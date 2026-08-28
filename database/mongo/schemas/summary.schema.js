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
exports.SummaryModel = exports.SummarySchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const KeywordItemSchema = new mongoose_1.Schema({
    term: { type: String, required: true },
    definition: { type: String, required: true },
    importance: { type: Number, default: 3, min: 1, max: 5 },
    category: { type: String },
}, { _id: false });
const DetectedDateSchema = new mongoose_1.Schema({
    date_string: { type: String, required: true },
    parsed_date: { type: Date },
    context: { type: String, required: true },
    is_exam_or_deadline: { type: Boolean, default: false },
}, { _id: false });
const NamedEntitySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'Concept' },
}, { _id: false });
exports.SummarySchema = new mongoose_1.Schema({
    note_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    subject_id: { type: String, index: true },
    summary_text: { type: String, required: true },
    bullet_points: { type: [String], default: [] },
    key_takeaways: { type: [String], default: [] },
    keywords: { type: [KeywordItemSchema], default: [] },
    dates_detected: { type: [DetectedDateSchema], default: [] },
    entities: { type: [NamedEntitySchema], default: [] },
    suggested_subject: { type: String },
    suggested_tags: { type: [String], default: [] },
    reading_time_minutes: { type: Number, default: 2 },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
exports.SummarySchema.index({ summary_text: 'text', 'keywords.term': 'text' });
exports.SummaryModel = mongoose_1.default.model('Summary', exports.SummarySchema);
