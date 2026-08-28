import { getLLMProvider } from '../providers/llmProvider.js';
import { AIJobPayload, NoteJobPayload } from '../queue/jobQueue.js';
import { SummaryModel, AudioNoteModel, FlashcardModel, QuizModel } from '../../../models/index.js';
import { logger } from '../../../utils/logger.js';

export async function processAISummarizationJob(payload: AIJobPayload): Promise<void> {
  const { noteId, userId, subjectId, transcriptText } = payload;
  logger.info(`[Worker:Summarization] Starting summarization for noteId=${noteId}`);

  try {
    const llm = getLLMProvider();
    const note = await AudioNoteModel.findById(noteId).lean().catch(() => null);
    const title = (note as any)?.title || 'Lecture Note';

    const result = await llm.generateSummary(transcriptText, title);

    await SummaryModel.findOneAndUpdate(
      { note_id: noteId },
      {
        note_id: noteId,
        user_id: userId,
        summary_text: result.summaryText,
        bullet_points: result.bulletPoints,
        key_takeaways: result.keyTakeaways || result.bulletPoints,
        keywords: (result.keywords || []).map((k: any) => typeof k === 'string' ? { term: k, definition: '' } : k),
        action_items: result.actionItems,
      },
      { upsert: true, new: true }
    );

    // Also auto-generate flashcards and quiz
    const [flashcards, quizQuestions] = await Promise.all([
      llm.generateFlashcards(result.summaryText || transcriptText, 4).catch(() => []),
      llm.generateQuiz(result.summaryText || transcriptText, 5).catch(() => []),
    ]);

    if (flashcards.length > 0) {
      await FlashcardModel.findOneAndUpdate(
        { note_id: noteId },
        {
          note_id: noteId,
          user_id: userId,
          subject_id: subjectId,
          title: `${title} Flashcards`,
          cards: flashcards.map((f: any, idx: number) => ({
            front_question: f.frontQuestion,
            back_answer: f.backAnswer,
            topic_tag: title,
            difficulty: ['EASY', 'MEDIUM', 'HARD'][idx % 3],
          })),
        },
        { upsert: true, new: true }
      );
    }

    if (quizQuestions.length > 0) {
      await QuizModel.findOneAndUpdate(
        { audio_note_id: noteId },
        {
          audio_note_id: noteId,
          user_id: userId,
          subject_id: subjectId,
          title: `${title} Quiz`,
          difficulty: 'medium',
          questions: quizQuestions.map((q: any, i: number) => ({
            question: q.question,
            options: q.options,
            correct_answer: q.options[q.correctIndex] || '',
            correct_index: q.correctIndex,
            explanation: q.explanation,
            difficulty: q.difficulty || 'medium',
            topic_tag: title,
            level: Math.floor(i / 2) + 1,
          })),
          question_count: quizQuestions.length,
        },
        { upsert: true, new: true }
      );
    }

    await AudioNoteModel.findByIdAndUpdate(noteId, {
      $set: {
        status: 'ready',
        has_summary: true,
        has_quiz: quizQuestions.length > 0,
        updated_at: new Date(),
      }
    }).catch(() => {});

    logger.info(`[Worker:Summarization] Completed summarization & quiz generation for noteId=${noteId}.`);
  } catch (error) {
    logger.error(`[Worker:Summarization] Failed to summarize noteId=${noteId}:`, error);
    await AudioNoteModel.findByIdAndUpdate(noteId, { $set: { status: 'ready', updated_at: new Date() } }).catch(() => {});
  }
}

export const processSummarizationJob = processAISummarizationJob;
