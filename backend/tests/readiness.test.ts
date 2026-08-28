import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Quizzes, Mastery Engine & Readiness Scoring', () => {
  const app = createApp();
  let accessToken = '';
  let subjectId = '';
  let noteId = '';

  beforeAll(async () => {
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
      const attemptRes = await request(app)
        .post(`/api/v1/quizzes/${quizId}/attempt`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          timeSpentSeconds: 95,
          answers: [
            { questionId: 'q-1', selectedIndex: 1 },
            { questionId: 'q-2', selectedIndex: 0 },
            { questionId: 'q-3', selectedIndex: 1 },
          ],
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
});
