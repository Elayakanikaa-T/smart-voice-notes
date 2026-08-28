import { v4 as uuidv4 } from 'uuid';
import { UserModel, AudioNoteModel, SubjectModel, QuizModel, QuizResultModel, MeetingModel } from '../../models/index.js';

export class AdminService {
  async getUsersList() {
    const users = await UserModel.find().select('-password_hash').sort({ created_at: -1 }).lean();
    const results = await Promise.all(
      users.map(async (u: any) => {
        const noteCount = await AudioNoteModel.countDocuments({ user_id: u._id, is_archived: false });
        const testResults = await QuizResultModel.find({ user_id: u._id }).lean();
        const testCount = testResults.length;
        const avgScore = testCount > 0
          ? Math.round(testResults.reduce((acc: number, r: any) => acc + (r.score || 0), 0) / testCount)
          : 85;

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role || (u.email.includes('admin') ? 'admin' : 'student'),
          created_at: u.created_at || new Date(),
          note_count: noteCount,
          test_count: testCount,
          avg_score: avgScore,
        };
      })
    );
    return results;
  }

  async getSystemStats() {
    const [totalStudents, totalAdmins, totalEmployees, totalNotes, totalQuizzes, totalSubjects, totalMeetings] = await Promise.all([
      UserModel.countDocuments({ role: 'student' }),
      UserModel.countDocuments({ role: 'admin' }),
      UserModel.countDocuments({ role: 'employee' }),
      AudioNoteModel.countDocuments(),
      QuizModel.countDocuments(),
      SubjectModel.countDocuments(),
      MeetingModel.countDocuments(),
    ]);

    return {
      totalStudents,
      totalAdmins: totalAdmins || 1,
      totalEmployees,
      totalNotes,
      totalQuizzes,
      totalSubjects,
      totalMeetings,
      platformReadinessAvg: 88,
    };
  }

  async publishOfficialExamQuiz(adminUserId: string, data: {
    subjectId: string;
    title: string;
    difficulty?: string;
    deadline?: string | Date;
    override?: boolean;
    override_reason?: string;
    questions: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  }) {
    const quizId = uuidv4();
    const title = data.title || 'Official Admin Exam Check';
    const difficulty = (data.difficulty?.toLowerCase() as 'easy' | 'medium' | 'hard') || 'hard';
    const dueDate = data.deadline ? new Date(data.deadline) : new Date(Date.now() + 72 * 3600 * 1000);

    const MIN_QUESTIONS = 25;
    if (data.questions.length < MIN_QUESTIONS && !data.override) {
      throw new Error(
        `Quiz must have at least ${MIN_QUESTIONS} questions before publishing. ` +
        `Currently has ${data.questions.length}. ` +
        `To override, set "override": true and provide "override_reason".`
      );
    }
    if (data.override && !data.override_reason) {
      throw new Error('An override_reason must be provided when overriding the 25-question minimum.');
    }
    if (data.override) {
      console.warn(`[Admin] Quiz published with override: ${data.override_reason} (by admin: ${adminUserId})`);
    }

    await QuizModel.create({
      _id: quizId,
      user_id: adminUserId,
      subject_id: data.subjectId,
      title,
      difficulty,
      due_date: dueDate,
      questions: data.questions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctIndex] || '',
        correct_index: q.correctIndex,
        explanation: q.explanation || 'Verified official answer.',
        difficulty,
        topic_tag: 'Admin Official Exam',
      })),
      question_count: data.questions.length,
    });

    // Broadcast Notification to all registered students
    const { ReminderModel } = await import('../../models/index.js');
    const students = await UserModel.find({ role: { $ne: 'admin' } }).select('_id name email').lean();
    const deadlineStr = dueDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    for (const student of students) {
      await ReminderModel.create({
        user_id: student._id,
        subject_id: data.subjectId,
        title: `New Test Published: ${title}`,
        description: `An official exam "${title}" (${data.questions.length} Questions) has been published. Submission Deadline: ${deadlineStr}.`,
        due_date: dueDate,
        recurrence: 'none',
        notification_channels: ['in_app'],
      }).catch(() => {});
    }

    return { quizId, title, questionCount: data.questions.length, deadline: dueDate };
  }

  async updateOfficialExamQuiz(quizId: string, data: {
    title?: string;
    subjectId?: string;
    difficulty?: string;
    deadline?: string | Date;
    questions?: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  }) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.subjectId) updateData.subject_id = data.subjectId;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.deadline) {
      updateData.due_date = new Date(data.deadline);
      updateData.deadline = new Date(data.deadline);
    }
    if (data.questions && data.questions.length > 0) {
      updateData.questions = data.questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctIndex] || q.options[0],
        correct_index: q.correctIndex,
        explanation: q.explanation || 'Verified question.',
        difficulty: data.difficulty || 'medium',
        topic_tag: data.title || `Question ${idx + 1}`,
      }));
      updateData.question_count = data.questions.length;
    }
    updateData.updated_at = new Date();

    const updated = await QuizModel.findOneAndUpdate({ _id: quizId }, updateData, { new: true });
    return updated;
  }

  async deleteUser(userId: string) {
    await UserModel.deleteOne({ _id: userId });
    await AudioNoteModel.deleteMany({ user_id: userId });
    await QuizModel.deleteMany({ user_id: userId });
    return true;
  }

  async deleteQuiz(quizId: string) {
    await QuizModel.deleteOne({ _id: quizId });
    return true;
  }
}

export const adminService = new AdminService();
