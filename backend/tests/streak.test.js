const request = require('supertest');
const { start, stop, clearUserData } = require('./setup');

let app, models, clock;
const HOUR = 60 * 60 * 1000;

beforeAll(async () => {
  await start();
  app = require('../src/app');
  models = require('../src/models');
  clock = require('../src/utils/clock');
});
afterAll(stop);
beforeEach(clearUserData);

let n = 0;
async function newUser() {
  n += 1;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: `User ${n}`, email: `user${n}@test.dev`, password: 'Password123' });
  expect(res.status).toBe(201);
  return { token: res.body.token, id: res.body.user.id };
}

const get = (token, path = '/api/daily-streak') => request(app).get(path).set('Authorization', `Bearer ${token}`);
const claim = (token, body = {}, key) => {
  const r = request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`);
  if (key) r.set('Idempotency-Key', key);
  return r.send(body);
};
const travel = (hours) => clock.setOffset(clock.getOffset() + hours * HOUR);

describe('new accounts', () => {
  test('a fresh user starts empty: 0 balance, no streak, no history', async () => {
    const { token } = await newUser();
    const res = await get(token);
    expect(res.body.wallet).toEqual({ ves: 0, giftCardINR: 0 });
    expect(res.body.streak.currentStreak).toBe(0);
    expect(res.body.streak.checkedIn).toBe(0);
    expect(res.body.rewards.map((r) => r.status)).toEqual(['TODAY', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED']);
    expect((await get(token, '/api/daily-streak/history')).body.total).toBe(0);
    expect((await get(token, '/api/wallet/transactions')).body.total).toBe(0);
  });

  test('seeded demo user gets no free balance', async () => {
    const { seedDemoUser } = require('../seed/seed');
    process.env.SEED_DEMO_EMAIL = 'seeded@test.dev';
    process.env.SEED_DEMO_PASSWORD = 'Password123';
    await seedDemoUser();
    delete process.env.SEED_DEMO_EMAIL;
    delete process.env.SEED_DEMO_PASSWORD;
    const login = await request(app).post('/api/auth/login').send({ email: 'seeded@test.dev', password: 'Password123' });
    expect((await get(login.body.token)).body.wallet.ves).toBe(0);
  });
});

describe('auth', () => {
  test('streak APIs need a token', async () => {
    expect((await request(app).get('/api/daily-streak')).status).toBe(401);
    expect((await request(app).post('/api/daily-streak/claim')).status).toBe(401);
    const bad = await request(app).get('/api/daily-streak').set('Authorization', 'Bearer nope');
    expect(bad.status).toBe(401);
    expect(bad.body.error.message).toBe('Please log in to continue.');
  });

  test('login works and wrong password fails', async () => {
    await newUser();
    const ok = await request(app).post('/api/auth/login').send({ email: `user${n}@test.dev`, password: 'Password123' });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();
    const bad = await request(app).post('/api/auth/login').send({ email: `user${n}@test.dev`, password: 'wrongpass1' });
    expect(bad.status).toBe(401);
  });
});

describe('daily streak state', () => {
  test('new user sees day 1 claimable, rest locked, rewards from db', async () => {
    const { token } = await newUser();
    const res = await get(token);
    expect(res.status).toBe(200);
    expect(res.body.serverTime).toBeTruthy();
    expect(res.body.streak).toMatchObject({ currentStreak: 0, currentDay: 1, checkedIn: 0, totalRewards: 7, canClaim: true });
    expect(res.body.rewards).toHaveLength(7);
    expect(res.body.rewards[0]).toMatchObject({ status: 'TODAY', claimable: true });
    expect(res.body.rewards.slice(1).every((r) => r.status === 'LOCKED')).toBe(true);
    expect(res.body.rewards.map((r) => [r.reward.amount, r.reward.currency])).toEqual([
      [5, 'VES'], [10, 'VES'], [15, 'VES'], [1, 'INR'], [2, 'INR'], [30, 'VES'], [5, 'INR'],
    ]);
    expect(res.body.ultimateReward).toMatchObject({ day: 7, amount: 5, currency: 'INR', assetType: 'crown' });
    expect(res.body.nextReward).toMatchObject({ day: 1, amount: 5 });
  });

  test('reward config change shows up without code change', async () => {
    await models.StreakReward.updateOne({ day: 2 }, { amount: 15 });
    const { token } = await newUser();
    const res = await get(token);
    expect(res.body.rewards[1].reward.amount).toBe(15);
    await models.StreakReward.updateOne({ day: 2 }, { amount: 10 });
  });
});

describe('claiming', () => {
  test('day 1 claim credits wallet, records txn + claim, locks day 2 with nextClaimAt', async () => {
    const { token, id } = await newUser();
    const res = await claim(token);
    expect(res.status).toBe(201);
    expect(res.body.transaction).toMatchObject({ amount: 5, currency: 'VES', source: 'DAILY_STREAK', streakDay: 1, balanceBefore: 0, balanceAfter: 5 });
    expect(res.body.transaction.referenceId).toMatch(/^STREAK-[0-9A-F]{8}$/);

    const s = res.body.state;
    expect(s.streak).toMatchObject({ currentStreak: 1, checkedIn: 1, currentDay: 2, canClaim: false });
    expect(s.rewards[0].status).toBe('CLAIMED');
    expect(s.rewards[1]).toMatchObject({ status: 'LOCKED', isNext: true });
    expect(new Date(s.streak.nextClaimAt) - new Date(s.streak.lastClaimedAt)).toBe(24 * HOUR);
    expect(s.wallet.ves).toBe(5);

    const claimDoc = await models.StreakClaim.findOne({ userId: id, day: 1 });
    const txn = await models.WalletTransaction.findOne({ transactionId: claimDoc.transactionId });
    expect(txn.referenceId).toBe(claimDoc.referenceId);
    expect(await models.AuditLog.exists({ userId: id, event: 'STREAK_CLAIM_SUCCESS' })).toBeTruthy();
  });

  test('second claim same day is rejected, no extra reward', async () => {
    const { token } = await newUser();
    expect((await claim(token)).status).toBe(201);
    const again = await claim(token);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('ALREADY_CLAIMED');
    expect((await get(token, '/api/wallet')).body.wallet.ves).toBe(5);
  });

  test('same Idempotency-Key replays the original claim', async () => {
    const { token } = await newUser();
    const a = await claim(token, {}, 'key-abcdef-123');
    const b = await claim(token, {}, 'key-abcdef-123');
    expect(a.status).toBe(201);
    expect(b.status).toBe(200);
    expect(b.body.idempotent).toBe(true);
    expect(b.body.claim.claimId).toBe(a.body.claim.claimId);
    expect((await models.WalletTransaction.countDocuments())).toBe(1);
  });

  test('concurrent claims only grant once', async () => {
    const { token, id } = await newUser();
    const results = await Promise.all(Array.from({ length: 10 }, () => claim(token)));
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 201)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(9);
    expect(await models.StreakClaim.countDocuments({ userId: id })).toBe(1);
    expect(await models.WalletTransaction.countDocuments({ userId: id })).toBe(1);
    expect((await models.Wallet.findOne({ userId: id })).vesBalance).toBe(5);
  });

  test('concurrent claims on day 2 (after unlock) also grant once', async () => {
    const { token, id } = await newUser();
    await claim(token);
    travel(25);
    const results = await Promise.all(Array.from({ length: 8 }, () => claim(token)));
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect((await models.Wallet.findOne({ userId: id })).vesBalance).toBe(15);
  });

  test('locked day cannot be claimed before nextClaimAt (client clock is irrelevant)', async () => {
    const { token } = await newUser();
    await claim(token);
    travel(23);
    const res = await claim(token);
    expect(res.status).toBe(409);
    expect(res.body.error.details.nextClaimAt).toBeTruthy();
    travel(1.01);
    expect((await claim(token)).status).toBe(201);
  });

  test('fake day, reward, streak and userId in body are ignored / rejected', async () => {
    const victim = await newUser();
    const { token, id } = await newUser();

    const jump = await claim(token, { day: 7 });
    expect(jump.status).toBe(400);
    expect(jump.body.error.code).toBe('INVALID_DAY');

    const fake = await claim(token, { day: 1, reward: 1000000, amount: 99999, currency: 'INR', streak: 7, userId: victim.id });
    expect(fake.status).toBe(201);
    expect(fake.body.transaction).toMatchObject({ amount: 5, currency: 'VES', streakDay: 1 });
    expect(String(fake.body.transaction.userId)).toBe(id);
    expect(fake.body.state.streak.currentStreak).toBe(1);

    const v = await get(victim.token);
    expect(v.body.streak.currentStreak).toBe(0);
    expect(v.body.wallet.ves).toBe(0);
    expect(await models.AuditLog.exists({ userId: id, event: 'TAMPER_ATTEMPT' })).toBeTruthy();
    expect(await models.AuditLog.exists({ userId: id, event: 'INVALID_CLAIM' })).toBeTruthy();
  });

  test('previous day must be claimed', async () => {
    const { token, id } = await newUser();
    await claim(token);
    travel(25);
    // simulate a corrupted cycle: day 1 claim record removed
    await models.StreakClaim.deleteMany({ userId: id });
    const res = await claim(token);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PREVIOUS_DAY_MISSING');
  });
});

describe('missed day + full cycle', () => {
  test('missing the window resets streak to day 1', async () => {
    const { token, id } = await newUser();
    await claim(token);
    travel(25);
    await claim(token);
    expect((await get(token)).body.streak.currentStreak).toBe(2);

    // day 3 window = 24h..48h after day 2 claim; jump past it
    travel(49);
    const res = await get(token);
    expect(res.body.streak).toMatchObject({ currentStreak: 0, currentDay: 1, canClaim: true });
    expect(res.body.rewards[0].status).toBe('TODAY');
    expect(res.body.lastReset).toMatchObject({ missedDay: 3, previousStreak: 2 });
    expect(res.body.lastReset.days.find((d) => d.day === 3).status).toBe('MISSED');
    expect(await models.StreakCycle.countDocuments({ userId: id, status: 'BROKEN' })).toBe(1);
    expect(await models.AuditLog.exists({ userId: id, event: 'STREAK_RESET' })).toBeTruthy();

    // wallet keeps earned rewards; new cycle starts at day 1 (+5)
    const c = await claim(token);
    expect(c.body.transaction).toMatchObject({ streakDay: 1, amount: 5, balanceAfter: 20 });
  });

  test('claiming late but inside the window keeps the streak', async () => {
    const { token } = await newUser();
    await claim(token);
    travel(47);
    expect((await claim(token)).status).toBe(201);
    expect((await get(token)).body.streak.currentStreak).toBe(2);
  });

  test('just not opening the app does not reset before the window ends', async () => {
    const { token } = await newUser();
    await claim(token);
    travel(30);
    expect((await get(token)).body.streak.currentStreak).toBe(1);
  });

  test('all 7 days credit the right rewards and complete the cycle', async () => {
    const { token, id } = await newUser();
    for (let d = 1; d <= 7; d++) {
      const res = await claim(token);
      expect(res.status).toBe(201);
      expect(res.body.claim.day).toBe(d);
      travel(24.1);
    }
    const w = await models.Wallet.findOne({ userId: id });
    expect(w.vesBalance).toBe(5 + 10 + 15 + 30);
    expect(w.giftCardBalanceINR).toBe(1 + 2 + 5);
    expect(await models.StreakCycle.countDocuments({ userId: id, status: 'COMPLETED' })).toBe(1);

    const res = await get(token);
    expect(res.body.streak).toMatchObject({ currentDay: 1, currentStreak: 0, canClaim: true });

    const hist = await get(token, '/api/daily-streak/history');
    expect(hist.body.total).toBe(7);
    const txns = await get(token, '/api/wallet/transactions');
    expect(txns.body.total).toBe(7);
  });

  test('day 7 claim then immediate claim is locked until next cycle unlocks', async () => {
    const { token } = await newUser();
    for (let d = 1; d <= 7; d++) {
      await claim(token);
      if (d < 7) travel(24.1);
    }
    const res = await claim(token);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_CLAIMED');
  });

  test('after day 7 the finished week is reported until the next cycle starts', async () => {
    const { token } = await newUser();
    for (let d = 1; d <= 7; d++) {
      await claim(token);
      if (d < 7) travel(24.1);
    }
    let res = await get(token);
    expect(res.body.streak).toMatchObject({ currentDay: 1, canClaim: false, checkedInToday: true });
    expect(res.body.lastCompleted).toMatchObject({ days: 7, earned: { ves: 60, giftCardINR: 8 } });
    expect(new Date(res.body.lastCompleted.nextCycleAt).getTime()).toBe(new Date(res.body.streak.nextClaimAt).getTime());
    expect(res.body.rewards[0]).toMatchObject({ status: 'LOCKED', isNext: true });

    travel(24.1);
    res = await get(token);
    expect(res.body.streak.canClaim).toBe(true);
    expect((await claim(token)).body.claim.day).toBe(1);
    expect((await get(token)).body.lastCompleted).toBeNull();
  });

  test('day 7 pays the ₹5 gift card into the gift card balance', async () => {
    const { token } = await newUser();
    for (let d = 1; d <= 6; d++) {
      await claim(token);
      travel(24.1);
    }
    const before = await get(token);
    expect(before.body.rewards[6]).toMatchObject({ status: 'TODAY', claimable: true });
    const c = await claim(token, { day: 7 });
    expect(c.status).toBe(201);
    expect(c.body.transaction).toMatchObject({ streakDay: 7, amount: 5, currency: 'INR' });
    expect((await get(token)).body.wallet.giftCardINR).toBe(8);
  });

  test('reset note goes away once the new day 1 is claimed', async () => {
    const { token } = await newUser();
    await claim(token);
    travel(49);
    expect((await get(token)).body.lastReset).toBeTruthy();
    await claim(token);
    const res = await get(token);
    expect(res.body.lastReset).toBeNull();
    expect(res.body.streak).toMatchObject({ currentStreak: 1, checkedInToday: true });
  });
});

describe('persistence + misc', () => {
  test('state survives re-login (comes from mongo)', async () => {
    const { token } = await newUser();
    await claim(token);
    const login = await request(app).post('/api/auth/login').send({ email: `user${n}@test.dev`, password: 'Password123' });
    const res = await get(login.body.token);
    expect(res.body.rewards[0].status).toBe('CLAIMED');
    expect(res.body.rewards[1].status).toBe('LOCKED');
  });

  test('status endpoint returns serverTime and today card', async () => {
    const { token } = await newUser();
    const res = await get(token, '/api/daily-streak/status');
    expect(res.status).toBe(200);
    expect(res.body.today).toMatchObject({ day: 1, status: 'TODAY' });
    expect(res.body.serverTime).toBeTruthy();
  });

  test('errors never leak internals', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/Mongo|Cast|stack/);
  });
});
