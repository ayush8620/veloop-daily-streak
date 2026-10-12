const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// userId always comes from the token, never from the request body
module.exports = async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError(401, 'UNAUTHORIZED', 'Please log in to continue.');

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError(401, 'UNAUTHORIZED', 'Please log in to continue.');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in to continue.');
    if (user.status !== 'ACTIVE') throw new AppError(403, 'ACCOUNT_BLOCKED', 'This account is not active.');

    req.user = user;
    req.ctx = { ip: req.ip, userAgent: req.get('user-agent') };
    next();
  } catch (err) {
    next(err);
  }
};
