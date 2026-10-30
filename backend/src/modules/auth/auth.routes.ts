import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  SendOtpSchema,
  VerifyOtpSchema,
  SignupSchema,
  ResetPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  BiometricRegisterSchema,
  UpdateSettingsSchema,
} from './auth.schema.js';

const router = Router();

router.post('/send-otp', validateBody(SendOtpSchema), (req, res, next) => authController.sendOtp(req, res, next));
router.post('/verify-otp', validateBody(VerifyOtpSchema), (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/signup', validateBody(SignupSchema), (req, res, next) => authController.signup(req, res, next));
router.post('/login', validateBody(LoginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/reset-password', validateBody(ResetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

router.post('/refresh', validateBody(RefreshTokenSchema), (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
router.post('/biometric/register', authenticate, validateBody(BiometricRegisterSchema), (req, res, next) =>
  authController.registerBiometric(req, res, next)
);
router.patch('/settings', authenticate, validateBody(UpdateSettingsSchema), (req, res, next) =>
  authController.updateSettings(req, res, next)
);

export default router;
