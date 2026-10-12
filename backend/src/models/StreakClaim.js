const mongoose = require('mongoose');

const streakClaimSchema = new mongoose.Schema(
  {
    claimId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleId: { type: String, required: true },
    day: { type: Number, required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakReward', required: true },
    reward: {
      rewardType: String,
      currency: String,
      amount: Number,
      title: String,
    },
    status: { type: String, enum: ['CLAIMED'], default: 'CLAIMED' },
    claimedAt: { type: Date, required: true },
    transactionId: { type: String, required: true },
    referenceId: { type: String, required: true },
    idempotencyKey: { type: String, default: undefined },
  },
  { timestamps: true }
);

// A day can only ever be claimed once per cycle.
streakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true, name: 'unique_claim_per_day' });
streakClaimSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } }, name: 'unique_idempotency_key' }
);
streakClaimSchema.index({ userId: 1, claimedAt: -1 });

module.exports = mongoose.model('StreakClaim', streakClaimSchema);
