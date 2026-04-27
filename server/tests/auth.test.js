const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  // connect DB
  await require('../src/config/db')();
  app = require('../src/app');
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

test('GET /api/health', async () => {
  const res = await request(app).get('/api/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('register / login / profile flow', async () => {
  const user = { name: 'Tester', email: 'test@example.com', password: 'pass1234' };
  const reg = await request(app).post('/api/auth/register').send(user);
  expect(reg.statusCode).toBe(201);
  expect(reg.body.success).toBe(true);
  expect(reg.body.token).toBeDefined();

  const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
  expect(login.statusCode).toBe(200);
  expect(login.body.success).toBe(true);
  expect(login.body.token).toBeDefined();

  const profile = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${login.body.token}`);
  expect(profile.statusCode).toBe(200);
  expect(profile.body.success).toBe(true);
  expect(profile.body.user.email).toBe(user.email);
});

test('refresh token rotates and invalidates old refresh token', async () => {
  const user = { name: 'Refresh Tester', email: 'refresh@example.com', password: 'pass1234' };

  const reg = await request(app).post('/api/auth/register').send(user);
  expect(reg.statusCode).toBe(201);
  expect(reg.body.refreshToken).toBeDefined();

  const firstRefresh = reg.body.refreshToken;
  const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken: firstRefresh });
  expect(refreshRes.statusCode).toBe(200);
  expect(refreshRes.body.token).toBeDefined();
  expect(refreshRes.body.refreshToken).toBeDefined();

  const replayRes = await request(app).post('/api/auth/refresh').send({ refreshToken: firstRefresh });
  expect(replayRes.statusCode).toBe(401);
});

test('logout invalidates current refresh token', async () => {
  const user = { name: 'Logout Tester', email: 'logout@example.com', password: 'pass1234' };

  const reg = await request(app).post('/api/auth/register').send(user);
  expect(reg.statusCode).toBe(201);
  expect(reg.body.refreshToken).toBeDefined();

  const refreshBeforeLogout = reg.body.refreshToken;

  const logoutRes = await request(app).post('/api/auth/logout').send({ refreshToken: refreshBeforeLogout });
  expect(logoutRes.statusCode).toBe(200);

  const refreshAfterLogout = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: refreshBeforeLogout });

  expect(refreshAfterLogout.statusCode).toBe(401);
});
