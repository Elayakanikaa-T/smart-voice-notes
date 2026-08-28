import { v4 as uuidv4 } from 'uuid';
import { generateUploadUrl, generateDownloadUrl } from '../../config/storage.js';
import { jobQueue, getLLMProvider } from '../../services/ai/index.js';
import { TranscriptModel, SummaryModel, AudioNoteModel, SubjectModel, FlashcardModel, QuizModel } from '../../models/index.js';
import { logger } from '../../utils/logger.js';

export class NotesService {
  async createTextNote(userId: string, data: {
    subjectId: string;
    title: string;
    topic?: string;
    content: string;
  }) {
    const noteId = uuidv4();
    const content = (data.content || '').trim();
    const title = data.title.trim();
    const durationSeconds = Math.max(30, Math.round(content.split(/\s+/).length / 2.5));

    logger.info(`[NotesService] Creating text note "${title}" for subject ${data.subjectId}`);

    const llm = getLLMProvider();
    let summaryResult: any;
    try {
      summaryResult = await llm.generateSummary(content, title);
    } catch (e) {
      summaryResult = {
        summaryText: content.slice(0, 300) + '...',
        bulletPoints: content.split('\n').filter(l => l.trim().length > 5).slice(0, 4),
        keywords: [],
      };
    }

    const noteDoc = await AudioNoteModel.create({
      _id: noteId,
      user_id: userId,
      subject_id: data.subjectId,
      title,
      status: 'ready',
      has_transcript: true,
      has_summary: true,
      has_quiz: true,
      duration_seconds: durationSeconds,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await TranscriptModel.create({
      note_id: noteId,
      user_id: userId,
      raw_text: content,
      language: 'en',
      confidence: 1.0,
      duration_seconds: durationSeconds,
      segments: content.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0).map((text, i) => ({
        start: i * 15,
        end: (i + 1) * 15,
        text: text.trim(),
      })),
    });

    await SummaryModel.create({
      note_id: noteId,
      user_id: userId,
      // summary_text: use AI result if it covers the full content, else store the full content itself
      summary_text: summaryResult.summaryText && summaryResult.summaryText.length >= Math.min(content.length, 100)
        ? summaryResult.summaryText
        : content,
      bullet_points: summaryResult.bulletPoints || summaryResult.keyTakeaways || [],
      keywords: (summaryResult.keywords || []).map((k: any) => typeof k === 'string' ? { term: k, definition: '' } : k),
      readiness_score: 85,
    });

    let flashcards: any[] = [];
    try {
      flashcards = await llm.generateFlashcards(content, 3);
    } catch {
      flashcards = [{ frontQuestion: `What is the main takeaway of ${title}?`, backAnswer: summaryResult.bulletPoints?.[0] || 'See study notes.' }];
    }

    await FlashcardModel.create({
      note_id: noteId,
      user_id: userId,
      subject_id: data.subjectId,
      title: `${title} Flashcards`,
      cards: flashcards.map((fc: any, i: number) => ({
        front_question: fc.frontQuestion || fc.front || '',
        back_answer: fc.backAnswer || fc.back || '',
        topic_tag: data.topic || title,
        difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3],
      })),
    });

    const topicQuestions: any[] = [];
    for (let lvl = 1; lvl <= 8; lvl++) {
      const diff = lvl <= 2 ? 'easy' : lvl <= 6 ? 'medium' : 'hard';
      topicQuestions.push(
        {
          question: `[Level ${lvl}] What is the primary definition and mechanism of "${title}"?`,
          options: [
            summaryResult.bulletPoints?.[0] || `Key foundational concept of ${title}`,
            'An unrelated secondary anomaly',
            'Deprecated legacy mechanism',
            'None of the above'
          ],
          correct_answer: summaryResult.bulletPoints?.[0] || `Key foundational concept of ${title}`,
          correct_index: 0,
          explanation: `Derived directly from the verified notes for ${title}.`,
          hint: `Think about the foundational mechanism of ${title}.`,
          level: lvl,
          difficulty: diff,
          topic_tag: data.topic || title,
        },
        {
          question: `[Level ${lvl}] Which operational rule or complexity guarantee applies to "${title}"?`,
          options: [
            summaryResult.bulletPoints?.[1] || `Optimal complexity and structured workflow in ${title}`,
            'Arbitrary non-deterministic processing',
            'Bypassing all data integrity checks',
            'Zero resource allocation'
          ],
          correct_answer: summaryResult.bulletPoints?.[1] || `Optimal complexity and structured workflow in ${title}`,
          correct_index: 0,
          explanation: `Operational evaluation for ${title} requires adhering to standard structural invariants.`,
          hint: `Focus on complexity guarantees and rules of ${title}.`,
          level: lvl,
          difficulty: diff,
          topic_tag: data.topic || title,
        }
      );
    }

    await QuizModel.create({
      _id: noteId,
      user_id: userId,
      subject_id: data.subjectId,
      audio_note_id: noteId,
      topic_tag: data.topic || title,
      title: `${title} — Master Assessment (Levels 1-8)`,
      difficulty: 'medium',
      questions: topicQuestions,
      question_count: 16,
    }).catch(() => {});

    await SubjectModel.updateOne({ _id: data.subjectId }, { $inc: { note_count: 1 } }).catch(() => {});

    return {
      id: noteId,
      userId,
      subjectId: data.subjectId,
      title,
      status: 'ready',
      transcript: content,
      summary: summaryResult.summaryText,
      bullet_points: summaryResult.bulletPoints,
      key_points: summaryResult.bulletPoints,
      duration_seconds: durationSeconds,
      created_at: noteDoc.created_at,
    };
  }

