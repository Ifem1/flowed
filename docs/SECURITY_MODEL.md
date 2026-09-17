# Security model

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

## Trust assumptions and limits

GenLayer consensus evaluates supplied public evidence; it does not guarantee the underlying evidence is objectively true. Participants remain responsible for choosing criteria and sources that can meaningfully establish completion. The contract performs textual URL hardening for HTTPS and obvious local/private hosts; the GenLayer web runtime remains part of the trust boundary for network resolution, redirects, and fetch isolation. Wallet key security and injected-wallet behavior are outside the contract.

Direct Mode semantic mocks prove deterministic integration boundaries, not live external-model truth. Only finalized Studionet artifacts may be described as live proof.