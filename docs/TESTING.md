# Testing

## Automated (backend)

```bash
cd backend && npm test
```

Jest + Supertest against an in-memory MongoDB replica set (real transactions and unique indexes). Time is moved with the test clock in `src/utils/clock.js`, the same one behind `/api/dev/time-travel`.

Last run: **21/21 passed**.

| Case | Test |
|---|---|
| Unauthorized request | `auth > streak APIs need a token` |
| Normal claim, wallet + transaction + audit | `claiming > day 1 claim credits wallet...` |
| Already claimed | `claiming > second claim same day is rejected` |
| Duplicate request (same Idempotency-Key) | `claiming > same Idempotency-Key replays...` |
| Concurrent requests (10 at once, and 8 on day 2) | `claiming > concurrent claims only grant once` |
| Locked reward / timer / changed device time | `claiming > locked day cannot be claimed before nextClaimAt` |
| Fake day, fake reward, fake streak, fake user | `claiming > fake day, reward, streak and userId...` |
| Previous-day validation | `claiming > previous day must be claimed` |
| Missed day + reset | `missed day > missing the window resets streak to day 1` |
| Late but inside window | `missed day > claiming late but inside the window...` |
| Closing the app doesn't reset | `missed day > just not opening the app...` |
| Full 7 days, cycle completion | `missed day > all 7 days credit the right rewards...` |
| Reward config from DB | `daily streak state > reward config change...` |
| Logout/login persistence | `persistence > state survives re-login` |
| Error messages don't leak | `persistence > errors never leak internals` |
| Rate limiting | `ratelimit.test.js` |

## Manual / browser

I ran the built frontend against `npm run dev:memory` in headless Chrome and checked:

- register -> loader -> skeleton -> page with Day 1 = Today
- claim -> CPA demo -> success with `STREAK-XXXXXXXX` ref -> Day 1 Claimed, Day 2 countdown ticking
- refresh and logout/login keep the state
- browser `Date` shifted +25h: Day 2 stays locked (countdown uses server time + `performance.now()`)
- second tab opened before the claim can't claim the same day
- 6 parallel fetches from the page: one 201, five 409, wallet +10 only
- days 3-7 via the test clock, wallet ends at 60 VEs + ₹8
- skip a day (+72h): reset banner, Day 1 Today
- API error -> error state with retry
- no horizontal scroll at 320, 360, 375, 390, 414, 480, 768, 820, 834, 1024, 1280, 1366, 1440, 1920

Screenshots for each are in `screenshots/`.

## Testing the missed day by hand

```bash
cd backend && npm run dev:memory
# log in, claim day 1, then:
curl -X POST localhost:5000/api/dev/time-travel -H "Content-Type: application/json" -d '{"hours":25}'
# claim day 2, then skip past the window:
curl -X POST localhost:5000/api/dev/time-travel -H "Content-Type: application/json" -d '{"hours":49}'
# reload the page -> streak reset, Day 1 claimable
curl -X POST localhost:5000/api/dev/time-reset
```

The Postman collection in `postman/` runs the same flow including negative cases (24/24 assertions passing with newman).
