import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  user_id: string;
  subject_id: string;
  subject_name?: string; // Denormalized for fast reads
  readiness_score: number; // 0-100 composite score
  quiz_accuracy_avg: number; // Average quiz score
  material_coverage_pct: number; // % of notes reviewed
  learning_path_pct?: number; // % of learning path steps completed
  path_total_steps?: number;
  path_completed_steps?: number;
  quiz_attempts: number;
  weak_topics: string[];
  strong_topics: string[];
  notes_count: number;
  last_quiz_at?: Date;
  last_note_at?: Date;
  last_updated: Date;
  created_at: Date;
}

export const ProgressSchema = new Schema<IProgress>(
  {
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true, index: true },
    subject_name: { type: String, default: '' },
    readiness_score: { type: Number, default: 0, min: 0, max: 100 },
    quiz_accuracy_avg: { type: Number, default: 0, min: 0, max: 100 },
    material_coverage_pct: { type: Number, default: 0, min: 0, max: 100 },
    learning_path_pct: { type: Number, default: 0, min: 0, max: 100 },
    path_total_steps: { type: Number, default: 0 },
    path_completed_steps: { type: Number, default: 0 },
    quiz_attempts: { type: Number, default: 0 },
    weak_topics: { type: [String], default: [] },
    strong_topics: { type: [String], default: [] },
    notes_count: { type: Number, default: 0 },
    last_quiz_at: { type: Date },
    last_note_at: { type: Date },
    last_updated: { type: Date, default: () => new Date() },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'last_updated' },
  }
);

// Unique per user+subject combination
ProgressSchema.index({ user_id: 1, subject_id: 1 }, { unique: true });
ProgressSchema.index({ user_id: 1, readiness_score: -1 });

export const ProgressModel =
  mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
