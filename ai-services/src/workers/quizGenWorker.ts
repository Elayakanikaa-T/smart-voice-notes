import { v4 as uuidv4 } from 'uuid';
import { getLLMProvider } from '../providers/llm/llmProvider.js';
import { FlashcardSetModel, QuizDocumentModel } from '../../backend/src/models/index.js';
import { isMongoConnected, memoryStore, pgPool, isPostgresConnected } from '../../backend/src/config/database.js';
import { logger } from '../../backend/src/utils/logger.js';

export async function generateAndSaveFlashcardsAndQuizzes(
  noteId: string,
  userId: string,
  subjectId: string,
  transcriptText: string
): Promise<void> {
  const llm = getLLMProvider();

  // 1. Generate Flashcards
  const flashcardItems = await llm.generateFlashcards(transcriptText, 5);
  if (isMongoConnected) {
    await FlashcardSetModel.create({
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
  } else {
    memoryStore.flashcards.set(noteId, {
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
  const quizId = uuidv4();
  const quizQuestions = await llm.generateQuiz(transcriptText, 5, 'medium');

  if (isPostgresConnected && pgPool) {
    await pgPool.query(
      `INSERT INTO quizzes (id, user_id, subject_id, note_id, title, type, difficulty_level, total_questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [quizId, userId, subjectId, noteId, 'Lecture Mastery Check', 'quiz', 'medium', quizQuestions.length]
    );
  } else {
    memoryStore.quizzes.set(quizId, {
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

  if (isMongoConnected) {
    await QuizDocumentModel.create({
      quiz_id: quizId,
      note_id: noteId,
      subject_id: subjectId,
      user_id: userId,
      title: 'Lecture Mastery Check',
      questions: quizQuestions,
    });
  } else {
    memoryStore.quizQuestions.set(quizId, {
      quiz_id: quizId,
      note_id: noteId,
      subject_id: subjectId,
      user_id: userId,
      title: 'Lecture Mastery Check',
      questions: quizQuestions,
      created_at: new Date(),
    });
  }

  logger.info(`[Worker:Quiz] Created flashcards and quiz=${quizId} for note=${noteId}`);
}
