require('dotenv').config({ quiet: true });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  ENABLE_DEV_TOOLS: process.env.ENABLE_DEV_TOOLS === 'true',
  RATE_LIMIT_CLAIM_PER_MIN: Number(process.env.RATE_LIMIT_CLAIM_PER_MIN) || 10,
  RATE_LIMIT_AUTH_PER_15MIN: Number(process.env.RATE_LIMIT_AUTH_PER_15MIN) || 20,
  RATE_LIMIT_API_PER_MIN: Number(process.env.RATE_LIMIT_API_PER_MIN) || 120,
};

env.isProduction = env.NODE_ENV === 'production';
// Dev tools (time travel) are never available in production, even if the flag is set.
env.devToolsEnabled = !env.isProduction && (env.ENABLE_DEV_TOOLS || env.NODE_ENV === 'test');

module.exports = env;
