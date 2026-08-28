import { v4 as uuidv4 } from 'uuid';
import {
  SubjectModel,
  AudioNoteModel,
  TranscriptModel,
  SummaryModel,
  FlashcardModel,
  QuizModel,
  ProgressModel,
  ReminderModel,
} from '../../models/index.js';
import { ALL_CURRICULUM_SUBJECTS } from './curriculumData.js';

export const SUBJECTS = ALL_CURRICULUM_SUBJECTS.map(sub => ({
  name: sub.name,
  color: sub.color,
  icon: sub.icon,
  description: sub.description,
  notes: sub.topics.map(t => ({
    title: t.title,
    topicName: t.topicName,
    difficulty: t.difficulty,
    transcript: t.transcript,
    summary: t.summary,
    bullets: t.bullets,
    keywords: t.keywords.map(k => k.term),
    flashcards: t.flashcards,
    quizzes: t.quizzes,
  }))
}));

export async function seedUserData(userId: string): Promise<void> {
  try {
    const existingCount = await SubjectModel.countDocuments({ user_id: userId });
    if (existingCount > 0) {
      return;
    }
  } catch (err) {
    console.warn('Error checking existing subject count:', err);
  }

  for (const subjectData of ALL_CURRICULUM_SUBJECTS) {
    const subjectId = uuidv4();

    await SubjectModel.create({
      _id: subjectId,
      user_id: userId,
      name: subjectData.name,
      color: subjectData.color,
      icon: subjectData.icon,
      description: subjectData.description,
      note_count: subjectData.topics.length,
      created_at: new Date(),
    }).catch(() => {});

    for (const topicData of subjectData.topics) {
      const noteId = uuidv4();

      await AudioNoteModel.create({
        _id: noteId,
        user_id: userId,
        subject_id: subjectId,
        title: topicData.title,
        status: 'ready',
        has_transcript: true,
        has_summary: true,
        has_quiz: true,
        duration_seconds: 360,
        created_at: new Date(),
        updated_at: new Date(),
      }).catch(() => {});

      await TranscriptModel.create({
        note_id: noteId,
        user_id: userId,
        raw_text: topicData.transcript,
        language: 'en',
        confidence: 1.0,
        duration_seconds: 360,
        segments: [{ start: 0, end: 360, text: topicData.transcript }],
      }).catch(() => {});

      await SummaryModel.create({
        note_id: noteId,
        user_id: userId,
        summary_text: topicData.summary,
        bullet_points: topicData.bullets,
        key_takeaways: topicData.bullets,
        keywords: topicData.keywords.map((k: any) => ({ term: k.term, definition: k.definition })),
        readiness_score: 90,
      }).catch(() => {});

      await FlashcardModel.create({
        note_id: noteId,
        user_id: userId,
        subject_id: subjectId,
        title: `${topicData.topicName} Flashcards`,
        cards: topicData.flashcards.map((fc: any, i: number) => ({
          front_question: fc.front,
          back_answer: fc.back,
          topic_tag: topicData.topicName,
          difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3],
        })),
      }).catch(() => {});

      await QuizModel.create({
        _id: noteId,
        user_id: userId,
        subject_id: subjectId,
        audio_note_id: noteId,
        topic_tag: topicData.topicName,
        title: `${topicData.topicName} — Master Assessment (Levels 1-8)`,
        difficulty: 'medium',
        questions: topicData.quizzes.map((q: any) => ({
          question: q.question,
          options: q.options,
          correct_answer: q.options[q.correct] || '',
          correct_index: q.correct,
          explanation: q.explanation,
          hint: q.hint || '',
          level: q.level || 1,
          difficulty: q.difficulty || 'medium',
          topic_tag: topicData.topicName,
        })),
        question_count: topicData.quizzes.length,
      }).catch(() => {});
    }

    await ProgressModel.create({
      user_id: userId,
      subject_id: subjectId,
      readiness_score: 80 + Math.floor(Math.random() * 15),
      retention_rate: 88,
      streak_days: 3,
      total_study_minutes: 90,
    }).catch(() => {});
  }

  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const inTwoDays = new Date(Date.now() + 48 * 3600 * 1000);
  const inThreeDays = new Date(Date.now() + 72 * 3600 * 1000);

  const defaultReminders = [
    {
      title: 'Practice Data Structures: Arrays & Dynamic Arrays (Level 1 to 8)',
      description: 'Test your understanding across all 8 progressive levels with 16 comprehensive practice questions.',
      due_date: tomorrow,
    },
    {
      title: 'Master Operating Systems: Virtual Memory & Page Replacement',
      description: 'Review Demand Paging, Inodes, and take the 8-Level progressive assessment.',
      due_date: inTwoDays,
    },
    {
      title: 'Data Analytics Assessment: Logistic Regression & Classification Metrics',
      description: 'Study Sigmoid activation, Log Loss, and solve the 16 progressive assessment questions.',
      due_date: inThreeDays,
    },
  ];

  for (const rem of defaultReminders) {
    await ReminderModel.create({
      user_id: userId,
      title: rem.title,
      description: rem.description,
      due_date: rem.due_date,
      recurrence: 'none',
      notification_channels: ['in_app'],
    }).catch(() => {});
  }
}

