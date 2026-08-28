import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITranscriptSegment {
  speaker?: string;
  start: number;
  end: number;
  text: string;
}

export interface IMeetingTranscript extends Document<string> {
  _id: string;
  meetingId: string;
  fullText: string;
  segments: ITranscriptSegment[];
  status: 'pending' | 'processing' | 'done' | 'failed';
  provider: string;
  errorMessage?: string;
  created_at: Date;
  updated_at: Date;
}

const SegmentSchema = new Schema<ITranscriptSegment>(
  {
    speaker: { type: String },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const MeetingTranscriptSchema = new Schema<IMeetingTranscript>(
  {
    _id: { type: String, default: () => uuidv4() },
    meetingId: { type: String, required: true, index: true },
    fullText: { type: String, default: '' },
    segments: { type: [SegmentSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    provider: { type: String, default: 'mock' },
    errorMessage: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Text index on fullText so search can span transcripts
MeetingTranscriptSchema.index({ meetingId: 1, status: 1 });
MeetingTranscriptSchema.index({ fullText: 'text' });

export const MeetingTranscriptModel =
  mongoose.models.MeetingTranscript ||
  mongoose.model<IMeetingTranscript>('MeetingTranscript', MeetingTranscriptSchema);
