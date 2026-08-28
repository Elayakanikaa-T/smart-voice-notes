import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/subject/:subjectId', (req, res, next) => analyticsController.getSubjectAnalytics(req, res, next));

export default router;
