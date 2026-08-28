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
exports.TranscriptModel = exports.TranscriptSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TranscriptSegmentSchema = new mongoose_1.Schema({
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
    speaker: { type: String, default: 'Speaker 1' },
    confidence: { type: Number, default: 0.95 },
}, { _id: false });
exports.TranscriptSchema = new mongoose_1.Schema({
    note_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    raw_text: { type: String, required: true },
    language: { type: String, default: 'en' },
    confidence: { type: Number, default: 0.95 },
    duration_seconds: { type: Number, default: 0 },
    segments: { type: [TranscriptSegmentSchema], default: [] },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Full text search index
exports.TranscriptSchema.index({ raw_text: 'text' });
exports.TranscriptModel = mongoose_1.default.model('Transcript', exports.TranscriptSchema);
