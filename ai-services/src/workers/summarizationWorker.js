"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAISummarizationJob = processAISummarizationJob;
const llmProvider_js_1 = require("../providers/llm/llmProvider.js");
const index_js_1 = require("../../backend/src/models/index.js");
const database_js_1 = require("../../backend/src/config/database.js");
const logger_js_1 = require("../../backend/src/utils/logger.js");
const quizGenWorker_js_1 = require("./quizGenWorker.js");
const readinessWorker_js_1 = require("./readinessWorker.js");
async function processAISummarizationJob(payload) {
    const { noteId, userId, subjectId, transcriptText } = payload;
    logger_js_1.logger.info(`[Worker:AI] Processing AI summary, flashcards, and quizzes for noteId=${noteId}`);
    try {
        const llm = (0, llmProvider_js_1.getLLMProvider)();
        const summaryResult = await llm.generateSummary(transcriptText);
        if (database_js_1.isMongoConnected) {
            await index_js_1.SummaryModel.findOneAndUpdate({ note_id: noteId }, {
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
            }, { upsert: true, new: true });
        }
        else {
            database_js_1.memoryStore.summaries.set(noteId, {
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
        await (0, quizGenWorker_js_1.generateAndSaveFlashcardsAndQuizzes)(noteId, userId, subjectId, transcriptText);
        if (database_js_1.isPostgresConnected && database_js_1.pgPool) {
            await database_js_1.pgPool.query("UPDATE notes_meta SET status = 'ready' WHERE id = $1", [noteId]);
        }
        else {
            const note = database_js_1.memoryStore.notesMeta.get(noteId);
            if (note)
                note.status = 'ready';
        }
        await (0, readinessWorker_js_1.updateSubjectReadinessScore)(userId, subjectId);
        logger_js_1.logger.info(`[Worker:AI] AI Pipeline completed successfully for noteId=${noteId}`);
    }
    catch (error) {
        logger_js_1.logger.error(`[Worker:AI] Failed to process AI job for noteId=${noteId}:`, error);
    }
}
