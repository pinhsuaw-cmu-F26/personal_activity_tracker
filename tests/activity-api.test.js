const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../backend/server');
const database = require('../backend/db');

test.beforeEach(() => database.prepare('DELETE FROM activities').run());

test('creates and lists activities in newest-first order', async () => {
  const older = { type: 'Running', duration: 30, distance: 3, calories: 300, averageHeartRate: 150, timestamp: '2026-09-01T08:00:00Z' };
  const newer = { type: 'Pickleball', duration: 45, calories: 350, averageHeartRate: 140, timestamp: '2026-09-09T08:00:00Z' };
  await request(app).post('/activities').send(older).expect(201);
  const response = await request(app).post('/activities').send(newer).expect(201);
  assert.equal(response.body.type, 'Pickleball');
  const list = await request(app).get('/activities').expect(200);
  assert.equal(list.body.length, 2);
  assert.equal(list.body[0].type, 'Pickleball');
  assert.equal(list.body[1].type, 'Running');
});

test('rejects activities missing distance', async () => {
  await request(app).post('/activities').send({ type: 'Walking', duration: 20, calories: 100, averageHeartRate: 120, timestamp: '2026-09-09T08:00:00Z' }).expect(400);
});

test('supports date range and deletion', async () => {
  const response = await request(app).post('/activities').send({ type: 'Swimming', duration: 25, distance: 1, calories: 200, averageHeartRate: 130, timestamp: '2026-09-05T08:00:00Z' }).expect(201);
  await request(app).get('/activities/2026-09-01/2026-09-04').expect(200).expect(({ body }) => assert.equal(body.length, 0));
  await request(app).delete(`/activities/${response.body.id}`).expect(204);
  await request(app).get('/activities').expect(200).expect(({ body }) => assert.equal(body.length, 0));
});
