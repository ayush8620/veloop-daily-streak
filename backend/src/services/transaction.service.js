const { WalletTransaction } = require('../models');
const ids = require('../utils/ids');

async function recordStreakCredit({ userId, reward, cycleId, referenceId, before, after }, session) {
  const [txn] = await WalletTransaction.create(
    [
      {
        transactionId: ids.transactionId(),
        userId,
        rewardType: reward.rewardType,
        currency: reward.currency,
        type: 'CREDIT',
        amount: reward.amount,
        source: 'DAILY_STREAK',
        streakDay: reward.day,
        cycleId,
        referenceId,
        balanceBefore: before,
        balanceAfter: after,
        status: 'SUCCESS',
      },
    ],
    { session }
  );
  return txn;
}

async function listForUser(userId, { page = 1, limit = 20 } = {}) {
  const q = { userId };
  const [items, total] = await Promise.all([
    WalletTransaction.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    WalletTransaction.countDocuments(q),
  ]);
  return { items, total, page, limit };
}

module.exports = { recordStreakCredit, listForUser };
