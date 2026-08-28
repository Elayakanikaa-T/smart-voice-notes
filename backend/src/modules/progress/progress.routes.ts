import { Router } from 'express';
import { progressController } from './progress.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => progressController.getProgress(req, res, next));
router.get('/:userId', (req, res, next) => progressController.getProgress(req, res, next));
router.get('/subjects/:subjectId', (req, res, next) => progressController.getSubjectProgress(req, res, next));

export default router;
