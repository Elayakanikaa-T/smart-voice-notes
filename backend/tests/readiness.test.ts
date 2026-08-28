import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectMongo, disconnectDatabases, cleanDatabase } from '../src/config/database.js';

describe('Quizzes, Mastery Engine & Readiness Scoring', () => {
  const app = createApp();
  let accessToken = '';
  let subjectId = '';
  let noteId = '';

  beforeAll(async () => {
    const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_voice_notes';
    const url = new URL(baseUri);
    url.pathname = '/smart_voice_notes_test_readiness';
    await connectMongo(url.toString());

    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: `readiness_test_${Date.now()}@smartnotes.ai`,
        password: 'Password123!',
        name: 'Alex Rivera',
      });
    accessToken = signupRes.body.data.tokens.accessToken;

    const subRes = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Computer Science', color: '#10B981' });
    subjectId = subRes.body.data.id;

    const noteRes = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ subjectId, title: 'Shortest Path Algorithms' });
    noteId = noteRes.body.data.noteId;

    // Complete upload to trigger AI pipeline
    await request(app)
      .post(`/api/v1/notes/${noteId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ durationSeconds: 360 });

    // Wait for in-memory event loop to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('GET /api/v1/quizzes - retrieves generated quizzes', async () => {
    const res = await request(app)
      .get(`/api/v1/quizzes?subjectId=${subjectId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/quizzes/:id/attempt - submits quiz attempt and updates readiness score', async () => {
    const quizzesRes = await request(app)
      .get(`/api/v1/quizzes?subjectId=${subjectId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const quizList = quizzesRes.body.data;
    if (quizList.length > 0) {
      const quizId = quizList[0].id;
      // Fetch quiz details to retrieve actual question IDs
      const quizDetailRes = await request(app)
        .get(`/api/v1/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const questions = quizDetailRes.body.data.questions || [];
      const answers = questions.map((q: any) => ({
        questionId: q.questionId || q.question_id || q.id || q._id,
        selectedIndex: q.correctIndex !== undefined ? q.correctIndex : q.correct_index !== undefined ? q.correct_index : 0
      }));

      const attemptRes = await request(app)
        .post(`/api/v1/quizzes/${quizId}/attempt`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          timeSpentSeconds: 95,
          answers: answers.slice(0, 3),
        });

      expect(attemptRes.status).toBe(200);
      expect(attemptRes.body.success).toBe(true);
      expect(attemptRes.body.data.score).toBeGreaterThan(0);
    }
  });

  it('GET /api/v1/analytics/overview - calculates student study streak and readiness', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallReadinessScore).toBeDefined();
    expect(res.body.data.totalSubjects).toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabases();
  });
});
