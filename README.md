# Flowed

**Work moves. Money follows.**

Flowed is a funded sequential semantic workflow. One payer funds an entire 2–8 step workflow upfront. Each ordered step freezes its exact tranche, acceptance criteria, evidence sources, and relative deadline. GenLayer judges only whether the current active step satisfies its frozen criteria against a frozen public-evidence snapshot; deterministic contract logic releases the precommitted tranche and activates the next step.

> “Flowed turns funded work into a sequential semantic state machine: when GenLayer establishes that the active step is complete, deterministic contract logic releases its precommitted tranche and activates the next step.”

## Canonical production

- Live app: https://cdn.statically.io/gh/Ifem1/flowed@d2016d4d2a164fc557caaaa83aafdd40bf68129b/index.html
- Live frontend source snapshot: `d2016d4d2a164fc557caaaa83aafdd40bf68129b`
- Canonical contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Network: **GenLayer Studionet**
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Canonical deployed source commit: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Canonical source SHA-256: `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`
- Canonical `contracts/Flowed.py` Git blob: `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Deployment tx: `0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`
- Runtime: `v0.2.16`
- Runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`

The canonical deployment is independently re-read from Studionet on every repository push. The deployment transaction is `FINALIZED`, the stable Studio leader receipt reports `SUCCESS`, and finalized public reads verify global escrow and bond accounting. The deployed `contracts/Flowed.py` is frozen and must not be modified or redeployed.

## What is implemented

- complete Flow lifecycle: create, accept, decline, withdraw, offer expiry, active review/retry, contest, contest resolution, provisional finalization, stalled-contest fallback, abandonment, and active expiry
- exact global and per-Flow escrow/bond accounting
- bounded equality-backed evidence snapshots with SHA-256 digests
- same-snapshot contest resolution without refetch or party-added evidence
- one-scalar semantic verdict boundary
- finalized GEN transfers using the stable GenLayer transfer mechanism
- public browser reads through `genlayer-js` without wallet connection
- injected EIP-1193 wallet writes only; no private-key UI
- Studionet `61999` network detection/switching
- exact `BigInt` GEN parsing and write construction
- lossless on-chain JSON integer parsing before any wei-to-`BigInt` conversion
- finalized-success verification that supports the stable Studio v0.2.16 receipt shape
- real Flow list, detail, dashboard, create-flow, manifests/history, accounting, actions, and transaction lifecycle UI
- canonical production configuration; no fake Flow fallback and no fake transaction success
- public commit-pinned production frontend with automated HTTP/config verification

## Verification

```bash
python -m pip install -r requirements.txt
python scripts/validate_contract.py
genvm-lint check contracts/Flowed.py
python -m pytest tests/contract tests/frontend -q

npm ci
npm run lint
npm run typecheck
npm test
npm run build

node scripts/deploy_preflight.mjs
node scripts/verify_canonical_live.mjs
node scripts/verify_live_frontend.mjs
```

The preserved Direct Mode suite is diagnostic on the stable v0.2.16 runtime. The pinned local harness fails while decoding the runtime message during import with `DecodingError: unexpected end of memory`; it does not reach Flowed contract execution. CI records that limitation without presenting it as a Direct Mode pass. Finalized Studionet execution is the authoritative stable-runtime evidence.

## Live protocol proof

The immutable three-step evidence and exact demo payload are prepared. The only unexecuted proof is the funded 0.03 GEN lifecycle itself because its create/accept/review/contest/finalize writes require real payer/recipient wallet signatures. No Flow ID, lifecycle hash, semantic label, snapshot digest, or final accounting is fabricated before those finalized transactions exist.

See `BUILD_STATUS.md`, `SUBMISSION.md`, `docs/DEPLOYMENT.md`, and `docs/LIVE_VERIFICATION.md`.
