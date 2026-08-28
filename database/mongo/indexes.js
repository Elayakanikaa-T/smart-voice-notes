"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureMongoIndexes = ensureMongoIndexes;
const transcript_schema_js_1 = require("./schemas/transcript.schema.js");
const summary_schema_js_1 = require("./schemas/summary.schema.js");
const flashcard_schema_js_1 = require("./schemas/flashcard.schema.js");
const quizQuestion_schema_js_1 = require("./schemas/quizQuestion.schema.js");
async function ensureMongoIndexes() {
    try {
        await transcript_schema_js_1.TranscriptModel.ensureIndexes();
        await summary_schema_js_1.SummaryModel.ensureIndexes();
        await flashcard_schema_js_1.FlashcardSetModel.ensureIndexes();
        await quizQuestion_schema_js_1.QuizDocumentModel.ensureIndexes();
        console.log('[Mongo] All MongoDB indexes verified successfully.');
    }
    catch (error) {
        console.error('[Mongo] Error creating MongoDB indexes:', error);
    }
}
