import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['student', 'admin', 'employee']).optional(),
  portal: z.enum(['student', 'admin', 'employee']).optional(),
  themePref: z.enum(['light', 'dark', 'system']).optional().default('system'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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
