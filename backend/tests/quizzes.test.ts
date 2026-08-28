import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Quizzes & Learning Path Endpoints', () => {
  const app = createApp();
  let accessToken = '';
  let subjectId = '';
  let quizId = '';

  beforeAll(async () => {
    // Signup a test user
    const authRes = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: `quiz_tester_${Date.now()}@smartnotes.ai`,
        password: 'Password123!',
        name: 'Quiz Tester',
      });
    accessToken = authRes.body.data.tokens.accessToken;

    // Create a subject
    const subRes = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Algorithms & Data Structures',
        description: 'CS fundamentals',
        color: '#3B82F6',
      });
    subjectId = subRes.body.data?.id || subRes.body.data?._id || 'sub-1';
  });

  it('GET /api/v1/quizzes - retrieves list of available quizzes', async () => {
    const res = await request(app)
      .get('/api/v1/quizzes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data?.quizzes || res.body.data)).toBe(true);
  });

  it('POST /api/v1/learning-path - generates a personalized study path', async () => {
    const res = await request(app)
      .post('/api/v1/learning-path')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        subject_id: subjectId,
        title: 'Exam Sprint Preparation',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ordered_steps).toBeDefined();
    expect(res.body.data.ordered_steps.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/recommendations - returns AI study recommendations', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommended_courses).toBeDefined();
  });

  it('GET /api/v1/progress - returns readiness and progress analytics', async () => {
    const res = await request(app)
      .get('/api/v1/progress')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overall).toBeDefined();
  });

  it('GET /api/v1/languages - lists all supported languages', async () => {
    const res = await request(app).get('/api/v1/languages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.languages.length).toBeGreaterThan(5);
  });
});
