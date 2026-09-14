# Architecture

Flowed is intentionally a one-contract sequential state machine. Each Flow has one payer, one recipient, and an ordered set of frozen Steps. Only the active Step can be reviewed, contested, finalized, or expired.

```text
OFFERED → ACTIVE → PROVISIONAL → RELEASED → NEXT STEP
   ├─ decline / withdraw / expire → terminal refund
   └─ active review: retry, contest, or finalize
```

The contract should snapshot frozen HTTPS evidence using equality-backed consensus before semantic classification. The model returns one scalar label only. It never chooses amounts, ordering, ownership, or escrow destinations. Deterministic code releases the exact amount frozen at creation and advances the index atomically.
