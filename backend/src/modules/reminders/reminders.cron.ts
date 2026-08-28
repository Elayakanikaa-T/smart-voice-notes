import cron from 'node-cron';
import { ReminderModel } from '../../models/reminder.model.js';
import { logger } from '../../utils/logger.js';
import { isMongoConnected } from '../../config/database.js';

export class RemindersCron {
  public start() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      if (!isMongoConnected) return;

      try {
        const now = new Date();
        // Find reminders that are due, not completed, and not notified
        const dueReminders = await ReminderModel.find({
          due_date: { $lte: now },
          is_completed: false,
          is_notified: false,
        });

        for (const reminder of dueReminders) {
          logger.info(`[Reminders] Triggering notification for reminder: ${reminder._id} - ${reminder.title}`);
          
          // In a real app, send push notification or email here
          // e.g. web push via Webhooks, or WebSocket to frontend
          
          reminder.is_notified = true;
          
          // If recurrence is not none, calculate next due date
          if (reminder.recurrence !== 'none') {
            const nextDue = new Date(reminder.due_date);
            if (reminder.recurrence === 'daily') {
              nextDue.setDate(nextDue.getDate() + 1);
            } else if (reminder.recurrence === 'weekly') {
              nextDue.setDate(nextDue.getDate() + 7);
            } else if (reminder.recurrence === 'monthly') {
              nextDue.setMonth(nextDue.getMonth() + 1);
            }
            reminder.next_due_date = nextDue;
          }
          
          await reminder.save();
        }
      } catch (err) {
        logger.error('[Reminders] Error running cron job:', err);
      }
    });
    
    logger.info('[Reminders] Cron job initialized.');
  }
}

export const remindersCron = new RemindersCron();
