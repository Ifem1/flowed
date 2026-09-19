import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant, TransactionStatus } from 'genlayer-js/types';
import { parseLosslessJson } from '../lossless-json.js';

const CANONICAL_CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';
const CONTRACT = (process.env.FLOWED_CONTRACT_ADDRESS || CANONICAL_CONTRACT).trim();
const FLOW_ID = (process.env.FLOWED_FLOW_ID || '').trim();
const HASHES = (process.env.FLOWED_TX_HASHES || '').split(',').map((x) => x.trim()).filter(Boolean);
const EXPECT_CANONICAL_DEMO = process.env.FLOWED_EXPECT_CANONICAL_DEMO === '1';

if (CONTRACT.toLowerCase() !== CANONICAL_CONTRACT.toLowerCase()) {
  throw new Error('Live verification must target the canonical Flowed contract');
}
if (studionet.id !== 61999) throw new Error(`Wrong genlayer-js network definition: ${studionet.id}`);

const client = createClient({ chain: studionet });
const read = (functionName, args = []) => client.readContract({
  address: CONTRACT,
  functionName,
  args,
  transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
});

function finalizedSuccess(receipt) {
  const finalized = receipt?.statusName === 'FINALIZED' || Number(receipt?.status) === 7;
  const leaderRaw = receipt?.consensus_data?.leader_receipt;
  const leaders = Array.isArray(leaderRaw) ? leaderRaw : leaderRaw ? [leaderRaw] : [];
  const executionOk =
    receipt?.txExecutionResultName === 'FINISHED_WITH_RETURN' ||
    Number(receipt?.txExecutionResult) === 1 ||
    leaders.some((item) => item?.execution_result === 'SUCCESS');
  return finalized && executionOk;
}

const count = await read('get_flow_count');
const accounting = await read('get_accounting');
const output = {
  network: 'GenLayer Studionet',
  chainId: 61999,
  contract: CONTRACT,
  flowCount: count.toString(),
  accounting,
  transactions: [],
};

for (const hash of HASHES) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) throw new Error(`Invalid transaction hash: ${hash}`);
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    fullTransaction: true,
  });
  if (!finalizedSuccess(receipt)) {
    throw new Error(`${hash} finalized without successful execution: ${JSON.stringify({
      status: receipt?.status,
      statusName: receipt?.statusName,
      txExecutionResult: receipt?.txExecutionResult,
      txExecutionResultName: receipt?.txExecutionResultName,
    })}`);
  }
  const leaderRaw = receipt?.consensus_data?.leader_receipt;
  const leaders = Array.isArray(leaderRaw) ? leaderRaw : leaderRaw ? [leaderRaw] : [];
  output.transactions.push({
    hash,
    finalized: true,
    statusName: receipt?.statusName || 'FINALIZED',
    execution: receipt?.txExecutionResultName || leaders.map((item) => item?.execution_result).filter(Boolean),
  });
}

