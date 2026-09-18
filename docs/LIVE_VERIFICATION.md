# Live verification

Only observed finalized Studionet artifacts are recorded here. No Direct Mode mock and no unexecuted demo transaction is represented as live proof.

## Canonical deployment

- Canonical source commit: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Canonical source SHA-256: `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`
- Canonical source Git blob: `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Canonical contract: `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`
- Deployment tx: `0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`
- Network: GenLayer Studionet
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Runtime: `v0.2.16`
- Runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
- Deployment status: **FINALIZED**
- Stable Studio leader execution: **SUCCESS**

Independent repository verification ran successfully in GitHub Actions run `35338071491` using `scripts/verify_canonical_live.mjs`.

Observed state from that finalized read:

```text
get_flow_count = 0

funded = 0
released = 0
refunded = 0
remaining = 0

bonds_received = 0
bonds_locked = 0
bonds_returned = 0
bonds_forfeited = 0
```

Observed global escrow invariant: **PASS**

Observed global bond invariant: **PASS**

## Stable loader probe

- Probe tx: `0x6b53ff06166a67e172c51af1d6bba0551a713a428d392b9235ae5860e45c95c1`
- Probe contract: `0xf07F18c1053E5f5fb4B54eBf954ff269e8226015`

The probe is runtime evidence only. It is **not** the Flowed production contract.

## Frontend

Canonical frontend configuration is committed and the production build targets only `0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`.

Live frontend URL: **not yet available**. GitHub Pages publishing is prepared, but the repository Pages setting must be enabled externally before the workflow can publish.

## Canonical 3-step Flow

Not yet executed. A real payer and recipient must sign the lifecycle transactions; therefore the following fields remain intentionally absent until actual finalized transactions exist:

- Flow ID
- create tx
- accept tx
- step 1 review/finalize txs
- step 2 review/contest/resolve txs
- step 3 review/finalize txs
- semantic manifest labels
- snapshot digests
- payer/recipient addresses
- final per-Flow escrow accounting
- final per-Flow bond accounting
- post-demo global accounting

The immutable evidence files are pinned at commit `eb7cfea7fa192517186334a900dba33ee6a70dd9`; see `docs/DEPLOYMENT.md` for the exact criteria, URLs, amounts, and bond.

## Direct Mode

The preserved v0.2.16 Direct Mode tests currently fail in the pinned local harness during SDK import with `DecodingError: unexpected end of memory`. Flowed contract execution is never reached in that harness failure. This limitation is kept visible as a diagnostic and is not called a pass. Finalized real Studionet deployment/read evidence above is authoritative for the stable runtime.
