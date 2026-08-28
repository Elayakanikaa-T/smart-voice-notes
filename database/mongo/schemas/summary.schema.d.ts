import mongoose, { Document } from 'mongoose';
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
export declare const SummarySchema: mongoose.Schema<ISummary, mongoose.Model<ISummary, any, any, any, mongoose.Document<unknown, any, ISummary, any, {}> & ISummary & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ISummary, mongoose.Document<unknown, {}, mongoose.FlatRecord<ISummary>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<ISummary> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const SummaryModel: mongoose.Model<ISummary, {}, {}, {}, mongoose.Document<unknown, {}, ISummary, {}, {}> & ISummary & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
