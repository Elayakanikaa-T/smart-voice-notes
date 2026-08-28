import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { doubtChatService } from './doubt-chat.service.js';

export class DoubtChatController {
  async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { subjectId } = req.query;
      const session = await doubtChatService.getSession(userId, subjectId as string);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { content: rawContent, message, subjectId, context } = req.body;
      const content = rawContent || message;
      
      if (!content) {
        res.status(400).json({ success: false, error: 'Message content is required.' });
        return;
      }
      
      const session = await doubtChatService.processMessage(userId, content, subjectId, context);
      res.status(200).json({ success: true, data: session });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const doubtChatController = new DoubtChatController();
