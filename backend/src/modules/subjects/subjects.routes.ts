import { Router } from 'express';
import { subjectsController } from './subjects.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  CreateSubjectSchema,
  UpdateSubjectSchema,
  CreateFolderSchema,
} from './subjects.schema.js';

const router = Router();

router.use(authenticate);

// Subjects
router.get('/', (req, res, next) => subjectsController.getSubjects(req, res, next));
router.get('/:id', (req, res, next) => subjectsController.getSubject(req, res, next));
router.get('/:id/notes', (req, res, next) => subjectsController.getSubjectNotes(req, res, next));
router.post('/', validateBody(CreateSubjectSchema), (req, res, next) => subjectsController.createSubject(req, res, next));
router.patch('/:id', validateBody(UpdateSubjectSchema), (req, res, next) => subjectsController.updateSubject(req, res, next));
router.delete('/:id', (req, res, next) => subjectsController.deleteSubject(req, res, next));

// Folders
router.get('/folders/list', (req, res, next) => subjectsController.getFolders(req, res, next));
router.post('/folders', validateBody(CreateFolderSchema), (req, res, next) => subjectsController.createFolder(req, res, next));
router.delete('/folders/:id', (req, res, next) => subjectsController.deleteFolder(req, res, next));

export default router;
