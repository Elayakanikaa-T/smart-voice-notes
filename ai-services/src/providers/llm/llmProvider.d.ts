export interface AISummaryResult {
    summaryText: string;
    bulletPoints: string[];
    keyTakeaways: string[];
    keywords: Array<{
        term: string;
        definition: string;
        importance: number;
        category?: string;
    }>;
    datesDetected: Array<{
        dateString: string;
        parsedDate?: string;
        context: string;
        isExamOrDeadline: boolean;
    }>;
    entities: Array<{
        name: string;
        category: string;
    }>;
    suggestedSubject: string;
    suggestedTags: string[];
    readingTimeMinutes: number;
}
export interface FlashcardItem {
    cardId: string;
    frontQuestion: string;
    backAnswer: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topicTag: string;
}
export interface QuizQuestionItem {
    questionId: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topicTag: string;
    bloomTaxonomyLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
}
export interface ILLMProvider {
    generateSummary(transcript: string, title?: string): Promise<AISummaryResult>;
    generateFlashcards(transcript: string, count?: number): Promise<FlashcardItem[]>;
    generateQuiz(transcript: string, count?: number, difficulty?: string): Promise<QuizQuestionItem[]>;
}
export declare class MockLLMProvider implements ILLMProvider {
    generateSummary(transcript: string, title?: string): Promise<AISummaryResult>;
    generateFlashcards(transcript: string, count?: number): Promise<FlashcardItem[]>;
    generateQuiz(transcript: string, count?: number, difficulty?: string): Promise<QuizQuestionItem[]>;
}
export declare function getLLMProvider(): ILLMProvider;