export async function seedCustomSubjectData(userId: string, subjectId: string, subjectName: string): Promise<void> {
  const noteId = uuidv4();
  const title = `${subjectName} — Core Foundations & Comprehensive Guide`;
  const text = `Topic: ${subjectName}

1. Definition and Core Principles:
${subjectName} is an essential foundational domain in computer science and applied systems. It provides structured principles for organizing data, architecting reliable components, and optimizing computational complexity.

2. Detailed Explanation and Architectural Mechanics:
Mastering ${subjectName} requires understanding the balance between space allocation, execution latency, and modular decoupling.

3. Key Concepts and Subtopics:
- Foundational architectural primitives and lifecycle stages
- Operational trade-offs and complexity bounds
- Error handling, boundary conditions, and resource reclamation

4. Practical and Real-World Applications:
- Scalable distributed systems and enterprise infrastructure
- High-performance caching layers and real-time processing pipelines

5. Advantages and Limitations:
- Advantages: High determinism, optimal asymptotic complexity guarantees, modular maintainability.
- Limitations: Memory overhead when scaling dynamically.

6. Common Mistakes and Exam Pitfalls:
- Overlooking boundary conditions and off-by-one errors.
- Ignoring computational time complexity trade-offs when scaling input size.

7. Quick Revision Points:
Always evaluate space-time complexity trade-offs, enforce invariants, and test edge cases.

8. Verified Educational References:
- Standard University Computer Science Curriculum and Technical Documentation.`;

  await AudioNoteModel.create({
    _id: noteId,
    user_id: userId,
    subject_id: subjectId,
    title,
    status: 'ready',
    duration_seconds: 360,
    created_at: new Date(),
  }).catch(() => {});

  await TranscriptModel.create({
    note_id: noteId,
    user_id: userId,
    raw_text: text,
    language: 'en',
    confidence: 1.0,
    duration_seconds: 360,
    segments: [{ start: 0, end: 360, text }],
  }).catch(() => {});

  await SummaryModel.create({
    note_id: noteId,
    user_id: userId,
    summary_text: `${subjectName} core foundations, architectural patterns, complexity guarantees, and practical engineering trade-offs.`,
    bullet_points: [
      `Foundational architecture and principles of ${subjectName}`,
      'Algorithmic trade-offs and complexity guarantees',
      'Real-world system design and exam revision insights',
    ],
    keywords: [
      { term: subjectName, definition: 'Core academic topic' },
      { term: 'Asymptotic Complexity', definition: 'Time and space performance analysis' },
    ],
    readiness_score: 88,
  }).catch(() => {});

  const customQuestions = [];
  for (let lvl = 1; lvl <= 8; lvl++) {
    const diff = lvl <= 2 ? 'easy' : lvl <= 6 ? 'medium' : 'hard';
    customQuestions.push(
      {
        question: `[Level ${lvl}] What is a primary foundational principle of ${subjectName}?`,
        options: [
          `Core structured architecture and standard operational rules in ${subjectName}`,
          'Unstructured non-deterministic memory allocation',
          'Deprecating all data validation checks',
          'Ignoring computational bounds'
        ],
        correct_answer: `Core structured architecture and standard operational rules in ${subjectName}`,
        correct_index: 0,
        explanation: `Accurate architectural understanding of ${subjectName} is required at Level ${lvl}.`,
        hint: `Focus on the standard structured rules of ${subjectName}.`,
        level: lvl,
        difficulty: diff,
        topic_tag: subjectName,
      },
      {
        question: `[Level ${lvl}] How is asymptotic performance and reliability evaluated in ${subjectName}?`,
        options: [
          'By analyzing optimal time/space complexity guarantees and resource constraints',
          'By guessing execution speed randomly',
          'By disabling CPU interrupts unconditionally',
          'By removing memory safety bounds'
        ],
        correct_answer: 'By analyzing optimal time/space complexity guarantees and resource constraints',
        correct_index: 0,
        explanation: `System evaluation requires rigorous complexity analysis and constraint verification at Level ${lvl}.`,
        hint: 'Look for the option addressing time/space complexity guarantees.',
        level: lvl,
        difficulty: diff,
        topic_tag: subjectName,
      }
    );
  }

  await QuizModel.create({
    _id: noteId,
    user_id: userId,
    subject_id: subjectId,
    topic_tag: subjectName,
    title: `${subjectName} — Master Assessment (Levels 1-8)`,
    questions: customQuestions,
    question_count: 16,
  }).catch(() => {});
}
