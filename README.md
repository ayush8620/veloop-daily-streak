# VELoop Rewards - Daily Streak

A 7-day daily check-in system for VELoop Rewards, built with MongoDB, Express, React (Vite) and Node.

The main rule I followed: React only displays things. The streak, current day, card states, reward values, countdown target, missed-day reset and wallet credits are all decided by the API using server time.

Screenshots are in `screenshots/` (desktop, tablet, mobile, loader/skeleton, CPA demo, reset, error states).

## Stack

- Backend: Node 18+, Express, Mongoose, JWT, bcryptjs, helmet, express-rate-limit, express-validator
- Frontend: React 18 + Vite, React Router, Bootstrap 5 + CSS Modules, Axios, Lucide icons, Framer Motion
- DB: MongoDB (needs a replica set for transactions - Atlas has one by default)
- Tests: Jest + Supertest + mongodb-memory-server

## Project structure

```
backend/
  src/config       env, db, default seed values
  src/models       User, Wallet, StreakConfig, StreakReward, StreakCycle, StreakClaim, WalletTransaction, AuditLog
  src/services     streak, reward, wallet, transaction, audit, auth
  src/controllers  thin request handlers
  src/routes       all routes in one file
  src/middleware   auth, rate limits, validation, errors
  seed/seed.js     rewards + config + demo user
  scripts/dev.js   runs the API on an in-memory Mongo (no install needed)
  tests/           jest tests
frontend/
  src/pages/DailyStreak   page + components, each with its own .module.css
  src/services            api.js (axios), streakApi.js, authApi.js
  src/hooks               useStreak, useCountdown, useServerClock
docs/              API, database, security, testing notes
postman/           Postman collection
```

## Running locally

Quickest way (no MongoDB install, data is in memory):

```bash
cd backend && npm install && npm run dev:memory     # API on :5000, seeds a demo user
cd frontend && npm install && npm run dev           # http://localhost:5173
```

With a real database:

```bash
cd backend
cp .env.example .env      # set MONGO_URI and JWT_SECRET
npm install
npm run seed
npm run dev
```

For a local mongod, start it as a single-node replica set (`mongod --replSet rs0`, then `rs.initiate()` once) and use `mongodb://127.0.0.1:27017/veloop?replicaSet=rs0`.

Frontend: `cp .env.example .env` and set `VITE_API_URL` (default `http://localhost:5000/api`).

Demo login: `demo@veloop.test` / `Demo@12345`

Tests: `cd backend && npm test`

## How the streak works

Each 7-day run is a `StreakCycle`. A cycle stores `claimedDays`, `lastClaimedAt`, `nextClaimAt` and `expiresAt`.

- The current day is always `claimedDays + 1`. The client never sends it (if it does, it has to match or the request is rejected).
- After a claim: `nextClaimAt = claimedAt + claimIntervalMs`, `expiresAt = nextClaimAt + graceWindowMs`. Both values come from the `StreakConfig` document (24h / 24h by default), so day N+1 can be claimed between 24h and 48h after day N.
- Missed day: on any status/claim call, if server time is past `expiresAt` the cycle is marked `BROKEN`, a `STREAK_RESET` audit entry is written and a fresh cycle starts at Day 1. Nothing happens just because the browser was closed - it only depends on stored timestamps.
- After Day 7 the cycle is `COMPLETED` and a new one starts, unlocking one interval later.
- Wallet balances are kept when a streak resets.

Card states returned by the API: `CLAIMED`, `TODAY` (claimable now), `LOCKED` (the next day also carries `isNext` + `nextClaimAt` for the countdown), `MISSED` (shown in the reset banner for the broken cycle), and `AVAILABLE` is supported by the UI as a claimable state without the Today ribbon.

## Claim flow

1. User clicks Claim, button is disabled.
2. Frontend calls `GET /daily-streak/status` to confirm `canClaim`.
3. CPA demo modal (placeholder only, it doesn't grant anything).
4. `POST /daily-streak/claim` with an `Idempotency-Key` header and an empty body.
5. The server checks auth, active cycle, missed window, unlock time, previous day, and reward config, then in one Mongo transaction:
   - moves the cycle from `claimedDays = day-1` to `day` with a conditional update (this is what stops concurrent double claims)
   - `$inc`s the wallet
   - writes a `WalletTransaction` (balanceBefore/After, `STREAK-XXXXXXXX` reference)
   - writes the `StreakClaim` (unique on userId + cycleId + day)
6. Frontend refetches `GET /daily-streak` and re-renders everything from that.

## Timer

The API returns `serverTime` and `nextClaimAt`. The frontend anchors server time to `performance.now()` so changing the device clock doesn't affect the countdown. When it reaches zero the page asks the API again - it never unlocks a card by itself.

## Rewards

Stored in the `streakrewards` collection (seeded from `backend/src/config/defaults.js`):

| Day | Reward |
|---|---|
| 1 | +5 VEs |
| 2 | +10 VEs |
| 3 | +15 VEs |
| 4 | ₹1 Amazon Gift Card |
| 5 | ₹2 Amazon Gift Card |
| 6 | +30 VEs |
| 7 | ₹5 Amazon Gift Card (Ultimate) |

Changing a document (e.g. Day 2 to 15 VEs) shows up in the UI without touching React. VEs go to `wallet.vesBalance`, gift cards to `wallet.giftCardBalanceINR`.

## Testing the missed-day logic

Outside production there is a test clock: `POST /api/dev/time-travel {"hours": 25}` moves server time forward, `POST /api/dev/time-reset` resets it. The routes are not mounted when `NODE_ENV=production`. The jest tests use the same clock. See `docs/TESTING.md`.

## Deployment

**MongoDB Atlas**
1. Create a free M0 cluster, a database user and allow network access (0.0.0.0/0 for Render).
2. Copy the connection string, e.g. `mongodb+srv://user:pass@cluster.xxxx.mongodb.net/veloop`.

**Backend on Render**
1. New Web Service from this repo, root directory `backend`.
2. Build: `npm install`, start: `npm start`.
3. Env vars: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (48+ random chars), `CLIENT_ORIGIN=https://<your-app>.vercel.app`.
4. Once it's up, run the seed once from the Render shell: `npm run seed`.
5. Check `https://<service>.onrender.com/api/health`.

**Frontend on Vercel**
1. Import the repo, root directory `frontend`, framework Vite.
2. Env var: `VITE_API_URL=https://<service>.onrender.com/api`.
3. `vercel.json` already rewrites all routes to `index.html`.

Note: Render's free tier sleeps, so the first request after idle can take ~30s.

## Known limitations

- The CPA step is a placeholder, as asked. The real ad integration plugs in between the status check and the claim call.
- Gift cards are credited as an INR balance; there's no actual voucher issuing.
- The reward artwork is cut out from the supplied design images. Gift/crown/hero use subtle CSS/Framer Motion float instead of AI-generated animation.
- The test clock is global for the process (fine for dev/testing, disabled in production).
