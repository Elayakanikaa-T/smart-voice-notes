"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQueue = void 0;
const events_1 = require("events");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_js_1 = require("../../backend/src/config/env.js");
const logger_js_1 = require("../../backend/src/utils/logger.js");
class ResilientJobQueue {
    eventEmitter = new events_1.EventEmitter();
    redisClient = null;
    transcriptionQueue = null;
    aiQueue = null;
    isRedisActive = false;
    constructor() {
        this.initRedisQueue();
    }
    initRedisQueue() {
        try {
            const redis = new ioredis_1.default({
                host: env_js_1.config.redis.host,
                port: env_js_1.config.redis.port,
                password: env_js_1.config.redis.password,
                maxRetriesPerRequest: null,
                lazyConnect: true,
                connectTimeout: 2000,
            });
            redis.connect()
                .then(() => {
                this.redisClient = redis;
                this.transcriptionQueue = new bullmq_1.Queue('transcription-queue', { connection: redis });
                this.aiQueue = new bullmq_1.Queue('ai-processing-queue', { connection: redis });
                this.isRedisActive = true;
                logger_js_1.logger.info('[Queue] Connected to Redis BullMQ queues.');
            })
                .catch(() => {
                logger_js_1.logger.info('[Queue] Redis unavailable. Using in-memory event-driven queue pipeline.');
                this.isRedisActive = false;
            });
        }
        catch {
            this.isRedisActive = false;
        }
    }
    async addTranscriptionJob(payload) {
        logger_js_1.logger.info(`[Queue] Scheduling transcription job for note ${payload.noteId}`);
        if (this.isRedisActive && this.transcriptionQueue) {
            await this.transcriptionQueue.add('transcribe', payload, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            });
        }
        else {
            // Async dispatch on next tick
            setImmediate(() => {
                this.eventEmitter.emit('transcription-job', payload);
            });
        }
    }
    async addAIProcessingJob(payload) {
        logger_js_1.logger.info(`[Queue] Scheduling AI summarization & quiz generation for note ${payload.noteId}`);
        if (this.isRedisActive && this.aiQueue) {
            await this.aiQueue.add('ai-process', payload, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 3000 },
            });
        }
        else {
            setImmediate(() => {
                this.eventEmitter.emit('ai-job', payload);
            });
        }
    }
    onTranscriptionJob(handler) {
        if (this.isRedisActive && this.redisClient) {
            new bullmq_1.Worker('transcription-queue', async (job) => {
                await handler(job.data);
            }, { connection: this.redisClient });
        }
        this.eventEmitter.on('transcription-job', async (payload) => {
            try {
                await handler(payload);
            }
            catch (err) {
                logger_js_1.logger.error(`[Queue] Error processing in-memory transcription job:`, err);
            }
        });
    }
    onAIProcessingJob(handler) {
        if (this.isRedisActive && this.redisClient) {
            new bullmq_1.Worker('ai-processing-queue', async (job) => {
                await handler(job.data);
            }, { connection: this.redisClient });
        }
        this.eventEmitter.on('ai-job', async (payload) => {
            try {
                await handler(payload);
            }
            catch (err) {
                logger_js_1.logger.error(`[Queue] Error processing in-memory AI job:`, err);
            }
        });
    }
}
exports.jobQueue = new ResilientJobQueue();
