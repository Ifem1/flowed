# Versioned Future-Step Amendments

## Accepted baseline

Accepted repository baseline: `27bbd4574ec03244fb8841a8dc3abd84739780be` (`Mark Flowed build specification as historical`, 2026-09-19). Evidence: GitHub `main` and `master` both pointed to this commit; its parent chain includes the final Phase 3 closure commits, including `Finalize Phase 3 docs/DEPLOYMENT.md`, `Finalize Phase 3 docs/LIVE_VERIFICATION.md`, `Finalize Phase 3 SUBMISSION.md`, `Finalize Phase 3 README.md`, and `Add ready-to-paste Flowed submission copy`. That accepted state records the canonical contract and successful live Flow 1/Flow 2 evidence. The deployed contract source commit `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47` is distinct from this accepted repository baseline.

## Before

Accepted Flowed froze the complete workflow at creation. After acceptance, future-step criteria, evidence sources, and TTL could not change.

## After

Payer and recipient may mutually amend criteria, normalized HTTPS evidence sources, and TTL on future inactive steps. Exact proposal IDs and base versions prevent stale approval; only the counterparty can approve. Active and completed steps remain immutable. Step configuration versions and canonical SHA-256 digests are recorded, accepted amendment history is bounded, and primary/contest manifests identify the active version and digest. Escrow, tranche amounts, roles, ordering, contest economics, and released funds remain frozen.

Limits: at most 8 proposal attempts and 4 accepted amendments per step; at most 32 accepted history records per Flow. Proposals are terminalized on rejection, cancellation, or target activation.

## Verification

Local verification: Python contract/protocol suite `38 passed`; frontend suite `24 passed`; frontend lint, typecheck, contract syntax validation, production build, and `git diff --check` passed. GitHub Actions [Flowed CI](https://github.com/Ifem1/flowed/actions/runs/37661947807) passed, including Studionet preflight and both test suites. The separate [canonical live verifier](https://github.com/Ifem1/flowed/actions/runs/37661947878) passed against the accepted historical deployment and Flow 2 evidence; it is not amendment live proof.

GenVM lint's three static checks pass, but local SDK validation is blocked by Windows `Access is denied` loading the cached GenLayer SDK. Direct Mode was not achieved: local Windows failed in the `gltest` loader deleting its open temp file (`PermissionError`, WinError 32); on GitHub Linux, all six Direct Mode tests fail with `DecodingError: unexpected end of memory` while loading the pinned stable v0.2.16 contract, before contract logic executes. No Direct Mode pass is claimed.

## Deployment and live amendment demonstration

The accepted historical deployment is `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad` on GenLayer Studionet chain `61999`; keep its source and live evidence unchanged. The milestone contract requires a fresh deployment. Milestone address, deployment transaction, source fingerprint, and live 3-step amendment transactions must be recorded after actual finalized execution.

Live verification template: [AMENDMENT_LIVE_VERIFICATION.md](AMENDMENT_LIVE_VERIFICATION.md). Historical Flow 1/Flow 2 evidence remains in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

## Compare

Accepted baseline: `27bbd4574ec03244fb8841a8dc3abd84739780be`.
Implementation commit: `5db3383` (`add versioned future-step amendments`); build-safety follow-up: `a52487c`.
Compare URL: https://github.com/Ifem1/flowed/compare/27bbd4574ec03244fb8841a8dc3abd84739780be...a52487c

The branch is not deployed to production. Its build intentionally refuses to use the historical contract, and the accepted production app remains on the original deployment until a fresh milestone contract is finalized.
