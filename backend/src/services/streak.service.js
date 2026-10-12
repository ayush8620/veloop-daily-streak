const mongoose = require('mongoose');
const { StreakCycle, StreakClaim } = require('../models');
const AppError = require('../utils/AppError');
const clock = require('../utils/clock');
const ids = require('../utils/ids');
const rewards = require('./reward.service');
const wallet = require('./wallet.service');
const transactions = require('./transaction.service');
const audit = require('./audit.service');

const isDupKey = (err) => err && err.code === 11000;

async function createCycle(userId, cfg, nextClaimAt, session) {
  const [cycle] = await StreakCycle.create(
    [
      {
        cycleId: ids.cycleId(),
        userId,
        cycleLength: cfg.cycleLength,
        nextClaimAt,
        startedAt: clock.now(),
      },
    ],
    { session }
  );
  return cycle;
}

// Breaks the cycle if the claim window has passed. Returns true if it did.
async function checkMissedDay(cycle, now, ctx) {
  if (!cycle.expiresAt || now <= cycle.expiresAt) return false;

  const broken = await StreakCycle.findOneAndUpdate(
    { _id: cycle._id, status: 'ACTIVE' },
    { $set: { status: 'BROKEN', endedAt: now, endReason: 'MISSED', missedDay: cycle.claimedDays + 1 } },
    { new: true }
  );
  if (broken) {
    await audit.log('STREAK_RESET', {
      userId: cycle.userId,
      reason: `Day ${cycle.claimedDays + 1} missed`,
      payload: { cycleId: cycle.cycleId, claimedDays: cycle.claimedDays, expiresAt: cycle.expiresAt },
      ctx,
    });
  }
  return true;
}

// Always returns the user's current ACTIVE cycle, resetting a missed one first.
async function getActiveCycle(userId, cfg, ctx) {
  for (let i = 0; i < 3; i++) {
    const now = clock.now();
    let cycle = await StreakCycle.findOne({ userId, status: 'ACTIVE' });

    if (cycle && (await checkMissedDay(cycle, now, ctx))) cycle = null;
    if (cycle) return cycle;

    try {
      return await createCycle(userId, cfg, now);
    } catch (err) {
      if (!isDupKey(err)) throw err; // another request created it, loop and re-read
    }
  }
  throw new AppError(500, 'CYCLE_ERROR', 'Unable to load streak');
}

function calculateCurrentDay(cycle) {
  return Math.min(cycle.claimedDays + 1, cycle.cycleLength);
}

function buildCards(cycle, rewardList, claims, now) {
  const claimedByDay = new Map(claims.map((c) => [c.day, c]));
  const target = cycle.claimedDays + 1;
  const unlocked = now >= cycle.nextClaimAt;

  return rewardList.map((r) => {
    const card = { day: r.day, reward: rewards.toPublicReward(r), isToday: false, claimable: false };
    if (r.day <= cycle.claimedDays) {
      const c = claimedByDay.get(r.day);
      return { ...card, status: 'CLAIMED', claimedAt: c ? c.claimedAt : null };
    }
    if (r.day === target) {
      if (unlocked) return { ...card, status: 'TODAY', isToday: true, claimable: true, expiresAt: cycle.expiresAt };
      return { ...card, status: 'LOCKED', isNext: true, nextClaimAt: cycle.nextClaimAt };
    }
    return { ...card, status: 'LOCKED' };
  });
}

// Info about a reset in the last 48h so the UI can show the reset state.
async function getRecentReset(userId, cfg, now) {
  const since = new Date(now.getTime() - 2 * cfg.claimIntervalMs);
  const last = await StreakCycle.findOne({ userId, status: 'BROKEN', endedAt: { $gte: since } })
    .sort({ endedAt: -1 })
    .lean();
  if (!last) return null;

  const days = [];
  for (let d = 1; d <= last.cycleLength; d++) {
    if (d <= last.claimedDays) days.push({ day: d, status: 'CLAIMED' });
    else if (d === last.missedDay) days.push({ day: d, status: 'MISSED' });
  }
  return { cycleId: last.cycleId, missedDay: last.missedDay, previousStreak: last.claimedDays, resetAt: last.endedAt, days };
}

async function getStreakStatus(userId, ctx) {
  const cfg = await rewards.getConfig();
  const cycle = await getActiveCycle(userId, cfg, ctx);
  const now = clock.now();

  const [rewardList, claims, userWallet, lastReset] = await Promise.all([
    rewards.getActiveRewards(),
    StreakClaim.find({ userId, cycleId: cycle.cycleId }).lean(),
    wallet.getOrCreateWallet(userId),
    getRecentReset(userId, cfg, now),
  ]);

  const currentDay = calculateCurrentDay(cycle);
  const cards = buildCards(cycle, rewardList, claims, now);
  const next = rewardList.find((r) => r.day === currentDay);
  const ultimate = rewardList.find((r) => r.isUltimate) || rewardList[rewardList.length - 1];
  const canClaim = now >= cycle.nextClaimAt && cycle.claimedDays < cycle.cycleLength;

  return {
    serverTime: now,
    streak: {
      cycleId: cycle.cycleId,
      status: cycle.status,
      currentStreak: cycle.claimedDays,
      currentDay,
      checkedIn: cycle.claimedDays,
      totalRewards: rewardList.length,
      canClaim,
      lastClaimedAt: cycle.lastClaimedAt,
      nextClaimAt: cycle.nextClaimAt,
      expiresAt: cycle.expiresAt,
      claimIntervalMs: cfg.claimIntervalMs,
    },
    nextReward: rewards.toPublicReward(next),
    ultimateReward: rewards.toPublicReward(ultimate),
    rewards: cards,
    wallet: wallet.toPublicWallet(userWallet),
    lastReset,
  };
}

