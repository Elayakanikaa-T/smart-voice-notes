import { Request, Response, NextFunction } from 'express';
import { meetingsService } from './meetings.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class MeetingsController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const meeting = await meetingsService.create({
        title: req.body.title,
        organizerId: req.user!.userId,
        participants: req.body.participants,
        scheduledAt: req.body.scheduledAt,
      });
      res.status(201).json({ success: true, data: meeting });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await meetingsService.list({
        userId: req.user!.userId,
        role: req.user!.role || 'employee',
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        status: req.query.status as string,
        from: req.query.from as string,
        to: req.query.to as string,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await meetingsService.getById(
        req.params.id,
        req.user!.userId,
        req.user!.role || 'employee'
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      const code = err.message === 'Meeting not found.' ? 404 : err.message === 'Access denied.' ? 403 : 400;
      res.status(code).json({ success: false, error: err.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await meetingsService.update(
        req.params.id,
        req.body,
        req.user!.userId,
        req.user!.role || 'employee'
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async deleteMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await meetingsService.deleteMeeting(
        req.params.id,
        req.user!.userId,
        req.user!.role || 'employee'
      );
      res.status(200).json({ success: true, message: 'Meeting deleted.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async uploadAudio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No audio file provided.' });
        return;
      }
      const audioUrl = `/uploads/meetings/${file.filename}`;
      const transcriptText = req.body?.transcriptText;
      let segments = req.body?.segments;
      if (typeof segments === 'string') {
        try { segments = JSON.parse(segments); } catch {}
      }

      const result = await meetingsService.uploadAudio(
        req.params.id,
        audioUrl,
        req.user!.userId,
        req.user!.role || 'employee',
        transcriptText,
        segments
      );
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await meetingsService.getStatus(req.params.id);
      res.status(200).json({ success: true, data: status });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async shareMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await meetingsService.shareMeeting(
        req.params.id,
        req.body?.message,
        req.user?.userId
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateTranscript(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await meetingsService.updateTranscript(
        req.params.id,
        req.body?.fullText,
        req.body?.segments,
        req.user?.userId,
        req.user?.role || 'employee'
      );
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const meetingsController = new MeetingsController();
