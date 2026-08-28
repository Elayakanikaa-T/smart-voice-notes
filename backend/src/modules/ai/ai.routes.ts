import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/:noteId/summary', (req, res, next) => aiController.getSummary(req, res, next));
router.post('/:noteId/regenerate-summary', (req, res, next) => aiController.regenerateSummary(req, res, next));
router.get('/:noteId/flashcards', (req, res, next) => aiController.getFlashcards(req, res, next));
router.post('/:noteId/generate-flashcards', (req, res, next) => aiController.generateFlashcards(req, res, next));
router.post('/:noteId/generate-quiz', (req, res, next) => aiController.generateQuiz(req, res, next));
router.post('/topic-details', (req, res, next) => aiController.getTopicDetails(req, res, next));
router.get('/topic-details', (req, res, next) => aiController.getTopicDetails(req, res, next));
router.post('/evaluate-voice-answer', (req, res, next) => aiController.evaluateVoiceAnswer(req, res, next));

export default router;
