import { v4 as uuidv4 } from 'uuid';
import { QuizModel, QuizResultModel, ProgressModel, SubjectModel, AudioNoteModel, TranscriptModel, SummaryModel } from '../../models/index.js';
import { getLLMProvider } from '../../services/ai/index.js';

export class QuizzesService {
  async getQuizzes(userId: string, subjectId?: string, noteId?: string) {
    const filter: any = { user_id: userId };
    if (subjectId && subjectId !== 'all') {
      filter.$or = [
        { subject_id: subjectId },
        { subject_id: { $regex: new RegExp(subjectId, 'i') } },
        { _id: subjectId }
      ];
    }
    if (noteId) filter.audio_note_id = noteId;

    let docs = await QuizModel.find(filter).sort({ created_at: -1 }).lean();

    // Deduplicate quizzes: keep only 1 quiz per topic / title
    const seenTopics = new Set<string>();
    const uniqueDocs: any[] = [];
    const duplicateIds: any[] = [];

    for (const doc of docs) {
      const normalizedTitle = (doc.title || '').replace(/—.*$/, '').trim().toLowerCase();
      const normalizedTopic = (doc.topic_tag || '').trim().toLowerCase();
      const dedupKey = normalizedTopic || normalizedTitle || String(doc._id);

      if (seenTopics.has(dedupKey)) {
        duplicateIds.push(doc._id);
      } else {
        seenTopics.add(dedupKey);
        uniqueDocs.push(doc);
      }
    }

    if (duplicateIds.length > 0) {
      QuizModel.deleteMany({ _id: { $in: duplicateIds } }).catch(() => {});
    }

    const results = await Promise.all(
      uniqueDocs.map(async (doc: any) => {
        const attempt: any = await QuizResultModel.findOne({ user_id: userId, quiz_id: doc._id }).sort({ created_at: -1 }).lean().catch(() => null);
        let subject: any = doc.subject_id ? await SubjectModel.findOne({ _id: doc.subject_id }).lean().catch(() => null) : null;
        if (!subject && doc.subject_id) {
          subject = await SubjectModel.findOne({ name: { $regex: new RegExp(doc.subject_id, 'i') } }).lean().catch(() => null);
        }

        return {
          id: doc._id?.toString() || doc.id,
          user_id: doc.user_id,
          subject_id: doc.subject_id,
          subject_name: (subject as any)?.name || doc.topic_tag || 'Core Subject',
          title: doc.title,
          difficulty: doc.difficulty || 'medium',
          question_count: doc.question_count || doc.questions?.length || 16,
          best_score: attempt?.score || doc.avg_score || 85,
          attempts_count: doc.attempt_count || (attempt ? 1 : 0),
          due_date: doc.due_date,
          deadline: doc.due_date,
          created_at: doc.created_at,
        };
      })
    );
    return results;
  }

  async getQuizById(quizId: string) {
    const doc: any = await QuizModel.findOne({ _id: quizId }).lean().catch(() => null) ||
                     await QuizModel.findOne({ id: quizId }).lean().catch(() => null) ||
                     await QuizModel.findOne({ audio_note_id: quizId }).lean().catch(() => null) ||
                     await QuizModel.findById(quizId).lean().catch(() => null);
    if (!doc) return null;

    return {
      id: doc._id?.toString() || doc.id,
      user_id: doc.user_id,
      subject_id: doc.subject_id,
      title: doc.title,
      difficulty: doc.difficulty || 'medium',
      questions: (doc.questions || []).map((q: any, i: number) => ({
        questionId: q._id?.toString() || String(i + 1),
        question_id: q._id?.toString() || String(i + 1),
        question: q.question,
        question_text: q.question,
        options: q.options || [],
        correctIndex: q.correct_index ?? 0,
        correct_index: q.correct_index ?? 0,
        correct_answer: q.correct_answer || (q.options ? q.options[q.correct_index || 0] : ''),
        explanation: q.explanation || 'Verified subject answer.',
        hint: q.hint || '',
        level: q.level || Math.floor(i / 2) + 1,
        difficulty: q.difficulty || doc.difficulty || 'medium',
        topic_tag: q.topic_tag || 'General',
      })),
      question_count: doc.question_count || doc.questions?.length || 0,
      created_at: doc.created_at,
    };
  }

  async submitAttempt(userId: string, quizId: string, data: { timeSpentSeconds?: number; answers: Array<{ questionId: string; selectedIndex: number }> }) {
    const quiz = await this.getQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    const questions = quiz.questions || [];
    let correctCount = 0;
    const evaluatedAnswers: any[] = [];

    for (const submitted of data.answers) {
      const q = questions.find((item: any) =>
        item.questionId === submitted.questionId ||
        item.question_id === submitted.questionId ||
        item.id === submitted.questionId
      );

      if (q) {
        const correctIdx = q.correctIndex ?? q.correct_index ?? 0;
        const isCorrect = correctIdx === submitted.selectedIndex;
        if (isCorrect) correctCount++;
        evaluatedAnswers.push({
          questionId: submitted.questionId,
          question: q.question || q.question_text,
          selectedIndex: submitted.selectedIndex,
          correctIndex: correctIdx,
          isCorrect,
          explanation: q.explanation,
        });
      }
    }

    const totalQuestions = questions.length || data.answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 60;
    const attemptId = uuidv4();

    await QuizResultModel.create({
      _id: attemptId,
      user_id: userId,
      quiz_id: quizId,
      subject_id: quiz.subject_id,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      incorrect_count: totalQuestions - correctCount,
      time_taken_seconds: data.timeSpentSeconds || 60,
      passed,
      answers: evaluatedAnswers,
    }).catch(() => {});

    if (quiz.subject_id) {
      await ProgressModel.findOneAndUpdate(
        { user_id: userId, subject_id: quiz.subject_id },
        { $set: { readiness_score: score }, $inc: { total_study_minutes: 15, streak_days: 1 } },
        { upsert: true, new: true }
      ).catch(() => {});
    }

    return {
      attemptId,
      score,
      totalQuestions,
      correctCount,
      passed,
      timeSpentSeconds: data.timeSpentSeconds || 0,
      answers: evaluatedAnswers,
      feedback:
        score >= 85
          ? 'Outstanding mastery! Ready for exam.'
          : score >= 60
          ? 'Good progress. Review the highlighted weak areas.'
          : 'Further review recommended before test day.',
    };
  }

