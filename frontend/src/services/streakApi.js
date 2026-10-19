import api from './api';

export const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const getStreak = () => api.get('/daily-streak').then((r) => r.data);
export const getStatus = () => api.get('/daily-streak/status').then((r) => r.data);
export const getHistory = (page = 1) => api.get('/daily-streak/history', { params: { page } }).then((r) => r.data);
export const getTransactions = (page = 1, limit = 20) =>
  api.get('/wallet/transactions', { params: { page, limit } }).then((r) => r.data);
export const getWallet = () => api.get('/wallet').then((r) => r.data.wallet);

// no day/amount sent - the server works it out
export const claimStreak = (idempotencyKey = newKey()) =>
  api.post('/daily-streak/claim', {}, { headers: { 'Idempotency-Key': idempotencyKey } }).then((r) => r.data);
