const request = require('supertest');
const { start, stop } = require('./setup');

process.env.RATE_LIMIT_CLAIM_PER_MIN = '3';

let app;
beforeAll(async () => {
  await start();
  app = require('../src/app');
});
afterAll(stop);

test('claim endpoint is rate limited per user', async () => {
  const reg = await request(app).post('/api/auth/register').send({ name: 'Spam', email: 'spam@test.dev', password: 'Password123' });
  const codes = [];
  for (let i = 0; i < 5; i++) {
    const r = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${reg.body.token}`).send({});
    codes.push(r.status);
  }
  expect(codes.slice(0, 3)).toEqual([201, 409, 409]);
  expect(codes.slice(3)).toEqual([429, 429]);
});
