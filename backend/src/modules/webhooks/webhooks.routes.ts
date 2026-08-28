import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { updateSubjectReadinessScore } from '../../services/ai/index.js';

const router = Router();

// Internal / n8n Webhook: Transcription Complete
router.post('/transcription-complete', async (req: Request, res: Response) => {
  try {
    const { noteId, userId, subjectId, text } = req.body;
    logger.info(`[Webhook] Received transcription-complete for noteId=${noteId}`);
    res.status(200).json({ success: true, message: 'Transcription acknowledged.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Internal / n8n Webhook: AI Job Complete
router.post('/ai-job-complete', async (req: Request, res: Response) => {
  try {
    const { noteId, userId, subjectId } = req.body;
    logger.info(`[Webhook] Received ai-job-complete for noteId=${noteId}`);
    if (userId && subjectId) {
      await updateSubjectReadinessScore(userId, subjectId);
    }
    res.status(200).json({ success: true, message: 'AI job acknowledged.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// n8n Calendar Event Created Callback
router.post('/calendar-event-created', async (req: Request, res: Response) => {
  try {
    const { reminderId, calendarEventId } = req.body;
    logger.info(`[Webhook] Received calendar-event-created for reminderId=${reminderId}`);
    res.status(200).json({ success: true, message: 'Calendar event linked.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
