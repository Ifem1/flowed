# Flowed

**Work moves. Money follows.**

Flowed is a funded sequential semantic workflow. One payer funds an entire 2–8 step workflow upfront. Each ordered step freezes its exact tranche, acceptance criteria, evidence sources, and relative deadline. GenLayer judges only whether the current active step satisfies its frozen criteria against a frozen public-evidence snapshot; deterministic contract logic releases the precommitted tranche and activates the next step.

> “Flowed turns funded work into a sequential semantic state machine: when GenLayer establishes that the active step is complete, deterministic contract logic releases its precommitted tranche and activates the next step.”

## Network

- GenLayer Studionet only
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Production contract source: `contracts/Flowed.py`

## What is implemented

- complete Flow lifecycle: create, accept, decline, withdraw, offer expiry, active review/retry, contest, contest resolution, provisional finalization, stalled-contest fallback, abandonment, and active expiry
- exact global and per-Flow escrow/bond accounting
- canonical bounded equality-backed evidence snapshots with SHA-256 digests
- contest reuse of the stored primary snapshot without refetch or evidence injection
- one-scalar semantic verdict boundary
- finalized GEN transfers using the supported GenLayer contract transfer mechanism
- stable-runtime port of the actual production `Flowed.py`, with real Studionet probe proof; the pinned Direct Mode harness limitation is documented in `BUILD_STATUS.md`
- contract/protocol test suite and GenVM lint/SDK validation in GitHub Actions
- live browser reads through `genlayer-js` without wallet connection
- injected-wallet writes with Studionet enforcement and finalized receipt checking
- exact `BigInt` GEN handling in frontend utilities and browser write construction
- real flow list, detail, dashboard, create-flow, history/manifests, accounting, actions, and transaction lifecycle UI

The browser deliberately shows **deployment pending** while `config.js` has no canonical contract address. It never falls back to fake flows or fake transaction success.

## Development checks

```bash
python -m pip install -r requirements.txt
python scripts/validate_contract.py
genvm-lint check contracts/Flowed.py
python -m pytest tests/contract tests/frontend -q
python -m pytest tests/direct -q

npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

CI separates contract static validation, contract/protocol tests, genuine Direct Mode, and frontend validation so unrelated gates do not become skipped merely because another gate fails.

## Deployment

Run the no-signature preflight first:

```bash
node scripts/deploy_preflight.mjs
```

The production deployment itself targets only Studionet `61999` and has no constructor arguments. See `docs/DEPLOYMENT.md`. Deployment is not claimed until a funded wallet actually signs it and the canonical address/transaction are recorded.

## Live verification

After deployment, the canonical address is wired into the frontend and the required tiny 3-step live Flow is executed. Only actual finalized artifacts belong in `docs/LIVE_VERIFICATION.md`; mocked Direct Mode model output is never described as live semantic proof.

See `FLOWED_BUILD_SPEC.md`, `BUILD_STATUS.md`, `docs/ARCHITECTURE.md`, and `docs/SECURITY_MODEL.md` for the frozen protocol boundary.
