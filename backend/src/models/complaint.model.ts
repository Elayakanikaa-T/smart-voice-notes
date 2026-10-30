import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IComplaint extends Document<string> {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'student' | 'employee' | 'admin';
  category: 'technical' | 'audio_transcription' | 'account_login' | 'feature_request' | 'other';
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    userRole: { type: String, enum: ['student', 'employee', 'admin'], default: 'student' },
    category: {
      type: String,
      enum: ['technical', 'audio_transcription', 'account_login', 'feature_request', 'other'],
      default: 'technical',
    },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    adminNotes: { type: String, default: '' },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ComplaintSchema.index({ status: 1, createdAt: -1 });

export const ComplaintModel =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
