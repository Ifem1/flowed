import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, TransactionHashVariant, TransactionStatus } from 'genlayer-js/types';

const CONTRACT = (process.env.FLOWED_CONTRACT_ADDRESS || '').trim();
const FLOW_ID = (process.env.FLOWED_FLOW_ID || '').trim();
const HASHES = (process.env.FLOWED_TX_HASHES || '').split(',').map((x) => x.trim()).filter(Boolean);

if (!/^0x[a-fA-F0-9]{40}$/.test(CONTRACT)) throw new Error('Set FLOWED_CONTRACT_ADDRESS to the canonical Studionet contract');
if (studionet.id !== 61999) throw new Error(`Wrong genlayer-js network definition: ${studionet.id}`);

const client = createClient({ chain: studionet });
const read = (functionName, args = []) => client.readContract({
  address: CONTRACT,
  functionName,
  args,
  transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
});

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
  if (!/^0x[a-fA-F0-9]+$/.test(hash)) throw new Error(`Invalid transaction hash: ${hash}`);
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED });
  const success = receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN;
  if (!success) throw new Error(`${hash} finalized without successful execution: ${receipt.txExecutionResultName}`);
  output.transactions.push({ hash, finalized: true, execution: receipt.txExecutionResultName });
}

if (FLOW_ID) {
  if (!/^\d+$/.test(FLOW_ID) || FLOW_ID === '0') throw new Error('FLOWED_FLOW_ID must be a positive integer');
  const raw = await read('get_flow', [BigInt(FLOW_ID)]);
  const flow = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const activeRaw = await read('get_active_step', [BigInt(FLOW_ID)]);
  output.flowId = FLOW_ID;
  output.flow = flow;
  output.activeStep = activeRaw ? (typeof activeRaw === 'string' ? JSON.parse(activeRaw) : activeRaw) : null;
  output.escrowInvariant = BigInt(flow.funded) === BigInt(flow.released) + BigInt(flow.refunded) + BigInt(flow.remaining);
  output.bondInvariant = BigInt(flow.bonds_received) === BigInt(flow.bonds_locked) + BigInt(flow.bonds_returned) + BigInt(flow.bonds_forfeited);
  if (!output.escrowInvariant || !output.bondInvariant) throw new Error('Live Flow accounting invariant failed');
}

console.log(JSON.stringify(output, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
