export interface TranscriptSegmentDTO {
    start: number;
    end: number;
    text: string;
    speaker?: string;
    confidence?: number;
}
export interface STTResult {
    rawText: string;
    language: string;
    confidence: number;
    durationSeconds: number;
    segments: TranscriptSegmentDTO[];
}
export interface ISTTProvider {
    transcribe(audioPathOrUrl: string, options?: {
        language?: string;
    }): Promise<STTResult>;
}
export declare class MockSTTProvider implements ISTTProvider {
    transcribe(audioPathOrUrl: string, options?: {
        language?: string;
    }): Promise<STTResult>;
}
export declare class WhisperSTTProvider implements ISTTProvider {
    transcribe(audioPathOrUrl: string, options?: {
        language?: string;
    }): Promise<STTResult>;
}
export declare class AssemblyAISTTProvider implements ISTTProvider {
    transcribe(audioPathOrUrl: string, options?: {
        language?: string;
    }): Promise<STTResult>;
}
export declare function getSTTProvider(): ISTTProvider;
