import mongoose, { Document } from 'mongoose';
export interface ITranscriptSegment {
    start: number;
    end: number;
    text: string;
    speaker?: string;
    confidence?: number;
}
export interface ITranscript extends Document {
    note_id: string;
    user_id: string;
    raw_text: string;
    language: string;
    confidence: number;
    duration_seconds: number;
    segments: ITranscriptSegment[];
    created_at: Date;
    updated_at: Date;
}
export declare const TranscriptSchema: mongoose.Schema<ITranscript, mongoose.Model<ITranscript, any, any, any, mongoose.Document<unknown, any, ITranscript, any, {}> & ITranscript & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITranscript, mongoose.Document<unknown, {}, mongoose.FlatRecord<ITranscript>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<ITranscript> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const TranscriptModel: mongoose.Model<ITranscript, {}, {}, {}, mongoose.Document<unknown, {}, ITranscript, {}, {}> & ITranscript & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
