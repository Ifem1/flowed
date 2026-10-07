# Future-step amendment live verification

All entries below come from finalized Studionet receipts and latest-final contract reads. Historical deployment evidence in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) is unchanged.

## Current production frontend

The current production frontend is [https://flowed-eight.vercel.app/](https://flowed-eight.vercel.app/) (`/app`), deployed to Vercel as `dpl_DEF7gsLfzwfENfDJfyh3Xue7DKSy` with Production status `READY`. Its live `/config.js` returns HTTP 200 and identifies GenLayer Studionet chain `61999` and milestone contract `0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443`. The app route returns HTTP 200. Browser inspection confirmed Flow 1 and Flow 2 render; Flow 2 shows Step 3 version 2, config digest `249d2ad58a658c7a0babf7de3e40ca47b45039557edf60eae51dc3652e252f9e`, amendment history, and manifests with step version/config digest. The completed Flow exposes no wallet action controls. Wallet connection, wrong-network gating, and amendment role/state gating are covered by the frontend tests; no injected wallet provider was available in the live browser session for an on-chain wallet interaction.

## Milestone deployment

| Field | Value |
| --- | --- |
| Network / chain | GenLayer Studionet / `61999` |
| Historical contract | [`0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad`](https://explorer-studio.genlayer.com/address/0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad) (unchanged) |
| Milestone contract | [`0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443`](https://explorer-studio.genlayer.com/address/0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443) |
| Deployment transaction | [`0x90f6de1e85f2308fe0cfbe803e58bbcdbc3219a3f7682a11b3d6dc4184990bb1`](https://explorer-studio.genlayer.com/tx/0x90f6de1e85f2308fe0cfbe803e58bbcdbc3219a3f7682a11b3d6dc4184990bb1) — FINALIZED / SUCCESS |
| Deployed source commit | `5ede53d8a2a1ec164df5d2f4962e3dda2d908c92` |
| Contract source SHA-256 | `97332aa0cfb4f8d0a497421e466ab30953d93cebfb60661cbf6d1121ca88aea8` |
| Contract source Git blob | `8c12fd7524fb29e68097ce3adb0c348c791edcc7` |
| Runtime / runner | GenLayer `v0.2.16` / `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` |
| Constructor | No arguments; `0 GEN` |

## Flow 1 — ordinary three-step completion

Flow 1 completed all three steps without amendments or contests. Each fixed tranche was `0.01 GEN`; the full `0.03 GEN` escrow was released.

| Stage | Finalized transaction |
| --- | --- |
| Create | [`0xb55cc8b115ec7a84478b4d577bf0a43bfef3386b6f07dd569fc7a90f85d2c108`](https://explorer-studio.genlayer.com/tx/0xb55cc8b115ec7a84478b4d577bf0a43bfef3386b6f07dd569fc7a90f85d2c108) |
| Recipient accepts | [`0x409dcba4ad7c964e2d4077adeedb19052dd24bd6cc66adcb26ee01e76de5be8e`](https://explorer-studio.genlayer.com/tx/0x409dcba4ad7c964e2d4077adeedb19052dd24bd6cc66adcb26ee01e76de5be8e) |
| Step 1 review / release | [`0xff8a4cd68c0d1945b5606b392747042a2e458d67efb7bc9be03daebe38445747`](https://explorer-studio.genlayer.com/tx/0xff8a4cd68c0d1945b5606b392747042a2e458d67efb7bc9be03daebe38445747) / [`0x6c659afbea237d51d4fc075a4a26396469886b5dd93eca3a133b11936bcd1de9`](https://explorer-studio.genlayer.com/tx/0x6c659afbea237d51d4fc075a4a26396469886b5dd93eca3a133b11936bcd1de9) |
| Step 2 review / release | [`0xdb3b9deff9b02d19ef5e98baf495280e9646d95cafc2999580112484d0f183e1`](https://explorer-studio.genlayer.com/tx/0xdb3b9deff9b02d19ef5e98baf495280e9646d95cafc2999580112484d0f183e1) / [`0x8426a17667263f291fab759c03d3d0ebb5f64884dc6c5b2a4f4a598cc8cbc93b`](https://explorer-studio.genlayer.com/tx/0x8426a17667263f291fab759c03d3d0ebb5f64884dc6c5b2a4f4a598cc8cbc93b) |
| Step 3 review / release | [`0x30a1ec35036cc74b5c570690c440a7bb4a2c3af86a993bef9f8a9f0e4367440c`](https://explorer-studio.genlayer.com/tx/0x30a1ec35036cc74b5c570690c440a7bb4a2c3af86a993bef9f8a9f0e4367440c) / [`0x762ab2526f7051b832e5bb13d89d3f78c81003b007a3519ffe8c4a4c5e27004a`](https://explorer-studio.genlayer.com/tx/0x762ab2526f7051b832e5bb13d89d3f78c81003b007a3519ffe8c4a4c5e27004a) |

Final state: `COMPLETED`; funded/released `30000000000000000` wei; refunded/remaining `0`.

## Flow 2 — mutually approved step 3 amendment

Flow 2 is the amendment proof. Payer `0x39680bd423437C0Eaa18493629652821Ec672C61` and recipient `0xA49c51d759790116D451f256654dD9F0549D341F` funded three fixed `0.01 GEN` tranches. While step 2 was active and step 3 remained future, the payer proposed proposal `1`; the recipient approved it. Step 3 then activated at version 2 and reviewed against its amended criteria.

| Stage | Finalized transaction |
| --- | --- |
| Create | [`0x6df769a79c40646b87a12bc2539dfd631afedb5a8dbbea85ef3c7f95d459ddd1`](https://explorer-studio.genlayer.com/tx/0x6df769a79c40646b87a12bc2539dfd631afedb5a8dbbea85ef3c7f95d459ddd1) |
| Recipient accepts | [`0x9c79d946759579375c6151e75e73a92d77fbf2f2b664f57c8c1a13ba22c1e4f1`](https://explorer-studio.genlayer.com/tx/0x9c79d946759579375c6151e75e73a92d77fbf2f2b664f57c8c1a13ba22c1e4f1) |
| Step 1 review / release | [`0xecca422599d2244cff0dab936ba7aab9824b5ae086910b8ef2a2aa68de18e1e9`](https://explorer-studio.genlayer.com/tx/0xecca422599d2244cff0dab936ba7aab9824b5ae086910b8ef2a2aa68de18e1e9) / [`0x5dfb628d1330f6531d683dc72c0ad88f27cc1e8a391200f6ec8d210edfe01669`](https://explorer-studio.genlayer.com/tx/0x5dfb628d1330f6531d683dc72c0ad88f27cc1e8a391200f6ec8d210edfe01669) |
| Amendment proposal 1 | [`0xb57873fe6303da0d9e499198b7643dd456b93c811b2adb0750c4873b2c297c0f`](https://explorer-studio.genlayer.com/tx/0xb57873fe6303da0d9e499198b7643dd456b93c811b2adb0750c4873b2c297c0f) |
| Counterparty approval | [`0xdfa776340942cbf9617b18dfb0eb7d8125704fcf7be9c47453db27414ae728e8`](https://explorer-studio.genlayer.com/tx/0xdfa776340942cbf9617b18dfb0eb7d8125704fcf7be9c47453db27414ae728e8) |
| Step 2 review / release | [`0x84bee8d27a05ffe98d92a420a67e7d295494fe83bcdf39e6f70adad8a0fdc4fe`](https://explorer-studio.genlayer.com/tx/0x84bee8d27a05ffe98d92a420a67e7d295494fe83bcdf39e6f70adad8a0fdc4fe) / [`0xd55a17e4ba48d78937c57a1b2803978554ccc5846fe6a94094610649a20dd98f`](https://explorer-studio.genlayer.com/tx/0xd55a17e4ba48d78937c57a1b2803978554ccc5846fe6a94094610649a20dd98f) |
| Step 3 v2 review / release | [`0xbe8a517365de6c2d08118da9aceb26921dd8a206abbe2f6d58948b109f1b4523`](https://explorer-studio.genlayer.com/tx/0xbe8a517365de6c2d08118da9aceb26921dd8a206abbe2f6d58948b109f1b4523) / [`0x98b4ea0c2f12a3f8055f1777dd6099fc80d12ebbd5bd104e865867e564f49510`](https://explorer-studio.genlayer.com/tx/0x98b4ea0c2f12a3f8055f1777dd6099fc80d12ebbd5bd104e865867e564f49510) |

Final state: `COMPLETED`; funded/released `30000000000000000` wei; refunded/remaining `0`. All three primary semantic manifests were `SATISFIED`.

Step 3 version/digest: `2` / `249d2ad58a658c7a0babf7de3e40ca47b45039557edf60eae51dc3652e252f9e`.

Step 3 v2 manifest: phase `PRIMARY`, label `SATISFIED`, config digest `249d2ad58a658c7a0babf7de3e40ca47b45039557edf60eae51dc3652e252f9e`, snapshot digest `9cc5dca53030853f0fcb779e48a737c51f5367fcbbe85967f1ab49d7d4e7619e`.

Amendment history records proposal `1`, target step index `2`, old/new versions `1`/`2`, old digest `8cfd37468de869fbf3c9e04786049546b1aa3e29b87d2c0bcb4f806e360dde80`, new digest above, payer as proposer, and recipient as approver.

## Final accounting

Across both Flows: funded `60000000000000000` wei; released `60000000000000000`; refunded `0`; remaining `0`. Escrow invariant holds for each Flow and globally. Bonds received, locked, returned, and forfeited are all `0`.
