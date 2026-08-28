/**
 * Task Reminder Cron
 * Runs every hour. Finds action items due within 24h (not yet reminded) and:
 *   1. Creates an in-app notification for the owner
 *   2. Optionally sends email via Nodemailer (if EMAIL_HOST is configured)
 */
import cron from 'node-cron';
import { ActionItemModel } from '../models/actionItem.model.js';
import { NotificationModel } from '../models/meetingNotification.model.js';
import { MeetingModel } from '../models/meeting.model.js';
import { logger } from '../utils/logger.js';
import { sendReminderEmail } from './emailService.js';

export function startTaskReminderCron() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find items due within 24h that haven't been reminded yet and aren't done
      const dueSoon = await ActionItemModel.find({
        dueDate: { $lte: in24h, $gte: now },
        reminderSent: false,
        status: { $ne: 'done' },
      }).lean();

      // Find overdue items (dueDate passed, not done, not reminded)
      const overdue = await ActionItemModel.find({
        dueDate: { $lt: now },
        reminderSent: false,
        status: { $ne: 'done' },
      }).lean();

      const all = [...dueSoon, ...overdue];
      if (all.length === 0) return;

      logger.info(`[TaskCron] Processing ${all.length} task reminder(s)`);

      for (const item of all) {
        const anyItem = item as any;
        const isOverdue = anyItem.dueDate < now;
        const ownerUserId = anyItem.owner?.userId;
        const ownerEmail = anyItem.owner?.email;
        const ownerName = anyItem.owner?.name;
        const meeting: any = await MeetingModel.findById(anyItem.meetingId, 'title').lean();
        const meetingTitle = meeting?.title || 'a meeting';

        const notifTitle = isOverdue ? '⚠️ Overdue Task' : '🔔 Task Due Soon';
        const notifMessage = isOverdue
          ? `Your task "${anyItem.task}" from "${meetingTitle}" is overdue!`
          : `Your task "${anyItem.task}" from "${meetingTitle}" is due within 24 hours.`;

        // In-app notification
        if (ownerUserId) {
          await NotificationModel.create({
            userId: ownerUserId,
            type: isOverdue ? 'task_overdue' : 'task_reminder',
            title: notifTitle,
            message: notifMessage,
            relatedMeetingId: anyItem.meetingId,
            relatedActionItemId: anyItem._id,
          });
        }

        // Email notification (optional — graceful if no SMTP)
        if (ownerEmail) {
          await sendReminderEmail({
            to: ownerEmail,
            toName: ownerName || ownerEmail,
            subject: notifTitle,
            body: notifMessage,
            meetingTitle,
            taskText: anyItem.task,
            dueDate: anyItem.dueDate,
            isOverdue,
          }).catch((err: any) => {
            logger.warn(`[TaskCron] Email send failed for ${ownerEmail}: ${err.message}`);
          });
        }

        // Mark as reminded
        await ActionItemModel.findByIdAndUpdate(anyItem._id, { $set: { reminderSent: true } });
      }

      logger.info(`[TaskCron] Sent ${all.length} reminder(s)`);
    } catch (err: any) {
      logger.error(`[TaskCron] Error: ${err.message}`);
    }
  });

  logger.info('[TaskCron] Task reminder cron started (runs every hour).');
}
