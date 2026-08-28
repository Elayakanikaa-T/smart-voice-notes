import { Response, NextFunction } from 'express';
import { actionItemsService } from './actionItems.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class ActionItemsController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await actionItemsService.list(req.params.id, req.user!.userId, req.user!.role || 'employee');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.message === 'Access denied.' ? 403 : 400).json({ success: false, error: err.message });
    }
  }

  async myItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await actionItemsService.myItems(req.user!.userId, req.user!.email);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await actionItemsService.create(
        req.params.id,
        req.body,
        req.user!.userId,
        req.user!.role || 'employee'
      );
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await actionItemsService.update(
        req.params.id,
        req.params.itemId,
        req.body,
        req.user!.userId,
        req.user!.role || 'employee'
      );
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await actionItemsService.remove(
        req.params.id,
        req.params.itemId,
        req.user!.userId,
        req.user!.role || 'employee'
      );
      res.json({ success: true, message: 'Action item deleted.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const actionItemsController = new ActionItemsController();
