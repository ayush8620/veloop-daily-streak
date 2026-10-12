// the in-memory replica set runs outside the jest sandbox
const { MongoMemoryReplSet } = require('mongodb-memory-server');

module.exports = async () => {
  const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  globalThis.__MONGO_RS__ = rs;
  process.env.TEST_MONGO_URI = rs.getUri();
};