const IGNORED_FIELDS = ['reward', 'amount', 'currency', 'streak', 'userId', 'rewardType', 'status', 'nextClaimAt'];

async function reject(userId, event, code, status, message, ctx, extra = {}) {
  await audit.log(event, { userId, reason: code, payload: extra, ctx });
  throw new AppError(status, code, message, extra);
}

async function claimReward(userId, body = {}, { idempotencyKey, ctx } = {}) {
  await audit.log('STREAK_CLAIM_REQUEST', { userId, payload: { body, idempotencyKey }, ctx });

  const tampered = IGNORED_FIELDS.filter((f) => body[f] !== undefined);
  if (tampered.length) {
    // these are ignored, just logged
    await audit.log('TAMPER_ATTEMPT', { userId, reason: `Ignored fields: ${tampered.join(', ')}`, payload: body, ctx });
  }

  if (idempotencyKey) {
    const existing = await StreakClaim.findOne({ userId, idempotencyKey }).lean();
    if (existing) {
      await audit.log('DUPLICATE_CLAIM', { userId, reason: 'IDEMPOTENT_REPLAY', payload: { claimId: existing.claimId }, ctx });
      return { claim: existing, idempotent: true };
    }
  }

  const cfg = await rewards.getConfig();
  const cycle = await getActiveCycle(userId, cfg, ctx);
  const now = clock.now();
  const day = cycle.claimedDays + 1;

  if (now < cycle.nextClaimAt) {
    if (cycle.claimedDays > 0) {
      await reject(userId, 'DUPLICATE_CLAIM', 'ALREADY_CLAIMED', 409, "You've already claimed today's reward.", ctx, {
        nextClaimAt: cycle.nextClaimAt,
      });
    }
    await reject(userId, 'STREAK_CLAIM_REJECTED', 'LOCKED', 423, 'Your next reward is not available yet.', ctx, {
      nextClaimAt: cycle.nextClaimAt,
    });
  }

  if (body.day !== undefined && Number(body.day) !== day) {
    await reject(userId, 'INVALID_CLAIM', 'INVALID_DAY', 400, `Day ${body.day} is not your current reward day.`, ctx, {
      requestedDay: body.day,
      currentDay: day,
    });
  }

  if (day > 1) {
    const prev = await StreakClaim.exists({ userId, cycleId: cycle.cycleId, day: day - 1 });
    if (!prev) await reject(userId, 'INVALID_CLAIM', 'PREVIOUS_DAY_MISSING', 409, 'Previous day was not claimed.', ctx);
  }

  const reward = await rewards.getRewardForDay(day);
  if (!reward) await reject(userId, 'INVALID_CLAIM', 'REWARD_NOT_FOUND', 404, 'No reward configured for this day.', ctx);

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const completes = day >= cycle.cycleLength;
      const nextClaimAt = new Date(now.getTime() + cfg.claimIntervalMs);
      const update = completes
        ? { status: 'COMPLETED', endedAt: now, endReason: 'COMPLETED' }
        : { expiresAt: new Date(nextClaimAt.getTime() + cfg.graceWindowMs) };

      // the filter is the real lock: only one request can move claimedDays from day-1 to day
      const updated = await StreakCycle.findOneAndUpdate(
        { _id: cycle._id, status: 'ACTIVE', claimedDays: day - 1, nextClaimAt: { $lte: now } },
        { $set: { claimedDays: day, lastClaimedAt: now, nextClaimAt, ...update } },
        { new: true, session }
      );
      if (!updated) throw new AppError(409, 'ALREADY_CLAIMED', "You've already claimed today's reward.");

      const referenceId = ids.streakRef();
      const balance = await wallet.credit(userId, reward.currency, reward.amount, session);
      const txn = await transactions.recordStreakCredit(
        { userId, reward, cycleId: cycle.cycleId, referenceId, ...balance },
        session
      );

      const [claim] = await StreakClaim.create(
        [
          {
            claimId: ids.claimId(),
            userId,
            cycleId: cycle.cycleId,
            day,
            rewardId: reward._id,
            reward: { rewardType: reward.rewardType, currency: reward.currency, amount: reward.amount, title: reward.title },
            claimedAt: now,
            transactionId: txn.transactionId,
            referenceId,
            idempotencyKey: idempotencyKey || undefined,
          },
        ],
        { session }
      );

      if (completes) await createCycle(userId, cfg, nextClaimAt, session);

      result = { claim: claim.toObject(), transaction: txn.toObject(), completed: completes };
    });
  } catch (err) {
    if (isDupKey(err) || (err instanceof AppError && err.code === 'ALREADY_CLAIMED')) {
      await audit.log('DUPLICATE_CLAIM', { userId, reason: 'CONCURRENT_OR_REPEAT', payload: { day }, ctx });
      throw new AppError(409, 'ALREADY_CLAIMED', "You've already claimed today's reward.");
    }
    throw err;
  } finally {
    await session.endSession();
  }

  await audit.log('STREAK_CLAIM_SUCCESS', {
    userId,
    payload: { day, cycleId: cycle.cycleId, transactionId: result.transaction.transactionId, amount: reward.amount, currency: reward.currency },
    ctx,
  });
  if (result.completed) await audit.log('STREAK_CYCLE_COMPLETED', { userId, payload: { cycleId: cycle.cycleId }, ctx });

  return { ...result, idempotent: false };
}

async function getHistory(userId, { page = 1, limit = 20 } = {}) {
  const q = { userId };
  const [items, total] = await Promise.all([
    StreakClaim.find(q).sort({ claimedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    StreakClaim.countDocuments(q),
  ]);
  return { items, total, page, limit };
}

module.exports = { getStreakStatus, claimReward, getHistory, getActiveCycle, calculateCurrentDay, checkMissedDay };
