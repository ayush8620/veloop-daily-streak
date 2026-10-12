// Single source of server time. In non-production environments a test offset
// can be applied (see /api/dev/time-travel) to simulate days passing.
const env = require('../config/env');

let offsetMs = 0;

const now = () => new Date(Date.now() + (env.devToolsEnabled ? offsetMs : 0));
const getOffset = () => offsetMs;
const setOffset = (ms) => {
  if (!env.devToolsEnabled) throw new Error('Time travel disabled');
  offsetMs = Number(ms) || 0;
};

module.exports = { now, getOffset, setOffset };
