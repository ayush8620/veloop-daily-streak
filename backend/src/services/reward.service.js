const { StreakReward, StreakConfig } = require('../models');
const AppError = require('../utils/AppError');

async function getConfig() {
  const cfg = await StreakConfig.findOne({ key: 'DAILY_STREAK', active: true }).lean();
  if (!cfg) throw new AppError(503, 'CONFIG_MISSING', 'Daily streak is not configured. Run the seed script.');
  return cfg;
}

async function getActiveRewards() {
  return StreakReward.find({ active: true }).sort({ day: 1 }).lean();
}

async function getRewardForDay(day, session) {
  return StreakReward.findOne({ day, active: true }).session(session || null).lean();
}

const toPublicReward = (r) =>
  r && {
    id: r._id,
    day: r.day,
    rewardType: r.rewardType,
    currency: r.currency,
    amount: r.amount,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    assetType: r.assetType,
    badge: r.badge,
    isUltimate: !!r.isUltimate,
    metadata: r.metadata || {},
  };

module.exports = { getConfig, getActiveRewards, getRewardForDay, toPublicReward };
