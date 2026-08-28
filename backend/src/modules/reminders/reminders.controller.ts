import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { remindersService } from './reminders.service.js';

export class RemindersController {
  async getReminders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { subjectId, upcoming, limit, offset } = req.query;
      const result = await remindersService.getReminders(userId, {
        subjectId: subjectId as string,
        upcoming: upcoming === 'true',
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createReminder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const reminder = await remindersService.createReminder(userId, req.body);
      res.status(201).json({ success: true, message: 'Reminder created.', data: reminder });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateReminder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await remindersService.updateReminder(userId, req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Reminder not found.' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteReminder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await remindersService.deleteReminder(userId, req.params.id);
      res.status(200).json({ success: true, message: 'Reminder deleted.' });
    } catch (error) {
      next(error);
    }
  }

  async markComplete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await remindersService.markComplete(userId, req.params.id);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const remindersController = new RemindersController();
