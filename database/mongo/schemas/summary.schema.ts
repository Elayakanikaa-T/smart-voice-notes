import mongoose, { Schema, Document } from 'mongoose';

export interface IKeywordItem {
  term: string;
  definition: string;
  importance: number; // 1-5
  category?: string;
}

export interface IDetectedDate {
  date_string: string;
  parsed_date?: Date;
  context: string;
  is_exam_or_deadline: boolean;
}

export interface INamedEntity {
  name: string;
  category: string; // 'Concept' | 'Person' | 'Formula' | 'Algorithm' | 'Event'
}

export interface ISummary extends Document {
  note_id: string;
  user_id: string;
  subject_id?: string;
  summary_text: string;
  bullet_points: string[];
  key_takeaways: string[];
  keywords: IKeywordItem[];
  dates_detected: IDetectedDate[];
  entities: INamedEntity[];
  suggested_subject?: string;
  suggested_tags: string[];
  reading_time_minutes: number;
  created_at: Date;
  updated_at: Date;
}

const KeywordItemSchema = new Schema<IKeywordItem>(
  {
    term: { type: String, required: true },
    definition: { type: String, required: true },
    importance: { type: Number, default: 3, min: 1, max: 5 },
    category: { type: String },
  },
  { _id: false }
);

const DetectedDateSchema = new Schema<IDetectedDate>(
  {
    date_string: { type: String, required: true },
    parsed_date: { type: Date },
    context: { type: String, required: true },
    is_exam_or_deadline: { type: Boolean, default: false },
  },
  { _id: false }
);

const NamedEntitySchema = new Schema<INamedEntity>(
  {
    name: { type: String, required: true },
    category: { type: String, default: 'Concept' },
  },
  { _id: false }
);

export const SummarySchema = new Schema<ISummary>(
  {
    note_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    summary_text: { type: String, required: true },
    bullet_points: { type: [String], default: [] },
    key_takeaways: { type: [String], default: [] },
    keywords: { type: [KeywordItemSchema], default: [] },
    dates_detected: { type: [DetectedDateSchema], default: [] },
    entities: { type: [NamedEntitySchema], default: [] },
    suggested_subject: { type: String },
    suggested_tags: { type: [String], default: [] },
    reading_time_minutes: { type: Number, default: 2 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SummarySchema.index({ summary_text: 'text', 'keywords.term': 'text' });

export const SummaryModel = mongoose.model<ISummary>('Summary', SummarySchema);
