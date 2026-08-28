import { getSTTProvider } from '../providers/stt/sttProvider.js';
import { NoteJobPayload, jobQueue } from '../queue/jobQueue.js';
import { TranscriptModel } from '../../backend/src/models/index.js';
import { isMongoConnected, memoryStore, pgPool, isPostgresConnected } from '../../backend/src/config/database.js';
import { logger } from '../../backend/src/utils/logger.js';

export async function processTranscriptionJob(payload: NoteJobPayload): Promise<void> {
  const { noteId, userId, subjectId, audioUrl, audioKey } = payload;
  logger.info(`[Worker:Transcription] Starting transcription for noteId=${noteId}`);

  try {
    await updateNoteStatus(noteId, 'transcribing');

    const stt = getSTTProvider();
    const result = await stt.transcribe(audioUrl || audioKey || 'sample-recording.m4a');

    if (isMongoConnected) {
      await TranscriptModel.findOneAndUpdate(
        { note_id: noteId },
        {
          note_id: noteId,
          user_id: userId,
          raw_text: result.rawText,
          language: result.language,
          confidence: result.confidence,
          duration_seconds: result.durationSeconds,
          segments: result.segments,
        },
        { upsert: true, new: true }
      );
    } else {
      memoryStore.transcripts.set(noteId, {
        note_id: noteId,
        user_id: userId,
        raw_text: result.rawText,
        language: result.language,
        confidence: result.confidence,
        duration_seconds: result.durationSeconds,
        segments: result.segments,
        created_at: new Date(),
      });
    }

    if (isPostgresConnected && pgPool) {
      await pgPool.query(
        'UPDATE notes_meta SET duration_seconds = $1, status = $2 WHERE id = $3',
        [result.durationSeconds, 'processing', noteId]
      );
    } else {
      const note = memoryStore.notesMeta.get(noteId);
      if (note) {
        note.duration_seconds = result.durationSeconds;
        note.status = 'processing';
      }
    }

    logger.info(`[Worker:Transcription] Completed transcription for noteId=${noteId}. Dispatching to AI pipeline.`);

    await jobQueue.addAIProcessingJob({
      noteId,
      userId,
      subjectId,
      transcriptText: result.rawText,
    });
  } catch (error) {
    logger.error(`[Worker:Transcription] Failed to process noteId=${noteId}:`, error);
    await updateNoteStatus(noteId, 'failed');
  }
}

async function updateNoteStatus(noteId: string, status: string) {
  if (isPostgresConnected && pgPool) {
    await pgPool.query('UPDATE notes_meta SET status = $1 WHERE id = $2', [status, noteId]);
  } else {
    const note = memoryStore.notesMeta.get(noteId);
    if (note) note.status = status;
  }
}
