# Flowed

**Work moves. Money follows.**

Flowed is a funded semantic workflow protocol: a payer freezes a sequence of work steps, acceptance criteria, evidence sources, timing, and tranche amounts. GenLayer reviews only the active step against a frozen evidence snapshot; deterministic contract logic moves the precommitted money.

## Current build

This repository contains the Flowed contract, protocol tests, exact-money utilities, TypeScript protocol boundary, responsive product surface, deployment runner, and reviewer documentation. The contract targets GenLayer Studionet (chain ID **61999**) and does not claim a live contract, deployment, or fake transaction success.

Open `index.html` in a browser to inspect the experience. The demo data is clearly presentational and is not a substitute for contract reads.

## Product boundary

The production implementation should use one contract, `contracts/Flowed.py`, with 2–8 ordered steps, exact 18-decimal GEN accounting, scalar `SATISFIED` / `NOT_SATISFIED` / `INCONCLUSIVE` consensus, frozen evidence, bounded contests, permissionless finalization, and no admin settlement.

## Next integration gate

Install the pinned `genlayer-js` client in the deployment environment, bind `src/lib/protocol.ts` to its public reads and finalized wallet-gated writes, then run `node scripts/live_full.mjs` with secure `FLOWED_PRIVATE_KEY` and `FLOWED_CONTRACT_ADDRESS` values. Record the canonical address, source commit, transaction hashes, and live 3-step verification in `docs/LIVE_VERIFICATION.md`.
