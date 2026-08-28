import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectMongo } from './config/database.js';
import { initializeAIWorkers } from './services/ai/index.js';
import { logger } from './utils/logger.js';
import { remindersCron } from './modules/reminders/reminders.cron.js';
import { Server as SocketIOServer } from 'socket.io';

async function startServer() {
  logger.info('=== Starting Smart Voice Note Application Backend ===');

  await connectMongo();

  initializeAIWorkers();
  remindersCron.start();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`🚀 Backend API server listening on http://localhost:${config.port}${config.apiPrefix}`);
    logger.info(`📖 Swagger OpenAPI documentation live at http://localhost:${config.port}/api-docs`);
    logger.info(`🩺 Health check at http://localhost:${config.port}/health`);
  });

  // --- Socket.io Setup ---
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket] User connected: ${socket.id}`);

    // Join a specific meeting room
    socket.on('join-meeting', (meetingId: string, userName: string) => {
      socket.join(meetingId);
      logger.info(`[Socket] ${userName} (${socket.id}) joined meeting: ${meetingId}`);
      // Notify others in the room
      socket.to(meetingId).emit('user-joined', { socketId: socket.id, userName });
    });

    // Broadcast live transcript chunks to the room
    socket.on('live-transcript-chunk', (data: { meetingId: string, text: string, userName: string, isFinal: boolean, language: string }) => {
      // Broadcast to everyone else in the room
      socket.to(data.meetingId).emit('transcript-update', data);
    });

    // Handle translated broadcast
    socket.on('translation-update', (data: { meetingId: string, originalText: string, translatedText: string, userName: string, isFinal: boolean }) => {
      socket.to(data.meetingId).emit('translated-transcript-update', data);
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] User disconnected: ${socket.id}`);
    });
  });
  // -----------------------

  const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(err => {
  logger.error('Fatal error during backend startup:', err);
  process.exit(1);
});
