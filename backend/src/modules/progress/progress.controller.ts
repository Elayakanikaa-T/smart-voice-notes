import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { progressService } from './progress.service.js';

export class ProgressController {
  async getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.userId;
      const data = await progressService.getProgress(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getSubjectProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { subjectId } = req.params;
      const data = await progressService.getSubjectProgress(userId, subjectId);
      if (!data) {
        res.status(404).json({ success: false, error: 'Progress data not found for subject.' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const progressController = new ProgressController();
