// Runs the API against an in-memory MongoDB replica set (no local mongod needed).
// Handy for demos and e2e runs. Data is lost when the process stops.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ENABLE_DEV_TOOLS = process.env.ENABLE_DEV_TOOLS || 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(48).toString('hex');

const { MongoMemoryReplSet } = require('mongodb-memory-server');

(async () => {
  const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  process.env.MONGO_URI = rs.getUri('veloop');

  const env = require('../src/config/env');
  const { connectDB } = require('../src/config/db');
  const app = require('../src/app');
  const { seedConfig, seedDemoUser } = require('../seed/seed');

  await connectDB(env.MONGO_URI);
  await seedConfig();
  const demo = await seedDemoUser();
  app.listen(env.PORT, () => console.log(`API (in-memory db) on :${env.PORT}` + (demo ? `  demo user: ${demo.email}` : '')));
})();
