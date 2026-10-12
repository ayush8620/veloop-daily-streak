# API

Base URL: `/api`. All streak and wallet routes need `Authorization: Bearer <token>`.

Errors always look like:

```json
{ "success": false, "error": { "code": "ALREADY_CLAIMED", "message": "You've already claimed today's reward.", "details": {} } }
```

## Auth

| Method | Path | Body |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` (password 8+ chars) |
| POST | `/auth/login` | `{ email, password }` |
| GET | `/auth/me` | - |

Both return `{ success, token, user }`.

## Daily streak

### GET /daily-streak
Full page state.

```json
{
  "success": true,
  "serverTime": "2026-10-12T14:00:00.000Z",
  "streak": {
    "cycleId": "CYC-...", "status": "ACTIVE",
    "currentStreak": 1, "currentDay": 2, "checkedIn": 1, "totalRewards": 7,
    "canClaim": false,
    "lastClaimedAt": "2026-10-12T14:00:00.000Z",
    "nextClaimAt": "2026-10-13T14:00:00.000Z",
    "expiresAt": "2026-10-14T14:00:00.000Z",
    "claimIntervalMs": 86400000
  },
  "nextReward": { "day": 2, "rewardType": "VES", "currency": "VES", "amount": 10, "assetType": "coin", "...": "" },
  "ultimateReward": { "day": 7, "currency": "INR", "amount": 5, "assetType": "crown", "isUltimate": true },
  "rewards": [
    { "day": 1, "status": "CLAIMED", "claimedAt": "...", "reward": { } },
    { "day": 2, "status": "LOCKED", "isNext": true, "nextClaimAt": "...", "reward": { } },
    { "day": 3, "status": "LOCKED", "reward": { } }
  ],
  "wallet": { "ves": 5, "giftCardINR": 0 },
  "lastReset": null
}
```

`lastReset` is filled for 48h after a missed-day reset: `{ cycleId, missedDay, previousStreak, resetAt, days: [{ day, status: "CLAIMED" | "MISSED" }] }`.

### GET /daily-streak/status
Smaller version used when the countdown ends: `{ serverTime, streak, today, wallet }`.

### POST /daily-streak/claim
Body can be empty. Optional header `Idempotency-Key` (8-100 chars).

- `day` in the body is optional and must equal the current day.
- `reward`, `amount`, `currency`, `streak`, `userId` are ignored (and logged as `TAMPER_ATTEMPT`).

201:
```json
{
  "success": true, "idempotent": false,
  "claim": { "claimId": "CLM-...", "day": 2, "cycleId": "CYC-...", "reward": { "amount": 10, "currency": "VES" }, "transactionId": "TXN-...", "referenceId": "STREAK-1A2B3C4D" },
  "transaction": { "transactionId": "TXN-...", "amount": 10, "balanceBefore": 5, "balanceAfter": 15, "source": "DAILY_STREAK", "streakDay": 2 },
  "serverTime": "...",
  "state": { "...": "same as GET /daily-streak" }
}
```

Same Idempotency-Key again returns 200 with `idempotent: true` and the original claim.

| Status | code | When |
|---|---|---|
| 400 | `INVALID_DAY` | body `day` isn't the current day |
| 400 | `VALIDATION_ERROR` | bad input |
| 401 | `UNAUTHORIZED` | no/invalid token |
| 409 | `ALREADY_CLAIMED` | already claimed in this period, or lost a concurrent race |
| 409 | `PREVIOUS_DAY_MISSING` | previous day record not found |
| 423 | `LOCKED` | new cycle not unlocked yet (`details.nextClaimAt`) |
| 429 | `RATE_LIMITED` | too many requests |

### GET /daily-streak/history?page=1&limit=20
All claims for the user, newest first: `{ items, total, page, limit }`.

## Wallet

- `GET /wallet` - `{ wallet: { ves, giftCardINR } }`
- `GET /wallet/transactions?page=1&limit=20` - ledger entries

## Dev only (not in production)

- `GET /dev/time` - current server time and offset
- `POST /dev/time-travel` `{ "hours": 25 }`
- `POST /dev/time-reset`

## Health

`GET /health`
