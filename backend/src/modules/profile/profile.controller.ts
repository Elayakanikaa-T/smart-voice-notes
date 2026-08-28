import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { UserModel } from '../../models/index.js';

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const user = await UserModel.findById(userId).select('-password_hash').lean();
      if (user) {
        res.status(200).json({ success: true, data: user });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: userId,
          email: req.user!.email,
          name: req.user!.name,
          role: req.user!.role,
          preferred_language: 'en',
          theme_pref: 'system',
          settings: { autoSummarize: true, autoGenerateQuiz: true, audioQuality: 'high', offlineSync: true },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, preferred_language, theme_pref, avatar_url, settings } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (preferred_language) updateData.preferred_language = preferred_language;
      if (theme_pref) updateData.theme_pref = theme_pref;
      if (avatar_url) updateData.avatar_url = avatar_url;
      if (settings) updateData.settings = settings;

      const updated = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true })
        .select('-password_hash')
        .lean();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated || {
          id: userId,
          email: req.user!.email,
          name: name || req.user!.name,
          preferred_language: preferred_language || 'en',
          theme_pref: theme_pref || 'system',
          settings: settings || { autoSummarize: true, autoGenerateQuiz: true },
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const profileController = new ProfileController();


