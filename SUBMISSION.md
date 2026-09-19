# Flowed submission

## What Flowed is

**Flowed — Work moves. Money follows.**

Flowed is a single GenLayer Intelligent Contract for funded, sequential work. A payer funds the complete workflow upfront. Each step freezes its tranche, criteria, evidence sources, and timing. Only the current step can be semantically reviewed.

**GenLayer verifies progression. Deterministic code moves funds.**

## Why GenLayer is necessary

Ordinary deterministic code can enforce funding, ordering, timing, accounting, and payment, but it cannot by itself determine whether public real-world evidence satisfies a natural-language completion criterion. Flowed uses GenLayer only for that semantic boundary.

The model is allowed to classify the frozen evidence snapshot as `SATISFIED`, `NOT_SATISFIED`, or `INCONCLUSIVE`. It does not choose payout amount, recipient, step ordering, active index, refund behavior, or contest bond.

## What the contract controls deterministically

- 2–8 ordered steps
- full upfront escrow
- exact per-step tranches
- one active step at a time
- activation-relative timing
- provisional completion
- exact 5% contest bond
- same-snapshot contest
- deterministic release/refund paths
- next-step activation
- escrow and bond invariants

## Live deployment

- Live app: https://flowed-eight.vercel.app/
- Operational app: https://flowed-eight.vercel.app/app
- Canonical contract: [`0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`](https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad)
- Network: GenLayer Studionet `61999`
- Canonical deployed source: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Deployment tx: [`0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`](https://explorer-studio.genlayer.com/tx/0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a)

## Live proof

Flow 1 demonstrates the ordinary no-contest path and also records a late contest that the contract correctly rejected after the frozen deadline.

Flow 2 is the canonical contest demonstration. Its lifecycle contains nine successful finalized writes:

| Stage | Transaction |
| --- | --- |
| Create | [`0x7b5dbc1a…c0b8e`](https://explorer-studio.genlayer.com/tx/0x7b5dbc1ab1df332f20a897bed45288a21405053df2a7ffeb82dafa70c71c0b8e) |
| Accept | [`0x6b193d63…9a120`](https://explorer-studio.genlayer.com/tx/0x6b193d6312fc4b482646eace05d4473231b90a2bc89637a3ea9aed926f79a120) |
| Step 1 review | [`0xc639056c…8b359`](https://explorer-studio.genlayer.com/tx/0xc639056ca6f54a53e8f639d1fb779cae1900fb72e2f6fb750609ada56448b359) |
| Step 1 finalize | [`0xa96b5385…107cad`](https://explorer-studio.genlayer.com/tx/0xa96b53858fa5f3e3461ab9afa11c46722105f7d0478f278d2e0c4bd386107cad) |
| Step 2 review | [`0x0e42e946…27686b4`](https://explorer-studio.genlayer.com/tx/0x0e42e9463eba647b404a52a16ae44a3d2dda9a9cff14debc01c6c657c27686b4) |
| Step 2 contest | [`0xe39a1ba4…80125`](https://explorer-studio.genlayer.com/tx/0xe39a1ba4061ea49d320c10c838ea8c7396dae233317304a58452c92332980125) |
| Step 2 resolve | [`0x599d6f1e…3e721`](https://explorer-studio.genlayer.com/tx/0x599d6f1e695201d041f272b9d430d0cec384ad8d790e590e07336f500803e721) |
| Step 3 review | [`0x45a816b8…88ce6`](https://explorer-studio.genlayer.com/tx/0x45a816b8c1a96b356984b692674cab6ba1eb5212e4b308dc350c8e1b05c88ce6) |
| Step 3 finalize | [`0x06b2ec62…91f7fc`](https://explorer-studio.genlayer.com/tx/0x06b2ec62f28dc79b41039d324d00e54554a1913c4b0c7ea69b4fa31ff591f7fc) |

All four semantic manifest labels are `SATISFIED`.

## Same-snapshot contest proof

Step-2 primary digest:

`fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7`

Step-2 contest digest:

`fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7`

**Same snapshot: PASS**

The contest does not refetch evidence or accept replacement evidence from either party.

## Final accounting

Flow 2 escrow:

`0.03 funded = 0.03 released + 0 refunded + 0 remaining`

**Escrow invariant: PASS**

Flow 2 bonds:

`0.0005 received = 0 locked + 0 returned + 0.0005 forfeited`

**Bond invariant: PASS**

Full receipt, manifest, digest, and Flow-1 evidence is recorded in [docs/LIVE_VERIFICATION.md](docs/LIVE_VERIFICATION.md).
