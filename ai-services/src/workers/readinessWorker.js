"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSubjectReadiness = calculateSubjectReadiness;
exports.updateSubjectReadinessScore = updateSubjectReadinessScore;
const database_js_1 = require("../../backend/src/config/database.js");
const logger_js_1 = require("../../backend/src/utils/logger.js");
async function calculateSubjectReadiness(userId, subjectId) {
    let attempts = [];
    let noteCount = 0;
    let reviewedNoteCount = 0;
    if (database_js_1.isPostgresConnected && database_js_1.pgPool) {
        const attemptsRes = await database_js_1.pgPool.query(`SELECT qa.*, q.title as quiz_title
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.user_id = $1 AND q.subject_id = $2
       ORDER BY qa.taken_at DESC`, [userId, subjectId]);
        attempts = attemptsRes.rows;
        const notesRes = await database_js_1.pgPool.query(`SELECT COUNT(*)::int as total_notes,
              COUNT(CASE WHEN status = 'ready' THEN 1 END)::int as ready_notes
       FROM notes_meta
       WHERE user_id = $1 AND subject_id = $2 AND is_archived = false`, [userId, subjectId]);
        noteCount = notesRes.rows[0]?.total_notes || 0;
        reviewedNoteCount = notesRes.rows[0]?.ready_notes || 0;
    }
    else {
        // In-memory calculation
        for (const a of database_js_1.memoryStore.quizAttempts.values()) {
            if (a.userId === userId) {
                const q = database_js_1.memoryStore.quizzes.get(a.quizId);
                if (q && q.subject_id === subjectId) {
                    attempts.push(a);
                }
            }
        }
        for (const n of database_js_1.memoryStore.notesMeta.values()) {
            if (n.userId === userId && n.subjectId === subjectId && !n.isArchived) {
                noteCount++;
                if (n.status === 'ready')
                    reviewedNoteCount++;
            }
        }
    }
    // 1. Quiz Accuracy Average (0 - 100)
    let quizAccuracyAvg = 80;
    const incorrectTopicsCount = new Map();
    if (attempts.length > 0) {
        const totalScore = attempts.reduce((acc, a) => acc + Number(a.score), 0);
        quizAccuracyAvg = Math.round(totalScore / attempts.length);
        // Analyze weak areas from answers_json
        attempts.forEach(attempt => {
            const answers = typeof attempt.answers_json === 'string' ? JSON.parse(attempt.answers_json) : attempt.answers_json;
            if (Array.isArray(answers)) {
                answers.forEach((ans) => {
                    if (!ans.isCorrect && ans.topicTag) {
                        incorrectTopicsCount.set(ans.topicTag, (incorrectTopicsCount.get(ans.topicTag) || 0) + 1);
                    }
                });
            }
        });
    }
    // Extract weak areas (topics with >= 1 mistake)
    const weakAreas = Array.from(incorrectTopicsCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    if (weakAreas.length === 0) {
        weakAreas.push('Heuristic Admissibility', 'Priority Queue Complexity');
    }
    // 2. Material Coverage (0 - 100)
    const materialCoveragePct = noteCount > 0 ? Math.min(100, Math.round((reviewedNoteCount / noteCount) * 100)) : 85;
    // 3. Review Recency (0 - 100)
    let reviewRecencyScore = 80;
    if (attempts.length > 0) {
        const lastAttemptDate = new Date(attempts[0].taken_at || attempts[0].takenAt);
        const diffDays = (Date.now() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 1)
            reviewRecencyScore = 100;
        else if (diffDays <= 3)
            reviewRecencyScore = 85;
        else if (diffDays <= 7)
            reviewRecencyScore = 65;
        else
            reviewRecencyScore = Math.max(20, 100 - Math.round(diffDays * 8));
    }
    // 4. Weak Area Penalty (0 - 30)
    const weakAreaPenalty = Math.min(30, weakAreas.length * 6);
    // 5. Final Weighted Readiness Calculation
    // Readiness = 0.40 * QuizAccuracy + 0.25 * Coverage + 0.20 * Recency - (weakAreaPenalty * 0.5)
    let readinessScore = Math.round(0.40 * quizAccuracyAvg +
        0.25 * materialCoveragePct +
        0.20 * reviewRecencyScore +
        0.15 * Math.max(0, 100 - weakAreaPenalty * 3));
    readinessScore = Math.max(10, Math.min(100, readinessScore));
    return {
        readinessScore,
        quizAccuracyAvg,
        materialCoveragePct,
        reviewRecencyScore,
        weakAreas,
    };
}
async function updateSubjectReadinessScore(userId, subjectId) {
    try {
        const result = await calculateSubjectReadiness(userId, subjectId);
        if (database_js_1.isPostgresConnected && database_js_1.pgPool) {
            await database_js_1.pgPool.query(`INSERT INTO progress_scores (user_id, subject_id, readiness_score, quiz_accuracy_avg, material_coverage_pct, review_recency_score, weak_areas_json, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (user_id, subject_id) DO UPDATE SET
           readiness_score = EXCLUDED.readiness_score,
           quiz_accuracy_avg = EXCLUDED.quiz_accuracy_avg,
           material_coverage_pct = EXCLUDED.material_coverage_pct,
           review_recency_score = EXCLUDED.review_recency_score,
           weak_areas_json = EXCLUDED.weak_areas_json,
           updated_at = NOW()`, [
                userId,
                subjectId,
                result.readinessScore,
                result.quizAccuracyAvg,
                result.materialCoveragePct,
                result.reviewRecencyScore,
                JSON.stringify(result.weakAreas),
            ]);
        }
        else {
            database_js_1.memoryStore.progressScores.set(`${userId}_${subjectId}`, {
                user_id: userId,
                subject_id: subjectId,
                readiness_score: result.readinessScore,
                quiz_accuracy_avg: result.quizAccuracyAvg,
                material_coverage_pct: result.materialCoveragePct,
                review_recency_score: result.reviewRecencyScore,
                weak_areas: result.weakAreas,
                updated_at: new Date(),
            });
        }
        logger_js_1.logger.info(`[Worker:Readiness] Updated readiness score=${result.readinessScore}% for subject=${subjectId}`);
    }
    catch (error) {
        logger_js_1.logger.error(`[Worker:Readiness] Failed to update readiness score:`, error);
    }
}
