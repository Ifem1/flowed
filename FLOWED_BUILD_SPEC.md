# Flowed build specification

**Tagline:** Work moves. Money follows.

**Reviewer sentence:** “Flowed turns funded work into a sequential semantic state machine: when GenLayer establishes that the active step is complete, deterministic contract logic releases its precommitted tranche and activates the next step.”

## Frozen product boundary

Flowed is a funded sequential semantic workflow. One payer funds the complete workflow and one recipient progresses through 2–8 ordered work steps. Every step freezes its exact tranche, acceptance criteria, public evidence sources, and relative TTL at creation. GenLayer judges only whether the current active step satisfies its frozen criteria against a frozen evidence snapshot. It never selects amounts, recipients, ordering, refunds, or the active step.

Flowed is not a bounty, guarantee protocol, DAO, marketplace, reputation layer, code-governance system, generic escrow, or AI payment allocator.

## Network and production source

- Network: GenLayer Studionet
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Production contract: `contracts/Flowed.py`
- Production contract count: exactly one

No `61997`, `studio-dev`, or Bradbury dependency is permitted in the production path.

## Frozen invariants

- one payer / one recipient
- 2–8 ordered steps
- all escrow funded at creation
- `sum(step.amount) == escrow == message.value`
- fixed tranche per step
- immutable criteria and source manifests after creation
- only the active step may be reviewed
- future steps remain locked until deterministic release of the preceding step
- each step deadline starts when that step activates
- each tranche settles at most once
- completed steps cannot reopen
- AI cannot select amount, recipient, ordering, active step, or refund
- per-Flow and global escrow equation: `funded = released + refunded + remaining`
- per-Flow and global bond equation: `received = locked + returned + forfeited`

## Semantic boundary

Allowed model labels are exactly:

- `SATISFIED`
- `NOT_SATISFIED`
- `INCONCLUSIVE`

Protocol/infrastructure labels are `SOURCE_UNAVAILABLE` and `MODEL_OUTPUT_INVALID`. Consensus-critical model output is one scalar label only. No JSON verdict, free-form reasoning, confidence, percentage, risk score, or model-selected payment value is consensus critical.

Evidence is treated as untrusted data. The prompt instructs validators to ignore instructions in evidence, not follow links found inside evidence, judge only the frozen criteria against the frozen snapshot, and return one exact label.

## Lifecycle

- `OFFERED`: accept, recipient decline, payer withdraw, or permissionless expiry after `accept_by`.
- `ACTIVE`: recipient review/retry, recipient abandonment, or permissionless active-step expiry.
- `PROVISIONAL`: payer may contest before the fixed deadline; after it, anyone may finalize.
- `CONTESTED`: anyone may resolve; unresolved contests receive a fixed stalled-contest fallback.
- terminal states: `COMPLETED`, `DECLINED`, `WITHDRAWN`, `EXPIRED`, `ABANDONED`.

`INCONCLUSIVE`, `SOURCE_UNAVAILABLE`, and `MODEL_OUTPUT_INVALID` are retryable with cooldown and a bounded recovery grace. `NOT_SATISFIED` does not receive infrastructure grace.

## Evidence snapshot

Only creation-frozen HTTPS sources may be fetched. Source count, source labels, URLs, and response bodies are bounded. Required source failure produces `SOURCE_UNAVAILABLE`; unavailable optional sources remain represented. Bodies are bounded before canonical JSON serialization, so final JSON is never sliced mid-document. The canonical snapshot is equality-backed, SHA-256 digested, stored only after a primary `SATISFIED` result, and reused unchanged in contest resolution. Contest cannot refetch or add evidence.

## Money

All outgoing GEN uses the SDK finalized-transfer mechanism. Contract/accounting state is committed before the external transfer call. The exact contest bond is `step.amount / 20` (5%). Refund and tranche paths are replay-protected by state transitions and remaining-balance checks.

## Browser boundary

Public reads work without a wallet. Writes use an injected wallet only, enforce Studionet chain `61999`, use `BigInt` for all GEN math, and wait for a finalized successful GenLayer receipt before displaying completion. The browser must never request or embed a private key and must never fabricate success or contract data.

## Live-proof rule

Direct Mode and mocked semantic responses are test proof, not live semantic proof. `docs/LIVE_VERIFICATION.md` may contain canonical addresses, transaction hashes, snapshot digests, manifests, and final accounting only after those artifacts exist on Studionet.