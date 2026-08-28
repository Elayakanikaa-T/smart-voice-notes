"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardSetModel = exports.FlashcardSetSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CardItemSchema = new mongoose_1.Schema({
    card_id: { type: String, required: true },
    front_question: { type: String, required: true },
    back_answer: { type: String, required: true },
    hint: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic_tag: { type: String, default: 'General' },
    review_count: { type: Number, default: 0 },
    last_reviewed_at: { type: Date },
    ease_factor: { type: Number, default: 2.5 },
}, { _id: false });
exports.FlashcardSetSchema = new mongoose_1.Schema({
    note_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    cards: { type: [CardItemSchema], default: [] },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
exports.FlashcardSetModel = mongoose_1.default.model('FlashcardSet', exports.FlashcardSetSchema);
