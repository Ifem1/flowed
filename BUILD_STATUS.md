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
- Current live `get_flow_count()`: `0`
- Current live global accounting: ✅ all zero
- Current live escrow and bond invariants: ✅
- Contract source unchanged after deployment: ✅ SHA-256 `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`, Git blob `b8c351464cf876fedb1c1b0312670a1a4d693b5b`

## Application

- Canonical contract wired in `config.js`: ✅
- Production build defaults to and enforces the canonical contract: ✅
- Public reads without wallet: ✅
- Injected wallet only / no browser private key: ✅
- Wrong-network detection and Studionet switch request: ✅
- Exact `BigInt` GEN handling: ✅
- Full production write surface: ✅
- FINALIZED success verification, including stable Studio leader receipt: ✅
- Flow list/detail/create/dashboard/history/accounting UI: ✅
- Fake/mock Flow fallback: none
- Frontend production hosting: ⚠️ build is ready; GitHub Pages is not enabled for the repository, so the prepared Pages workflow cannot publish until an administrator enables Pages with GitHub Actions as the source.

## Verification and CI

- Contract tests: ✅
- Contract static / GenVM lint / SDK validation: ✅
- Frontend lint/typecheck/tests/build: ✅ on the corrected integration code; final HEAD run must be inspected before closure
- Canonical live Studionet verification: ✅ GitHub Actions run `35338071491`
- Direct Mode: ⚠️ documented stable-runtime harness limitation. The pinned harness raises `DecodingError: unexpected end of memory` while importing the v0.2.16 SDK before Flowed executes. Preserved tests remain diagnostic and CI does not mislabel them as PASS.

## Canonical 3-step demonstration

Immutable evidence is committed and ready. The real 0.03 GEN Flow has not been created yet because it requires funded payer and recipient wallet signatures. No Flow ID, lifecycle transaction hash, semantic label, snapshot digest, or final live accounting is invented.

Remaining external actions before final submission closure:

1. enable GitHub Pages for this repository (or connect an approved production hosting provider), then run `Flowed Frontend Production`
2. sign the canonical 3-step Flow lifecycle using real payer/recipient wallets
3. record the resulting finalized proof in `docs/LIVE_VERIFICATION.md`
