import axios from 'axios';

export const TOKEN_KEY = 'veloop_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 70000,
});

const SLOW_AFTER = 4000;
let pending = 0;
let slowTimers = new Map();
export let serverWaking = false;

function setWaking(v) {
  if (serverWaking === v) return;
  serverWaking = v;
  window.dispatchEvent(new CustomEvent('veloop:waking', { detail: v }));
}

function track(config) {
  if (config.__tracked) return;
  config.__tracked = true;
  pending += 1;
  slowTimers.set(config, setTimeout(() => setWaking(true), SLOW_AFTER));
}

function untrack(config) {
  if (!config?.__tracked) return;
  config.__tracked = false;
  clearTimeout(slowTimers.get(config));
  slowTimers.delete(config);
  pending = Math.max(0, pending - 1);
  if (!pending) setWaking(false);
}

const RETRYABLE_POSTS = ['/auth/login', '/auth/register'];

function canRetry(err) {
  const config = err?.config;
  if (!config || config.__retried || err.response) return false;
  const method = (config.method || 'get').toLowerCase();
  return method === 'get' || RETRYABLE_POSTS.some((u) => config.url?.endsWith(u));
}

export function wakeServer() {
  api.get('/health', { __silent: true }).catch(() => {});
}

api.interceptors.request.use((config) => {
  if (!config.__silent) track(config);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const FRIENDLY = {
  ALREADY_CLAIMED: 'This reward has already been claimed.',
  LOCKED: 'Your next reward is not available yet.',
  INVALID_DAY: 'This reward is not available for your current day.',
  PREVIOUS_DAY_MISSING: 'Your streak has been reset. Start again from Day 1.',
  UNAUTHORIZED: 'Please log in to continue.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment.',
};

// turn any axios error into { code, message } that is safe to show
export function toApiError(err) {
  const data = err?.response?.data?.error;
  if (data) return { status: err.response.status, code: data.code, message: FRIENDLY[data.code] || data.message, details: data.details };
  if (err?.code === 'ECONNABORTED' || !err?.response) {
    return { status: 0, code: 'NETWORK', message: 'Unable to reach the server. Check your connection and try again.' };
  }
  return { status: 500, code: 'SERVER_ERROR', message: 'Unable to process your reward. Please try again.' };
}

api.interceptors.response.use(
  (res) => {
    untrack(res.config);
    return res;
  },
  (err) => {
    if (canRetry(err)) {
      err.config.__retried = true;
      return api.request(err.config);
    }
    untrack(err.config);
    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('veloop:logout'));
    }
    return Promise.reject(toApiError(err));
  }
);

export default api;
