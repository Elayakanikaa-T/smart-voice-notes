import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_secret_access_key_min_32_chars_long_12345',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_secret_refresh_key_min_32_chars_long_12345',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '7d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },

  postgres: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    database: process.env.PG_DATABASE || 'smart_voice_notes',
    ssl: process.env.PG_SSL === 'true',
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_voice_notes',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  storage: {
    driver: (process.env.STORAGE_DRIVER || 'local') as 's3' | 'local',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.S3_BUCKET_NAME || 'smart-voice-notes-audio',
    signedUrlExpiry: parseInt(process.env.S3_SIGNED_URL_EXPIRY || '3600', 10),
    localUploadDir: path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || './uploads'),
  },

  ai: {
    sttProvider: (process.env.STT_PROVIDER || 'mock') as 'whisper' | 'assemblyai' | 'google' | 'mock',
    llmProvider: (process.env.LLM_PROVIDER || 'hybrid') as 'openai' | 'gemini' | 'hybrid' | 'mock' | 'anthropic',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY || '',
  },

  n8n: {
    examRemindersWebhook: process.env.N8N_EXAM_REMINDERS_WEBHOOK_URL || '',
    notePipelineWebhook: process.env.N8N_NOTE_PIPELINE_WEBHOOK_URL || '',
    calendarSyncWebhook: process.env.N8N_CALENDAR_SYNC_WEBHOOK_URL || '',
    autoShareWebhook: process.env.N8N_AUTO_SHARE_WEBHOOK_URL || '',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || 'n8n_secret_hmac_token_123',
  },
};
