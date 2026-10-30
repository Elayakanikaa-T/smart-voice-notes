import mongoose, { Schema, Document } from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

export interface IUserSettings {
  autoSummarize: boolean;
  autoGenerateQuiz: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  offlineSync: boolean;
  emailReminders: boolean;
  inAppNotifications: boolean;
}

export interface IUser extends Document<string> {
  _id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin' | 'employee';
  email_verified: boolean;
  preferred_language: string;
  theme_pref: 'dark' | 'light' | 'system';
  avatar_url?: string;
  age?: number;
  status?: string;
  phone?: string;
  gender?: string;
  institution?: string;
  grade_or_designation?: string;
  bio?: string;
  settings: IUserSettings;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    autoSummarize: { type: Boolean, default: true },
    autoGenerateQuiz: { type: Boolean, default: true },
    audioQuality: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
    offlineSync: { type: Boolean, default: true },
    emailReminders: { type: Boolean, default: false },
    inAppNotifications: { type: Boolean, default: true },
  },
  { _id: false }
);

export const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'employee'], default: 'student' },
    email_verified: { type: Boolean, default: true },
    preferred_language: { type: String, default: 'en' },
    theme_pref: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
    avatar_url: { type: String },
    age: { type: Number, min: 1, max: 120 },
    status: { type: String, default: 'Active' },
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    institution: { type: String, default: '' },
    grade_or_designation: { type: String, default: '' },
    bio: { type: String, default: '' },
    settings: { type: UserSettingsSchema, default: () => ({}) },
    last_login: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for admin queries
UserSchema.index({ role: 1, created_at: -1 });

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
