import { Router } from 'express';
import { learningPathController } from './learningPath.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => learningPathController.getLearningPaths(req, res, next));
router.get('/:userId', (req, res, next) => learningPathController.getLearningPaths(req, res, next));
router.post('/topics', (req, res, next) => learningPathController.addTopic(req, res, next));
router.post('/generate', (req, res, next) => learningPathController.generatePath(req, res, next));
router.post('/', (req, res, next) => learningPathController.generatePath(req, res, next));
router.patch('/:pathId/steps/:stepId', (req, res, next) => learningPathController.updateStep(req, res, next));
router.delete('/:pathId/steps/:stepId', (req, res, next) => learningPathController.deleteStep(req, res, next));

export default router;
