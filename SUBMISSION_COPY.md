# Flowed submission copy

## Project name

Flowed

## Tagline

Work moves. Money follows.

## Short description

Flowed is a GenLayer Intelligent Contract for fully funded, sequential work. GenLayer verifies whether the active step satisfies frozen public evidence, while deterministic contract logic releases only the precommitted tranche and activates the next step.

## Medium description

Flowed turns multi-step funded work into a sequential on-chain state machine. A payer funds the entire workflow upfront, with each step freezing its exact amount, acceptance criteria, public HTTPS evidence sources, and timing before execution begins. Only the active step can be reviewed.

GenLayer is used for the part ordinary deterministic code cannot solve on its own: deciding whether the frozen evidence satisfies a natural-language completion criterion. The model never chooses payout amounts, recipients, ordering, refunds, or bond size. Those remain deterministic contract rules.

Flow 2 is the canonical live contest proof. It completed all three funded steps, including a step-2 contest resolved against the exact same stored evidence snapshot. Final accounting shows 0.03 GEN funded and released, with a 0.0005 GEN contest bond forfeited after the contest verdict remained SATISFIED.

## Technical description

Flowed uses GenLayer only at the semantic verification boundary. A primary review builds an equality-backed snapshot from creation-frozen HTTPS sources, hashes it, and classifies the active step as SATISFIED, NOT_SATISFIED, or INCONCLUSIVE. A SATISFIED review becomes provisional. If the payer contests, the contract reuses the exact stored primary snapshot instead of refetching evidence, and the payer must post the exact 5% bond.

Everything economic stays deterministic: full upfront escrow, 2–8 ordered steps, exact per-step tranches, active-step ordering, deadlines, bond amount, release/refund paths, accounting invariants, and next-step activation. The model cannot select payout amount or recipient.

## Live link

https://flowed-eight.vercel.app/

## Operational app

https://flowed-eight.vercel.app/app

## GitHub

https://github.com/Ifem1/flowed

## Canonical contract

0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad

## Network

GenLayer Studionet — Chain ID 61999

## Live proof summary

Flow 2 is the canonical contest demonstration. All nine lifecycle writes finalized successfully. All four semantic manifests are SATISFIED.

Step-2 primary digest:

fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7

Step-2 contest digest:

fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7

Same-snapshot contest: PASS.

Final Flow 2 accounting:

- 0.03 GEN funded
- 0.03 GEN released
- 0 refunded
- 0 remaining
- 0.0005 GEN bond received
- 0.0005 GEN bond forfeited
- 0 locked
- 0 returned
