// Seeds streak config, rewards and a demo user.  Usage: npm run seed
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const { StreakConfig, StreakReward, User, Wallet } = require('../src/models');
const { defaultConfig, defaultRewards } = require('../src/config/defaults');

async function seedConfig() {
  await StreakConfig.updateOne({ key: defaultConfig.key }, { $set: defaultConfig }, { upsert: true });
  for (const r of defaultRewards) {
    await StreakReward.updateOne({ day: r.day }, { $set: { active: true, ...r } }, { upsert: true });
  }
}

async function seedDemoUser() {
  const email = process.env.DEMO_EMAIL || 'demo@veloop.test';
  const password = process.env.DEMO_PASSWORD || 'Demo@12345';
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ name: 'Demo User', email, passwordHash: await bcrypt.hash(password, 10) });
  await Wallet.updateOne({ userId: user._id }, { $setOnInsert: { userId: user._id, vesBalance: 100 } }, { upsert: true });
  return { email, password };
}

module.exports = { seedConfig, seedDemoUser };

if (require.main === module) {
  (async () => {
    await connectDB(env.MONGO_URI);
    await seedConfig();
    const demo = await seedDemoUser();
    console.log(`Seeded ${defaultRewards.length} rewards. Demo login: ${demo.email} / ${demo.password}`);
    await mongoose.disconnect();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
