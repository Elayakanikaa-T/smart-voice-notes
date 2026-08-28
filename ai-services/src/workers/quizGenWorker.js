"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSaveFlashcardsAndQuizzes = generateAndSaveFlashcardsAndQuizzes;
const uuid_1 = require("uuid");
const llmProvider_js_1 = require("../providers/llm/llmProvider.js");
const index_js_1 = require("../../backend/src/models/index.js");
const database_js_1 = require("../../backend/src/config/database.js");
const logger_js_1 = require("../../backend/src/utils/logger.js");
async function generateAndSaveFlashcardsAndQuizzes(noteId, userId, subjectId, transcriptText) {
    const llm = (0, llmProvider_js_1.getLLMProvider)();
    // 1. Generate Flashcards
    const flashcardItems = await llm.generateFlashcards(transcriptText, 5);
    if (database_js_1.isMongoConnected) {
        await index_js_1.FlashcardSetModel.create({
            note_id: noteId,
            subject_id: subjectId,
            user_id: userId,
            title: 'Auto-Generated Study Flashcards',
            cards: flashcardItems.map(c => ({
                ...c,
                review_count: 0,
                ease_factor: 2.5,
            })),
        });
    }
    else {
        database_js_1.memoryStore.flashcards.set(noteId, {
            note_id: noteId,
            subject_id: subjectId,
            user_id: userId,
            title: 'Auto-Generated Study Flashcards',
            cards: flashcardItems.map(c => ({
                ...c,
                review_count: 0,
                ease_factor: 2.5,
            })),
            created_at: new Date(),
        });
    }
    // 2. Generate Quiz Questions & Insert into Postgres + Mongo
    const quizId = (0, uuid_1.v4)();
    const quizQuestions = await llm.generateQuiz(transcriptText, 5, 'medium');
    if (database_js_1.isPostgresConnected && database_js_1.pgPool) {
        await database_js_1.pgPool.query(`INSERT INTO quizzes (id, user_id, subject_id, note_id, title, type, difficulty_level, total_questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [quizId, userId, subjectId, noteId, 'Lecture Mastery Check', 'quiz', 'medium', quizQuestions.length]);
    }
    else {
        database_js_1.memoryStore.quizzes.set(quizId, {
            id: quizId,
            user_id: userId,
            subject_id: subjectId,
            note_id: noteId,
            title: 'Lecture Mastery Check',
            type: 'quiz',
            difficulty_level: 'medium',
            total_questions: quizQuestions.length,
            created_at: new Date(),
        });
    }
    if (database_js_1.isMongoConnected) {
        await index_js_1.QuizDocumentModel.create({
            quiz_id: quizId,
            note_id: noteId,
            subject_id: subjectId,
            user_id: userId,
            title: 'Lecture Mastery Check',
            questions: quizQuestions,
        });
    }
    else {
        database_js_1.memoryStore.quizQuestions.set(quizId, {
            quiz_id: quizId,
            note_id: noteId,
            subject_id: subjectId,
            user_id: userId,
            title: 'Lecture Mastery Check',
            questions: quizQuestions,
            created_at: new Date(),
        });
    }
    logger_js_1.logger.info(`[Worker:Quiz] Created flashcards and quiz=${quizId} for note=${noteId}`);
}
