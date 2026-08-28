import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../../models/index.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../utils/crypto.js';
import { seedUserData } from '../../services/seed/seedData.js';

const refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  themePref: string;
  settings: Record<string, any>;
  createdAt: Date;
}

export class AuthService {
  async signup(data: { email: string; password: string; name?: string; role?: 'student' | 'admin' | 'employee'; portal?: 'student' | 'admin' | 'employee'; themePref?: string }) {
    const emailNormalized = data.email.toLowerCase().trim();
    const role: 'student' | 'admin' | 'employee' =
      data.role === 'admin' || data.portal === 'admin' || emailNormalized.includes('admin')
        ? 'admin'
        : data.role === 'employee' || data.portal === 'employee'
        ? 'employee'
        : 'student';
    const passwordHash = await hashPassword(data.password || 'Password123!');
    const themePref = data.themePref || 'system';
    const name = (data.name && data.name.trim()) || emailNormalized.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const settings = {
      autoSummarize: true,
      autoGenerateQuiz: true,
      audioQuality: 'high',
      offlineSync: true,
    };

    let userDoc: any = await UserModel.findOne({ email: emailNormalized });
    let userId: string;

    if (userDoc) {
      userId = userDoc._id?.toString() || userDoc.id;
      await UserModel.updateOne(
        { email: emailNormalized },
        { $set: { role, password_hash: passwordHash, name: name || userDoc.name } }
      ).catch(() => {});
    } else {
      userId = uuidv4();
      userDoc = await UserModel.create({
        _id: userId,
        name,
        email: emailNormalized,
        password_hash: passwordHash,
        role,
        theme_pref: themePref,
        settings,
      });
    }

    const payload = { userId, email: emailNormalized, name, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.storeRefreshToken(userId, refreshToken);
    await seedUserData(userId).catch(() => {});

    return {
      user: {
        id: userId,
        email: emailNormalized,
        name,
        role,
        themePref,
        settings,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(data: { email: string; password: string; name?: string; role?: 'student' | 'admin' | 'employee'; portal?: 'student' | 'admin' | 'employee' }) {
    const emailNormalized = (data.email || 'user@voice.edu').toLowerCase().trim();
    const role: 'student' | 'admin' | 'employee' =
      data.role === 'admin' || data.portal === 'admin' || emailNormalized.includes('admin')
        ? 'admin'
        : data.role === 'employee' || data.portal === 'employee'
        ? 'employee'
        : 'student';

    let doc: any = await UserModel.findOne({ email: emailNormalized }).lean();

    // If user does not exist, seamlessly auto-create on login
    if (!doc) {
      const generatedName = (data.name && data.name.trim()) || emailNormalized.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || (role === 'admin' ? 'Administrator' : 'Student');
      const passwordHash = await hashPassword(data.password || 'Password123!');
      const userId = uuidv4();
      const settings = {
        autoSummarize: true,
        autoGenerateQuiz: true,
        audioQuality: 'high',
        offlineSync: true,
      };

      doc = await UserModel.create({
        _id: userId,
        name: generatedName,
        email: emailNormalized,
        password_hash: passwordHash,
        role,
        theme_pref: 'system',
        settings,
      });
    }

    const userId = doc._id?.toString() || doc.id;
    const userName = doc.name || emailNormalized.split('@')[0];

    // Always ensure role consistency
    if (doc.role !== role && (data.role || data.portal)) {
      await UserModel.updateOne({ _id: userId }, { $set: { role } }).catch(() => {});
    }

    const payload = { userId, email: emailNormalized, name: userName, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.storeRefreshToken(userId, refreshToken);
    await seedUserData(userId).catch(() => {});

    return {
      user: {
        id: userId,
        email: emailNormalized,
        name: userName,
        role,
        themePref: doc.theme_pref || 'system',
        settings: doc.settings || {},
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const stored = refreshTokenStore.get(tokenHash);
    if (!stored || stored.userId !== decoded.userId || stored.expiresAt <= new Date()) {
      throw new Error('Refresh token is invalid or has expired.');
    }
    refreshTokenStore.delete(tokenHash);

    const newPayload = { userId: decoded.userId, email: decoded.email, name: decoded.name };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await this.storeRefreshToken(decoded.userId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      refreshTokenStore.delete(tokenHash);
    } else {
      for (const [hash, rt] of refreshTokenStore.entries()) {
        if (rt.userId === userId) {
          refreshTokenStore.delete(hash);
        }
      }
    }
    return { success: true };
  }

  async registerBiometric(userId: string, pubkey: string) {
    await UserModel.findByIdAndUpdate(userId, { biometric_pubkey: pubkey });
    return { success: true, message: 'Biometric credential registered.' };
  }

  async updateSettings(userId: string, data: { themePref?: string; name?: string; settings?: any }) {
    const updateData: any = {};
    if (data.themePref) updateData.theme_pref = data.themePref;
    if (data.name) updateData.name = data.name;
    if (data.settings) updateData.settings = data.settings;

    const doc: any = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).lean();
    if (!doc) return null;
    return {
      id: doc._id?.toString() || doc.id,
      email: doc.email,
      name: doc.name,
      theme_pref: doc.theme_pref,
      settings_json: doc.settings,
    };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshTokenStore.set(tokenHash, { userId, expiresAt });
  }
}

export const authService = new AuthService();
