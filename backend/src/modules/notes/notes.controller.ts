import { Request, Response, NextFunction } from 'express';
import { notesService } from './notes.service.js';
import { AudioNoteModel } from '../../models/index.js';

import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class NotesController {
  async createTextNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await notesService.createTextNote(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Text note created and AI study takeaways generated.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async initUpload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await notesService.initUpload(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Upload initialized. Use the uploadUrl to upload your recording.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async completeUpload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const noteId = req.params.id || req.params.noteId;
      const { durationSeconds, transcriptText } = req.body || {};
      const note = await notesService.markUploadCompleted(userId, noteId, durationSeconds, transcriptText);
      res.status(200).json({
        success: true,
        message: 'Upload completed. Speech-to-text transcription queued.',
        data: note,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await notesService.getNotes(userId, {
        subjectId: req.query.subjectId as string,
        folderId: req.query.folderId as string,
        status: req.query.status as string,
        isFavorite: req.query.isFavorite ? req.query.isFavorite === 'true' : undefined,
        isArchived: req.query.isArchived ? req.query.isArchived === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const note = await notesService.getNoteById(userId, req.params.id);
      if (!note) {
        res.status(404).json({ success: false, error: 'Note not found.' });
        return;
      }
      res.status(200).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await notesService.updateNote(userId, req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Note not found.' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await notesService.deleteNote(userId, req.params.id);
      res.status(200).json({ success: true, message: 'Note deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async searchNotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const query = {
        q: req.query.q as string,
        subjectId: req.query.subjectId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };
      const result = await notesService.searchNotes(userId, query);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async syncBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { clientChanges, lastSyncTimestamp } = req.body;
      const result = await notesService.syncBatch(userId, clientChanges || [], lastSyncTimestamp);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET /notes/:id/status â€” lightweight polling endpoint for AI pipeline progress */
  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const noteId = req.params.id;

      let status: string = 'unknown';
      let hasTranscript = false;
      let hasSummary = false;
      let hasQuiz = false;
      let errorMessage: string | undefined;
      let title = '';

      
        const note: any = await AudioNoteModel.findOne({ _id: noteId, user_id: userId }).lean();
        if (!note) {
          res.status(404).json({ success: false, error: 'Note not found.' });
          return;
        }
        status = note.status;
        hasTranscript = note.has_transcript;
        hasSummary = note.has_summary;
        hasQuiz = note.has_quiz;
        errorMessage = note.error_message;
        title = note.title;
      

      // Map internal status to a human-readable progress percent
      const progressMap: Record<string, number> = {
        recording: 5, uploaded: 15, transcribing: 35, processing: 65, ready: 100, failed: 0,
      };

      res.status(200).json({
        success: true,
        data: {
          noteId,
          title,
          status,
          progress: progressMap[status] ?? 50,
          hasTranscript,
          hasSummary,
          hasQuiz,
          errorMessage,
          isComplete: status === 'ready',
          isFailed: status === 'failed',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notesController = new NotesController();

