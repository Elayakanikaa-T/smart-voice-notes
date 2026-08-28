import { Response, NextFunction } from 'express';
import { TranscriptModel } from '../../models/index.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class TranscriptionController {
  async getTranscript(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const transcript = await TranscriptModel.findOne({ note_id: noteId }).lean();

      if (!transcript) {
        res.status(404).json({
          success: false,
          error: 'Transcript not found or still processing.',
        });
        return;
      }

      res.status(200).json({ success: true, data: transcript });
    } catch (error) {
      next(error);
    }
  }

  async updateTranscript(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const { raw_text, segments } = req.body;

      const updated = await TranscriptModel.findOneAndUpdate(
        { note_id: noteId },
        { $set: { raw_text, segments, updated_at: new Date() } },
        { new: true }
      ).lean();

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const transcriptionController = new TranscriptionController();
