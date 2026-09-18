# Architecture

Flowed is intentionally one production Intelligent Contract: `contracts/Flowed.py`. It is a funded sequential semantic state machine, not a generic escrow or AI payment allocator.

The production contract is frozen at source commit `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47` and deployed on GenLayer Studionet `61999` at `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`. Post-deployment repository commits may change frontend, CI, evidence, and documentation, but `contracts/Flowed.py` must remain byte-identical to the deployed source.

## State machine

```text
OFFERED
  ├─ recipient accept ───────────────→ ACTIVE(step 1)
  ├─ recipient decline ─────────────→ DECLINED + refund
  ├─ payer withdraw ────────────────→ WITHDRAWN + refund
  └─ permissionless expiry ─────────→ EXPIRED + refund

ACTIVE(step N)
  ├─ SATISFIED ─────────────────────→ PROVISIONAL
  ├─ NOT_SATISFIED ─────────────────→ ACTIVE (retry subject to deadline/cooldown)
  ├─ infra/ambiguity ───────────────→ ACTIVE (bounded recovery grace)
  ├─ recipient abandon ─────────────→ ABANDONED + remaining refund
  └─ permissionless expiry ─────────→ EXPIRED + remaining refund

PROVISIONAL
  ├─ payer contests + exact 5% bond → CONTESTED
  └─ contest window elapses ────────→ RELEASE exact tranche

CONTESTED
  ├─ SATISFIED ─────────────────────→ bond forfeited to recipient + RELEASE
  ├─ NOT_SATISFIED ─────────────────→ bond returned + ACTIVE
  ├─ infra/ambiguity ───────────────→ CONTESTED retry
  └─ fixed stalled timeout ─────────→ bond returned + RELEASE primary-approved tranche

RELEASE
  ├─ more steps ────────────────────→ ACTIVE(next step; deadline starts now)
  └─ final step ────────────────────→ COMPLETED
```

Only the current active step can be judged. A future step has no activation timestamp or deadline until deterministic release advances the active index.

## Semantic architecture

Primary review first creates a bounded canonical snapshot from only creation-frozen HTTPS sources. The fetch is wrapped by equality-backed consensus. Required unavailable/empty/non-2xx sources produce `SOURCE_UNAVAILABLE`; optional unavailable sources remain represented. Source bodies are bounded before canonical JSON serialization. The contract records the SHA-256 digest.

The semantic prompt treats evidence as untrusted data and accepts exactly one scalar model label: `SATISFIED`, `NOT_SATISFIED`, or `INCONCLUSIVE`. Invalid output becomes `MODEL_OUTPUT_INVALID` at the protocol boundary.

A primary `SATISFIED` stores the snapshot for the provisional step. Contest resolution calls the model against that exact stored snapshot and cannot refetch or append evidence.

## Deterministic money architecture

The model never chooses amount, recipient, active index, ordering, contest bond, or refund. Exact amounts are frozen at creation and every settlement branch updates storage/accounting before the finalized external GEN transfer.

Per Flow and globally:

```text
funded = released + refunded + remaining
bonds_received = bonds_locked + bonds_returned + bonds_forfeited
```

The exact contest bond is `step.amount / 20`.

## Browser architecture

The browser uses `genlayer-js` against the canonical Studionet contract. `get_flow_count`, `get_flow`, `get_active_step`, and `get_accounting` are finalized public reads and require no wallet.

Writes use only an injected EIP-1193 provider. The browser detects the connected chain, requests Studionet `61999` when needed, constructs all GEN values with `BigInt`, and displays transaction progress separately as awaiting signature, submitted, consensus, finalizing, completed, or failed.

For stable Studio v0.2.16 finality, a write is considered complete only when the transaction is `FINALIZED` and successful execution is proven by either the SDK execution-result field or the stable Studio consensus leader receipt `execution_result: SUCCESS`. Merely reaching `ACCEPTED` is never treated as completion.

The application reconstructs Flow lists, details, manifests, and accounting from canonical contract reads on reload; no JavaScript demo-flow object is an operational source of truth.
