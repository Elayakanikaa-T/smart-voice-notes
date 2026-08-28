import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { NotificationModel } from '../../models/meetingNotification.model.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { actionItemsController } from '../action-items/actionItems.controller.js';

const router = Router();
router.use(authenticate);

// Get my action items across all meetings
router.get('/my-action-items', (req, res, next) =>
  actionItemsController.myItems(req as any, res, next)
);

// Get notifications
router.get('/notifications', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const notifs = await NotificationModel.find({ userId })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();
    const unreadCount = await NotificationModel.countDocuments({ userId, read: false });
    res.json({ success: true, data: { notifications: notifs, unreadCount } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Mark notification(s) as read
router.patch('/notifications/read', async (req: any, res) => {
  try {
    const { ids } = req.body; // array of notification ids, or empty to mark all
    const userId = req.user.userId;
    const query: any = { userId };
    if (ids && ids.length > 0) query._id = { $in: ids };
    await NotificationModel.updateMany(query, { $set: { read: true } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
