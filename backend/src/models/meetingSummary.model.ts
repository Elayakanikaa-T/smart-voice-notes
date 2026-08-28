import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMeetingSummary extends Document<string> {
  _id: string;
  meetingId: string;
  shortSummary: string;
  detailedNotes: string;
  keyPoints: string[];
  status: 'pending' | 'processing' | 'done' | 'failed';
  aiModel: string;
  errorMessage?: string;
  created_at: Date;
  updated_at: Date;
}

const MeetingSummarySchema = new Schema<IMeetingSummary>(
  {
    _id: { type: String, default: () => uuidv4() },
    meetingId: { type: String, required: true, unique: true, index: true },
    shortSummary: { type: String, default: '' },
    detailedNotes: { type: String, default: '' },
    keyPoints: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    aiModel: { type: String, default: 'mock' },
    errorMessage: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

MeetingSummarySchema.index({ shortSummary: 'text', detailedNotes: 'text' });

export const MeetingSummaryModel =
  mongoose.models.MeetingSummary ||
  mongoose.model<IMeetingSummary>('MeetingSummary', MeetingSummarySchema);