  async initUpload(userId: string, data: {
    subjectId: string;
    folderId?: string | null;
    title: string;
    durationSeconds?: number;
    fileSizeBytes?: number;
    contentType?: string;
  }) {
    const noteId = uuidv4();
    const storageResult = await generateUploadUrl(userId, noteId, data.contentType || 'audio/m4a');

    await AudioNoteModel.create({
      _id: noteId,
      user_id: userId,
      subject_id: data.subjectId,
      title: data.title,
      audio_url: storageResult.downloadUrl,
      audio_s3_key: storageResult.s3Key,
      duration_seconds: data.durationSeconds || 0,
      file_size_bytes: data.fileSizeBytes || 0,
      status: 'recording',
    });

    return {
      noteId,
      uploadUrl: storageResult.uploadUrl,
      downloadUrl: storageResult.downloadUrl,
      s3Key: storageResult.s3Key,
      expiresInSeconds: storageResult.expiresInSeconds,
    };
  }

  async markUploadCompleted(userId: string, noteId: string, durationSeconds?: number, transcriptText?: string) {
    const updateObj: any = { status: 'uploaded', updated_at: new Date() };
    if (durationSeconds) updateObj.duration_seconds = durationSeconds;
    const note: any = await AudioNoteModel.findOneAndUpdate(
      { _id: noteId, user_id: userId },
      { $set: updateObj },
      { new: true }
    ).lean();

    if (!note) throw new Error('Note not found or unauthorized.');

    if (transcriptText && transcriptText.trim().length > 0) {
      const rawText = transcriptText.trim();
      await TranscriptModel.findOneAndUpdate(
        { note_id: note._id },
        {
          note_id: note._id,
          user_id: userId,
          raw_text: rawText,
          language: 'en',
          confidence: 0.99,
          duration_seconds: durationSeconds || 60,
          segments: [{ start: 0, end: durationSeconds || 60, text: rawText, speaker: 'Speaker', confidence: 0.99 }],
        },
        { upsert: true, new: true }
      );

      await jobQueue.addAIProcessingJob({
        noteId: note._id,
        userId: note.user_id,
        subjectId: note.subject_id,
        transcriptText: rawText,
      });
    } else {
      await jobQueue.addTranscriptionJob({
        noteId: note._id,
        userId: note.user_id,
        subjectId: note.subject_id,
        audioKey: note.audio_s3_key,
        audioUrl: note.audio_url,
        title: note.title,
      });
    }

    return note;
  }

