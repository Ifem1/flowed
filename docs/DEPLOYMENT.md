# Deployment

## Canonical target

- Network: **GenLayer Studionet**
- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Production source: `contracts/Flowed.py`
- GenVM contract layout: `v0.3.0`
- Constructor arguments: none
- Constructor value: `0 GEN`

Do not use `61997`, `studio-dev`, or Bradbury for the canonical Flowed deployment.

## Preflight — no signature required

Run:

```bash
node scripts/deploy_preflight.mjs
```

Optionally include the intended deployer so the preflight also reads its current RPC balance:

```bash
DEPLOYER_ADDRESS=0xYourAddress node scripts/deploy_preflight.mjs
```

The script fails if the RPC is not chain `61999`, the production class/SDK pin is unexpected, or the constructor is not zero-argument. It prints the exact Git commit and SHA-256 of `contracts/Flowed.py`.

## Canonical deployment

Official CLI form:

```bash
genlayer deploy --contract contracts/Flowed.py --rpc https://studio.genlayer.com/api
```

No `--args` are supplied because `Flowed.__init__` has no constructor arguments.

Equivalent Studio UI flow:

1. Open `https://studio.genlayer.com`.
2. Confirm the environment is **Studionet (61999)**.
3. Add `contracts/Flowed.py` from file and open it.
4. Confirm Constructor Inputs is empty.
5. Connect/select the funded deployer account.
6. Click **Deploy** and approve the wallet transaction.
7. Wait for finalized success and record the contract address and deployment transaction.

The deployment transaction requires a funded wallet signature. Flowed itself sends no constructor value; the wallet must only cover the network deployment fee shown by the current Studionet client/Studio quote.

## Post-deployment repository closure

After a canonical address exists:

1. set `contractAddress` in `config.js` to the canonical address
2. build with `FLOWED_CONTRACT_ADDRESS=<address> npm run build`
3. deploy the static frontend
4. run `FLOWED_CONTRACT_ADDRESS=<address> node scripts/live_full.mjs` to confirm finalized public reads
5. execute the required 3-step live Flow with tiny real GEN
6. pass its Flow ID and finalized tx hashes back through `scripts/live_full.mjs`
7. record only actual proof in `docs/LIVE_VERIFICATION.md`
8. rerun GitHub Actions and make the closure commit

## Required live Flow

Use `0.03 GEN` escrow with three `0.01 GEN` steps and commit-pinned immutable public evidence. Prove both the no-contest finalization path and the step-2 contest path with exact `0.0005 GEN` bond. Final escrow accounting must be `0.03 = 0.03 + 0 + 0`; final bond accounting must be `0.0005 = 0 + 0 + 0.0005`.