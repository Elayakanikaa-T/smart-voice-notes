import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { learningPathService } from './learningPath.service.js';

export class LearningPathController {
  async getLearningPaths(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { subjectId } = req.query;
      const data = await learningPathService.getLearningPaths(userId, subjectId as string);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async addTopic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = await learningPathService.addTopic(userId, req.body);
      res.status(201).json({ success: true, message: 'Topic added to learning path successfully.', data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async generatePath(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = await learningPathService.generateLearningPath(userId, req.body);
      res.status(201).json({ success: true, message: 'Learning path generated successfully.', data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateStep(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { pathId, stepId } = req.params;
      const { status } = req.body;
      const data = await learningPathService.updateStepStatus(userId, pathId, stepId, status);
      res.status(200).json({ success: true, message: 'Topic status updated successfully.', data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteStep(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { pathId, stepId } = req.params;
      const data = await learningPathService.deleteStep(userId, pathId, stepId);
      res.status(200).json({ success: true, message: 'Topic removed from learning path.', data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const learningPathController = new LearningPathController();
