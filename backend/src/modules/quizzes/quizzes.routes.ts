import { Router } from 'express';
import { quizzesController } from './quizzes.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { SubmitQuizAttemptSchema } from './quizzes.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => quizzesController.getQuizzes(req, res, next));
router.post('/', (req, res, next) => quizzesController.createQuiz(req, res, next));
router.get('/attempts', (req, res, next) => quizzesController.getAttempts(req, res, next));
router.get('/:id', (req, res, next) => quizzesController.getQuiz(req, res, next));
router.delete('/:id', (req, res, next) => quizzesController.deleteQuiz(req, res, next));
router.post('/:id/attempt', validateBody(SubmitQuizAttemptSchema), (req, res, next) =>
  quizzesController.submitAttempt(req, res, next)
);

export default router;

