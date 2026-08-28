import mongoose, { Document } from 'mongoose';
export interface IQuizQuestionItem {
    question_id: string;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic_tag: string;
    bloom_taxonomy_level?: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
}
export interface IQuizDocument extends Document {
    quiz_id: string;
    note_id?: string;
    subject_id: string;
    user_id: string;
    title: string;
    questions: IQuizQuestionItem[];
    created_at: Date;
    updated_at: Date;
}
export declare const QuizDocumentSchema: mongoose.Schema<IQuizDocument, mongoose.Model<IQuizDocument, any, any, any, mongoose.Document<unknown, any, IQuizDocument, any, {}> & IQuizDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IQuizDocument, mongoose.Document<unknown, {}, mongoose.FlatRecord<IQuizDocument>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<IQuizDocument> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const QuizDocumentModel: mongoose.Model<IQuizDocument, {}, {}, {}, mongoose.Document<unknown, {}, IQuizDocument, {}, {}> & IQuizDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
