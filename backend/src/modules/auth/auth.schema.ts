import { z } from 'zod';

const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

export const SendOtpSchema = z.object({
  email: z.string().regex(gmailRegex, 'Please enter a valid Gmail address (e.g., yourname@gmail.com)'),
  name: z.string().optional(),
  purpose: z.enum(['signup', 'reset']).optional().default('signup'),
});

export const VerifyOtpSchema = z.object({
  email: z.string().regex(gmailRegex, 'Please enter a valid Gmail address (e.g., yourname@gmail.com)'),
  otp: z.string().min(4, 'Verification code must be at least 4 digits').max(8, 'Verification code is too long'),
});

export const SignupSchema = z.object({
  email: z.string().regex(gmailRegex, 'Please enter a valid Gmail address (e.g., yourname@gmail.com)'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['student', 'admin', 'employee']).optional(),
  portal: z.enum(['student', 'admin', 'employee']).optional(),
  adminSecretKey: z.string().optional(),
  otp: z.string().min(4, 'Please enter the verification code sent to your Gmail'),
  themePref: z.enum(['light', 'dark', 'system']).optional().default('system'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().regex(gmailRegex, 'Please enter a valid Gmail address (e.g., yourname@gmail.com)'),
  otp: z.string().min(4, 'Verification code must be at least 4 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().min(1, 'Please enter your registered email address'),
  password: z.string().min(1, 'Please enter your password'),
  role: z.enum(['student', 'admin', 'employee']).optional(),
  portal: z.enum(['student', 'admin', 'employee']).optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const BiometricRegisterSchema = z.object({
  biometricPubkey: z.string().min(1, 'Biometric public key/token is required'),
});

export const BiometricLoginSchema = z.object({
  email: z.string().email(),
  biometricToken: z.string().min(1),
});

export const UpdateSettingsSchema = z.object({
  themePref: z.enum(['light', 'dark', 'system']).optional(),
  name: z.string().min(2).optional(),
  settings: z.record(z.any()).optional(),
});
