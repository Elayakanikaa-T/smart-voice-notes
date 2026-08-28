import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface ITranscript extends Document {
  note_id: string;
  user_id: string;
  raw_text: string;
  language: string;
  confidence: number;
  duration_seconds: number;
  segments: ITranscriptSegment[];
  created_at: Date;
  updated_at: Date;
}

const TranscriptSegmentSchema = new Schema<ITranscriptSegment>(
  {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
    speaker: { type: String, default: 'Speaker 1' },
    confidence: { type: Number, default: 0.95 },
  },
  { _id: false }
);

export const TranscriptSchema = new Schema<ITranscript>(
  {
    note_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    raw_text: { type: String, required: true },
    language: { type: String, default: 'en' },
    confidence: { type: Number, default: 0.95 },
    duration_seconds: { type: Number, default: 0 },
    segments: { type: [TranscriptSegmentSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

TranscriptSchema.index({ raw_text: 'text' });

export const TranscriptModel =
  mongoose.models.Transcript || mongoose.model<ITranscript>('Transcript', TranscriptSchema);
