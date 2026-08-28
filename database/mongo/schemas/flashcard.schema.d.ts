import mongoose, { Document } from 'mongoose';
export interface ICardItem {
    card_id: string;
    front_question: string;
    back_answer: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic_tag: string;
    review_count: number;
    last_reviewed_at?: Date;
    ease_factor: number;
}
export interface IFlashcardSet extends Document {
    note_id: string;
    subject_id: string;
    user_id: string;
    title: string;
    cards: ICardItem[];
    created_at: Date;
    updated_at: Date;
}
export declare const FlashcardSetSchema: mongoose.Schema<IFlashcardSet, mongoose.Model<IFlashcardSet, any, any, any, mongoose.Document<unknown, any, IFlashcardSet, any, {}> & IFlashcardSet & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IFlashcardSet, mongoose.Document<unknown, {}, mongoose.FlatRecord<IFlashcardSet>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<IFlashcardSet> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const FlashcardSetModel: mongoose.Model<IFlashcardSet, {}, {}, {}, mongoose.Document<unknown, {}, IFlashcardSet, {}, {}> & IFlashcardSet & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
