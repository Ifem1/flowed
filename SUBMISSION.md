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
- current `get_flow_count()`: `0`
- current global accounting: all zero; escrow and bond invariants true
- source unchanged after deployment: SHA-256 `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`

## Repository proof

The browser is wired to the canonical address and uses finalized public reads without a wallet. Writes use an injected EIP-1193 wallet, enforce Studionet `61999`, construct GEN values with `BigInt`, and treat a transaction as complete only after finalized successful execution. The build refuses a non-canonical production address.

Contract tests, contract static validation, SDK validation, and the frontend validation pipeline are preserved in CI. Canonical live verification runs separately against the real Studionet deployment.

## Direct Mode boundary

The pinned Direct Mode harness cannot decode the stable v0.2.16 message format and raises `DecodingError: unexpected end of memory` during SDK import before Flowed executes. The tests remain in the repository and run as a transparent diagnostic; this limitation is not represented as a pass. The stable runtime loader probe and the full canonical Flowed deployment both finalized successfully on real Studionet.

## Remaining signed proof

The submission is not yet claiming the required live 3-step Flow. Immutable stage evidence is ready, but the real payer/recipient signatures and 0.03 GEN escrow transaction have not yet been supplied. `docs/LIVE_VERIFICATION.md` records only observed artifacts and will be extended after those finalized transactions exist.
