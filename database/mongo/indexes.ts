import mongoose from 'mongoose';
import { TranscriptModel } from './schemas/transcript.schema.js';
import { SummaryModel } from './schemas/summary.schema.js';
import { FlashcardSetModel } from './schemas/flashcard.schema.js';
import { QuizDocumentModel } from './schemas/quizQuestion.schema.js';

export async function ensureMongoIndexes(): Promise<void> {
  try {
    await TranscriptModel.ensureIndexes();
    await SummaryModel.ensureIndexes();
    await FlashcardSetModel.ensureIndexes();
    await QuizDocumentModel.ensureIndexes();
    console.log('[Mongo] All MongoDB indexes verified successfully.');
  } catch (error) {
    console.error('[Mongo] Error creating MongoDB indexes:', error);
  }
}
