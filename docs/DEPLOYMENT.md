# Deployment

## Canonical production deployment

Flowed is already deployed. Do **not** redeploy or modify `contracts/Flowed.py`.

- Network: **GenLayer Studionet**
- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Canonical contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Canonical deployed source commit: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Source SHA-256: `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`
- Git blob: `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Deployment transaction: `0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`
- Runtime: `v0.2.16`
- Depends runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
- Constructor arguments: none
- Constructor value: `0 GEN`

`scripts/deploy_preflight.mjs` is a post-deployment source/chain guard. It fails if the local production source no longer matches the canonical deployed SHA-256/Git blob or if the configured RPC is not chain `61999`.

`scripts/verify_canonical_live.mjs` independently verifies the canonical deployment transaction reaches `FINALIZED`, checks stable Studio leader execution, reads the canonical contract at `LATEST_FINAL`, and verifies global accounting equations.

## Production frontend

The production frontend is intended for Vercel.

Repository deployment settings are fixed in `vercel.json`:

- build command: `npm run build`
- output directory: `dist`
- framework preset: none/static

The build defaults to the canonical Flowed contract and rejects any different `FLOWED_CONTRACT_ADDRESS`.

Deploy the current `master` branch in Vercel, then verify the resulting URL:

```bash
FLOWED_LIVE_FRONTEND=https://<your-vercel-domain> node scripts/verify_live_frontend.mjs
```

Only after that verifier passes should the Vercel URL be recorded as the canonical live frontend.

## Canonical live demo payload

Use exactly three steps and total escrow `0.03 GEN`:

- each tranche: `0.01 GEN` = `10000000000000000` wei
- total: `0.03 GEN` = `30000000000000000` wei
- step-2 contest bond: `0.0005 GEN` = `500000000000000` wei
- contest window: `60` seconds
- recommended step TTL: `3600` seconds
- acceptance deadline: a future timestamp when the payer signs

Frozen criteria and immutable sources:

1. criterion: `The evidence states that Flowed demo stage 1 is complete.`
   source: `https://raw.githubusercontent.com/Ifem1/flowed/eb7cfea7fa192517186334a900dba33ee6a70dd9/demo-evidence/step-1.txt`
2. criterion: `The evidence states that Flowed demo stage 2 is complete.`
   source: `https://raw.githubusercontent.com/Ifem1/flowed/eb7cfea7fa192517186334a900dba33ee6a70dd9/demo-evidence/step-2.txt`
3. criterion: `The evidence states that Flowed demo stage 3 is complete.`
   source: `https://raw.githubusercontent.com/Ifem1/flowed/eb7cfea7fa192517186334a900dba33ee6a70dd9/demo-evidence/step-3.txt`

The payer and recipient must be distinct real wallet addresses. Never paste a private key into the browser or repository.

## Required finalized lifecycle

1. payer creates the Flow with exactly `0.03 GEN`
2. recipient accepts
3. recipient reviews step 1; after `SATISFIED` and the 60-second contest window, permissionlessly finalize
4. recipient reviews step 2; payer contests with exactly `0.0005 GEN`; resolve against the same stored snapshot
5. recipient reviews step 3; after `SATISFIED` and the 60-second contest window, permissionlessly finalize
6. read per-Flow and global accounting and record only finalized observed values

Use `scripts/live_full.mjs` to re-read finalized state and supplied transaction hashes after the signed lifecycle exists.