if (FLOW_ID) {
  if (!/^\d+$/.test(FLOW_ID) || FLOW_ID === '0') throw new Error('FLOWED_FLOW_ID must be a positive integer');
  const raw = await read('get_flow', [BigInt(FLOW_ID)]);
  const flow = parseLosslessJson(raw);
  const activeRaw = await read('get_active_step', [BigInt(FLOW_ID)]);
  output.flowId = FLOW_ID;
  output.flow = flow;
  output.activeStep = activeRaw ? parseLosslessJson(activeRaw) : null;
  output.escrowInvariant = BigInt(flow.funded) === BigInt(flow.released) + BigInt(flow.refunded) + BigInt(flow.remaining);
  output.bondInvariant = BigInt(flow.bonds_received) === BigInt(flow.bonds_locked) + BigInt(flow.bonds_returned) + BigInt(flow.bonds_forfeited);
  if (!output.escrowInvariant || !output.bondInvariant) throw new Error('Live Flow accounting invariant failed');

  if (EXPECT_CANONICAL_DEMO) {
    if (FLOW_ID !== '2') throw new Error('Canonical demo expectation is defined for Flow 2');
    if (HASHES.length !== 9) throw new Error(`Canonical Flow 2 expects 9 successful lifecycle hashes, got ${HASHES.length}`);
    if (flow.state !== 'COMPLETED') throw new Error(`Flow 2 state mismatch: ${flow.state}`);
    if (String(flow.payer).toLowerCase() !== '0x94d41755aa709f92fb30ebafa06c81208a6fe774') throw new Error('Flow 2 payer mismatch');
    if (String(flow.recipient).toLowerCase() !== '0xc0889b02c5e88bac6ca426dd8e4051c81c49c15b') throw new Error('Flow 2 recipient mismatch');

    const expectWei = {
      funded: 30000000000000000n,
      released: 30000000000000000n,
      refunded: 0n,
      remaining: 0n,
      bonds_received: 500000000000000n,
      bonds_locked: 0n,
      bonds_returned: 0n,
      bonds_forfeited: 500000000000000n,
    };
    for (const [key, expected] of Object.entries(expectWei)) {
      if (BigInt(flow[key]) !== expected) throw new Error(`Flow 2 ${key} mismatch: ${flow[key]}`);
    }

    const manifests = Array.isArray(flow.manifests) ? flow.manifests : [];
    if (manifests.length !== 4) throw new Error(`Flow 2 manifest count mismatch: ${manifests.length}`);
    if (!manifests.every((item) => item.label === 'SATISFIED')) throw new Error('Flow 2 has a non-SATISFIED semantic manifest');

    const primary = manifests.find((item) => String(item.step_index) === '1' && item.phase === 'PRIMARY');
    const contest = manifests.find((item) => String(item.step_index) === '1' && item.phase === 'CONTEST');
    const expectedDigest = 'fe4b6c2d245ede0e8ebfe4bc921f5240fee34fad5ac507cfc9e43c9f268506c7';
    if (!primary || !contest) throw new Error('Flow 2 step-2 primary/contest manifests are missing');
    if (primary.snapshot_digest !== expectedDigest || contest.snapshot_digest !== expectedDigest) {
      throw new Error('Flow 2 step-2 digest mismatch');
    }

    const expectedPrimaryDigests = [
      'e6d63636d6eb793f1fca5951b1a85248851d493c5ca38f7486a272b8a7ea3642',
      expectedDigest,
      '4e23cd4ac90bb6a944f33e744165129461af9216dfb1a02d8fb3109636ca7b26',
    ];
    for (let index = 0; index < 3; index += 1) {
      const manifest = manifests.find((item) => String(item.step_index) === String(index) && item.phase === 'PRIMARY');
      if (!manifest || manifest.snapshot_digest !== expectedPrimaryDigests[index]) {
        throw new Error(`Flow 2 primary digest mismatch for step ${index + 1}`);
      }
    }

    const flow1 = parseLosslessJson(await read('get_flow', [1n]));
    if (flow1.state !== 'COMPLETED') throw new Error(`Flow 1 state mismatch: ${flow1.state}`);
    output.flow1 = {
      state: flow1.state,
      funded: flow1.funded,
      released: flow1.released,
      refunded: flow1.refunded,
      remaining: flow1.remaining,
      bonds_received: flow1.bonds_received,
      bonds_locked: flow1.bonds_locked,
      bonds_returned: flow1.bonds_returned,
      bonds_forfeited: flow1.bonds_forfeited,
      primaryLabels: (flow1.manifests || []).filter((item) => item.phase === 'PRIMARY').map((item) => item.label),
    };

    const expectedGlobal = {
      funded: 60000000000000000n,
      released: 60000000000000000n,
      refunded: 0n,
      remaining: 0n,
      bonds_received: 500000000000000n,
      bonds_locked: 0n,
      bonds_returned: 0n,
      bonds_forfeited: 500000000000000n,
    };
    for (const [key, expected] of Object.entries(expectedGlobal)) {
      if (BigInt(accounting[key]) !== expected) throw new Error(`Global ${key} mismatch: ${accounting[key]}`);
    }

    output.canonicalDemo = {
      status: 'PASS',
      successfulLifecycleTransactions: HASHES.length,
      allSemanticLabelsSatisfied: true,
      step2PrimaryDigest: primary.snapshot_digest,
      step2ContestDigest: contest.snapshot_digest,
      sameSnapshot: primary.snapshot_digest === contest.snapshot_digest,
      escrowInvariant: output.escrowInvariant,
      bondInvariant: output.bondInvariant,
      globalAccounting: accounting,
    };
  }
}

console.log(JSON.stringify(output, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
