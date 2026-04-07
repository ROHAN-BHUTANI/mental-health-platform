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

test('analytics returns empty payload for new user', async () => {
  const user = { name: 'EdgeUser', email: 'edge@test.com', password: 'pass1234' };
  const reg = await request(app).post('/api/auth/register').send(user);
  const token = reg.body.token;

  const analytics = await request(app)
    .get('/api/user/analytics')
    .set('Authorization', `Bearer ${token}`);

  expect(analytics.statusCode).toBe(200);
  expect(analytics.body.success).toBe(true);
  expect(analytics.body.totalEntries).toBe(0);
  expect(analytics.body.status).toBe('Stable');
  expect(Array.isArray(analytics.body.charts.moodTrend)).toBe(true);
  expect(analytics.body.charts.moodTrend.length).toBe(0);
});
