import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface INotification extends Document<string> {
  _id: string;
  userId: string;
  type: 'task_reminder' | 'task_overdue' | 'meeting_processed' | 'general';
  title: string;
  message: string;
  relatedMeetingId?: string;
  relatedActionItemId?: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['task_reminder', 'task_overdue', 'meeting_processed', 'general'],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedMeetingId: { type: String },
    relatedActionItemId: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

NotificationSchema.index({ userId: 1, read: 1, created_at: -1 });

export const NotificationModel =
  mongoose.models.MeetingNotification ||
  mongoose.model<INotification>('MeetingNotification', NotificationSchema);
