export interface ReadinessCalculationResult {
    readinessScore: number;
    quizAccuracyAvg: number;
    materialCoveragePct: number;
    reviewRecencyScore: number;
    weakAreas: string[];
}
export declare function calculateSubjectReadiness(userId: string, subjectId: string): Promise<ReadinessCalculationResult>;
export declare function updateSubjectReadinessScore(userId: string, subjectId: string): Promise<void>;
