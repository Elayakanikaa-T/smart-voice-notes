import { ReminderModel, IReminder } from '../../models/index.js';
import { isMongoConnected } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class RemindersService {
  async getReminders(userId: string, query: {
    subjectId?: string;
    upcoming?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    if (isMongoConnected) {
      const filter: any = { user_id: userId };
      if (query.subjectId) filter.subject_id = query.subjectId;
      if (query.upcoming) {
        filter.due_date = { $gte: new Date() };
        filter.is_completed = false;
      }

      const [reminders, total] = await Promise.all([
        ReminderModel.find(filter)
          .sort({ due_date: 1 })
          .skip(offset)
          .limit(limit)
          .lean(),
        ReminderModel.countDocuments(filter),
      ]);

      return { reminders, total, limit, offset };
    }

    // In-memory fallback
    const now = new Date();
    const all = Array.from({ length: 0 }); // Empty for memory fallback
    return { reminders: all, total: 0, limit, offset };
  }

  async createReminder(userId: string, data: {
    title: string;
    description?: string;
    note?: string;
    subject_id?: string;
    due_date?: string | Date;
    reminder_date?: string | Date;
    dueDate?: string | Date;
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
    notification_channels?: ('in_app' | 'email')[];
  }) {
    const rawDate = data.due_date || data.reminder_date || data.dueDate;
    let dueDate = rawDate ? new Date(rawDate) : new Date(Date.now() + 24 * 3600 * 1000);
    if (isNaN(dueDate.getTime())) {
      dueDate = new Date(Date.now() + 24 * 3600 * 1000); // Default to tomorrow if invalid format
    }

    const description = data.description || data.note || '';

    if (isMongoConnected) {
      const reminder = await ReminderModel.create({
        user_id: userId,
        subject_id: data.subject_id,
        title: (data.title || 'Study Reminder').trim(),
        description,
        due_date: dueDate,
        recurrence: data.recurrence || 'none',
        notification_channels: data.notification_channels || ['in_app'],
      });
      return reminder.toObject();
    }

    // Memory fallback
    return {
      id: uuidv4(),
      user_id: userId,
      ...data,
      due_date: dueDate,
      is_notified: false,
      is_completed: false,
      created_at: new Date(),
    };
  }

  async updateReminder(userId: string, reminderId: string, data: Partial<IReminder>) {
    if (isMongoConnected) {
      const updated = await ReminderModel.findOneAndUpdate(
        { _id: reminderId, user_id: userId },
        { $set: data },
        { new: true }
      ).lean();
      return updated;
    }
    return null;
  }

  async deleteReminder(userId: string, reminderId: string) {
    if (isMongoConnected) {
      await ReminderModel.deleteOne({ _id: reminderId, user_id: userId });
    }
  }

  async markComplete(userId: string, reminderId: string) {
    if (isMongoConnected) {
      const updated = await ReminderModel.findOneAndUpdate(
        { _id: reminderId, user_id: userId },
        { $set: { is_completed: true } },
        { new: true }
      ).lean();
      return updated;
    }
    return null;
  }

  /** Called by a cron/scheduler to compute next due date for recurring reminders */
  computeNextDueDate(currentDue: Date, recurrence: 'none' | 'daily' | 'weekly' | 'monthly'): Date | null {
    if (recurrence === 'none') return null;
    const next = new Date(currentDue);
    if (recurrence === 'daily') next.setDate(next.getDate() + 1);
    else if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
    else if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
    return next;
  }
}

export const remindersService = new RemindersService();
