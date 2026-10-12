const mongoose = require('mongoose');

const streakConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    cycleLength: { type: Number, required: true, min: 1 },
    claimIntervalMs: { type: Number, required: true, min: 1000 },
    graceWindowMs: { type: Number, required: true, min: 1000 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakConfig', streakConfigSchema);
