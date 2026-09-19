# Deployment

## Canonical production deployment

Flowed is already deployed. Do **not** redeploy or modify `contracts/Flowed.py`.

- Network: **GenLayer Studionet**
- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Explorer: https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad
- Canonical contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Canonical deployed source commit: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Source SHA-256: `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`
- Git blob: `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a
- Runtime: `v0.2.16`
- Depends runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
- Constructor arguments: none
- Constructor value: `0 GEN`

`scripts/deploy_preflight.mjs` guards the local source fingerprint and chain. `scripts/verify_canonical_live.mjs` rechecks the deployment receipt, finalized public reads, and global accounting equations.

## Production frontend

Production is live:

- https://flowed-eight.vercel.app/
- https://flowed-eight.vercel.app/app

Vercel builds `npm run build` to `dist`. Production configuration defaults to the canonical contract and rejects any different `FLOWED_CONTRACT_ADDRESS`.

Live frontend verification:

```bash
FLOWED_LIVE_FRONTEND=https://flowed-eight.vercel.app \
node scripts/verify_live_frontend.mjs
```

## Immutable evidence

Immutable evidence commit: `eb7cfea7fa192517186334a900dba33ee6a70dd9`.

Sources:

1. https://raw.githubusercontent.com/Ifem1/flowed/eb7cfea7fa192517186334a900dba33ee6a70dd9/demo-evidence/step-1.txt
2. https://raw.githubusercontent.com/Ifem1/flowed/eb7cfea7fa192517186334a900dba33ee6a70dd9/demo-evidence/step-2.txt
3. https://raw.githubusercontent.com/Ifem1/flowed/eb7cfea7fa192517186334a900dba33ee6a70dd9/demo-evidence/step-3.txt

Each Flow uses three `0.01 GEN` tranches for total escrow `0.03 GEN`. A step contest requires the exact 5% bond: `0.0005 GEN`.

## Live demonstrations

### Flow 1

Flow 1 is the normal-path historical proof. It completed all three steps through the ordinary no-contest finalization path. A late step-2 contest attempt was correctly rejected after the frozen 60-second contest deadline. See [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) for hashes and final accounting.

### Flow 2

Flow 2 is the canonical contest demonstration. Its contest window was `600` seconds. Step 2 was reviewed `SATISFIED`, contested with the exact `0.0005 GEN` bond, resolved `SATISFIED` against the stored primary snapshot, and released with the bond forfeited to the recipient.

Step-2 primary and contest digest:

`fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7`

Same snapshot: **PASS**

Do not create another Flow for submission evidence. Flow 2 is the primary demo.

## Canonical Flow-2 verifier

After a clean `npm ci`:

```bash
FLOWED_FLOW_ID=2 \
FLOWED_EXPECT_CANONICAL_DEMO=1 \
FLOWED_TX_HASHES="0x7b5dbc1ab1df332f20a897bed45288a21405053df2a7ffeb82dafa70c71c0b8e,0x6b193d6312fc4b482646eace05d4473231b90a2bc89637a3ea9aed926f79a120,0xc639056ca6f54a53e8f639d1fb779cae1900fb72e2f6fb750609ada56448b359,0xa96b53858fa5f3e3461ab9afa11c46722105f7d0478f278d2e0c4bd386107cad,0x0e42e9463eba647b404a52a16ae44a3d2dda9a9cff14debc01c6c657c27686b4,0xe39a1ba4061ea49d320c10c838ea8c7396dae233317304a58452c92332980125,0x599d6f1e695201d041f272b9d430d0cec384ad8d790e590e07336f500803e721,0x45a816b8c1a96b356984b692674cab6ba1eb5212e4b308dc350c8e1b05c88ce6,0x06b2ec62f28dc79b41039d324d00e54554a1913c4b0c7ea69b4fa31ff591f7fc" \
node scripts/live_full.mjs
```
