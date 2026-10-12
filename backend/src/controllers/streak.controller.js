const streak = require('../services/streak.service');
const clock = require('../utils/clock');

exports.getStreak = async (req, res) => {
  const data = await streak.getStreakStatus(req.user._id, req.ctx);
  res.json({ success: true, ...data });
};

// lighter payload used by the countdown when it hits zero
exports.getStatus = async (req, res) => {
  const data = await streak.getStreakStatus(req.user._id, req.ctx);
  const target = data.rewards.find((r) => r.day === data.streak.currentDay);
  res.json({ success: true, serverTime: data.serverTime, streak: data.streak, today: target, wallet: data.wallet });
};

exports.claim = async (req, res) => {
  const result = await streak.claimReward(req.user._id, req.body || {}, {
    idempotencyKey: req.get('idempotency-key'),
    ctx: req.ctx,
  });
  const state = await streak.getStreakStatus(req.user._id, req.ctx);
  res.status(result.idempotent ? 200 : 201).json({
    success: true,
    idempotent: result.idempotent,
    claim: result.claim,
    transaction: result.transaction || null,
    serverTime: clock.now(),
    state,
  });
};

exports.history = async (req, res) => {
  const data = await streak.getHistory(req.user._id, { page: req.query.page || 1, limit: req.query.limit || 20 });
  res.json({ success: true, ...data });
};
