import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { notesController } from './notes.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../../middleware/validate.middleware.js';
import {
  InitNoteUploadSchema,
  CreateTextNoteSchema,
  UpdateNoteSchema,
  SyncNotesBatchSchema,
  SearchNotesSchema,
} from './notes.schema.js';
import { config } from '../../config/env.js';

const router = Router();

// Multer storage for local upload mock
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.storage.localUploadDir)) {
      fs.mkdirSync(config.storage.localUploadDir, { recursive: true });
    }
    cb(null, config.storage.localUploadDir);
  },
  filename: (req, file, cb) => {
    const noteId = req.params.id;
    cb(null, `${noteId}.m4a`);
  },
});
const upload = multer({ storage });

router.use(authenticate);

// Direct text note creation
router.post('/text', validateBody(CreateTextNoteSchema), (req, res, next) => notesController.createTextNote(req, res, next));

// Init and complete audio upload
router.post('/', validateBody(InitNoteUploadSchema), (req, res, next) => notesController.initUpload(req, res, next));
router.post('/:id/complete', (req, res, next) => notesController.completeUpload(req, res, next));

// Direct local audio upload (for dev/local testing)
router.post('/:id/upload-audio', upload.single('audio'), (req, res, next) => {
  req.params.noteId = req.params.id;
  notesController.completeUpload(req, res, next);
});

// Search & Sync
router.get('/search', validateQuery(SearchNotesSchema), (req, res, next) => notesController.searchNotes(req, res, next));
router.post('/sync', validateBody(SyncNotesBatchSchema), (req, res, next) => notesController.syncBatch(req, res, next));

// CRUD
router.get('/', (req, res, next) => notesController.getNotes(req, res, next));
router.get('/:id/status', (req, res, next) => notesController.getStatus(req, res, next));
router.get('/:id', (req, res, next) => notesController.getNote(req, res, next));
router.patch('/:id', validateBody(UpdateNoteSchema), (req, res, next) => notesController.updateNote(req, res, next));
router.delete('/:id', (req, res, next) => notesController.deleteNote(req, res, next));

export default router;

