import mongoose, { Schema, Document } from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

export type AudioNoteStatus =
  | 'recording'
  | 'uploaded'
  | 'transcribing'
  | 'processing'
  | 'ready'
  | 'failed';

export interface IAudioNote extends Document<string> {
  _id: string;
  user_id: string;
  subject_id: string;
  title: string;
  audio_url: string;
  audio_s3_key?: string;
  duration_seconds: number;
  file_size_bytes: number;
  mime_type: string;
  status: AudioNoteStatus;
  language: string;
  error_message?: string;
  is_favorite: boolean;
  is_archived: boolean;
  tags: string[];
  // Populated after pipeline completion
  has_transcript: boolean;
  has_summary: boolean;
  has_quiz: boolean;
  processing_started_at?: Date;
  processing_completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export const AudioNoteSchema = new Schema<IAudioNote>(
  {
    _id: { type: String, default: () => uuidv4() },
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    audio_url: { type: String, default: '' },
    audio_s3_key: { type: String },
    duration_seconds: { type: Number, default: 0, min: 0 },
    file_size_bytes: { type: Number, default: 0, min: 0 },
    mime_type: { type: String, default: 'audio/webm' },
    status: {
      type: String,
      enum: ['recording', 'uploaded', 'transcribing', 'processing', 'ready', 'failed'],
      default: 'recording',
      index: true,
    },
    language: { type: String, default: 'en' },
    error_message: { type: String },
    is_favorite: { type: Boolean, default: false },
    is_archived: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    has_transcript: { type: Boolean, default: false },
    has_summary: { type: Boolean, default: false },
    has_quiz: { type: Boolean, default: false },
    processing_started_at: { type: Date },
    processing_completed_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for common query patterns
AudioNoteSchema.index({ user_id: 1, status: 1, created_at: -1 });
AudioNoteSchema.index({ user_id: 1, subject_id: 1, created_at: -1 });
AudioNoteSchema.index({ user_id: 1, is_favorite: 1 });
AudioNoteSchema.index({ title: 'text', tags: 'text' });

export const AudioNoteModel =
  mongoose.models.AudioNote || mongoose.model<IAudioNote>('AudioNote', AudioNoteSchema);
