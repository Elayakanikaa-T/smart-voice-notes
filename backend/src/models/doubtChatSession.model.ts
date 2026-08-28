import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IDoubtChatSession extends Document {
  user_id: string;
  subject_id?: string;
  messages: IMessage[];
  created_at: Date;
  updated_at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

export const DoubtChatSessionSchema = new Schema<IDoubtChatSession>(
  {
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    messages: { type: [MessageSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

DoubtChatSessionSchema.index({ user_id: 1, updated_at: -1 });

export const DoubtChatSessionModel =
  mongoose.models.DoubtChatSession ||
  mongoose.model<IDoubtChatSession>('DoubtChatSession', DoubtChatSessionSchema);
