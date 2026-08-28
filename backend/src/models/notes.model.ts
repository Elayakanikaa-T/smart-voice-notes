import mongoose, { Schema, Document } from 'mongoose';

export interface IStructuredSection {
  heading: string;
  level: 1 | 2 | 3;
  content: string;
  bullet_points: string[];
}

export interface INotes extends Document {
  audio_note_id: string;
  user_id: string;
  subject_id?: string;
  structured_notes_text: string; // Full formatted markdown/text
  sections: IStructuredSection[];
  word_count: number;
  reading_time_minutes: number;
  generated_at: Date;
  updated_at: Date;
}

const StructuredSectionSchema = new Schema<IStructuredSection>(
  {
    heading: { type: String, required: true },
    level: { type: Number, enum: [1, 2, 3], default: 2 },
    content: { type: String, default: '' },
    bullet_points: { type: [String], default: [] },
  },
  { _id: false }
);

export const NotesSchema = new Schema<INotes>(
  {
    audio_note_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    structured_notes_text: { type: String, required: true },
    sections: { type: [StructuredSectionSchema], default: [] },
    word_count: { type: Number, default: 0 },
    reading_time_minutes: { type: Number, default: 1 },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: 'updated_at' },
  }
);

NotesSchema.index({ structured_notes_text: 'text' });

export const NotesModel =
  mongoose.models.Notes || mongoose.model<INotes>('Notes', NotesSchema);
