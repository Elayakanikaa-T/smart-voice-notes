import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { config } from './config/env.js';
import { isMongoConnected } from './config/database.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { swaggerRouter } from './swagger/swagger.js';

// Route modules
import authRoutes from './modules/auth/auth.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import subjectsRoutes from './modules/subjects/subjects.routes.js';
import notesRoutes from './modules/notes/notes.routes.js';
import transcriptionRoutes from './modules/transcription/transcription.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import quizzesRoutes from './modules/quizzes/quizzes.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import remindersRoutes from './modules/reminders/reminders.routes.js';
import sharesRoutes from './modules/shares/shares.routes.js';
import webhooksRoutes from './modules/webhooks/webhooks.routes.js';
import progressRoutes from './modules/progress/progress.routes.js';
import recommendationsRoutes from './modules/recommendations/recommendations.routes.js';
import learningPathRoutes from './modules/learning-path/learningPath.routes.js';
import languagesRoutes from './modules/languages/languages.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import { doubtChatRouter } from './modules/doubt-chat/doubt-chat.routes.js';

// Meeting Portal Routes
import meetingsRoutes from './modules/meetings/meetings.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import translateRoutes from './modules/translate/translate.routes.js';
import { startMeetingWorker } from './services/meetingWorker.js';
import { startTaskReminderCron } from './services/taskReminderCron.js';

export function createApp(): express.Application {
  const app = express();

  // Security & standard middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static files for local uploads and web preview
  app.use('/uploads', express.static(config.storage.localUploadDir));
  const frontendPath = path.resolve(process.cwd(), '../frontend/dist');
  app.use(express.static(frontendPath));

  // Global rate limiter (generous limit for local dev & testing)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });
  app.use(limiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'smart-voice-note-backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        mongodb: isMongoConnected ? 'connected' : 'disconnected',
      },
    });
  });

  // Swagger Documentation
  app.use('/api-docs', swaggerRouter);

  // API v1 Routes
  const v1 = express.Router();
  v1.use('/auth', authRoutes);
  v1.use('/admin', adminRouter);
  v1.use('/profile', profileRoutes);
  v1.use('/subjects', subjectsRoutes);
  v1.use('/notes', notesRoutes);
  v1.use('/audio-notes', notesRoutes); // Alias for spec compatibility
  v1.use('/transcription', transcriptionRoutes);
  v1.use('/ai', aiRoutes);
  v1.use('/ai-guide', aiRoutes); // Alias for spec compatibility
  v1.use('/quizzes', quizzesRoutes);
  v1.use('/analytics', analyticsRoutes);
  v1.use('/progress', progressRoutes);
  v1.use('/reminders', remindersRoutes);
  v1.use('/recommendations', recommendationsRoutes);
  v1.use('/learning-path', learningPathRoutes);
  v1.use('/languages', languagesRoutes);
  v1.use('/shares', sharesRoutes);
  v1.use('/webhooks', webhooksRoutes);
  v1.use('/doubt-chat', doubtChatRouter);

  // ── Employee Meeting Portal ──────────────────────────────────────────────
  v1.use('/meetings', meetingsRoutes);
  v1.use('/tasks', tasksRoutes);
  v1.use('/meeting-search', searchRoutes);
  v1.use('/translate', translateRoutes);

  // Direct alias for POST /api/v1/translate per spec
  v1.use('/', languagesRoutes);

  app.use(config.apiPrefix, v1);

  // Start async workers and cron jobs
  try {
    startMeetingWorker();
    startTaskReminderCron();
  } catch (err: any) {
    // Worker/cron failures (e.g. Redis not available) should not crash the app
    console.warn('[App] Could not start background services:', err.message);
  }

  // Fallback for React Router (must be before notFoundHandler)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  // Error handling for unmatched API routes
  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}

