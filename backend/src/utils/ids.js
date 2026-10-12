const crypto = require('crypto');

const rand = (n = 8) => crypto.randomBytes(16).toString('hex').toUpperCase().slice(0, n);

module.exports = {
  claimId: () => `CLM-${rand(12)}`,
  cycleId: () => `CYC-${rand(12)}`,
  transactionId: () => `TXN-${rand(12)}`,
  streakRef: () => `STREAK-${rand(8)}`,
};
