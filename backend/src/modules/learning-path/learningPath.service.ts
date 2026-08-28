import { LearningPathModel, ILearningPath, SubjectModel } from '../../models/index.js';
import { progressService } from '../progress/progress.service.js';

export class LearningPathService {
  async getLearningPaths(userId: string, subjectId?: string) {
    const filter: any = { user_id: userId };
    if (subjectId) filter.subject_id = subjectId;

    let paths = await LearningPathModel.find(filter).sort({ generated_at: -1 }).lean();

    // Auto-seed default realistic paths if user has none
    if (paths.length === 0 && (!subjectId || subjectId === 'all')) {
      const subjects: any[] = await SubjectModel.find({
        $or: [{ user_id: userId }, { user_id: { $exists: false } }],
        is_archived: false,
      }).lean();

      const defaultCurriculum = [
        {
          name: 'Data Structures',
          title: 'Data Structures Mastery Path',
          desc: 'Master foundational and advanced linear and hierarchical structures.',
          steps: [
            { topic: 'Arrays & Dynamic Arrays', status: 'completed' as const, description: 'Contiguous memory, resizing amortized O(1), and cache locality.' },
            { topic: 'Linked Lists & Doubly Linked Lists', status: 'completed' as const, description: 'Pointer manipulation and node insertion/deletion.' },
            { topic: 'Stacks & Queues', status: 'completed' as const, description: 'LIFO & FIFO semantics, circular buffers, and expressions.' },
            { topic: 'Binary Search Trees & AVL Balancing', status: 'in_progress' as const, description: 'Search invariants, rotations, and height balance guarantees.' },
            { topic: 'Graph Traversals (BFS, DFS & Dijkstra)', status: 'pending' as const, description: 'Shortest path computation and state space exploration.' },
            { topic: 'Dynamic Programming & Memoization', status: 'pending' as const, description: 'Optimal substructure and overlapping subproblems.' }
          ]
        },
        {
          name: 'Operating Systems',
          title: 'Operating Systems Blueprint',
          desc: 'Core kernel mechanisms, process scheduling, and memory architecture.',
          steps: [
            { topic: 'Process Lifecycle & PCB Management', status: 'completed' as const, description: 'Process control blocks, context switching, and states.' },
            { topic: 'CPU Scheduling Algorithms', status: 'completed' as const, description: 'Round Robin, SJF, and multilevel feedback queues.' },
            { topic: 'Virtual Memory & Demand Paging', status: 'in_progress' as const, description: 'Page tables, TLB caching, and page replacement policies.' },
            { topic: 'File Systems & Inode Structures', status: 'pending' as const, description: 'Directory hierarchical trees, block pointers, and disk scheduling.' },
            { topic: 'Concurrency & Deadlock Prevention', status: 'pending' as const, description: 'Mutex locks, semaphores, and Banker algorithm invariants.' }
          ]
        },
        {
          name: 'Data Analytics',
          title: 'Data Analytics & ML Fundamentals',
          desc: 'Statistical inference, exploratory analysis, and predictive modeling.',
          steps: [
            { topic: 'Descriptive Statistics & Central Tendency', status: 'completed' as const, description: 'Mean, median, mode, variance, and standard deviation.' },
            { topic: 'Data Visualization & Distribution Analysis', status: 'completed' as const, description: 'Box plots, histograms, and skewness evaluation.' },
            { topic: 'Exploratory Data Analysis & Imputation', status: 'completed' as const, description: 'Handling missing values, outliers, and feature scaling.' },
            { topic: 'Linear & Logistic Regression', status: 'completed' as const, description: 'Ordinary least squares, sigmoid functions, and ROC-AUC.' },
            { topic: 'K-Means Clustering & PCA', status: 'in_progress' as const, description: 'Unsupervised grouping and dimensionality reduction.' }
          ]
        }
      ];

      for (const curr of defaultCurriculum) {
        const matchingSub = subjects.find(s => s.name.toLowerCase().includes(curr.name.toLowerCase()));
        const subId = matchingSub?._id?.toString() || matchingSub?.id || curr.name.toLowerCase().replace(/\s+/g, '-');

        const orderedSteps = curr.steps.map((s, idx) => ({
          order: idx + 1,
          topic: s.topic,
          description: s.description,
          resource_type: 'note' as const,
          status: s.status,
          estimated_minutes: 30,
          completed_at: s.status === 'completed' ? new Date() : undefined,
        }));

        const completedCount = orderedSteps.filter(s => s.status === 'completed').length;
        const total = orderedSteps.length;

        await LearningPathModel.create({
          user_id: userId,
          subject_id: subId,
          subject_name: curr.name,
          title: curr.title,
          description: curr.desc,
          exam_date: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          ordered_steps: orderedSteps,
          total_steps: total,
          completed_steps: completedCount,
          completion_pct: Math.round((completedCount / total) * 100),
          estimated_total_minutes: total * 30,
          is_active: true,
        }).catch(() => {});
      }

      paths = await LearningPathModel.find(filter).sort({ generated_at: -1 }).lean();
    }

    return paths;
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
