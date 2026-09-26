import { Response, NextFunction } from 'express';
import { TranscriptModel } from '../../models/index.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { getSTTProvider } from '../../services/ai/providers/sttProvider.js';

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

  async transcribeAudio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      const audioPath = file?.path || req.body.audioUrl;
      const language = req.body.language || 'en';
      const title = req.body.title || 'Voice Note Recording';

      if (!audioPath) {
        res.status(400).json({ success: false, error: 'No audio file or URL provided for transcription.' });
        return;
      }

      const stt = getSTTProvider();
      const result = await stt.transcribe(audioPath, { language, title });

      res.status(200).json({
        success: true,
        data: {
          transcript: result.rawText,
          rawText: result.rawText,
          language: result.language,
          confidence: result.confidence,
          durationSeconds: result.durationSeconds,
          segments: result.segments,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Transcription failed.' });
    }
  }
}

export const transcriptionController = new TranscriptionController();

