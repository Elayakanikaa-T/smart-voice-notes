import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestionItem {
  question_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tag: string;
  bloom_taxonomy_level?: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
}

export interface IQuizDocument extends Document {
  quiz_id: string; // References PostgreSQL quizzes.id (UUID)
  note_id?: string;
  subject_id: string;
  user_id: string;
  title: string;
  questions: IQuizQuestionItem[];
  created_at: Date;
  updated_at: Date;
}

const QuizQuestionItemSchema = new Schema<IQuizQuestionItem>(
  {
    question_id: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: [(v: string[]) => v.length >= 2, 'At least 2 options required'] },
    correct_index: { type: Number, required: true, min: 0 },
    explanation: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic_tag: { type: String, default: 'Core' },
    bloom_taxonomy_level: { type: String, enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'], default: 'Understand' },
  },
  { _id: false }
);

export const QuizDocumentSchema = new Schema<IQuizDocument>(
  {
    quiz_id: { type: String, required: true, unique: true, index: true },
    note_id: { type: String, index: true },
    subject_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    questions: { type: [QuizQuestionItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const QuizDocumentModel = mongoose.model<IQuizDocument>('QuizDocument', QuizDocumentSchema);
