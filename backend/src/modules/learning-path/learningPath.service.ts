import { LearningPathModel, ILearningPath, SubjectModel } from '../../models/index.js';
import { progressService } from '../progress/progress.service.js';

export class LearningPathService {
  async getLearningPaths(userId: string, subjectId?: string) {
    const filter: any = { user_id: userId };
    if (subjectId) filter.subject_id = subjectId;

    return await LearningPathModel.find(filter).sort({ generated_at: -1 }).lean();
  }

  async addTopic(userId: string, data: {
    subject_id?: string;
    subject_name?: string;
    path_id?: string;
    topic: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed';
    estimated_minutes?: number;
  }) {
    const topic = data.topic.trim();
    if (!topic) throw new Error('Topic name is required.');

    let path: any = null;

    if (data.path_id) {
      path = await LearningPathModel.findOne({ _id: data.path_id, user_id: userId });
    }

    if (!path && data.subject_id) {
      path = await LearningPathModel.findOne({ subject_id: data.subject_id, user_id: userId });
    }

    if (!path) {
      // Find or create learning path for this subject
      let subName = data.subject_name || 'General';
      if (data.subject_id) {
        const sub: any = await SubjectModel.findOne({
          $or: [{ _id: data.subject_id }, { id: data.subject_id }],
          user_id: userId,
        }).lean();
        if (sub) subName = sub.name;
      }

      path = await LearningPathModel.create({
        user_id: userId,
        subject_id: data.subject_id || 'custom-path',
        subject_name: subName,
        title: `${subName} Learning Journey`,
        description: `Personalized study path with custom topics for ${subName}.`,
        ordered_steps: [],
        total_steps: 0,
        completed_steps: 0,
        completion_pct: 0,
        estimated_total_minutes: 0,
        is_active: true,
      });
    }

    const currentSteps = path.ordered_steps || [];
    const status = data.status || 'in_progress';
    const newStep = {
      order: currentSteps.length + 1,
      topic,
      description: data.description || 'Self-assigned study topic.',
      resource_type: 'note',
      status,
      estimated_minutes: data.estimated_minutes || 30,
      completed_at: status === 'completed' ? new Date() : undefined,
    };

    path.ordered_steps.push(newStep);
    const total = path.ordered_steps.length;
    const completed = path.ordered_steps.filter((s: any) => s.status === 'completed').length;

    path.total_steps = total;
    path.completed_steps = completed;
    path.completion_pct = Math.round((completed / total) * 100);
    path.estimated_total_minutes = total * 30;

    await path.save();
    await progressService.recomputeProgress(userId).catch(() => {});
    return path.toObject();
  }

  async updateStepStatus(userId: string, pathId: string, stepId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped') {
    const path = await LearningPathModel.findOne({ _id: pathId, user_id: userId });
    if (!path) throw new Error('Learning path not found.');

    const step = (path.ordered_steps as any).id(stepId);
    if (!step) throw new Error('Topic not found in learning path.');

    step.status = status;
    if (status === 'completed') {
      step.completed_at = new Date();
    } else {
      step.completed_at = undefined;
    }

    const total = path.ordered_steps.length;
    const completed = path.ordered_steps.filter((s: any) => s.status === 'completed').length;
    path.completed_steps = completed;
    path.completion_pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    await path.save();
    await progressService.recomputeProgress(userId).catch(() => {});
    return path.toObject();
  }

  async deleteStep(userId: string, pathId: string, stepId: string) {
    const path = await LearningPathModel.findOne({ _id: pathId, user_id: userId });
    if (!path) throw new Error('Learning path not found.');

    path.ordered_steps = path.ordered_steps.filter((s: any) => s._id?.toString() !== stepId && (s as any).id !== stepId) as any;

    const total = path.ordered_steps.length;
    const completed = path.ordered_steps.filter((s: any) => s.status === 'completed').length;
    path.total_steps = total;
    path.completed_steps = completed;
    path.completion_pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    await path.save();
    await progressService.recomputeProgress(userId).catch(() => {});
    return path.toObject();
  }

  async generateLearningPath(userId: string, data: { subject_id: string; title?: string; exam_date?: string | Date }) {
    let subjectName = 'General Studies';
    const sub: any = await SubjectModel.findOne({ _id: data.subject_id, user_id: userId }).lean();
    if (sub) subjectName = sub.name;

    const steps = [
      {
        order: 1,
        topic: `${subjectName} - Foundations & Core Terminology Review`,
        description: 'Read the AI-structured notes and test key takeaways.',
        resource_type: 'note' as const,
        status: 'pending' as const,
        estimated_minutes: 25,
      },
      {
        order: 2,
        topic: `${subjectName} - Deep Dive on Identified Weak Areas`,
        description: 'Review flashcards and concept definitions flagged from your previous quizzes.',
        resource_type: 'note' as const,
        status: 'pending' as const,
        estimated_minutes: 35,
      },
      {
        order: 3,
        topic: `${subjectName} - Active Recall & Flashcard Drill`,
        description: 'Reinforce memory retention using spaced repetition cards.',
        resource_type: 'quiz' as const,
        status: 'pending' as const,
        estimated_minutes: 30,
      },
      {
        order: 4,
        topic: `${subjectName} - Full Practice Assessment`,
        description: 'Take an adaptive multi-difficulty quiz to benchmark your readiness score.',
        resource_type: 'review' as const,
        status: 'pending' as const,
        estimated_minutes: 45,
      }
    ];

    const newPath = {
      user_id: userId,
      subject_id: data.subject_id,
      subject_name: subjectName,
      title: data.title || `${subjectName} - Personalized Study Path`,
      description: `AI-customized 4-step sequence towards your mastery target.`,
      exam_date: data.exam_date ? new Date(data.exam_date) : undefined,
      ordered_steps: steps,
      total_steps: steps.length,
      completed_steps: 0,
      completion_pct: 0,
      estimated_total_minutes: 135,
      is_active: true,
      generated_at: new Date()
    };

    const created = await LearningPathModel.create(newPath);
    return created.toObject();
  }
}

export const learningPathService = new LearningPathService();
