const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-1234567890';
process.env.RATE_LIMIT_CLAIM_PER_MIN = '1000';
process.env.RATE_LIMIT_AUTH_PER_15MIN = '1000';
process.env.RATE_LIMIT_API_PER_MIN = '5000';

// each test file gets its own database on the shared replica set
async function start(dbName = `veloop_test_${process.pid}_${Date.now()}`) {
  const uri = process.env.TEST_MONGO_URI.replace('/?', `/${dbName}?`);
  await mongoose.connect(uri);
  const models = require('../src/models');
  await Promise.all(Object.values(models).map((m) => m.syncIndexes()));
  await require('../seed/seed').seedConfig();
}

async function stop() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

async function clearUserData() {
  const { User, Wallet, StreakCycle, StreakClaim, WalletTransaction, AuditLog } = require('../src/models');
  await Promise.all([User, Wallet, StreakCycle, StreakClaim, WalletTransaction, AuditLog].map((m) => m.deleteMany({})));
  require('../src/utils/clock').setOffset(0);
}

module.exports = { start, stop, clearUserData };
