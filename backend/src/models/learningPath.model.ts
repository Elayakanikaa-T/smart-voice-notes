import mongoose, { Schema, Document } from 'mongoose';

export type LearningStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface ILearningStep {
  order: number;
  topic: string;
  description?: string;
  resource_type: 'note' | 'quiz' | 'external' | 'review';
  resource_ref?: string; // Note ID, Quiz ID, or URL
  status: LearningStepStatus;
  estimated_minutes: number;
  completed_at?: Date;
}

export interface ILearningPath extends Document {
  user_id: string;
  subject_id: string;
  subject_name?: string;
  title: string;
  description?: string;
  exam_date?: Date;
  ordered_steps: ILearningStep[];
  total_steps: number;
  completed_steps: number;
  completion_pct: number;
  estimated_total_minutes: number;
  is_active: boolean;
  generated_at: Date;
  updated_at: Date;
}

const LearningStepSchema = new Schema<ILearningStep>(
  {
    order: { type: Number, required: true },
    topic: { type: String, required: true },
    description: { type: String },
    resource_type: {
      type: String,
      enum: ['note', 'quiz', 'external', 'review'],
      default: 'note',
    },
    resource_ref: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending',
    },
    estimated_minutes: { type: Number, default: 20 },
    completed_at: { type: Date },
  },
  { _id: true }
);

export const LearningPathSchema = new Schema<ILearningPath>(
  {
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true, index: true },
    subject_name: { type: String, default: '' },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    exam_date: { type: Date },
    ordered_steps: { type: [LearningStepSchema], default: [] },
    total_steps: { type: Number, default: 0 },
    completed_steps: { type: Number, default: 0 },
    completion_pct: { type: Number, default: 0, min: 0, max: 100 },
    estimated_total_minutes: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: 'updated_at' },
  }
);

LearningPathSchema.index({ user_id: 1, subject_id: 1 });
LearningPathSchema.index({ user_id: 1, is_active: 1, generated_at: -1 });

export const LearningPathModel =
  mongoose.models.LearningPath ||
  mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);
