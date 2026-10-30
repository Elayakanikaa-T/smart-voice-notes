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
import { sendOTPEmail } from '../../services/emailService.js';
import { logger } from '../../utils/logger.js';

const refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();
// In-memory OTP storage with 10-minute expiry
const otpStore = new Map<string, { otp: string; expiresAt: Date; verified?: boolean }>();

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  themePref: string;
  settings: Record<string, any>;
  createdAt: Date;
}

export class AuthService {
  /**
   * Send 6-digit OTP to user's email for signup or password reset
   */
  async sendOtp(data: { email: string; name?: string; purpose?: string }) {
    const emailNormalized = (data.email || '').toLowerCase().trim();
    if (!emailNormalized || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(emailNormalized)) {
      throw new Error('Please enter a valid Gmail address (e.g., yourname@gmail.com).');
    }

    // If purpose is signup, ensure email is not already registered
    if (data.purpose !== 'reset') {
      const existingUser = await UserModel.findOne({ email: emailNormalized });
      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore.set(emailNormalized, { otp, expiresAt, verified: false });
    logger.info(`[AuthService] OTP generated for ${emailNormalized} (expires at ${expiresAt.toISOString()})`);

    // Send email — MANDATORY. If delivery fails, remove the stored OTP and throw so signup cannot proceed.
    try {
      await sendOTPEmail({
        to: emailNormalized,
        toName: data.name,
        otp,
      });
    } catch (emailErr: any) {
      otpStore.delete(emailNormalized);
      logger.error(`[AuthService] Failed to send OTP email to ${emailNormalized}: ${emailErr.message}`);
      const msg = emailErr?.message || 'We could not deliver the verification code. Please check your SMTP configuration.';
      throw new Error(msg);
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${emailNormalized}. Please check your inbox and spam folder.`,
      // NEVER return the OTP in the API response — not even in development.
    };
  }

  /**
   * Verify the 6-digit OTP sent to user's email
   */
  async verifyOtp(data: { email: string; otp: string }) {
    const emailNormalized = (data.email || '').toLowerCase().trim();
    const stored = otpStore.get(emailNormalized);

    if (!stored) {
      throw new Error('No verification code requested or code has expired. Please click "Send Verification Code" first.');
    }

    if (new Date() > stored.expiresAt) {
      otpStore.delete(emailNormalized);
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (stored.otp !== data.otp.trim()) {
      throw new Error('Invalid verification code. Please check your email and try again.');
    }

    stored.verified = true;
    return {
      success: true,
      message: 'Email address verified successfully.',
    };
  }

  /**
   * Signup: validates credentials, checks email verification via OTP, creates account
   */
  async signup(data: { 
    email: string; 
    password: string; 
    name?: string; 
    role?: 'student' | 'admin' | 'employee'; 
    portal?: 'student' | 'admin' | 'employee'; 
    themePref?: string;
    otp?: string;
    adminSecretKey?: string;
  }) {
    const emailNormalized = (data.email || '').toLowerCase().trim();
    if (!emailNormalized || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(emailNormalized)) {
      throw new Error('Please enter a valid Gmail address (e.g., yourname@gmail.com).');
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // Check if user already exists
    const existingDoc = await UserModel.findOne({ email: emailNormalized });
    if (existingDoc) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    // Verify OTP: either passed in data.otp or verified in session
    const storedOtp = otpStore.get(emailNormalized);
    const isOtpValid = 
      (data.otp && storedOtp && storedOtp.otp === data.otp.trim() && new Date() <= storedOtp.expiresAt) ||
      (storedOtp && storedOtp.verified && new Date() <= storedOtp.expiresAt);

    if (!isOtpValid) {
      throw new Error('Please verify your email first using the 6-digit verification code.');
    }

    // Consume OTP once successfully used
    otpStore.delete(emailNormalized);

    const requestedRole: 'student' | 'admin' | 'employee' =
      data.role === 'admin' || data.portal === 'admin'
        ? 'admin'
        : data.role === 'employee' || data.portal === 'employee'
        ? 'employee'
        : 'student';

    // Admin authorization check: reject unauthorized admin signups
    if (requestedRole === 'admin') {
      const validAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'ADMIN_MASTER_2026!';
      if (!data.adminSecretKey || data.adminSecretKey.trim() !== validAdminKey) {
        throw new Error('Admin registration is restricted. Invalid Administrator Authorization Key.');
      }
    }

    const passwordHash = await hashPassword(data.password);
    const themePref = data.themePref || 'system';
    const name = (data.name && data.name.trim()) || emailNormalized.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const settings = {
      autoSummarize: true,
      autoGenerateQuiz: true,
      audioQuality: 'high',
      offlineSync: true,
    };

    const userId = uuidv4();
    await UserModel.create({
      _id: userId,
      name,
      email: emailNormalized,
      password_hash: passwordHash,
      role: requestedRole,
      email_verified: true,
      theme_pref: themePref,
      settings,
    });

    const payload = { userId, email: emailNormalized, name, role: requestedRole };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.storeRefreshToken(userId, refreshToken);
    await seedUserData(userId).catch(() => {});

    return {
      user: {
        id: userId,
        email: emailNormalized,
        name,
        role: requestedRole,
        themePref,
        settings,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Login: Strictly validates existing user account, password hash, and matching role.
   * Completely rejects unknown accounts, wrong passwords, unverified users, and role mismatches.
   */
  async login(data: { 
    email: string; 
    password: string; 
    name?: string; 
    role?: 'student' | 'admin' | 'employee'; 
    portal?: 'student' | 'admin' | 'employee' 
  }) {
    const emailNormalized = (data.email || '').toLowerCase().trim();
    if (!emailNormalized) {
      throw new Error('Please enter a valid email address.');
    }
    if (!data.password) {
      throw new Error('Invalid email or password.');
    }

    const doc: any = await UserModel.findOne({ email: emailNormalized });

    // Requirement: If user has not signed up, display "No account found. Please sign up first."
    if (!doc) {
      throw new Error('No account found. Please sign up first.');
    }

    // Requirement: If email is not verified, require verification
    if (doc.email_verified === false) {
      throw new Error('Please verify your email first.');
    }

    // STRICT PASSWORD VERIFICATION: Compare input password against stored bcrypt hash
    const isPasswordValid = await comparePassword(data.password, doc.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // ROLE VERIFICATION: Confirm that selected role matches user's authorized role in database
    const selectedRole = data.role || data.portal;
    if (selectedRole && selectedRole !== doc.role) {
      throw new Error(`Role mismatch. Your account is registered as a "${doc.role}". Please select the ${doc.role} role.`);
    }

    const userId = doc._id?.toString() || doc.id;
    const userName = doc.name || emailNormalized.split('@')[0];
    const role = doc.role || 'student';

    // Update last login
    await UserModel.updateOne({ _id: userId }, { $set: { last_login: new Date() } }).catch(() => {});

    const payload = { userId, email: emailNormalized, name: userName, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.storeRefreshToken(userId, refreshToken);

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

  /**
   * Reset Password with OTP verification
   */
  async resetPassword(data: { email: string; otp: string; newPassword: string }) {
    const emailNormalized = (data.email || '').toLowerCase().trim();
    if (!emailNormalized || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(emailNormalized)) {
      throw new Error('Please enter a valid Gmail address (e.g., yourname@gmail.com).');
    }

    if (!data.newPassword || data.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const doc = await UserModel.findOne({ email: emailNormalized });
    if (!doc) {
      throw new Error('No account found with this email address.');
    }

    const storedOtp = otpStore.get(emailNormalized);
    if (!storedOtp || storedOtp.otp !== data.otp.trim() || new Date() > storedOtp.expiresAt) {
      throw new Error('Invalid or expired verification code. Please request a new code.');
    }

    otpStore.delete(emailNormalized);

    const passwordHash = await hashPassword(data.newPassword);
    await UserModel.updateOne({ _id: doc._id }, { $set: { password_hash: passwordHash, email_verified: true } });

    return {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
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
