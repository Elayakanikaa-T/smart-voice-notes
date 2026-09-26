import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { transcriptionController } from './transcription.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { config } from '../../config/env.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.resolve(config.storage.localUploadDir, 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `stt_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

router.use(authenticate);

// Direct audio transcription
router.post('/transcribe', upload.single('audio'), (req, res, next) => transcriptionController.transcribeAudio(req as any, res, next));

router.get('/:noteId', (req, res, next) => transcriptionController.getTranscript(req as any, res, next));
router.patch('/:noteId', (req, res, next) => transcriptionController.updateTranscript(req as any, res, next));

export default router;

