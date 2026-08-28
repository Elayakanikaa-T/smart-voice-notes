import { Response, NextFunction } from 'express';
import { quizzesService } from './quizzes.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class QuizzesController {
  async getQuizzes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { subjectId, noteId } = req.query;
      const quizzes = await quizzesService.getQuizzes(userId, subjectId as string, noteId as string);
      res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
      next(error);
    }
  }

  async getQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await quizzesService.getQuizById(req.params.id);
      if (!quiz) {
        res.status(404).json({ success: false, error: 'Quiz not found.' });
        return;
      }
      res.status(200).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await quizzesService.submitAttempt(userId, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Quiz attempt evaluated.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAttempts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const attempts = await quizzesService.getAttempts(userId, req.query.quizId as string);
      res.status(200).json({ success: true, data: attempts });
    } catch (error) {
      next(error);
    }
  }
  async createQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const quiz = await quizzesService.createCustomQuiz(userId, req.body);
      res.status(201).json({ success: true, message: 'Custom test created.', data: quiz });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const quizId = req.params.id;
      await quizzesService.deleteQuiz(userId, quizId);
      res.status(200).json({ success: true, message: 'Quiz test deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const quizzesController = new QuizzesController();
