import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscriptSegment {
  start: number;       // Start time in seconds
  end: number;         // End time in seconds
  text: string;        // Segment text
  speaker?: string;    // Speaker identifier e.g. "Speaker 1"
  confidence?: number; // 0.0 - 1.0
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

// Full text search index
TranscriptSchema.index({ raw_text: 'text' });

export const TranscriptModel = mongoose.model<ITranscript>('Transcript', TranscriptSchema);
