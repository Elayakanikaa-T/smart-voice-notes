import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { recommendationsService } from './recommendations.service.js';

export class RecommendationsController {
  async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.userId;
      const refresh = req.query.refresh === 'true';
      const data = refresh
        ? await recommendationsService.generateRecommendations(userId)
        : await recommendationsService.getRecommendations(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async refreshRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = await recommendationsService.generateRecommendations(userId);
      res.status(200).json({ success: true, message: 'Fresh recommendations generated.', data });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationsController = new RecommendationsController();
