import { getSTTProvider } from '../providers/sttProvider.js';
import { NoteJobPayload, jobQueue } from '../queue/jobQueue.js';
import { TranscriptModel, AudioNoteModel } from '../../../models/index.js';
import { logger } from '../../../utils/logger.js';

export async function processTranscriptionJob(payload: NoteJobPayload): Promise<void> {
  const { noteId, userId, subjectId, audioUrl, audioKey } = payload;
  logger.info(`[Worker:Transcription] Starting transcription for noteId=${noteId}`);

  try {
    await AudioNoteModel.findByIdAndUpdate(noteId, { $set: { status: 'transcribing', updated_at: new Date() } }).catch(() => {});

    const stt = getSTTProvider();
    const result = await stt.transcribe(audioUrl || audioKey || 'sample-recording.m4a');

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

    await AudioNoteModel.findByIdAndUpdate(noteId, {
      $set: {
        duration_seconds: result.durationSeconds,
        status: 'processing',
        has_transcript: true,
        updated_at: new Date(),
      }
    }).catch(() => {});

    logger.info(`[Worker:Transcription] Completed transcription for noteId=${noteId}. Dispatching to AI pipeline.`);

    await jobQueue.addAIProcessingJob({
      noteId,
      userId,
      subjectId,
      transcriptText: result.rawText,
    });
  } catch (error) {
    logger.error(`[Worker:Transcription] Failed to process noteId=${noteId}:`, error);
    await AudioNoteModel.findByIdAndUpdate(noteId, { $set: { status: 'failed', updated_at: new Date() } }).catch(() => {});
  }
}
