# Build status

## Canonical deployment

- Contract implementation: ✅ frozen deployed `contracts/Flowed.py`
- Canonical deployed source: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Canonical contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Deployment tx: `0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`
- Network: GenLayer Studionet `61999`
- Runtime: `v0.2.16`
- Deployment receipt: ✅ `FINALIZED`
- Stable Studio leader execution: ✅ `SUCCESS`
- Contract source unchanged after deployment: ✅ SHA-256 `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`, Git blob `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Canonical live Studionet verification: ✅ automated on every push

## Application

- Live frontend: https://rawcdn.githack.com/Ifem1/flowed/d2016d4d2a164fc557caaaa83aafdd40bf68129b/index.html
- Frontend source snapshot: `d2016d4d2a164fc557caaaa83aafdd40bf68129b`
- Canonical contract wired in `config.js`: ✅
- Production build defaults to and enforces the canonical contract: ✅
- Public reads without wallet: ✅
- Injected wallet only / no browser private key: ✅
- Wrong-network detection and Studionet switch request: ✅
- Exact `BigInt` GEN handling: ✅
- Lossless contract JSON integer parsing: ✅
- Full production write surface: ✅
- FINALIZED success verification, including stable Studio leader receipt: ✅
- Flow list/detail/create/dashboard/history/accounting UI: ✅
- Fake/mock Flow fallback: none
- Public production resources and canonical config: ✅ checked by `scripts/verify_live_frontend.mjs`

## Verification and CI

- Contract tests: ✅
- Contract static / GenVM lint / SDK validation: ✅
- Frontend lint/typecheck/tests/build: ✅
- Canonical live Studionet verification: ✅
- Live frontend HTTP/config verification: ✅
- Direct Mode: ⚠️ **documented stable-runtime harness limitation**, not a PASS. The pinned harness raises `DecodingError: unexpected end of memory` while importing the v0.2.16 SDK before Flowed executes. Preserved tests remain diagnostic.

## Canonical 3-step demonstration

Immutable evidence is committed and ready. The real 0.03 GEN Flow has not yet been created because it requires funded payer and recipient wallet signatures. No Flow ID, lifecycle transaction hash, semantic label, snapshot digest, or final live accounting is invented.

The remaining execution is only the signed live lifecycle:

1. payer creates the 0.03 GEN three-step Flow
2. recipient accepts and reviews each active step
3. payer contests step 2 with exactly 0.0005 GEN
4. permissionless finalizers/contest resolver complete the lifecycle
5. finalized state and accounting are captured into `docs/LIVE_VERIFICATION.md`
