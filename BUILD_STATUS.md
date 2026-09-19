# Build status

## Canonical deployment

- Contract implementation: ✅ frozen deployed `contracts/Flowed.py`
- Canonical deployed source: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Canonical contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Deployment tx: `0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`
- Network: GenLayer Studionet `61999`
- Runtime: `v0.2.16`
- Contract Git blob: ✅ `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Deployment receipt: ✅ FINALIZED
- Stable Studio leader execution: ✅ SUCCESS
- Canonical live verification: ✅

## Application

- Production frontend: ✅ https://flowed-eight.vercel.app/
- Operational app: ✅ https://flowed-eight.vercel.app/app
- Public finalized reads without wallet: ✅
- Flow 1 visible: ✅
- Flow 2 visible: ✅
- Injected EIP-1193 wallet only: ✅
- Flowed-local disconnect: ✅
- Wrong-chain detection and Studionet switch: ✅
- 4902 add-network fallback: ✅
- Exact `BigInt` GEN handling: ✅
- Lossless on-chain JSON integer parsing: ✅
- Full write surface: ✅
- FINALIZED-success handling: ✅
- Fake/mock Flow fallback: none

## Live protocol proof

### Flow 1 — normal-path historical proof

- state: ✅ COMPLETED
- funded: `0.03 GEN`
- released: `0.03 GEN`
- refunded: `0`
- remaining: `0`
- bonds: all zero
- three primary semantic reviews: ✅ SATISFIED
- ordinary no-contest finalization: ✅
- late step-2 contest: correctly rejected after the frozen 60-second deadline; documented as an execution rejection, not a protocol failure

### Flow 2 — canonical contest demonstration

- state: ✅ COMPLETED
- all nine required lifecycle transactions: ✅ FINALIZED / SUCCESS
- all four semantic manifests: ✅ SATISFIED
- step-2 primary digest equals step-2 contest digest: ✅ PASS
- funded: `0.03 GEN`
- released: `0.03 GEN`
- refunded: `0`
- remaining: `0`
- escrow invariant: ✅ PASS
- bonds received: `0.0005 GEN`
- bonds locked: `0`
- bonds returned: `0`
- bonds forfeited: `0.0005 GEN`
- bond invariant: ✅ PASS

Current global accounting after both Flows:

- funded: `0.06 GEN`
- released: `0.06 GEN`
- refunded: `0`
- remaining: `0`
- bonds received: `0.0005 GEN`
- bonds locked: `0`
- bonds returned: `0`
- bonds forfeited: `0.0005 GEN`

## Verification and CI

- Contract tests: ✅
- Contract syntax validation: ✅
- GenVM lint / SDK validation: ✅
- Frontend lint / typecheck / tests / build: ✅
- Deployment preflight: ✅
- Canonical live Studionet verifier: ✅
- Canonical Flow-2 verifier: ✅ gated in `.github/workflows/canonical-live.yml`
- Vercel live verification: ✅
- GitHub Actions: ✅ required final runs inspected after push

Direct Mode remains a **diagnostic limitation**, not a genuine PASS. The pinned v0.2.16 local Direct Mode harness raises `DecodingError: unexpected end of memory` during SDK import before Flowed contract execution is reached. Finalized Studionet evidence is therefore the authoritative live-runtime proof.
