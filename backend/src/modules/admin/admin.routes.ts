import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export const adminRouter = Router();

// Protect all admin endpoints with JWT authentication & Admin role check
adminRouter.use(authenticate);
adminRouter.use(requireRole('admin'));

adminRouter.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
adminRouter.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));
adminRouter.get('/stats', (req, res, next) => adminController.getStats(req, res, next));
adminRouter.post('/publish-exam', (req, res, next) => adminController.publishExam(req, res, next));
adminRouter.put('/quizzes/:id', (req, res, next) => adminController.updateQuiz(req, res, next));
adminRouter.delete('/quizzes/:id', (req, res, next) => adminController.deleteQuiz(req, res, next));
