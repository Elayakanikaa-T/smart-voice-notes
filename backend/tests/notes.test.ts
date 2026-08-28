import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Notes, Subjects & Offline Sync Endpoints', () => {
  const app = createApp();
  let accessToken = '';
  let subjectId = '';
  let noteId = '';

  beforeAll(async () => {
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: `notes_test_${Date.now()}@smartnotes.ai`,
        password: 'Password123!',
        name: 'Alex Rivera',
      });
    accessToken = signupRes.body.data.tokens.accessToken;
  });

  it('POST /api/v1/subjects - creates a subject', async () => {
    const res = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Algorithms 101',
        color: '#6366F1',
        icon: 'code',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    subjectId = res.body.data.id;
  });

  it('POST /api/v1/notes - initializes note and generates upload URL', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        subjectId,
        title: 'Lecture 1: Dijkstra Algorithm',
        durationSeconds: 420,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.noteId).toBeDefined();
    expect(res.body.data.uploadUrl).toBeDefined();
    noteId = res.body.data.noteId;
  });

  it('POST /api/v1/notes/:id/complete - completes upload and queues AI', async () => {
    const res = await request(app)
      .post(`/api/v1/notes/${noteId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ durationSeconds: 420 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/notes - lists notes with subject metadata', async () => {
    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notes)).toBe(true);
  });

  it('POST /api/v1/notes/sync - batch offline sync with conflict resolution', async () => {
    const syncRes = await request(app)
      .post('/api/v1/notes/sync')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientChanges: [
          {
            id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
            subjectId,
            title: 'Offline Recorded Note on Trees',
            durationSeconds: 300,
            status: 'ready',
            syncVersion: 1,
            clientUpdatedAt: new Date().toISOString(),
          },
        ],
      });

    expect(syncRes.status).toBe(200);
    expect(syncRes.body.success).toBe(true);
    expect(syncRes.body.data.appliedChanges.length).toBe(1);
  });
});