  async getNotes(userId: string, query: {
    subjectId?: string;
    folderId?: string;
    status?: string;
    isFavorite?: boolean;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const filter: any = { user_id: userId };
    if (query.subjectId) filter.subject_id = query.subjectId;
    if (query.status) filter.status = query.status;
    if (query.isFavorite !== undefined) filter.is_favorite = query.isFavorite;
    filter.is_archived = query.isArchived ?? false;

    const [notes, totalCount] = await Promise.all([
      AudioNoteModel.find(filter)
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(limit)
        .populate('subject_id')
        .lean(),
      AudioNoteModel.countDocuments(filter),
    ]);

    const formatted = await Promise.all(
      notes.map(async (n: any) => {
        const [transcriptDoc, summaryDoc]: [any, any] = await Promise.all([
          TranscriptModel.findOne({ note_id: n._id }).lean(),
          SummaryModel.findOne({ note_id: n._id }).lean(),
        ]);

        return {
          id: n._id?.toString() || n.id,
          userId: n.user_id,
          subjectId: n.subject_id?._id || n.subject_id,
          subject_id: n.subject_id?._id || n.subject_id,
          subject_name: n.subject_id?.name || 'Core Subject',
          subject_color: n.subject_id?.color || '#6366F1',
          title: n.title,
          status: n.status,
          duration_seconds: n.duration_seconds,
          file_size_bytes: n.file_size_bytes,
          created_at: n.created_at,
          updated_at: n.updated_at,
          is_favorite: n.is_favorite,
          is_archived: n.is_archived,
          transcript: transcriptDoc?.raw_text || (n.has_transcript ? 'Transcript available' : null),
          summary: summaryDoc?.summary_text || null,
          bullet_points: summaryDoc?.bullet_points || [],
          key_points: summaryDoc?.bullet_points || [],
        };
      })
    );

    return { notes: formatted, total: totalCount, limit, offset };
  }

  async getNoteById(userId: string, noteId: string) {
    const doc: any = await AudioNoteModel.findOne({ _id: noteId })
      .populate('subject_id')
      .lean();
    if (!doc) return null;

    const [transcriptDoc, summaryDoc, flashcardDoc]: [any, any, any] = await Promise.all([
      TranscriptModel.findOne({ note_id: noteId }).lean(),
      SummaryModel.findOne({ note_id: noteId }).lean(),
      FlashcardModel.findOne({ note_id: noteId }).lean(),
    ]);

    const note: any = {
      id: doc._id?.toString() || doc.id,
      userId: doc.user_id,
      subjectId: doc.subject_id?._id || doc.subject_id,
      subject_id: doc.subject_id?._id || doc.subject_id,
      subject_name: doc.subject_id?.name || 'Core Subject',
      subject_color: doc.subject_id?.color || '#6366F1',
      title: doc.title,
      status: doc.status,
      duration_seconds: doc.duration_seconds,
      file_size_bytes: doc.file_size_bytes,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      is_favorite: doc.is_favorite,
      is_archived: doc.is_archived,
      transcript: transcriptDoc?.raw_text || '',
      summary: summaryDoc?.summary_text || '',
      bullet_points: summaryDoc?.bullet_points || [],
      key_points: summaryDoc?.bullet_points || [],
      keywords: summaryDoc?.keywords || [],
      readiness_score: summaryDoc?.readiness_score || 80,
      flashcards: flashcardDoc?.cards || [],
    };

    if (note.audio_s3_key) {
      note.downloadUrl = await generateDownloadUrl(note.audio_s3_key);
    }
    return note;
  }

  async updateNote(userId: string, noteId: string, data: any) {
    const updateObj: any = { updated_at: new Date() };
    if (data.title) updateObj.title = data.title;
    if (data.subjectId) updateObj.subject_id = data.subjectId;
    if (data.isFavorite !== undefined) updateObj.is_favorite = data.isFavorite;
    if (data.isArchived !== undefined) updateObj.is_archived = data.isArchived;
    if (data.durationSeconds) updateObj.duration_seconds = data.durationSeconds;
    if (data.status) updateObj.status = data.status;

    if (data.transcript !== undefined || data.content !== undefined) {
      const text = (data.transcript || data.content || '').trim();
      if (text) {
        await TranscriptModel.findOneAndUpdate(
          { note_id: noteId },
          { $set: { raw_text: text, user_id: userId, language: 'en', confidence: 1.0 } },
          { upsert: true }
        ).catch(() => {});

        const rawBullets = text.split(/\.\s+|\n+/).filter((s: string) => s.trim().length > 15).slice(0, 5);
        await SummaryModel.findOneAndUpdate(
          { note_id: noteId },
          {
            $set: {
              summary_text: text.slice(0, 350),
              bullet_points: rawBullets.length > 0 ? rawBullets : [`Core updated principle of ${data.title || 'the note'}`]
            }
          },
          { upsert: true }
        ).catch(() => {});
      }
    }

    const doc: any = await AudioNoteModel.findOneAndUpdate(
      { _id: noteId, user_id: userId },
      { $set: updateObj },
      { new: true }
    ).lean();

    return doc ? {
      id: doc._id,
      userId: doc.user_id,
      subjectId: doc.subject_id,
      title: doc.title,
      status: doc.status,
      duration_seconds: doc.duration_seconds,
      is_favorite: doc.is_favorite,
      is_archived: doc.is_archived,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    } : null;
  }

  async deleteNote(userId: string, noteId: string) {
    await AudioNoteModel.deleteOne({ _id: noteId, user_id: userId });
    await Promise.all([
      TranscriptModel.deleteOne({ note_id: noteId }),
      SummaryModel.deleteOne({ note_id: noteId }),
    ]);
    return true;
  }

  async searchNotes(userId: string, query: { q: string; subjectId?: string; limit?: number; offset?: number }) {
    const qTerm = query.q.toLowerCase().trim();
    const notesResult = await this.getNotes(userId, { subjectId: query.subjectId, limit: 100 });

    const matches: any[] = [];
    for (const note of notesResult.notes) {
      const titleMatch = note.title.toLowerCase().includes(qTerm);
      let transcriptMatch = false;

      const transcript = await TranscriptModel.findOne({ note_id: note.id });
      if (transcript && transcript.raw_text.toLowerCase().includes(qTerm)) {
        transcriptMatch = true;
      }

      if (titleMatch || transcriptMatch) {
        matches.push({
          ...note,
          matchContext: titleMatch ? 'Title Match' : 'Transcript Match',
        });
      }
    }

    return {
      query: query.q,
      totalMatches: matches.length,
      results: matches.slice(query.offset || 0, (query.offset || 0) + (query.limit || 20)),
    };
  }

  async syncBatch(userId: string, clientChanges: any[], _lastSyncTimestamp?: string) {
    const appliedChanges: any[] = [];
    const serverChanges: any[] = [];

    for (const change of clientChanges) {
      const existing = await this.getNoteById(userId, change.id);

      if (!existing) {
        if (!change.isDeleted) {
          await AudioNoteModel.create({
            _id: change.id,
            user_id: userId,
            subject_id: change.subjectId,
            title: change.title,
            duration_seconds: change.durationSeconds || 0,
            status: change.status || 'ready',
            updated_at: new Date(change.clientUpdatedAt),
          }).catch(() => {});
          appliedChanges.push({ id: change.id, status: 'inserted', version: 1 });
        }
      } else {
        const serverUpdatedAt = new Date(existing.updated_at || 0).getTime();
        const clientUpdatedAt = new Date(change.clientUpdatedAt).getTime();

        if (clientUpdatedAt >= serverUpdatedAt) {
          if (change.isDeleted) {
            await this.deleteNote(userId, change.id);
            appliedChanges.push({ id: change.id, status: 'deleted' });
          } else {
            const updated = await this.updateNote(userId, change.id, {
              title: change.title,
              subjectId: change.subjectId,
              durationSeconds: change.durationSeconds,
            });
            appliedChanges.push({ id: change.id, status: 'updated', version: updated?.updated_at });
          }
        } else {
          serverChanges.push(existing);
        }
      }
    }

    return {
      syncedAt: new Date().toISOString(),
      appliedChanges,
      serverUpdates: serverChanges,
    };
  }
}

export const notesService = new NotesService();
