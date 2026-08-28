import { Response, NextFunction } from 'express';
import { SummaryModel, FlashcardModel, TranscriptModel, AudioNoteModel, SubjectModel, QuizModel } from '../../models/index.js';
import { getLLMProvider } from '../../services/ai/index.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class AIController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const summary = await SummaryModel.findOne({ note_id: noteId }).lean();

      if (!summary) {
        res.status(404).json({ success: false, error: 'Summary not found or still processing.' });
        return;
      }

      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async regenerateSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const transcript: any = await TranscriptModel.findOne({ note_id: noteId }).lean();

      if (!transcript || !transcript.raw_text) {
        res.status(400).json({ success: false, error: 'Transcript is required before generating a summary.' });
        return;
      }

      const note: any = await AudioNoteModel.findById(noteId).lean();
      const llm = getLLMProvider();
      const result = await llm.generateSummary(transcript.raw_text, note?.title || 'Lecture Note');

      const updated = await SummaryModel.findOneAndUpdate(
        { note_id: noteId },
        {
          note_id: noteId,
          user_id: req.user!.userId,
          summary_text: result.summaryText,
          bullet_points: result.bulletPoints,
          key_takeaways: result.keyTakeaways || result.bulletPoints,
          keywords: (result.keywords || []).map(k => typeof k === 'string' ? { term: k, definition: '' } : k),
          action_items: result.actionItems,
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      res.status(200).json({ success: true, message: 'Summary regenerated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async getFlashcards(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const flashcards = await FlashcardModel.findOne({ note_id: noteId }).lean();

      if (!flashcards) {
        res.status(404).json({ success: false, error: 'Flashcards not found.' });
        return;
      }

      res.status(200).json({ success: true, data: flashcards });
    } catch (error) {
      next(error);
    }
  }

  async generateFlashcards(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const { count = 5 } = req.body;

      const transcript: any = await TranscriptModel.findOne({ note_id: noteId }).lean();
      if (!transcript || !transcript.raw_text) {
        res.status(400).json({ success: false, error: 'Transcript required to generate flashcards.' });
        return;
      }

      const note: any = await AudioNoteModel.findById(noteId).lean();
      const title = note?.title || 'Lecture Note';

      const llm = getLLMProvider();
      const generated = await llm.generateFlashcards(transcript.raw_text, count);

      const saved = await FlashcardModel.findOneAndUpdate(
        { note_id: noteId },
        {
          note_id: noteId,
          user_id: req.user!.userId,
          subject_id: note?.subject_id,
          title: `${title} Flashcards`,
          cards: generated.map((f, idx) => ({
            front_question: f.frontQuestion,
            back_answer: f.backAnswer,
            topic_tag: title,
            difficulty: ['EASY', 'MEDIUM', 'HARD'][idx % 3],
          })),
        },
        { upsert: true, new: true }
      );

      res.status(200).json({ success: true, data: saved });
    } catch (error) {
      next(error);
    }
  }

  async generateQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const { count = 5, difficulty = 'medium' } = req.body;

      const transcript: any = await TranscriptModel.findOne({ note_id: noteId }).lean();
      if (!transcript || !transcript.raw_text) {
        res.status(400).json({ success: false, error: 'Transcript required to generate quiz.' });
        return;
      }

      const note: any = await AudioNoteModel.findById(noteId).lean();
      const title = note?.title || 'Study Session';

      const llm = getLLMProvider();
      const generated = await llm.generateQuiz(transcript.raw_text, count, difficulty);

      const saved = await QuizModel.findOneAndUpdate(
        { audio_note_id: noteId },
        {
          audio_note_id: noteId,
          user_id: req.user!.userId,
          subject_id: note?.subject_id,
          title: `${title} Quiz`,
          difficulty,
          questions: generated.map((q, i) => ({
            question: q.question,
            options: q.options,
            correct_answer: q.options[q.correctIndex] || '',
            correct_index: q.correctIndex,
            explanation: q.explanation,
            difficulty: q.difficulty || difficulty,
            topic_tag: title,
            level: Math.floor(i / 2) + 1,
          })),
          question_count: generated.length,
        },
        { upsert: true, new: true }
      );

      res.status(200).json({ success: true, data: saved });
    } catch (error) {
      next(error);
    }
  }

  async getTopicDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = req.body?.topic || req.query?.topic;
      const context = req.body?.context || req.query?.context;

      if (!topic) {
        res.status(400).json({ success: false, error: 'Topic is required.' });
        return;
      }

      const llm = getLLMProvider();
      const details = await llm.generateTopicDetails(String(topic), context ? String(context) : undefined);

      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  async evaluateVoiceAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, userAnswer, correctAnswer } = req.body;
      const isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

      res.status(200).json({
        success: true,
        data: {
          isCorrect,
          score: isCorrect ? 100 : 50,
          feedback: isCorrect ? 'Great job! Accurate answer.' : `Correct answer: ${correctAnswer}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
