import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswerRecord {
  question_id: string;
  question_text: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  topic_tag: string;
}

export interface IQuizResult extends Document {
  quiz_id: string;
  user_id: string;
  subject_id?: string;
  score: number; // 0-100
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  time_taken_seconds: number;
  answers: IAnswerRecord[];
  weak_topics: string[]; // Topics where user got < 50% correct
  strong_topics: string[];
  analysis_summary: string; // AI-generated explanation
  taken_at: Date;
  updated_at: Date;
}

const AnswerRecordSchema = new Schema<IAnswerRecord>(
  {
    question_id: { type: String, required: true },
    question_text: { type: String, required: true },
    selected_answer: { type: String, default: '' },
    correct_answer: { type: String, required: true },
    is_correct: { type: Boolean, required: true },
    topic_tag: { type: String, default: 'General' },
  },
  { _id: false }
);

export const QuizResultSchema = new Schema<IQuizResult>(
  {
    quiz_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    total_questions: { type: Number, required: true },
    correct_count: { type: Number, default: 0 },
    incorrect_count: { type: Number, default: 0 },
    skipped_count: { type: Number, default: 0 },
    time_taken_seconds: { type: Number, default: 0 },
    answers: { type: [AnswerRecordSchema], default: [] },
    weak_topics: { type: [String], default: [] },
    strong_topics: { type: [String], default: [] },
    analysis_summary: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'taken_at', updatedAt: 'updated_at' },
  }
);

QuizResultSchema.index({ user_id: 1, quiz_id: 1, taken_at: -1 });
QuizResultSchema.index({ user_id: 1, subject_id: 1, taken_at: -1 });

export const QuizResultModel =
  mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
