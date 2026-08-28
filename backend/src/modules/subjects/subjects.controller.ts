import { Response, NextFunction } from 'express';
import { subjectsService } from './subjects.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class SubjectsController {
  async getSubjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const subjects = await subjectsService.getSubjects(userId);
      res.status(200).json({ success: true, data: subjects });
    } catch (error) {
      next(error);
    }
  }

  async getSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const subject = await subjectsService.getSubjectById(userId, req.params.id);
      if (!subject) {
        res.status(404).json({ success: false, error: 'Subject not found.' });
        return;
      }
      res.status(200).json({ success: true, data: subject });
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const subject = await subjectsService.createSubject(userId, req.body);
      res.status(201).json({ success: true, data: subject });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const subject = await subjectsService.updateSubject(userId, req.params.id, req.body);
      if (!subject) {
        res.status(404).json({ success: false, error: 'Subject not found.' });
        return;
      }
      res.status(200).json({ success: true, data: subject });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const success = await subjectsService.deleteSubject(userId, req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Subject not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Subject deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async getSubjectNotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notes = await subjectsService.getSubjectNotes(userId, req.params.id);
      res.status(200).json({ success: true, data: { notes } });
    } catch (error) {
      next(error);
    }
  }

  // Folders
  async getFolders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjectId = req.query.subjectId as string;
      if (!subjectId) {
        res.status(400).json({ success: false, error: 'subjectId query parameter is required.' });
        return;
      }
      const folders = await subjectsService.getFolders(subjectId);
      res.status(200).json({ success: true, data: folders });
    } catch (error) {
      next(error);
    }
  }

  async createFolder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const folder = await subjectsService.createFolder(req.body);
      res.status(201).json({ success: true, data: folder });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteFolder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = await subjectsService.deleteFolder(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Folder not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Folder deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const subjectsController = new SubjectsController();
