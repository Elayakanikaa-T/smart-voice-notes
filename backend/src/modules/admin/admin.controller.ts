import { Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class AdminController {
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.getUsersList();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getSystemStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async publishExam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const result = await adminService.publishOfficialExamQuiz(adminUserId, req.body);
      res.status(201).json({ success: true, message: 'Official exam published to students.', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteUser(req.params.id);
      res.status(200).json({ success: true, message: 'Student account removed.' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.updateOfficialExamQuiz(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Quiz updated successfully.', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteQuiz(req.params.id);
      res.status(200).json({ success: true, message: 'Quiz deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const adminController = new AdminController();
