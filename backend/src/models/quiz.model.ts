import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correct_answer: string; // The text of the correct option
  correct_index: number;  // 0-based index
  explanation: string;
  hint?: string;          // Non-spoiling learning hint
  level?: number;         // Level 1 to 8
  difficulty: QuizDifficulty;
  topic_tag: string;
  bloom_level?: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
}

export interface IQuiz extends Document<string> {
  _id: string;
  user_id: string;
  audio_note_id?: string;
  subject_id?: string;
  topic_tag?: string;
  level?: number;
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  question_count: number;
  difficulty: QuizDifficulty;
  time_limit_minutes?: number;
  due_date?: Date;
  attempt_count: number;
  avg_score: number;
  created_at: Date;
  updated_at: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: (v: string[]) => v.length >= 2 },
    correct_answer: { type: String, required: true },
    correct_index: { type: Number, required: true, min: 0 },
    explanation: { type: String, default: '' },
    hint: { type: String, default: '' },
    level: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic_tag: { type: String, default: 'General' },
    bloom_level: {
      type: String,
      enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'],
      default: 'Remember',
    },
  },
  { _id: true } // Keep _id so answers can reference question IDs
);

export const QuizSchema = new Schema<IQuiz>(
  {
    _id: { type: String, default: () => uuidv4() },
    user_id: { type: String, required: true, index: true },
    audio_note_id: { type: String, index: true },
    subject_id: { type: String, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    questions: { type: [QuizQuestionSchema], default: [] },
    question_count: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    time_limit_minutes: { type: Number, default: 30 },
    due_date: { type: Date },
    attempt_count: { type: Number, default: 0 },
    avg_score: { type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

QuizSchema.index({ user_id: 1, subject_id: 1, created_at: -1 });
QuizSchema.index({ user_id: 1, audio_note_id: 1 });

export const QuizModel =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
