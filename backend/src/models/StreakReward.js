const mongoose = require('mongoose');

const streakRewardSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, unique: true, min: 1 },
    rewardType: { type: String, enum: ['VES', 'GIFT_CARD'], required: true },
    currency: { type: String, enum: ['VES', 'INR'], required: true },
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    assetType: { type: String, enum: ['coin', 'gift', 'gift-card', 'crown'], default: 'coin' },
    badge: { type: String, default: null },
    isUltimate: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakReward', streakRewardSchema);
