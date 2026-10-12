# Security notes

- **Server decides everything.** The claim endpoint works out the day from the stored cycle. Client `day` must match; `reward`, `amount`, `currency`, `streak`, `userId` are ignored and logged.
- **Identity** comes only from the JWT (`sub`). There is no route that takes a userId, so one user can't read or claim for another.
- **Server time.** All checks use `clock.now()` on the server. The browser countdown is only visual and refetches at zero.
- **Duplicates / races.** The claim runs in a transaction with a conditional update on the cycle (`claimedDays: day - 1`, `nextClaimAt <= now`). Only one request can win; the others get 409. The unique index on (userId, cycleId, day) is a second guard, and `Idempotency-Key` makes retries safe.
- **Rate limiting.** 120 req/min per IP on the API, 20 auth attempts per 15 min, 10 claims/min per user (env configurable).
- **Validation** with express-validator, JSON body limited to 10kb, helmet headers, CORS restricted to `CLIENT_ORIGIN`.
- **Errors** are mapped to fixed codes/messages. Mongo/Cast/stack errors are never sent to the client.
- **Passwords** hashed with bcrypt, never returned (`select: false`).
- **Secrets** only in env vars. `.env` is git-ignored, only `.env.example` is committed. The server refuses to start with a JWT secret shorter than 32 chars.
- **Dev clock** routes are not registered when `NODE_ENV=production`, and the offset is ignored there too.
- **Audit log** records claim requests, successes, rejections, duplicates, resets and tamper attempts with IP and user agent.

Things I'd add for production: refresh tokens / httpOnly cookies, account lockout, and a shared rate-limit store (Redis) if running more than one instance.
