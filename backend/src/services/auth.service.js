const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const wallet = require('./wallet.service');
const audit = require('./audit.service');

const sign = (user) => jwt.sign({ sub: String(user._id) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

async function register({ name, email, password }, ctx) {
  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');

  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
  await wallet.getOrCreateWallet(user._id);
  await audit.log('USER_REGISTERED', { userId: user._id, ctx });
  return { token: sign(user), user: user.toPublic() };
}

async function login({ email, password }, ctx) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    await audit.log('LOGIN_FAILED', { userId: user && user._id, payload: { email }, ctx });
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }
  if (user.status !== 'ACTIVE') throw new AppError(403, 'ACCOUNT_BLOCKED', 'This account is not active.');

  await audit.log('USER_LOGIN', { userId: user._id, ctx });
  return { token: sign(user), user: user.toPublic() };
}

module.exports = { register, login, sign };
