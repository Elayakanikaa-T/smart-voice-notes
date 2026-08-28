import { z } from 'zod';
import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { generateShareToken } from '../../utils/crypto.js';
import { ShareModel, AudioNoteModel, TranscriptModel, SummaryModel, UserModel } from '../../models/index.js';

export const CreateShareSchema = z.object({
  sharedWithEmail: z.string().email(),
  permission: z.enum(['view', 'edit']).default('view'),
  expiresInDays: z.number().int().positive().optional().default(30),
});

export class SharesService {
  async createShare(userId: string, noteId: string, data: any) {
    const id = uuidv4();
    const accessToken = generateShareToken();
    const expiresAt = new Date(Date.now() + (data.expiresInDays || 30) * 24 * 60 * 60 * 1000);

    await ShareModel.create({
      _id: id,
      note_id: noteId,
      shared_by_user_id: userId,
      shared_with_email: data.sharedWithEmail,
      permission: data.permission || 'view',
      access_token: accessToken,
      expires_at: expiresAt,
    }).catch(() => {});

    return {
      id,
      note_id: noteId,
      shared_by_user_id: userId,
      shared_with_email: data.sharedWithEmail,
      permission: data.permission || 'view',
      access_token: accessToken,
      expires_at: expiresAt,
    };
  }

  async getSharedNote(accessToken: string) {
    const share: any = await ShareModel.findOne({
      access_token: accessToken,
      $or: [{ expires_at: { $exists: false } }, { expires_at: { $gt: new Date() } }]
    }).lean().catch(() => null);

    if (!share) return null;

    const noteId = share.note_id;
    const [note, transcript, summary, user]: [any, any, any, any] = await Promise.all([
      AudioNoteModel.findById(noteId).lean().catch(() => null),
      TranscriptModel.findOne({ note_id: noteId }).lean().catch(() => null),
      SummaryModel.findOne({ note_id: noteId }).lean().catch(() => null),
      UserModel.findById(share.shared_by_user_id).lean().catch(() => null),
    ]);

    return {
      shareInfo: {
        ...share,
        title: note?.title || 'Shared Note',
        duration_seconds: note?.duration_seconds || 0,
        shared_by_name: user?.name || 'A Student',
      },
      transcript,
      summary,
    };
  }

  async exportNoteMarkdown(noteId: string) {
    const [note, transcript, summary]: [any, any, any] = await Promise.all([
      AudioNoteModel.findById(noteId).lean().catch(() => null),
      TranscriptModel.findOne({ note_id: noteId }).lean().catch(() => null),
      SummaryModel.findOne({ note_id: noteId }).lean().catch(() => null),
    ]);

    const md = `
# ${note?.title || 'Smart Voice Note Summary'}
**Generated on:** ${new Date().toLocaleDateString()}
**Duration:** ${note?.duration_seconds || 0} seconds

---

## 📋 Executive Summary
${summary?.summary_text || 'No summary available.'}

## 🎯 Key Takeaways
${summary?.bullet_points?.map((t: string) => `- ${t}`).join('\n') || '- None recorded.'}

## 🔑 Key Terms & Glossary
${summary?.keywords?.map((k: any) => `- **${k.term}**: ${k.definition}`).join('\n') || '- None.'}

## 🎙️ Full Transcript
${transcript?.raw_text || 'No transcript generated.'}
    `.trim();

    return md;
  }
}

export const sharesService = new SharesService();

const router = Router();

router.post('/notes/:noteId/share', authenticate, validateBody(CreateShareSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await sharesService.createShare(req.user!.userId, req.params.noteId, req.body);
    res.status(201).json({
      success: true,
      message: 'Share link generated successfully.',
      data: {
        ...result,
        shareUrl: `http://localhost:5000/api/v1/shares/public/${result.access_token}`,
      },
    });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

router.get('/public/:token', async (req: any, res: Response, next: NextFunction) => {
  try {
    const sharedData = await sharesService.getSharedNote(req.params.token);
    if (!sharedData) {
      res.status(404).json({ success: false, error: 'Share link is invalid or has expired.' });
      return;
    }
    res.status(200).json({ success: true, data: sharedData });
  } catch (error) { next(error); }
});

router.get('/notes/:noteId/export/markdown', authenticate, async (req: any, res: Response, next: NextFunction) => {
  try {
    const markdown = await sharesService.exportNoteMarkdown(req.params.noteId);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="note-${req.params.noteId}.md"`);
    res.send(markdown);
  } catch (error) { next(error); }
});

export default router;
