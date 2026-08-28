import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectMongo, disconnectDatabases } from '../src/config/database.js';

describe('Authentication & User Management Endpoints', () => {
  const app = createApp();
  const testEmail = `student_${Date.now()}@smartnotes.ai`;
  const testPassword = 'SecurePassword123!';
  let accessToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  it('POST /api/v1/auth/signup - registers a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Jordan Lee',
        themePref: 'dark',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /api/v1/auth/login - authenticates registered user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('GET /api/v1/auth/me - gets authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail.toLowerCase());
  });

  it('POST /api/v1/auth/refresh - rotates refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});
