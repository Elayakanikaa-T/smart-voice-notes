import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { UserModel } from '../../models/index.js';
import { hashPassword, comparePassword } from '../../utils/crypto.js';

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
          age: null,
          status: 'Active',
          phone: '',
          gender: '',
          institution: '',
          grade_or_designation: '',
          bio: '',
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
      const {
        name,
        age,
        status,
        phone,
        gender,
        institution,
        grade_or_designation,
        bio,
        preferred_language,
        theme_pref,
        avatar_url,
        settings,
        currentPassword,
        newPassword,
        password,
      } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      // Handle password update if provided
      const passwordToSet = newPassword || password;
      if (passwordToSet) {
        if (typeof passwordToSet !== 'string' || passwordToSet.length < 6) {
          res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
          return;
        }

        if (currentPassword) {
          const isMatch = await comparePassword(currentPassword, user.password_hash);
          if (!isMatch) {
            res.status(400).json({ success: false, error: 'Current password does not match.' });
            return;
          }
        }

        user.password_hash = await hashPassword(passwordToSet);
      }

      if (name !== undefined) user.name = name.trim();
      if (age !== undefined) {
        const parsedAge = Number(age);
        user.age = isNaN(parsedAge) ? undefined : parsedAge;
      }
      if (status !== undefined) user.status = status.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (gender !== undefined) user.gender = gender;
      if (institution !== undefined) user.institution = institution.trim();
      if (grade_or_designation !== undefined) user.grade_or_designation = grade_or_designation.trim();
      if (bio !== undefined) user.bio = bio.trim();
      if (preferred_language !== undefined) user.preferred_language = preferred_language;
      if (theme_pref !== undefined) user.theme_pref = theme_pref;
      if (avatar_url !== undefined) user.avatar_url = avatar_url;
      if (settings !== undefined) {
        user.settings = { ...user.settings, ...settings };
      }

      await user.save();

      const userObj = user.toObject();
      delete (userObj as any).password_hash;

      res.status(200).json({
        success: true,
        message: passwordToSet ? 'Profile and password updated successfully.' : 'Profile updated successfully.',
        data: userObj,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Failed to update profile.' });
    }
  }
}

export const profileController = new ProfileController();
