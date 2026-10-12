const env = require('./config/env');
const app = require('./app');
const { connectDB } = require('./config/db');

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET missing or too short (min 32 chars)');
  process.exit(1);
}

connectDB(env.MONGO_URI)
  .then(() => {
    app.listen(env.PORT, () => console.log(`API running on :${env.PORT} (${env.NODE_ENV})`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
