import { Router } from 'express';
import { recommendationsController } from './recommendations.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => recommendationsController.getRecommendations(req, res, next));
router.get('/:userId', (req, res, next) => recommendationsController.getRecommendations(req, res, next));
router.post('/refresh', (req, res, next) => recommendationsController.refreshRecommendations(req, res, next));

export default router;
