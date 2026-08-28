import mongoose, { Schema, Document } from 'mongoose';

export interface IShare extends Document {
  _id: any;
  note_id: string;
  shared_by_user_id: string;
  shared_with_email: string;
  permission: 'view' | 'edit';
  access_token: string;
  expires_at: Date;
  created_at: Date;
}

const ShareSchema = new Schema<IShare>(
  {
    _id: { type: String, required: true },
    note_id: { type: String, required: true, ref: 'AudioNote' },
    shared_by_user_id: { type: String, required: true, ref: 'User' },
    shared_with_email: { type: String, required: true },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' },
    access_token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const ShareModel = mongoose.models.Share || mongoose.model<IShare>('Share', ShareSchema);
