const { AuditLog } = require('../models');
const clock = require('../utils/clock');

// Audit logging must never break the main flow.
async function log(event, { userId, reason, payload, ctx } = {}) {
  try {
    await AuditLog.create({
      event,
      userId,
      reason,
      payload,
      ip: ctx && ctx.ip,
      userAgent: ctx && ctx.userAgent,
      at: clock.now(),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') console.error('[audit] failed', event, err.message);
  }
}

module.exports = { log };
