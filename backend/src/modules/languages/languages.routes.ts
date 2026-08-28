import { Router } from 'express';
import { languagesController } from './languages.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Public or Authenticated lookup for languages
router.get('/', (req, res, next) => languagesController.getLanguages(req, res, next));

// Authenticated translation
router.post('/translate', authenticate, (req, res, next) => languagesController.translateContent(req, res, next));

export default router;
