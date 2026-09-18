# Security model

## Canonical deployment boundary

The production contract is frozen at commit `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`, SHA-256 `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`, and Git blob `b8c351464cf876fedb1c1b0312670a1a4d693b5b`. The canonical deployment is `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad` on Studionet `61999`. Repository automation rechecks the source fingerprint and canonical live deployment rather than silently redeploying.

## Protected properties

Flowed freezes economic and semantic terms at creation. The production contract enforces:

- one payer and one distinct non-zero recipient
- 2–8 ordered steps
- exact full funding at creation
- exact sum of step tranches equals escrow and `message.value`
- no review of future or completed steps
- activation-relative deadlines
- each tranche and refund settles at most once
- no model-selected amount, recipient, ordering, active index, refund, or bond
- global and per-Flow escrow accounting invariants
- global and per-Flow contest-bond accounting invariants
- bounded exits for every nonterminal state

## Evidence and prompt injection

Evidence is untrusted. Creation accepts only bounded HTTPS source manifests and rejects duplicates. The runtime fetches only those frozen URLs. Non-2xx, empty, or unavailable required sources map to `SOURCE_UNAVAILABLE`; unavailable optional sources remain represented. Bodies are truncated individually before canonical serialization, so the canonical JSON document itself is never cut mid-document.

The consensus prompt explicitly instructs the model to ignore instructions in evidence, not follow links found in evidence, judge only the frozen acceptance criteria against the frozen snapshot, and emit exactly one allowed scalar semantic label.

A primary `SATISFIED` stores the equality-backed snapshot and its SHA-256 digest. Contest uses the exact stored snapshot; it does not perform a new web fetch and parties cannot add contest evidence.

## Liveness and griefing

- unaccepted offers can be declined, withdrawn, or expired
- active work can be retried, abandoned by the recipient, or expired permissionlessly
- infrastructure/ambiguity states receive only a fixed recovery grace
- `NOT_SATISFIED` receives no infrastructure extension
- provisional approval becomes permissionlessly finalizable after the contest window
- a payer contest requires the exact 5% bond
- contested infra/ambiguity can be retried, but a fixed stalled-contest timeout returns the bond and releases the already primary-approved tranche
- review and contest attempt counts are bounded

These rules prevent either participant from indefinitely trapping remaining escrow or a contest bond by disappearing.

## Money safety

Every settlement path moves accounting/state before calling the finalized GEN transfer mechanism. State transitions and zero/remaining checks prevent replay of payouts, refunds, and bond settlement. The contest bond is separately accounted from escrow.

The browser uses integer `BigInt` GEN handling. It does not expose private-key entry and never treats a transaction hash or an `ACCEPTED` state as settlement success. Stable Studio writes must reach `FINALIZED` and show successful execution before the UI reports completion.

## Trust assumptions and limits

GenLayer consensus evaluates supplied public evidence; it does not guarantee the underlying evidence is objectively true. Participants remain responsible for choosing criteria and sources that can meaningfully establish completion. The contract performs textual URL hardening for HTTPS and obvious local/private hosts; the GenLayer web runtime remains part of the trust boundary for network resolution, redirects, and fetch isolation. Wallet key security and injected-wallet behavior are outside the contract.

The pinned local Direct Mode harness currently fails before Flowed execution while decoding the stable v0.2.16 runtime message. That limitation is kept visible and is not treated as semantic proof. Only finalized Studionet artifacts are described as live evidence.
