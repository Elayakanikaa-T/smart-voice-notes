import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Smart Voice Note Application API',
    version: '1.0.0',
    description:
      'Production-grade REST API for Smart Voice Note Application — an AI-powered study companion that turns spoken lecture notes into organized knowledge, summaries, flashcards, and quizzes.',
    contact: {
      name: 'Smart Voice Note Engineering Team',
      email: 'support@smartnotes.ai',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base URL',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      SignupRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@smartnotes.ai' },
          password: { type: 'string', minLength: 8, example: 'Password123!' },
          name: { type: 'string', example: 'Alex Rivera' },
          themePref: { type: 'string', enum: ['light', 'dark', 'system'], default: 'dark' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@smartnotes.ai' },
          password: { type: 'string', example: 'Password123!' },
        },
      },
      InitNoteUploadRequest: {
        type: 'object',
        required: ['subjectId', 'title'],
        properties: {
          subjectId: { type: 'string', format: 'uuid' },
          folderId: { type: 'string', format: 'uuid', nullable: true },
          title: { type: 'string', example: 'Graph Algorithms & Dijkstra' },
          durationSeconds: { type: 'integer', example: 420 },
        },
      },
      SubmitQuizAttemptRequest: {
        type: 'object',
        required: ['answers'],
        properties: {
          timeSpentSeconds: { type: 'integer', example: 120 },
          answers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                selectedIndex: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } },
        },
        responses: { 201: { description: 'User registered successfully' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: { 200: { description: 'Login successful with JWT tokens' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Exchange refresh token for a new pair of access & refresh tokens',
        responses: { 200: { description: 'Refreshed token pair' } },
      },
    },
    '/subjects': {
      get: {
        tags: ['Subjects & Folders'],
        security: [{ BearerAuth: [] }],
        summary: 'List user subjects with note count & readiness scores',
        responses: { 200: { description: 'List of subjects' } },
      },
      post: {
        tags: ['Subjects & Folders'],
        security: [{ BearerAuth: [] }],
        summary: 'Create a new subject',
        responses: { 201: { description: 'Subject created' } },
      },
    },
    '/notes': {
      get: {
        tags: ['Notes & Audio'],
        security: [{ BearerAuth: [] }],
        summary: 'List notes with filters and pagination',
        responses: { 200: { description: 'List of notes' } },
      },
      post: {
        tags: ['Notes & Audio'],
        security: [{ BearerAuth: [] }],
        summary: 'Initialize note creation and get presigned S3 upload URL',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InitNoteUploadRequest' } } },
        },
        responses: { 201: { description: 'Presigned upload URL generated' } },
      },
    },
    '/notes/{id}/complete': {
      post: {
        tags: ['Notes & Audio'],
        security: [{ BearerAuth: [] }],
        summary: 'Mark audio upload complete and trigger async STT & AI worker',
        responses: { 200: { description: 'Upload completed and queued for transcription' } },
      },
    },
    '/notes/search': {
      get: {
        tags: ['Notes & Audio'],
        security: [{ BearerAuth: [] }],
        summary: 'Full-text search across titles, transcripts, and AI summaries',
        responses: { 200: { description: 'Search results' } },
      },
    },
    '/notes/sync': {
      post: {
        tags: ['Notes & Audio'],
        security: [{ BearerAuth: [] }],
        summary: 'Offline batch sync with last-write-wins conflict resolution',
        responses: { 200: { description: 'Sync completed' } },
      },
    },
    '/transcription/{noteId}': {
      get: {
        tags: ['Transcription & STT'],
        security: [{ BearerAuth: [] }],
        summary: 'Get segment-level transcript for a note',
        responses: { 200: { description: 'Transcript data' } },
      },
    },
    '/ai/{noteId}/summary': {
      get: {
        tags: ['AI Knowledge Services'],
        security: [{ BearerAuth: [] }],
        summary: 'Get structured summary, key takeaways, and keywords',
        responses: { 200: { description: 'Summary data' } },
      },
    },
    '/ai/{noteId}/flashcards': {
      get: {
        tags: ['AI Knowledge Services'],
        security: [{ BearerAuth: [] }],
        summary: 'Get auto-generated flashcards for note',
        responses: { 200: { description: 'Flashcards array' } },
      },
    },
    '/quizzes': {
      get: {
        tags: ['Quizzes & Mastery'],
        security: [{ BearerAuth: [] }],
        summary: 'List quizzes for subject or note',
        responses: { 200: { description: 'Quizzes list' } },
      },
    },
    '/quizzes/{id}/attempt': {
      post: {
        tags: ['Quizzes & Mastery'],
        security: [{ BearerAuth: [] }],
        summary: 'Submit answers for quiz and calculate mastery score',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitQuizAttemptRequest' } } },
        },
        responses: { 200: { description: 'Attempt evaluated with feedback and weak areas updated' } },
      },
    },
    '/analytics/overview': {
      get: {
        tags: ['Analytics & Exam Readiness'],
        security: [{ BearerAuth: [] }],
        summary: 'Get comprehensive student readiness overview and streak',
        responses: { 200: { description: 'Readiness analytics' } },
      },
    },
    '/reminders': {
      get: {
        tags: ['Reminders & Calendar Sync'],
        security: [{ BearerAuth: [] }],
        summary: 'Get list of exam reminders',
        responses: { 200: { description: 'Reminders list' } },
      },
    },
  },
};

export const swaggerRouter = Router();
swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(openApiSpec));
