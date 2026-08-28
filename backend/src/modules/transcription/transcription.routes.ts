import { Router } from 'express';
import { transcriptionController } from './transcription.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/:noteId', (req, res, next) => transcriptionController.getTranscript(req, res, next));
router.patch('/:noteId', (req, res, next) => transcriptionController.updateTranscript(req, res, next));

export default router;
