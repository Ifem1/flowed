import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant, TransactionStatus } from 'genlayer-js/types';
import { parseLosslessJson } from '../lossless-json.js';

const CANONICAL_CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';
const CONTRACT = (process.env.FLOWED_CONTRACT_ADDRESS || CANONICAL_CONTRACT).trim();
const FLOW_ID = (process.env.FLOWED_FLOW_ID || '').trim();
const HASHES = (process.env.FLOWED_TX_HASHES || '').split(',').map((x) => x.trim()).filter(Boolean);

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
  const finalized = receipt?.statusName === TransactionStatus.FINALIZED || Number(receipt?.status) === 7;
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
}

console.log(JSON.stringify(output, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
