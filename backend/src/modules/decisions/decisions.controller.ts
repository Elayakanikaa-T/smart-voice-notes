import { Response, NextFunction } from 'express';
import { decisionsService } from './decisions.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class DecisionsController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await decisionsService.list(req.params.id, req.user!.userId, req.user!.role || 'employee');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.message === 'Access denied.' ? 403 : 400).json({ success: false, error: err.message });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await decisionsService.create(req.params.id, req.body.text, req.user!.userId, req.user!.role || 'employee');
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await decisionsService.update(req.params.id, req.params.decisionId, req.body.text, req.user!.userId, req.user!.role || 'employee');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await decisionsService.remove(req.params.id, req.params.decisionId, req.user!.userId, req.user!.role || 'employee');
      res.json({ success: true, message: 'Decision deleted.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const decisionsController = new DecisionsController();
