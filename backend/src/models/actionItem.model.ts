import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IActionItemOwner {
  userId?: string;
  name: string;
  email: string;
}

export interface IActionItem extends Document<string> {
  _id: string;
  meetingId: string;
  task: string;
  owner: IActionItemOwner;
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'done';
  progress: number;
  reminderSent: boolean;
  created_at: Date;
  updated_at: Date;
}

const OwnerSchema = new Schema<IActionItemOwner>(
  {
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
  },
  { _id: false }
);

const ActionItemSchema = new Schema<IActionItem>(
  {
    _id: { type: String, default: () => uuidv4() },
    meetingId: { type: String, required: true, index: true },
    task: { type: String, required: true, trim: true },
    owner: { type: OwnerSchema, required: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'done'],
      default: 'open',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    reminderSent: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ActionItemSchema.index({ meetingId: 1, status: 1 });
ActionItemSchema.index({ 'owner.userId': 1, status: 1 });
ActionItemSchema.index({ 'owner.email': 1, status: 1 });
ActionItemSchema.index({ dueDate: 1, reminderSent: 1 });
ActionItemSchema.index({ task: 'text' });

export const ActionItemModel =
  mongoose.models.ActionItem ||
  mongoose.model<IActionItem>('ActionItem', ActionItemSchema);