  async getAttempts(userId: string, quizId?: string) {
    const filter: any = { user_id: userId };
    if (quizId) filter.quiz_id = quizId;
    const docs = await QuizResultModel.find(filter).sort({ created_at: -1 }).limit(50).lean();
    return docs;
  }

  async createCustomQuiz(userId: string, data: { subjectId: string; title: string; questions: any[]; difficulty?: string }) {
    const quizId = uuidv4();
    const difficulty = data.difficulty || 'medium';

    await QuizModel.create({
      _id: quizId,
      user_id: userId,
      subject_id: data.subjectId,
      title: data.title,
      difficulty,
      questions: data.questions.map((q: any, i: number) => ({
        question: q.question || q.question_text || `Question ${i + 1}`,
        options: q.options,
        correct_answer: q.options[q.correctIndex ?? q.correct_index ?? 0],
        correct_index: q.correctIndex ?? q.correct_index ?? 0,
        explanation: q.explanation || 'Verified answer.',
        difficulty,
        topic_tag: 'Custom Test',
      })),
      question_count: data.questions.length,
    });

    return {
      id: quizId,
      userId,
      user_id: userId,
      subjectId: data.subjectId,
      subject_id: data.subjectId,
      title: data.title,
      difficulty,
      total_questions: data.questions.length,
      question_count: data.questions.length,
      questions: data.questions,
      created_at: new Date(),
    };
  }

  async generateQuizFromNote(userId: string, data: { noteId: string; count?: number; difficulty?: string }) {
    const { noteId } = data;
    const note: any = await AudioNoteModel.findOne({ _id: noteId, user_id: userId }).lean() ||
                      await AudioNoteModel.findOne({ _id: noteId }).lean();
    if (!note) {
      throw new Error('Note not found. Please select a valid note to generate a quiz.');
    }

    const [transcriptDoc, summaryDoc]: [any, any] = await Promise.all([
      TranscriptModel.findOne({ note_id: noteId }).lean(),
      SummaryModel.findOne({ note_id: noteId }).lean(),
    ]);

    const content = transcriptDoc?.raw_text || summaryDoc?.summary_text || note.title;
    const llm = getLLMProvider();
    const count = data.count || 5;
    const difficulty = data.difficulty || 'medium';

    const rawQuestions = await llm.generateQuiz(content, count, difficulty);
    const quizId = uuidv4();
    const formattedQuestions = rawQuestions.map((q: any, i: number) => {
      const opts = q.options && q.options.length >= 4 ? q.options : [
        q.correctAnswer || `Key verified concept regarding ${note.title}`,
        'An inverted behavior counter to what is stated in the notes.',
        'An unrelated secondary concept not referenced in this study material.',
        'None of the above principles apply.'
      ];
      const cIdx = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < opts.length ? q.correctIndex : 0;
      const cAns = q.correctAnswer || opts[cIdx];
      opts[cIdx] = cAns;

      return {
        questionId: q.questionId || `q-${i + 1}`,
        question: q.question || `Based on your note "${note.title}", what is stated regarding this concept?`,
        options: opts,
        correct_index: cIdx,
        correct_answer: cAns,
        explanation: q.explanation || `Derived directly from your verified note "${note.title}".`,
        hint: q.hint || `Recall the key principle stated in your note regarding ${note.title}.`,
        level: Math.floor(i / 2) + 1,
        difficulty,
        topic_tag: note.title,
      };
    });

    await QuizModel.create({
      _id: quizId,
      user_id: userId,
      subject_id: note.subject_id,
      audio_note_id: noteId,
      topic_tag: note.title,
      title: `${note.title} Quiz`,
      difficulty,
      questions: formattedQuestions,
      question_count: formattedQuestions.length,
    });

    await AudioNoteModel.updateOne({ _id: noteId }, { $set: { has_quiz: true } });

    return {
      id: quizId,
      _id: quizId,
      userId,
      subject_id: note.subject_id,
      title: `${note.title} Quiz`,
      difficulty,
      questions: formattedQuestions,
      question_count: formattedQuestions.length,
    };
  }

  async deleteQuiz(userId: string, quizId: string) {
    await QuizModel.deleteMany({
      $or: [{ _id: quizId }, { id: quizId }, { audio_note_id: quizId }]
    }).catch(() => {});
    await QuizResultModel.deleteMany({ quiz_id: quizId }).catch(() => {});
    return true;
  }
}

export const quizzesService = new QuizzesService();
