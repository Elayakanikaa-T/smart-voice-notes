import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRecommendationResource {
  title: string;
  type: 'book' | 'video' | 'article' | 'course';
  url: string;
}

export interface IRecommendation extends Document<string> {
  _id: string;
  user_id: string;
  topic: string;
  subject: string;
  explanation: string;
  resources: IRecommendationResource[];
  generated_at: Date;
  updated_at: Date;
}

const RecommendationResourceSchema = new Schema<IRecommendationResource>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['book', 'video', 'article', 'course'], required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

export const RecommendationSchema = new Schema<IRecommendation>(
  {
    _id: { type: String, default: () => uuidv4() },
    user_id: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    subject: { type: String, required: true },
    explanation: { type: String, required: true },
    resources: { type: [RecommendationResourceSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: 'updated_at' },
  }
);

RecommendationSchema.index({ user_id: 1, generated_at: -1 });

export const RecommendationModel =
  mongoose.models.Recommendation ||
  mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
