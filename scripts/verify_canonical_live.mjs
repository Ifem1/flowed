import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, TransactionHashVariant, TransactionStatus } from 'genlayer-js/types';

const RPC = 'https://studio.genlayer.com/api';
const CHAIN_ID = 61999n;
const CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';
const DEPLOYMENT_TX = '0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a';

async function rpc(method, params = []) {
  const response = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!response.ok) throw new Error(`${method}: HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
}

const rpcChainId = BigInt(await rpc('eth_chainId'));
if (rpcChainId !== CHAIN_ID) {
  throw new Error(`Wrong live RPC chain: expected ${CHAIN_ID}, got ${rpcChainId}`);
}
if (BigInt(studionet.id) !== CHAIN_ID) {
  throw new Error(`genlayer-js studionet mismatch: expected ${CHAIN_ID}, got ${studionet.id}`);
}

const client = createClient({ chain: studionet });
const deploymentReceipt = await client.waitForTransactionReceipt({
  hash: DEPLOYMENT_TX,
  status: TransactionStatus.FINALIZED,
  fullTransaction: true,
});
const deploymentFinalized =
  deploymentReceipt.statusName === TransactionStatus.FINALIZED ||
  Number(deploymentReceipt.status) === 7;
const deploymentSucceeded =
  deploymentReceipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN ||
  Number(deploymentReceipt.txExecutionResult) === 1;
if (!deploymentFinalized || !deploymentSucceeded) {
  throw new Error(
    `Canonical deployment finalized without successful execution: ${JSON.stringify({
      status: deploymentReceipt.status,
      statusName: deploymentReceipt.statusName,
      txExecutionResult: deploymentReceipt.txExecutionResult,
      txExecutionResultName: deploymentReceipt.txExecutionResultName,
      result: deploymentReceipt.result,
      resultName: deploymentReceipt.resultName,
    })}`,
  );
}

const read = (functionName, args = []) =>
  client.readContract({
    address: CONTRACT,
    functionName,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });

const flowCount = await read('get_flow_count');
const accounting = await read('get_accounting');
const normalize = (value) =>
  JSON.parse(JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item)));

const a = normalize(accounting);
const escrowInvariant =
  BigInt(a.funded) === BigInt(a.released) + BigInt(a.refunded) + BigInt(a.remaining);
const bondInvariant =
  BigInt(a.bonds_received) ===
  BigInt(a.bonds_locked) + BigInt(a.bonds_returned) + BigInt(a.bonds_forfeited);

if (!escrowInvariant) throw new Error('Global escrow invariant failed on live canonical contract');
if (!bondInvariant) throw new Error('Global bond invariant failed on live canonical contract');

console.log(
  JSON.stringify(
    {
      status: 'PASS',
      network: 'GenLayer Studionet',
      chainId: Number(rpcChainId),
      rpc: RPC,
      contract: CONTRACT,
      deploymentTx: DEPLOYMENT_TX,
      deployment: {
        status: 'FINALIZED',
        statusName: deploymentReceipt.statusName,
        txExecutionResult: deploymentReceipt.txExecutionResult,
        execution: deploymentReceipt.txExecutionResultName || ExecutionResult.FINISHED_WITH_RETURN,
      },
      flowCount: flowCount.toString(),
      accounting: a,
      escrowInvariant,
      bondInvariant,
    },
    null,
    2,
  ),
);
