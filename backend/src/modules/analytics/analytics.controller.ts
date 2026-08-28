import { Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class AnalyticsController {
  async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const overview = await analyticsService.getOverview(userId);
      res.status(200).json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  }

  async getSubjectAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { subjectId } = req.params;
      const analytics = await analyticsService.getSubjectAnalytics(userId, subjectId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
