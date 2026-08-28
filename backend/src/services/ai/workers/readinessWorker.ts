import { ProgressModel, QuizResultModel } from '../../../models/index.js';
import { logger } from '../../../utils/logger.js';

export async function calculateSubjectReadiness(userId: string, subjectId: string) {
  const results: any[] = await QuizResultModel.find({
    user_id: userId,
    subject_id: subjectId,
  }).sort({ taken_at: -1 }).limit(10).lean();

  const quizAttempts = results.length;
  const quizAccuracyAvg = quizAttempts > 0
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / quizAttempts)
    : 85;

  const weakTopics = new Set<string>();
  results.forEach((r: any) => {
    (r.weak_topics || []).forEach((t: string) => weakTopics.add(t));
  });

  const materialCoveragePct = Math.min(100, quizAttempts * 15 + (quizAccuracyAvg > 0 ? 10 : 0));
  const readinessScore = Math.round(quizAccuracyAvg * 0.5 + materialCoveragePct * 0.3 + 80 * 0.2);

  return {
    readinessScore: Math.min(100, readinessScore || 85),
    quizAccuracyAvg,
    materialCoveragePct,
    reviewRecencyScore: 85,
    weakAreas: Array.from(weakTopics).slice(0, 5),
  };
}

export async function updateSubjectReadinessScore(userId: string, subjectId: string): Promise<number> {
  const result = await calculateSubjectReadiness(userId, subjectId);
  await ProgressModel.findOneAndUpdate(
    { user_id: userId, subject_id: subjectId },
    {
      $set: {
        readiness_score: result.readinessScore,
        quiz_accuracy_avg: result.quizAccuracyAvg,
        material_coverage_pct: result.materialCoveragePct,
        weak_topics: result.weakAreas,
        updated_at: new Date(),
      },
    },
    { upsert: true }
  ).catch(() => {});
  return result.readinessScore;
}
