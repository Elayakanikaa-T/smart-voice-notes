import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDecision extends Document<string> {
  _id: string;
  meetingId: string;
  text: string;
  confirmedBy: string[]; // userIds
  created_at: Date;
  updated_at: Date;
}

const DecisionSchema = new Schema<IDecision>(
  {
    _id: { type: String, default: () => uuidv4() },
    meetingId: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true },
    confirmedBy: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

DecisionSchema.index({ meetingId: 1, created_at: 1 });
DecisionSchema.index({ text: 'text' });

export const DecisionModel =
  mongoose.models.Decision ||
  mongoose.model<IDecision>('Decision', DecisionSchema);
