const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const env = require('../config/env');

const handler = (req, res) =>
  res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } });

const make = (windowMs, limit, keyByUser) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler,
    ...(keyByUser && { keyGenerator: (req) => (req.user ? String(req.user._id) : ipKeyGenerator(req.ip)) }),
  });

module.exports = {
  apiLimiter: make(60 * 1000, env.RATE_LIMIT_API_PER_MIN),
  authLimiter: make(15 * 60 * 1000, env.RATE_LIMIT_AUTH_PER_15MIN),
  claimLimiter: make(60 * 1000, env.RATE_LIMIT_CLAIM_PER_MIN, true),
};
