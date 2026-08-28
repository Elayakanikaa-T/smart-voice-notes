// Existing models
export * from './transcript.model.js';
export * from './summary.model.js';
export * from './flashcard.model.js';
export * from './quizQuestion.model.js';

// New models — full spec coverage
export * from './user.model.js';
export * from './subject.model.js';
export * from './audioNote.model.js';
export * from './notes.model.js';
export * from './keyPoints.model.js';
export * from './aiGuideSession.model.js';
export * from './quiz.model.js';
export * from './quizResult.model.js';
export * from './progress.model.js';
export * from './reminder.model.js';
export * from './recommendation.model.js';
export * from './doubtChatSession.model.js';
export * from './learningPath.model.js';
export * from './share.model.js';

// ── Employee Meeting Portal Models ───────────────────────────────────────────
export * from './meeting.model.js';
// Use named exports to avoid ambiguity with transcript.model (ITranscriptSegment)
export { MeetingTranscriptModel } from './meetingTranscript.model.js';
export * from './meetingSummary.model.js';
export * from './decision.model.js';
// Use named exports to avoid ambiguity with summary.model (IActionItem)
export { ActionItemModel } from './actionItem.model.js';
export type { IActionItemOwner } from './actionItem.model.js';
export * from './meetingNotification.model.js';
