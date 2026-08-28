import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectMongo, disconnectDatabases } from '../src/config/database.js';

describe('Employee Meeting Portal Endpoints', () => {
  const app = createApp();
  const testEmail = `employee_${Date.now()}@company.com`;
  const testPassword = 'Password123!';
  let employeeToken = '';
  let meetingId = '';
  let decisionId = '';
  let actionItemId = '';

  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  it('POST /api/v1/auth/signup - registers an employee', async () => {
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Jordan Employee',
        themePref: 'dark',
      });

    if (signupRes.status !== 201) {
      console.log('SIGNUP ERROR BODY:', JSON.stringify(signupRes.body));
    }

    expect(signupRes.status).toBe(201);
    expect(signupRes.body.success).toBe(true);
    employeeToken = signupRes.body.data?.tokens?.accessToken || signupRes.body.data?.accessToken;
    expect(employeeToken).toBeDefined();
  });

  it('POST /api/v1/meetings - creates a new meeting workspace', async () => {
    const res = await request(app)
      .post('/api/v1/meetings')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'Q3 Product Strategy Alignment',
        participants: [
          { name: 'Sarah PM', email: 'sarah@company.com' },
          { name: 'Jordan Employee', email: testEmail },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    expect(res.body.data.title).toBe('Q3 Product Strategy Alignment');
    meetingId = res.body.data._id;
  });

  it('GET /api/v1/meetings - lists meetings accessible to user', async () => {
    const res = await request(app)
      .get('/api/v1/meetings')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.meetings)).toBe(true);
    expect(res.body.data.meetings.some((m: any) => m._id === meetingId)).toBe(true);
  });

  it('GET /api/v1/meetings/:id - retrieves meeting detail and sub-collections', async () => {
    const res = await request(app)
      .get(`/api/v1/meetings/${meetingId}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.meeting.title).toBe('Q3 Product Strategy Alignment');
    expect(Array.isArray(res.body.data.decisions)).toBe(true);
    expect(Array.isArray(res.body.data.actionItems)).toBe(true);
  });

  it('POST /api/v1/meetings/:id/decisions - adds a new decision', async () => {
    const res = await request(app)
      .post(`/api/v1/meetings/${meetingId}/decisions`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ text: 'Increase marketing budget by 15% for Q3' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('Increase marketing budget by 15% for Q3');
    decisionId = res.body.data._id;
  });

  it('PATCH /api/v1/meetings/:id/decisions/:decisionId - updates an existing decision', async () => {
    const res = await request(app)
      .patch(`/api/v1/meetings/${meetingId}/decisions/${decisionId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ text: 'Increase marketing budget by 20% for Q3' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('Increase marketing budget by 20% for Q3');
  });

  it('POST /api/v1/meetings/:id/action-items - adds a new action item', async () => {
    const res = await request(app)
      .post(`/api/v1/meetings/${meetingId}/action-items`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        task: 'Update financial spreadsheets by Friday',
        owner: { name: 'Jordan Employee', email: testEmail },
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task).toBe('Update financial spreadsheets by Friday');
    expect(res.body.data.status).toBe('open');
    actionItemId = res.body.data._id;
  });

  it('PATCH /api/v1/meetings/:id/action-items/:itemId - updates status to in_progress / done', async () => {
    const res = await request(app)
      .patch(`/api/v1/meetings/${meetingId}/action-items/${actionItemId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('done');
  });

  it('GET /api/v1/tasks/my-action-items - lists cross-meeting tasks for logged-in employee', async () => {
    const res = await request(app)
      .get('/api/v1/tasks/my-action-items')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((item: any) => item._id === actionItemId)).toBe(true);
  });

  it('GET /api/v1/meeting-search - searches meetings by title or keyword', async () => {
    const res = await request(app)
      .get('/api/v1/meeting-search')
      .query({ title: 'Product Strategy' })
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.meetings)).toBe(true);
    expect(res.body.data.meetings.some((m: any) => m._id === meetingId)).toBe(true);
  });
});
