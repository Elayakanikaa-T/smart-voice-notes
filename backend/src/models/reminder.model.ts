import mongoose, { Schema, Document } from 'mongoose';

export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface IReminder extends Document {
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  due_date: Date;
  recurrence: ReminderRecurrence;
  next_due_date?: Date;
  is_notified: boolean;
  is_completed: boolean;
  notification_channels: ('in_app' | 'email')[];
  created_at: Date;
  updated_at: Date;
}

export const ReminderSchema = new Schema<IReminder>(
  {
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    due_date: { type: Date, required: true },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    next_due_date: { type: Date },
    is_notified: { type: Boolean, default: false },
    is_completed: { type: Boolean, default: false },
    notification_channels: {
      type: [String],
      enum: ['in_app', 'email'],
      default: ['in_app'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ReminderSchema.index({ user_id: 1, due_date: 1 });
ReminderSchema.index({ user_id: 1, is_completed: 1, due_date: 1 });
// Index for cron-style notification sweeps
ReminderSchema.index({ due_date: 1, is_notified: 1, is_completed: 1 });

export const ReminderModel =
  mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);
