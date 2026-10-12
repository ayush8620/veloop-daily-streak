const mongoose = require('mongoose');

const EVENTS = [
  'USER_REGISTERED',
  'USER_LOGIN',
  'LOGIN_FAILED',
  'STREAK_CLAIM_REQUEST',
  'STREAK_CLAIM_SUCCESS',
  'STREAK_CLAIM_REJECTED',
  'STREAK_RESET',
  'STREAK_CYCLE_COMPLETED',
  'DUPLICATE_CLAIM',
  'INVALID_CLAIM',
  'TAMPER_ATTEMPT',
];

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    event: { type: String, enum: EVENTS, required: true, index: true },
    reason: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
    at: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
module.exports.EVENTS = EVENTS;
