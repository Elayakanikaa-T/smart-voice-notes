import { ProgressModel, QuizResultModel, SubjectModel, LearningPathModel, AudioNoteModel, SummaryModel } from '../../models/index.js';

export class ProgressService {
  async getProgress(userId: string) {
    await this.recomputeProgress(userId);

    const progressRecords: any[] = await ProgressModel.find({ user_id: userId })
      .sort({ readiness_score: -1 })
      .lean();

    const overall = progressRecords.length > 0
      ? Math.round(progressRecords.reduce((a, p) => a + p.readiness_score, 0) / progressRecords.length)
      : 0;

    const learningPathOverall = progressRecords.length > 0
      ? Math.round(progressRecords.reduce((a, p) => a + (p.learning_path_pct || p.material_coverage_pct || 0), 0) / progressRecords.length)
      : 0;

    return {
      subjects: progressRecords.map(p => ({
        subjectId: p.subject_id,
        subjectName: p.subject_name || 'Unknown',
        readinessScore: p.readiness_score,
        quizAccuracyAvg: p.quiz_accuracy_avg,
        materialCoveragePct: p.material_coverage_pct,
        learningPathPct: p.learning_path_pct ?? p.material_coverage_pct,
        pathTotalSteps: p.path_total_steps || 0,
        pathCompletedSteps: p.path_completed_steps || 0,
        quizAttempts: p.quiz_attempts,
        weakAreas: p.weak_topics,
        strongAreas: p.strong_topics,
        lastUpdated: p.last_updated,
      })),
      overall,
      learningPathOverall,
    };
  }

  async getSubjectProgress(userId: string, subjectId: string) {
    const record: any = await ProgressModel.findOne({ user_id: userId, subject_id: subjectId }).lean();
    if (!record) return null;
    return {
      subjectId: record.subject_id,
      subjectName: record.subject_name,
      readinessScore: record.readiness_score,
      quizAccuracyAvg: record.quiz_accuracy_avg,
      materialCoveragePct: record.material_coverage_pct,
      learningPathPct: record.learning_path_pct ?? record.material_coverage_pct,
      pathTotalSteps: record.path_total_steps || 0,
      pathCompletedSteps: record.path_completed_steps || 0,
      weakAreas: record.weak_topics,
      strongAreas: record.strong_topics,
      quizAttempts: record.quiz_attempts,
    };
  }

  async updateConceptReadiness(userId: string, data: { subjectId?: string; noteId?: string; readinessLevel: number; isDone?: boolean; topicName?: string }) {
    const level = Math.max(0, Math.min(100, Math.round(Number(data.readinessLevel) || 0)));
    let targetSubjectId = data.subjectId;

    if (data.noteId) {
      const note: any = await AudioNoteModel.findById(data.noteId).lean().catch(() => null);
      if (note) {
        targetSubjectId = targetSubjectId || note.subject_id;
        await AudioNoteModel.findByIdAndUpdate(data.noteId, {
          $set: {
            readiness_level: level,
            is_completed: data.isDone ?? (level >= 80),
            updated_at: new Date(),
          }
        }).catch(() => {});

        await SummaryModel.findOneAndUpdate(
          { note_id: data.noteId },
          { $set: { readiness_score: level, updated_at: new Date() } }
        ).catch(() => {});
      }
    }

    if (targetSubjectId) {
      const allNotes: any[] = await AudioNoteModel.find({ subject_id: targetSubjectId, is_archived: false }).lean().catch(() => []);
      const readinessScores = allNotes.map(n => n.readiness_level || 0);
      const avgSubjectReadiness = readinessScores.length > 0
        ? Math.round(readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length)
        : level;

      await ProgressModel.findOneAndUpdate(
        { user_id: userId, subject_id: targetSubjectId },
        {
          $set: {
            readiness_score: Math.max(avgSubjectReadiness, level),
            last_updated: new Date(),
          }
        },
        { upsert: true }
      ).catch(() => {});

      await SubjectModel.findByIdAndUpdate(targetSubjectId, {
        $set: { readiness_score: Math.max(avgSubjectReadiness, level) }
      }).catch(() => {});
    }

    return {
      success: true,
      readinessLevel: level,
      isDone: data.isDone ?? (level >= 80),
      subjectId: targetSubjectId,
      noteId: data.noteId,
    };
  }

  public async recomputeProgress(userId: string) {
    try {
      const subjects: any[] = await SubjectModel.find({
        $or: [{ user_id: userId }, { user_id: { $exists: false } }],
        is_archived: false,
      }).lean();

      for (const subject of subjects) {
        const subjectId = (subject._id as any).toString();

        const [results, path]: [any[], any] = await Promise.all([
          QuizResultModel.find({
            user_id: userId,
            subject_id: { $in: [subjectId, subject.id, subject.name] },
          }).sort({ taken_at: -1 }).limit(10).lean(),
          LearningPathModel.findOne({
            user_id: userId,
            $or: [
              { subject_id: subjectId },
              { subject_id: subject.id },
              { subject_name: { $regex: new RegExp(`^${subject.name}$`, 'i') } }
            ]
          }).lean()
        ]);

        const quizAttempts = results.length;
        const quizAccuracyAvg = quizAttempts > 0
          ? Math.round(results.reduce((a, r) => a + r.score, 0) / quizAttempts)
          : 80;

        const weakTopics = new Set<string>();
        const strongTopics = new Set<string>();
        results.forEach((r: any) => {
          (r.weak_topics || []).forEach((t: string) => weakTopics.add(t));
          (r.strong_topics || []).forEach((t: string) => strongTopics.add(t));
        });

        // Learning Path Stats
        const pathTotal = path ? (path.total_steps || path.ordered_steps?.length || 0) : 0;
        const pathCompleted = path ? (path.completed_steps || path.ordered_steps?.filter((s: any) => s.status === 'completed').length || 0) : 0;
        const learningPathPct = pathTotal > 0 ? Math.round((pathCompleted / pathTotal) * 100) : (path?.completion_pct || 0);

        // Material coverage is primarily driven by Learning Path completion + Quiz activity
        const materialCoveragePct = pathTotal > 0
          ? learningPathPct
          : Math.min(100, quizAttempts * 20 + 20);

        const lastActivity = results[0]?.taken_at || new Date();
        const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
        const recencyFactor = Math.max(50, 100 - Math.floor(daysSinceActivity * 3.5));

        // Readiness score combines: Learning Path (40%) + Quiz Accuracy (40%) + Activity Recency (20%)
        const readinessScore = Math.round(
          (materialCoveragePct * 0.4) +
          (quizAccuracyAvg * 0.4) +
          (recencyFactor * 0.2)
        );

        await ProgressModel.findOneAndUpdate(
          { user_id: userId, subject_id: subjectId },
          {
            $set: {
              subject_name: subject.name,
              readiness_score: Math.min(100, Math.max(0, readinessScore)),
              quiz_accuracy_avg: quizAccuracyAvg,
              material_coverage_pct: materialCoveragePct,
              learning_path_pct: learningPathPct,
              path_total_steps: pathTotal,
              path_completed_steps: pathCompleted,
              quiz_attempts: quizAttempts,
              weak_topics: Array.from(weakTopics).slice(0, 10),
              strong_topics: Array.from(strongTopics).slice(0, 10),
              last_updated: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error('[ProgressService] recompute error:', err);
    }
  }
}

export const progressService = new ProgressService();
