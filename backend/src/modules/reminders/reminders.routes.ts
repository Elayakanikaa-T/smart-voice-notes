import { Router } from 'express';
import { remindersController } from './reminders.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => remindersController.getReminders(req, res, next));
router.post('/', (req, res, next) => remindersController.createReminder(req, res, next));
router.put('/:id', (req, res, next) => remindersController.updateReminder(req, res, next));
router.patch('/:id/complete', (req, res, next) => remindersController.markComplete(req, res, next));
router.delete('/:id', (req, res, next) => remindersController.deleteReminder(req, res, next));

export default router;
