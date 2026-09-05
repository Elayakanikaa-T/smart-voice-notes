import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/auth.middleware.js';
import { meetingsController } from './meetings.controller.js';
import { decisionsController } from '../decisions/decisions.controller.js';
import { actionItemsController } from '../action-items/actionItems.controller.js';
import { summariesController } from '../summaries/summaries.controller.js';

const router = Router();

// Multer: store meeting audio in /uploads/meetings
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads/meetings'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// Guest Access (Public)
router.get('/live/:id', (req, res, next) => meetingsController.getById(req as any, res, next));

// All routes require JWT auth
router.use(authenticate);

// Meeting CRUD
router.post('/', (req, res, next) => meetingsController.create(req as any, res, next));
router.get('/', (req, res, next) => meetingsController.list(req as any, res, next));
router.get('/:id', (req, res, next) => meetingsController.getById(req as any, res, next));
router.patch('/:id', (req, res, next) => meetingsController.update(req as any, res, next));
router.delete('/:id', (req, res, next) => meetingsController.deleteMeeting(req as any, res, next));
router.post('/:id/share', (req, res, next) => meetingsController.shareMeeting(req as any, res, next));

// Audio upload → triggers transcription job
router.post(
  '/:id/audio',
  upload.single('audio'),
  (req, res, next) => meetingsController.uploadAudio(req as any, res, next)
);

// Update transcript directly
router.patch('/:id/transcript', (req, res, next) => meetingsController.updateTranscript(req as any, res, next));

// Poll processing status
router.get('/:id/status', (req, res, next) => meetingsController.getStatus(req as any, res, next));

// Summary sub-routes
router.get('/:id/summary', (req, res, next) => summariesController.get(req as any, res, next));
router.post('/:id/summary/regenerate', (req, res, next) => summariesController.regenerate(req as any, res, next));

// Decisions sub-routes
router.get('/:id/decisions', (req, res, next) => decisionsController.list(req as any, res, next));
router.post('/:id/decisions', (req, res, next) => decisionsController.create(req as any, res, next));
router.patch('/:id/decisions/:decisionId', (req, res, next) => decisionsController.update(req as any, res, next));
router.delete('/:id/decisions/:decisionId', (req, res, next) => decisionsController.remove(req as any, res, next));

// Action Items sub-routes
router.get('/:id/action-items', (req, res, next) => actionItemsController.list(req as any, res, next));
router.post('/:id/action-items', (req, res, next) => actionItemsController.create(req as any, res, next));
router.patch('/:id/action-items/:itemId', (req, res, next) => actionItemsController.update(req as any, res, next));
router.delete('/:id/action-items/:itemId', (req, res, next) => actionItemsController.remove(req as any, res, next));

export default router;
