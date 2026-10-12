const mongoose = require('mongoose');

// One document per 7-day streak cycle. Only one ACTIVE cycle per user
// (enforced by a partial unique index).
const streakCycleSchema = new mongoose.Schema(
  {
    cycleId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'BROKEN'], default: 'ACTIVE' },
    cycleLength: { type: Number, required: true },
    claimedDays: { type: Number, default: 0 }, // number of days claimed in this cycle
    lastClaimedAt: { type: Date, default: null },
    nextClaimAt: { type: Date, required: true }, // when the next day unlocks (server time)
    expiresAt: { type: Date, default: null }, // after this the streak is broken (null = never, e.g. day 1)
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    endReason: { type: String, default: null },
    missedDay: { type: Number, default: null },
  },
  { timestamps: true }
);

streakCycleSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' }, name: 'one_active_cycle_per_user' }
);

module.exports = mongoose.model('StreakCycle', streakCycleSchema);
