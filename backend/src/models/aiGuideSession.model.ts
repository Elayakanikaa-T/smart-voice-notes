import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens_used?: number;
}

export interface IAIGuideSession extends Document {
  user_id: string;
  audio_note_id?: string;
  subject_id?: string;
  title: string;
  messages: IChatMessage[];
  total_messages: number;
  model_used: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date() },
    tokens_used: { type: Number },
  },
  { _id: false }
);

export const AIGuideSessionSchema = new Schema<IAIGuideSession>(
  {
    user_id: { type: String, required: true, index: true },
    audio_note_id: { type: String, index: true },
    subject_id: { type: String, index: true },
    title: { type: String, default: 'New Conversation', maxlength: 200 },
    messages: { type: [ChatMessageSchema], default: [] },
    total_messages: { type: Number, default: 0 },
    model_used: { type: String, default: 'mock' },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

AIGuideSessionSchema.index({ user_id: 1, created_at: -1 });
AIGuideSessionSchema.index({ user_id: 1, audio_note_id: 1 });
AIGuideSessionSchema.index({ user_id: 1, subject_id: 1 });

export const AIGuideSessionModel =
  mongoose.models.AIGuideSession ||
  mongoose.model<IAIGuideSession>('AIGuideSession', AIGuideSessionSchema);
