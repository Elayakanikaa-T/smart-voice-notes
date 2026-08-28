import mongoose, { Schema, Document } from 'mongoose';

export interface ICardItem {
  card_id: string;
  front_question: string;
  back_answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tag: string;
  review_count: number;
  last_reviewed_at?: Date;
  ease_factor: number; // SuperMemo-2 style spaced repetition default 2.5
}

export interface IFlashcardSet extends Document {
  note_id: string;
  subject_id: string;
  user_id: string;
  title: string;
  cards: ICardItem[];
  created_at: Date;
  updated_at: Date;
}

const CardItemSchema = new Schema<ICardItem>(
  {
    card_id: { type: String, required: true },
    front_question: { type: String, required: true },
    back_answer: { type: String, required: true },
    hint: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic_tag: { type: String, default: 'General' },
    review_count: { type: Number, default: 0 },
    last_reviewed_at: { type: Date },
    ease_factor: { type: Number, default: 2.5 },
  },
  { _id: false }
);

export const FlashcardSetSchema = new Schema<IFlashcardSet>(
  {
    note_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    cards: { type: [CardItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const FlashcardSetModel = mongoose.model<IFlashcardSet>('FlashcardSet', FlashcardSetSchema);
