# Database

MongoDB via Mongoose. Transactions are used for claims, so the server must be a replica set (Atlas is).

| Collection | Key fields | Indexes |
|---|---|---|
| users | name, email, passwordHash (hidden), status | email unique |
| wallets | userId, vesBalance, giftCardBalanceINR | userId unique |
| streakconfigs | key, cycleLength, claimIntervalMs, graceWindowMs, active | key unique |
| streakrewards | day, rewardType (VES/GIFT_CARD), currency (VES/INR), amount, title, subtitle, assetType, badge, isUltimate, active, metadata | day unique |
| streakcycles | cycleId, userId, status (ACTIVE/COMPLETED/BROKEN), claimedDays, lastClaimedAt, nextClaimAt, expiresAt, startedAt, endedAt, endReason, missedDay | cycleId unique; userId unique where status = ACTIVE |
| streakclaims | claimId, userId, cycleId, day, rewardId, reward snapshot, claimedAt, transactionId, referenceId, idempotencyKey | (userId, cycleId, day) unique; (userId, idempotencyKey) unique when set |
| wallettransactions | transactionId, userId, rewardType, currency, type, amount, source, streakDay, cycleId, referenceId, balanceBefore, balanceAfter, status | transactionId unique, referenceId unique |
| auditlogs | userId, event, reason, ip, userAgent, payload, at | userId, event |

Audit events: `STREAK_CLAIM_REQUEST`, `STREAK_CLAIM_SUCCESS`, `STREAK_CLAIM_REJECTED`, `STREAK_RESET`, `STREAK_CYCLE_COMPLETED`, `DUPLICATE_CLAIM`, `INVALID_CLAIM`, `TAMPER_ATTEMPT`, `USER_REGISTERED`, `USER_LOGIN`, `LOGIN_FAILED`.

## Tracing a claim

```
streakclaims.transactionId  -> wallettransactions.transactionId
streakclaims.referenceId    =  wallettransactions.referenceId (STREAK-XXXXXXXX)
streakclaims.rewardId       -> streakrewards._id
streakclaims.cycleId        -> streakcycles.cycleId
wallettransactions.balanceAfter = wallets balance right after that claim
```

Example in mongosh:

```js
const c = db.streakclaims.findOne({ day: 2 });
db.wallettransactions.findOne({ transactionId: c.transactionId });
db.auditlogs.find({ userId: c.userId }).sort({ at: -1 });
```
