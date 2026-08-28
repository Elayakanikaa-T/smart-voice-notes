import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMeetingParticipant {
  userId?: string;
  name: string;
  email: string;
}

export interface IMeeting extends Document<string> {
  _id: string;
  title: string;
  organizer: string; // userId
  participants: IMeetingParticipant[];
  scheduledAt?: Date;
  status: 'scheduled' | 'recording' | 'processing' | 'done' | 'failed';
  audioUrl?: string;
  durationSeconds?: number;
  created_at: Date;
  updated_at: Date;
}

const ParticipantSchema = new Schema<IMeetingParticipant>(
  {
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
  },
  { _id: false }
);

const MeetingSchema = new Schema<IMeeting>(
  {
    _id: { type: String, default: () => uuidv4() },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    organizer: { type: String, required: true, index: true },
    participants: { type: [ParticipantSchema], default: [] },
    scheduledAt: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'recording', 'processing', 'done', 'failed'],
      default: 'scheduled',
    },
    audioUrl: { type: String },
    durationSeconds: { type: Number },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

MeetingSchema.index({ organizer: 1, created_at: -1 });
MeetingSchema.index({ 'participants.email': 1 });
MeetingSchema.index({ title: 'text' });

export const MeetingModel =
  mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);
