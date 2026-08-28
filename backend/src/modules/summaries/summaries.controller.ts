import { Response, NextFunction } from 'express';
import { summariesService } from './summaries.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class SummariesController {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await summariesService.get(req.params.id, req.user!.userId, req.user!.role || 'employee');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.message === 'Access denied.' ? 403 : 404).json({ success: false, error: err.message });
    }
  }

  async regenerate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await summariesService.regenerate(req.params.id, req.user!.userId, req.user!.role || 'employee');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const summariesController = new SummariesController();
