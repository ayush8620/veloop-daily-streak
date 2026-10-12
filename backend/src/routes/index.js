const router = require('express').Router();
const h = require('../utils/asyncHandler');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, claimLimiter } = require('../middleware/rateLimit');
const v = require('../validators');
const env = require('../config/env');
const authCtrl = require('../controllers/auth.controller');
const streakCtrl = require('../controllers/streak.controller');
const walletCtrl = require('../controllers/wallet.controller');
const devCtrl = require('../controllers/dev.controller');

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

router.post('/auth/register', authLimiter, v.register, validate, h(authCtrl.register));
router.post('/auth/login', authLimiter, v.login, validate, h(authCtrl.login));
router.get('/auth/me', requireAuth, h(authCtrl.me));

router.get('/daily-streak', requireAuth, h(streakCtrl.getStreak));
router.get('/daily-streak/status', requireAuth, h(streakCtrl.getStatus));
router.post('/daily-streak/claim', requireAuth, claimLimiter, v.claim, validate, h(streakCtrl.claim));
router.get('/daily-streak/history', requireAuth, v.pagination, validate, h(streakCtrl.history));

router.get('/wallet', requireAuth, h(walletCtrl.getWallet));
router.get('/wallet/transactions', requireAuth, v.pagination, validate, h(walletCtrl.listTransactions));

// time travel for testing the missed-day logic, never mounted in production
if (env.devToolsEnabled) {
  router.get('/dev/time', devCtrl.getTime);
  router.post('/dev/time-travel', v.timeTravel, validate, devCtrl.timeTravel);
  router.post('/dev/time-reset', devCtrl.resetTime);
}

module.exports = router;
