// Default seed data. Runtime values are always read from MongoDB
// (StreakConfig / StreakReward collections), never from this file.
const HOUR = 60 * 60 * 1000;

const defaultConfig = {
  key: 'DAILY_STREAK',
  cycleLength: 7,
  claimIntervalMs: 24 * HOUR, // wait after a claim before the next day unlocks
  graceWindowMs: 24 * HOUR, // how long the next day stays claimable before the streak breaks
  active: true,
};

const defaultRewards = [
  { day: 1, rewardType: 'VES', currency: 'VES', amount: 5, title: 'Daily Reward', subtitle: '5 VEs', assetType: 'coin' },
  { day: 2, rewardType: 'VES', currency: 'VES', amount: 10, title: 'Daily Reward', subtitle: '10 VEs', assetType: 'coin' },
  { day: 3, rewardType: 'VES', currency: 'VES', amount: 15, title: 'Daily Reward', subtitle: '15 VEs', assetType: 'coin' },
  { day: 4, rewardType: 'GIFT_CARD', currency: 'INR', amount: 1, title: 'Daily Reward', subtitle: 'Amazon Gift Card', assetType: 'gift', metadata: { brand: 'Amazon' } },
  { day: 5, rewardType: 'GIFT_CARD', currency: 'INR', amount: 2, title: 'Daily Reward', subtitle: 'Amazon Gift Card', assetType: 'gift-card', badge: 'Gift Card', metadata: { brand: 'Amazon' } },
  { day: 6, rewardType: 'VES', currency: 'VES', amount: 30, title: 'Daily Reward', subtitle: '30 VEs', assetType: 'coin', badge: 'Coin' },
  { day: 7, rewardType: 'GIFT_CARD', currency: 'INR', amount: 5, title: 'Ultimate Reward', subtitle: 'Amazon Gift Card', assetType: 'crown', badge: 'VIP', isUltimate: true, metadata: { brand: 'Amazon' } },
];

module.exports = { defaultConfig, defaultRewards };
