import { EventEmitter } from 'events';
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

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

class ResilientJobQueue implements JobQueueSystem {
  private eventEmitter = new EventEmitter();
  private redisClient: Redis | null = null;
  private transcriptionQueue: Queue | null = null;
  private aiQueue: Queue | null = null;
  private isRedisActive = false;

  constructor() {
    this.initRedisQueue();
  }

  private initRedisQueue() {
    try {
      const redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectTimeout: 2000,
        retryStrategy: () => null, // disable auto-retry — fall back to in-memory
      });
      // Suppress unhandled connection error events when Redis is unavailable
      redis.on('error', () => {});

      redis
        .connect()
        .then(() => {
          this.redisClient = redis;
          this.transcriptionQueue = new Queue('transcription-queue', { connection: redis });
          this.aiQueue = new Queue('ai-processing-queue', { connection: redis });
          this.isRedisActive = true;
          logger.info('[Queue] Connected to Redis BullMQ queues.');
        })
        .catch(() => {
          logger.info('[Queue] Redis unavailable. Using in-memory event-driven queue pipeline.');
          this.isRedisActive = false;
        });
    } catch {
      this.isRedisActive = false;
    }
  }

  async addTranscriptionJob(payload: NoteJobPayload): Promise<void> {
    logger.info(`[Queue] Scheduling transcription job for note ${payload.noteId}`);
    if (this.isRedisActive && this.transcriptionQueue) {
      await this.transcriptionQueue.add('transcribe', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
    } else {
      setImmediate(() => {
        this.eventEmitter.emit('transcription-job', payload);
      });
    }
  }

  async addAIProcessingJob(payload: AIJobPayload): Promise<void> {
    logger.info(`[Queue] Scheduling AI summarization & quiz generation for note ${payload.noteId}`);
    if (this.isRedisActive && this.aiQueue) {
      await this.aiQueue.add('ai-process', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      });
    } else {
      setImmediate(() => {
        this.eventEmitter.emit('ai-job', payload);
      });
    }
  }

  onTranscriptionJob(handler: (payload: NoteJobPayload) => Promise<void>): void {
    if (this.isRedisActive && this.redisClient) {
      new Worker(
        'transcription-queue',
        async (job: Job<NoteJobPayload>) => {
          await handler(job.data);
        },
        { connection: this.redisClient }
      );
    }
    this.eventEmitter.on('transcription-job', async (payload: NoteJobPayload) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error(`[Queue] Error processing in-memory transcription job:`, err);
      }
    });
  }

  onAIProcessingJob(handler: (payload: AIJobPayload) => Promise<void>): void {
    if (this.isRedisActive && this.redisClient) {
      new Worker(
        'ai-processing-queue',
        async (job: Job<AIJobPayload>) => {
          await handler(job.data);
        },
        { connection: this.redisClient }
      );
    }
    this.eventEmitter.on('ai-job', async (payload: AIJobPayload) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error(`[Queue] Error processing in-memory AI job:`, err);
      }
    });
  }
}

export const jobQueue = new ResilientJobQueue();
