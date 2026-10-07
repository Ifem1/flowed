# Flowed

This milestone extends accepted Flowed with bilateral amendments for future inactive steps. Payer and recipient can update criteria, evidence sources, and TTL while active/completed work and funded economics remain fixed. See [Milestone](docs/MILESTONE.md).

**Work moves. Money follows.**

Flowed is a funded sequential semantic workflow on GenLayer. One payer funds a 2–8 step workflow upfront. Each step’s tranche is fixed at creation; future inactive steps can later receive a new criteria, evidence, and TTL version after exact bilateral approval. GenLayer judges only the active version against its frozen evidence snapshot, while deterministic contract logic moves the already-committed funds and activates the next step.

**GenLayer verifies progression. Deterministic code moves funds.**

## Live deployment

- Live app: https://flowed-eight.vercel.app/
- Operational app: https://flowed-eight.vercel.app/app
- Accepted historical contract (no amendments): [`0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`](https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad)
- Future-step amendment milestone contract: [`0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443`](https://explorer-studio.genlayer.com/address/0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443)
- Network: **GenLayer Studionet**
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Accepted historical deployed source: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47` (historical contract above; source SHA-256 `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`; Git blob `b8c351464cf876fedb1c1b0312670a1a4d693b5b`)
- Historical deployment transaction: [`0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`](https://explorer-studio.genlayer.com/tx/0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a)
- Milestone deployed source: `5ede53d8a2a1ec164df5d2f4962e3dda2d908c92` (milestone contract above; source SHA-256 `97332aa0cfb4f8d0a497421e466ab30953d93cebfb60661cbf6d1121ca88aea8`)
- Milestone deployment transaction: [`0x90f6de1e85f2308fe0cfbe803e58bbcdbc3219a3f7682a11b3d6dc4184990bb1`](https://explorer-studio.genlayer.com/tx/0x90f6de1e85f2308fe0cfbe803e58bbcdbc3219a3f7682a11b3d6dc4184990bb1)
- Runtime: `v0.2.16`
- Runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`

Both deployed contract sources are frozen. Later repository commits change only frontend, verification tooling, evidence documentation, and submission material.

The accepted historical contract and the new amendment milestone deployment are documented separately. The production frontend at [flowed-eight.vercel.app](https://flowed-eight.vercel.app/) now uses the milestone contract on Studionet `61999`; deployment and live UI evidence are recorded in [docs/AMENDMENT_LIVE_VERIFICATION.md](docs/AMENDMENT_LIVE_VERIFICATION.md).

## Architecture

Flowed enforces:

- 2–8 ordered steps
- full funding upfront
- exactly one active step at a time
- frozen semantic criteria
- frozen public HTTPS evidence sources
- equality-backed evidence snapshots with SHA-256 digests
- semantic classification only at the active-step boundary
- provisional completion before settlement
- an exact 5% contest bond (`step amount / 20`)
- contest resolution against the **same stored snapshot**
- deterministic tranche release and next-step activation
- no AI-selected payout amount, recipient, ordering, refund, or bond
- no backend required for protocol correctness

The browser reconstructs state from finalized public contract reads. Writes use only an injected EIP-1193 wallet, exact `BigInt` GEN arithmetic, Studionet `61999`, and FINALIZED-success checks.

## Live proof

Two real Flows are finalized on the canonical contract.

**Flow 2 is the canonical contest demonstration.** It completed all three funded steps, including a payer contest on step 2, same-snapshot re-evaluation, forfeiture of the exact `0.0005 GEN` bond, and final release of the full `0.03 GEN` escrow.

Step-2 primary digest:

`fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7`

Step-2 contest digest:

`fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7`

Same-snapshot proof: **PASS**

Flow 1 remains useful historical proof of the normal no-contest path and also records a late contest correctly rejected after the frozen deadline.

Full evidence: [docs/LIVE_VERIFICATION.md](docs/LIVE_VERIFICATION.md)

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

FLOWED_FLOW_ID=2 \
FLOWED_EXPECT_CANONICAL_DEMO=1 \
FLOWED_TX_HASHES="<nine canonical Flow-2 hashes>" \
node scripts/live_full.mjs

FLOWED_LIVE_FRONTEND=https://flowed-eight.vercel.app \
node scripts/verify_live_frontend.mjs
```

The Direct Mode suite remains diagnostic only for the pinned stable v0.2.16 harness. That local harness fails during runtime-message decoding before Flowed executes, so it is not described as a Direct Mode pass. Finalized Studionet execution is the authoritative live-runtime evidence.

See also: [BUILD_STATUS.md](BUILD_STATUS.md), [SUBMISSION.md](SUBMISSION.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), and [DEMO.md](DEMO.md).
