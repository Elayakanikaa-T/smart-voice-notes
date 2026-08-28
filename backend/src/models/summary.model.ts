import mongoose, { Schema, Document } from 'mongoose';

export interface IKeywordItem {
  term: string;
  definition: string;
  importance: number;
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
  category: string;
}

export interface IActionItem {
  task: string;
  assignee?: string;
  deadline?: Date;
  is_completed: boolean;
}

export interface ISlide {
  slide_number: number;
  title: string;
  bullet_points: string[];
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
  action_items: IActionItem[];
  presentation_outline: ISlide[];
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

const ActionItemSchema = new Schema<IActionItem>(
  {
    task: { type: String, required: true },
    assignee: { type: String },
    deadline: { type: Date },
    is_completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const SlideSchema = new Schema<ISlide>(
  {
    slide_number: { type: Number, required: true },
    title: { type: String, required: true },
    bullet_points: { type: [String], default: [] },
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
    action_items: { type: [ActionItemSchema], default: [] },
    presentation_outline: { type: [SlideSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SummarySchema.index({ summary_text: 'text', 'keywords.term': 'text' });

export const SummaryModel =
  mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);
