import { getLLMProvider } from '../providers/llm/llmProvider.js';
import { AIJobPayload } from '../queue/jobQueue.js';
import { SummaryModel } from '../../backend/src/models/index.js';
import { isMongoConnected, memoryStore, pgPool, isPostgresConnected } from '../../backend/src/config/database.js';
import { logger } from '../../backend/src/utils/logger.js';
import { generateAndSaveFlashcardsAndQuizzes } from './quizGenWorker.js';
import { updateSubjectReadinessScore } from './readinessWorker.js';

export async function processAISummarizationJob(payload: AIJobPayload): Promise<void> {
  const { noteId, userId, subjectId, transcriptText } = payload;
  logger.info(`[Worker:AI] Processing AI summary, flashcards, and quizzes for noteId=${noteId}`);

  try {
    const llm = getLLMProvider();

    const summaryResult = await llm.generateSummary(transcriptText);

    if (isMongoConnected) {
      await SummaryModel.findOneAndUpdate(
        { note_id: noteId },
        {
          note_id: noteId,
          user_id: userId,
          subject_id: subjectId,
          summary_text: summaryResult.summaryText,
          bullet_points: summaryResult.bulletPoints,
          key_takeaways: summaryResult.keyTakeaways,
          keywords: summaryResult.keywords,
          dates_detected: summaryResult.datesDetected.map(d => ({
            date_string: d.dateString,
            parsed_date: d.parsedDate ? new Date(d.parsedDate) : undefined,
            context: d.context,
            is_exam_or_deadline: d.isExamOrDeadline,
          })),
          entities: summaryResult.entities,
          suggested_subject: summaryResult.suggestedSubject,
          suggested_tags: summaryResult.suggestedTags,
          reading_time_minutes: summaryResult.readingTimeMinutes,
        },
        { upsert: true, new: true }
      );
    } else {
      memoryStore.summaries.set(noteId, {
        note_id: noteId,
        user_id: userId,
        subject_id: subjectId,
        summary_text: summaryResult.summaryText,
        bullet_points: summaryResult.bulletPoints,
        key_takeaways: summaryResult.keyTakeaways,
        keywords: summaryResult.keywords,
        dates_detected: summaryResult.datesDetected,
        entities: summaryResult.entities,
        suggested_subject: summaryResult.suggestedSubject,
        suggested_tags: summaryResult.suggestedTags,
        reading_time_minutes: summaryResult.readingTimeMinutes,
        created_at: new Date(),
      });
    }

    await generateAndSaveFlashcardsAndQuizzes(noteId, userId, subjectId, transcriptText);

    if (isPostgresConnected && pgPool) {
      await pgPool.query("UPDATE notes_meta SET status = 'ready' WHERE id = $1", [noteId]);
    } else {
      const note = memoryStore.notesMeta.get(noteId);
      if (note) note.status = 'ready';
    }

    await updateSubjectReadinessScore(userId, subjectId);

    logger.info(`[Worker:AI] AI Pipeline completed successfully for noteId=${noteId}`);
  } catch (error) {
    logger.error(`[Worker:AI] Failed to process AI job for noteId=${noteId}:`, error);
  }
}
