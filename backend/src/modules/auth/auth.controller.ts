import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { refreshToken } = req.body || {};
      await authService.logout(userId, refreshToken);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async registerBiometric(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { biometricPubkey } = req.body;
      const result = await authService.registerBiometric(userId, biometricPubkey);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await authService.updateSettings(userId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const authController = new AuthController();
