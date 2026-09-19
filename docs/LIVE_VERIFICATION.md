# Live verification

Only observed finalized Studionet artifacts are recorded here. Flow 2 is the canonical contest demonstration. Flow 1 is retained as valid historical evidence of the ordinary no-contest path and a correctly rejected late contest.

## Canonical deployment

- Canonical source commit: `c628a86951d59de4c774d89cb4c8ae5cbb1e4e47`
- Canonical source SHA-256: `0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4`
- Canonical source Git blob: `b8c351464cf876fedb1c1b0312670a1a4d693b5b`
- Canonical contract: [`0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`](https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad)
- Deployment tx: [`0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a`](https://explorer-studio.genlayer.com/tx/0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a)
- Network: GenLayer Studionet
- Chain ID: `61999`
- Runtime: `v0.2.16`
- Runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
- Deployment status: **FINALIZED**
- Stable Studio leader execution: **SUCCESS**

## Production frontend

- Landing: https://flowed-eight.vercel.app/
- Operational app: https://flowed-eight.vercel.app/app
- canonical contract/config verification: **PASS**
- public finalized reads: **PASS**
- injected-wallet write surface: **PASS**
- wallet dropdown / copy / Flowed-local disconnect: **PASS**
- Studionet switching and 4902 fallback: **PASS**
- exact GEN `BigInt` handling: **PASS**
- FINALIZED-success handling: **PASS**
- hero node anchoring and responsive landing behavior: **PASS**

## Flow 2 — canonical contest demonstration

- Flow ID: `2`
- Payer: `0x94d41755aa709f92fb30ebafa06c81208a6fe774`
- Recipient: `0xc0889b02c5e88bac6ca426dd8e4051c81c49c15b`
- Contest window: `600` seconds
- Final state: **COMPLETED**

All nine required lifecycle writes finalized successfully:

| Stage | Transaction | Result |
| --- | --- | --- |
| Create | [`0x7b5dbc1ab1df332f20a897bed45288a21405053df2a7ffeb82dafa70c71c0b8e`](https://explorer-studio.genlayer.com/tx/0x7b5dbc1ab1df332f20a897bed45288a21405053df2a7ffeb82dafa70c71c0b8e) | FINALIZED / SUCCESS |
| Accept | [`0x6b193d6312fc4b482646eace05d4473231b90a2bc89637a3ea9aed926f79a120`](https://explorer-studio.genlayer.com/tx/0x6b193d6312fc4b482646eace05d4473231b90a2bc89637a3ea9aed926f79a120) | FINALIZED / SUCCESS |
| Step 1 review | [`0xc639056ca6f54a53e8f639d1fb779cae1900fb72e2f6fb750609ada56448b359`](https://explorer-studio.genlayer.com/tx/0xc639056ca6f54a53e8f639d1fb779cae1900fb72e2f6fb750609ada56448b359) | FINALIZED / SUCCESS |
| Step 1 finalize | [`0xa96b53858fa5f3e3461ab9afa11c46722105f7d0478f278d2e0c4bd386107cad`](https://explorer-studio.genlayer.com/tx/0xa96b53858fa5f3e3461ab9afa11c46722105f7d0478f278d2e0c4bd386107cad) | FINALIZED / SUCCESS |
| Step 2 review | [`0x0e42e9463eba647b404a52a16ae44a3d2dda9a9cff14debc01c6c657c27686b4`](https://explorer-studio.genlayer.com/tx/0x0e42e9463eba647b404a52a16ae44a3d2dda9a9cff14debc01c6c657c27686b4) | FINALIZED / SUCCESS |
| Step 2 contest | [`0xe39a1ba4061ea49d320c10c838ea8c7396dae233317304a58452c92332980125`](https://explorer-studio.genlayer.com/tx/0xe39a1ba4061ea49d320c10c838ea8c7396dae233317304a58452c92332980125) | FINALIZED / SUCCESS |
| Step 2 resolve | [`0x599d6f1e695201d041f272b9d430d0cec384ad8d790e590e07336f500803e721`](https://explorer-studio.genlayer.com/tx/0x599d6f1e695201d041f272b9d430d0cec384ad8d790e590e07336f500803e721) | FINALIZED / SUCCESS |
| Step 3 review | [`0x45a816b8c1a96b356984b692674cab6ba1eb5212e4b308dc350c8e1b05c88ce6`](https://explorer-studio.genlayer.com/tx/0x45a816b8c1a96b356984b692674cab6ba1eb5212e4b308dc350c8e1b05c88ce6) | FINALIZED / SUCCESS |
| Step 3 finalize | [`0x06b2ec62f28dc79b41039d324d00e54554a1913c4b0c7ea69b4fa31ff591f7fc`](https://explorer-studio.genlayer.com/tx/0x06b2ec62f28dc79b41039d324d00e54554a1913c4b0c7ea69b4fa31ff591f7fc) | FINALIZED / SUCCESS |

### Semantic manifests

| Step | Phase | Label | Snapshot digest |
| --- | --- | --- | --- |
| 1 | PRIMARY | SATISFIED | `e6d63636d6eb793f1fca5951b1a85248851d493c5ca38f7486a272b8a7ea3642` |
| 2 | PRIMARY | SATISFIED | `fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7` |
| 2 | CONTEST | SATISFIED | `fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7` |
| 3 | PRIMARY | SATISFIED | `4e23cd4ac90bb6a944f33e744165129461af9216dfb1a02d8fb3109636ca7b26` |

Step-2 primary digest == step-2 contest digest: **PASS**

That equality is direct live evidence that the contest re-used the same stored evidence snapshot.

### Flow 2 final accounting

Escrow:

- funded: `0.03 GEN`
- released: `0.03 GEN`
- refunded: `0`
- remaining: `0`

Invariant: `0.03 = 0.03 + 0 + 0` — **PASS**

Bonds:

- received: `0.0005 GEN`
- locked: `0`
- returned: `0`
- forfeited: `0.0005 GEN`

Invariant: `0.0005 = 0 + 0 + 0.0005` — **PASS**

Global accounting delta produced by Flow 2:

- funded: `+0.03 GEN`
- released: `+0.03 GEN`
- refunded: `+0`
- remaining: `+0`
- bonds received: `+0.0005 GEN`
- bonds locked: `+0`
- bonds returned: `+0`
- bonds forfeited: `+0.0005 GEN`

## Flow 1 — normal-path historical proof

Flow 1 demonstrates the ordinary no-contest path and also records a late contest that the contract correctly rejected after the frozen deadline.

- Flow ID: `1`
- Payer: `0x77e2edbb43277bf772e207c517dde731935ffba5`
- Recipient: `0x6b476bf35c4968f3f1775c0ca2110591b4b5fcbe`
- Final state: **COMPLETED**
- funded: `0.03 GEN`
- released: `0.03 GEN`
- refunded: `0`
- remaining: `0`
- bonds: all zero
- three primary reviews: `SATISFIED`

Successful ordinary path:

| Stage | Transaction |
| --- | --- |
| Create | [`0x24e3683bb27ac0ab7af65e51bae41f2ea71d328586873c301baaa4951717cc57`](https://explorer-studio.genlayer.com/tx/0x24e3683bb27ac0ab7af65e51bae41f2ea71d328586873c301baaa4951717cc57) |
| Accept | [`0xad222ac9c5174982806a33ca0398eea53ef935be8170aa364d827bd49165de00`](https://explorer-studio.genlayer.com/tx/0xad222ac9c5174982806a33ca0398eea53ef935be8170aa364d827bd49165de00) |
| Step 1 review | [`0x7036b5139c24d3046a400fd68cb9e30014d2576955a61f8a9f5debd41a8eb7d1`](https://explorer-studio.genlayer.com/tx/0x7036b5139c24d3046a400fd68cb9e30014d2576955a61f8a9f5debd41a8eb7d1) |
| Step 1 finalize | [`0x5795788a8c7215ad54330e4666f40cd7010667182704d8e1b3567f3848fb6109`](https://explorer-studio.genlayer.com/tx/0x5795788a8c7215ad54330e4666f40cd7010667182704d8e1b3567f3848fb6109) |
| Step 2 review | [`0x060244ea431d4087b7685c3462107e46330f7fefc881835c400741f792242bdf`](https://explorer-studio.genlayer.com/tx/0x060244ea431d4087b7685c3462107e46330f7fefc881835c400741f792242bdf) |
| Step 2 finalize | [`0x1751c7f797cda65f4b5a33dd875bf270b15d4a3d3970d2f776d7108cacdd0c8e`](https://explorer-studio.genlayer.com/tx/0x1751c7f797cda65f4b5a33dd875bf270b15d4a3d3970d2f776d7108cacdd0c8e) |
| Step 3 review | [`0xd0380ae85b13dbb52c7cadb4316c430bdc3f44293bc64c0dec3fbd933c5c2cdc`](https://explorer-studio.genlayer.com/tx/0xd0380ae85b13dbb52c7cadb4316c430bdc3f44293bc64c0dec3fbd933c5c2cdc) |
| Step 3 finalize | [`0x568aab80358c5ef826dcea0aaf6217a931edcc5c47e82a80476ee72d1e4a7e84`](https://explorer-studio.genlayer.com/tx/0x568aab80358c5ef826dcea0aaf6217a931edcc5c47e82a80476ee72d1e4a7e84) |

Late step-2 contest attempt:

[`0x7e75ed9192054c566dad0ecd6e65123058b58029950a455c241024f9a75b3432`](https://explorer-studio.genlayer.com/tx/0x7e75ed9192054c566dad0ecd6e65123058b58029950a455c241024f9a75b3432)

That transaction finalized with an execution error because the 60-second contest deadline had already expired. It is **not** included among successful lifecycle transactions and is not a protocol failure; it demonstrates enforcement of the frozen contest deadline.

## Automated re-verification

`.github/workflows/canonical-live.yml` runs:

1. `scripts/verify_canonical_live.mjs`
2. `scripts/live_full.mjs` against Flow 2 and its nine canonical lifecycle hashes
3. `scripts/verify_live_frontend.mjs` against the production Vercel deployment

## Direct Mode

The preserved stable v0.2.16 Direct Mode suite remains diagnostic. The pinned local harness fails during SDK import with `DecodingError: unexpected end of memory` before Flowed contract execution begins. This is documented as a verifier/harness limitation, not as a protocol failure and not as a Direct Mode pass.
