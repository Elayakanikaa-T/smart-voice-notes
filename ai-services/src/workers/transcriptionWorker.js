"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTranscriptionJob = processTranscriptionJob;
const sttProvider_js_1 = require("../providers/stt/sttProvider.js");
const jobQueue_js_1 = require("../queue/jobQueue.js");
const index_js_1 = require("../../backend/src/models/index.js");
const database_js_1 = require("../../backend/src/config/database.js");
const logger_js_1 = require("../../backend/src/utils/logger.js");
async function processTranscriptionJob(payload) {
    const { noteId, userId, subjectId, audioUrl, audioKey } = payload;
    logger_js_1.logger.info(`[Worker:Transcription] Starting transcription for noteId=${noteId}`);
    try {
        await updateNoteStatus(noteId, 'transcribing');
        const stt = (0, sttProvider_js_1.getSTTProvider)();
        const result = await stt.transcribe(audioUrl || audioKey || 'sample-recording.m4a');
        if (database_js_1.isMongoConnected) {
            await index_js_1.TranscriptModel.findOneAndUpdate({ note_id: noteId }, {
                note_id: noteId,
                user_id: userId,
                raw_text: result.rawText,
                language: result.language,
                confidence: result.confidence,
                duration_seconds: result.durationSeconds,
                segments: result.segments,
            }, { upsert: true, new: true });
        }
        else {
            database_js_1.memoryStore.transcripts.set(noteId, {
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
        if (database_js_1.isPostgresConnected && database_js_1.pgPool) {
            await database_js_1.pgPool.query('UPDATE notes_meta SET duration_seconds = $1, status = $2 WHERE id = $3', [result.durationSeconds, 'processing', noteId]);
        }
        else {
            const note = database_js_1.memoryStore.notesMeta.get(noteId);
            if (note) {
                note.duration_seconds = result.durationSeconds;
                note.status = 'processing';
            }
        }
        logger_js_1.logger.info(`[Worker:Transcription] Completed transcription for noteId=${noteId}. Dispatching to AI pipeline.`);
        await jobQueue_js_1.jobQueue.addAIProcessingJob({
            noteId,
            userId,
            subjectId,
            transcriptText: result.rawText,
        });
    }
    catch (error) {
        logger_js_1.logger.error(`[Worker:Transcription] Failed to process noteId=${noteId}:`, error);
        await updateNoteStatus(noteId, 'failed');
    }
}
async function updateNoteStatus(noteId, status) {
    if (database_js_1.isPostgresConnected && database_js_1.pgPool) {
        await database_js_1.pgPool.query('UPDATE notes_meta SET status = $1 WHERE id = $2', [status, noteId]);
    }
    else {
        const note = database_js_1.memoryStore.notesMeta.get(noteId);
        if (note)
            note.status = status;
    }
}
