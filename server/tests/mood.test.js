const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await require('../src/config/db')();
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('create and list mood entries (protected)', async () => {
  const user = { name: 'MoodTester', email: 'mood@test.com', password: 'pass1234' };
  const reg = await request(app).post('/api/auth/register').send(user);
  expect(reg.statusCode).toBe(201);
  const token = reg.body.token;

  const createRes = await request(app)
    .post('/api/mood')
    .set('Authorization', `Bearer ${token}`)
    .send({
      text: 'Feeling hopeful today',
      moodScore: 8,
      stressScore: 3,
      sleepHours: 7
    });

  expect(createRes.statusCode).toBe(201);
  expect(createRes.body.success).toBe(true);
  expect(createRes.body.text).toBe('Feeling hopeful today');

  const list = await request(app).get('/api/mood').set('Authorization', `Bearer ${token}`);
  expect(list.statusCode).toBe(200);
  expect(Array.isArray(list.body.data)).toBe(true);
  expect(list.body.data.length).toBe(1);
  expect(list.body.data[0].text).toBe('Feeling hopeful today');

  const dailyLog = await request(app)
    .post('/api/mood/log')
    .set('Authorization', `Bearer ${token}`)
    .send({ mood: 8, stress: 3, sleep: 7, date: '2030-01-01' });

  expect(dailyLog.statusCode).toBe(201);
  expect(dailyLog.body.success).toBe(true);

  const analytics = await request(app).get('/api/user/analytics').set('Authorization', `Bearer ${token}`);
  expect(analytics.statusCode).toBe(200);
  expect(analytics.body.success).toBe(true);
  expect(analytics.body.totalEntries).toBeGreaterThanOrEqual(2);
  expect(Array.isArray(analytics.body.charts.moodTrend)).toBe(true);
  const initialCount = analytics.body.totalEntries;

  const updatedLog = await request(app)
    .post('/api/mood/log')
    .set('Authorization', `Bearer ${token}`)
    .send({ mood: 9, stress: 2, sleep: 8, date: '2030-01-02' });

  expect(updatedLog.statusCode).toBe(201);

  const refreshedAnalytics = await request(app).get('/api/user/analytics').set('Authorization', `Bearer ${token}`);
  expect(refreshedAnalytics.statusCode).toBe(200);
  expect(refreshedAnalytics.body.totalEntries).toBe(initialCount + 1);
});