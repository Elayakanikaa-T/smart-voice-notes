import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => profileController.getProfile(req, res, next));
router.put('/', (req, res, next) => profileController.updateProfile(req, res, next));
router.patch('/', (req, res, next) => profileController.updateProfile(req, res, next));

export default router;
