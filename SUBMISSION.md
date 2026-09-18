# Submission proof

Flowed turns funded work into a sequential semantic state machine: when GenLayer establishes that the active step is complete, deterministic contract logic releases its precommitted tranche and activates the next step.

## Canonical deployment proof

- source commit: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- deployment tx: `0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`
- network: GenLayer Studionet, chain `61999`
- runtime: `v0.2.16`
- runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
- deployment state independently reverified: `FINALIZED`
- stable Studio leader execution: `SUCCESS`
- source unchanged after deployment: SHA-256 `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`

## Live application

- production frontend: https://rawcdn.githack.com/Ifem1/flowed/6ec9f1dc880c0c18c05ebbad2044570fa3eac511/index.html
- frontend source snapshot: `6ec9f1dc880c0c18c05ebbad2044570fa3eac511`
- public resources/config verified automatically from the live URL
- canonical contract and Studionet 61999 are hard-wired in production config
- finalized public reads work without wallet
- writes use injected EIP-1193 wallet only
- exact GEN values use `BigInt`
- transaction completion requires FINALIZED successful stable Studio execution

## CI and runtime evidence

Contract tests, contract static validation, GenVM lint/SDK validation, frontend lint/typecheck/tests/build, canonical live Studionet verification, and live frontend verification are all repository gates.

The pinned Direct Mode harness cannot decode the stable v0.2.16 message format and raises `DecodingError: unexpected end of memory` during SDK import before Flowed executes. The tests remain in the repository and run transparently as a diagnostic; this limitation is not represented as a Direct Mode pass. The stable loader probe and full canonical Flowed deployment finalized successfully on real Studionet.

## Remaining signed proof

The required live 3-step Flow is intentionally not claimed before it exists. Immutable stage evidence and exact amounts are ready, but real payer/recipient signatures are still required for the 0.03 GEN lifecycle. `docs/LIVE_VERIFICATION.md` contains only observed finalized artifacts and will be extended with the signed lifecycle proofs.
