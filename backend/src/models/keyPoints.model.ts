import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyPointDetectedDate {
  date_string: string;
  context: string;
  is_exam_or_deadline: boolean;
  parsed_date?: Date;
}

export interface IDetectedEntity {
  name: string;
  category: string; // e.g. 'Person', 'Concept', 'Organization', 'Location', 'Formula'
}

export interface IKeyPoints extends Document {
  audio_note_id: string;
  user_id: string;
  subject_id?: string;
  key_points: string[];
  detected_dates: IKeyPointDetectedDate[];
  detected_entities: IDetectedEntity[];
  action_items: string[];
  tags: string[];
  generated_at: Date;
  updated_at: Date;
}

const DetectedDateSchema = new Schema<IKeyPointDetectedDate>(
  {
    date_string: { type: String, required: true },
    context: { type: String, default: '' },
    is_exam_or_deadline: { type: Boolean, default: false },
    parsed_date: { type: Date },
  },
  { _id: false }
);

const DetectedEntitySchema = new Schema<IDetectedEntity>(
  {
    name: { type: String, required: true },
    category: { type: String, default: 'Concept' },
  },
  { _id: false }
);

export const KeyPointsSchema = new Schema<IKeyPoints>(
  {
    audio_note_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    key_points: { type: [String], default: [] },
    detected_dates: { type: [DetectedDateSchema], default: [] },
    detected_entities: { type: [DetectedEntitySchema], default: [] },
    action_items: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: 'updated_at' },
  }
);

export const KeyPointsModel =
  mongoose.models.KeyPoints || mongoose.model<IKeyPoints>('KeyPoints', KeyPointsSchema);
