# Flowed

**Work moves. Money follows.**

Flowed is a funded semantic workflow protocol: a payer freezes a sequence of work steps, acceptance criteria, evidence sources, timing, and tranche amounts. GenLayer reviews only the active step against a frozen evidence snapshot; deterministic contract logic moves the precommitted money.

## Current build

This repository contains the responsive product surface and interaction model for Flowed. It is a static, dependency-free frontend slice designed to be wired to the canonical GenLayer Studionet deployment (chain ID **61999**) once the pinned contract SDK and wallet credentials are available. It does not claim a live contract, deployment, or fake transaction success.

Open `index.html` in a browser to inspect the experience. The demo data is clearly presentational and is not a substitute for contract reads.

## Product boundary

The production implementation should use one contract, `contracts/Flowed.py`, with 2–8 ordered steps, exact 18-decimal GEN accounting, scalar `SATISFIED` / `NOT_SATISFIED` / `INCONCLUSIVE` consensus, frozen evidence, bounded contests, permissionless finalization, and no admin settlement.

## Next integration gate

Add the pinned `genlayer-js` client and contract once the deployment environment is available; then replace the presentational data in `app.js` with public reads and wallet-gated writes, wait for finalized execution, and record the canonical address, source commit, transaction hashes, and live 3-step verification in `docs/LIVE_VERIFICATION.md`.
