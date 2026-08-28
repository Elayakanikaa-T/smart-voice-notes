import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISubject extends Document<string> {
  _id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  note_count: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export const SubjectSchema = new Schema<ISubject>(
  {
    _id: { type: String, default: () => uuidv4() },
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    color: { type: String, default: '#3B82F6' }, // Default blue
    icon: { type: String, default: 'BookOpen' },
    note_count: { type: Number, default: 0, min: 0 },
    is_archived: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for fast user-specific subject queries
SubjectSchema.index({ user_id: 1, name: 1 });
SubjectSchema.index({ user_id: 1, is_archived: 1, created_at: -1 });
SubjectSchema.index({ name: 'text', description: 'text' });

export const SubjectModel =
  mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
