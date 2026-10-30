import { Router } from 'express';
import { doubtChatController } from './doubt-chat.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', doubtChatController.getSession);
router.post('/message', doubtChatController.sendMessage);
router.delete('/', doubtChatController.clearSession);

export const doubtChatRouter = router;
