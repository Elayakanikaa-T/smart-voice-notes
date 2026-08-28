export interface NoteJobPayload {
    noteId: string;
    userId: string;
    subjectId: string;
    audioKey?: string;
    audioUrl?: string;
    title?: string;
}
export interface AIJobPayload {
    noteId: string;
    userId: string;
    subjectId: string;
    transcriptText: string;
}
export interface JobQueueSystem {
    addTranscriptionJob(payload: NoteJobPayload): Promise<void>;
    addAIProcessingJob(payload: AIJobPayload): Promise<void>;
    onTranscriptionJob(handler: (payload: NoteJobPayload) => Promise<void>): void;
    onAIProcessingJob(handler: (payload: AIJobPayload) => Promise<void>): void;
}
declare class ResilientJobQueue implements JobQueueSystem {
    private eventEmitter;
    private redisClient;
    private transcriptionQueue;
    private aiQueue;
    private isRedisActive;
    constructor();
    private initRedisQueue;
    addTranscriptionJob(payload: NoteJobPayload): Promise<void>;
    addAIProcessingJob(payload: AIJobPayload): Promise<void>;
    onTranscriptionJob(handler: (payload: NoteJobPayload) => Promise<void>): void;
    onAIProcessingJob(handler: (payload: AIJobPayload) => Promise<void>): void;
}
export declare const jobQueue: ResilientJobQueue;
export {};
