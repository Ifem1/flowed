import { createRequire } from 'node:module';
import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus, TransactionHashVariant } from 'genlayer-js/types';
import { parseLosslessJson } from '../lossless-json.js';

const CONTRACT = '0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443';
const SKIP_AMENDMENT = process.env.FLOWED_SKIP_AMENDMENT === '1';
const CLI_ROOT = `${process.env.APPDATA}/npm/node_modules/genlayer`;
const require = createRequire(import.meta.url);
const keytar = require(`${CLI_ROOT}/node_modules/keytar`);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const asJson = (value) => typeof value === 'string' ? parseLosslessJson(value) : value;

async function signer(name) {
  const key = await keytar.getPassword('genlayer-cli', `account:${name}`);
  if (!key) throw new Error(`GenLayer account ${name} is not unlocked in Windows Credential Manager`);
  const account = createAccount(key);
  return { client: createClient({ chain: studionet, account }), address: account.address };
}

const payer = await signer('truss-deployer');
const recipient = await signer('truss-live-cycle');
const reader = createClient({ chain: studionet });
const transactions = [];

async function write(client, method, args, value = 0n) {
  const hash = await client.writeContract({ address: CONTRACT, functionName: method, args, value });
  console.log(`${method}: submitted ${hash}`);
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, fullTransaction: true, retries: 600, interval: 5000 });
  const leaderRaw = receipt?.consensus_data?.leader_receipt;
  const leaders = Array.isArray(leaderRaw) ? leaderRaw : leaderRaw ? [leaderRaw] : [];
  const finalized = receipt?.statusName === 'FINALIZED' || Number(receipt?.status) === 7;
  const success = receipt?.txExecutionResultName === 'FINISHED_WITH_RETURN' || Number(receipt?.txExecutionResult) === 1 || leaders.some((item) => item?.execution_result === 'SUCCESS');
  if (!finalized || !success) throw new Error(`${method} failed: ${JSON.stringify({ status: receipt?.statusName ?? receipt?.status, result: receipt?.txExecutionResultName ?? receipt?.txExecutionResult })}`);
  transactions.push({ method, hash, status: receipt.statusName ?? 'FINALIZED', result: 'SUCCESS' });
  return hash;
}

async function read(method, args = []) {
  return reader.readContract({ address: CONTRACT, functionName: method, args, transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
}

async function waitOutContest(flowId) {
  while (true) {
    const flow = asJson(await read('get_flow', [flowId]));
    const seconds = Number(flow.contest_deadline) - Math.floor(Date.now() / 1000) + 1;
    if (seconds <= 0) return;
    console.log(`Contest window: waiting ${seconds}s`);
    await wait(Math.min(seconds * 1000, 15000));
  }
}

const flowId = BigInt(process.env.FLOWED_LIVE_FLOW_ID || (BigInt(await read('get_flow_count')) + 1n));
const amount = 10_000_000_000_000_000n;
const total = amount * 3n;
const source = (number) => [{ label: `Flowed milestone evidence step ${number}`, url: `https://raw.githubusercontent.com/Ifem1/flowed/5ede53d8a2a1ec164df5d2f4962e3dda2d908c92/demo-evidence/step-${number}.txt`, required: true }];
const steps = [1, 2, 3].map((number) => ({
  title: `Milestone evidence step ${number}`,
  criteria: `The evidence states that Flowed demo stage ${number} is complete.`,
  amount_wei: amount.toString(),
  ttl_seconds: 3600,
  sources: source(number),
}));
const now = BigInt(Math.floor(Date.now() / 1000));
console.log(JSON.stringify({ contract: CONTRACT, flowId: String(flowId), payer: payer.address, recipient: recipient.address, escrowWei: String(total) }));

let flow = asJson(await read('get_flow', [flowId]).catch(() => null));
if (!flow) {
  if (flowId !== BigInt(await read('get_flow_count')) + 1n) throw new Error(`Flow ${flowId} does not exist and is not the next flow ID`);
  await write(payer.client, 'create_flow', [
    recipient.address,
    'Flowed future-step amendment lifecycle',
    'Three-step funded live proof of mutually approved future-step amendment.',
    now + 7200n,
    60n,
    total,
    JSON.stringify(steps),
  ], total);
  flow = asJson(await read('get_flow', [flowId]));
}
if (flow.title !== 'Flowed future-step amendment lifecycle' || flow.payer.toLowerCase() !== payer.address.toLowerCase() || flow.recipient.toLowerCase() !== recipient.address.toLowerCase()) {
  throw new Error(`Flow ${flowId} exists but does not match the expected lifecycle parties/title; refusing to mutate it.`);
}
if (flow.state === 'OFFERED') await write(recipient.client, 'accept_flow', [flowId]);

while (true) {
  flow = asJson(await read('get_flow', [flowId]));
  if (flow.state === 'COMPLETED') break;
  if (flow.state !== 'ACTIVE' && flow.state !== 'PROVISIONAL') throw new Error(`Flow ${flowId} entered unexpected state ${flow.state}`);
  const stepIndex = Number(flow.active);
  if (!SKIP_AMENDMENT && stepIndex === 1 && Number(flow.steps[2].version) === 1) {
    let pending = flow.steps[2].pending_amendment;
    if (!pending) {
      await write(payer.client, 'propose_step_amendment', [
        flowId,
        2n,
        'Version two: the evidence states that Flowed demo stage 3 is complete and confirms completion under the amended criterion.',
        JSON.stringify(source(3)),
        7200n,
      ]);
      flow = asJson(await read('get_flow', [flowId]));
      pending = flow.steps[2].pending_amendment;
    }
    if (!pending) throw new Error('Amendment proposal missing after finalized proposal transaction');
    const proposalId = BigInt(pending.proposal_id);
    await write(recipient.client, 'approve_step_amendment', [flowId, 2n, proposalId]);
    console.log(`Amendment approved: proposal ${proposalId}`);
    flow = asJson(await read('get_flow', [flowId]));
  }
  if (flow.state === 'ACTIVE') {
    await write(recipient.client, 'review_active_step', [flowId]);
    flow = asJson(await read('get_flow', [flowId]));
    const label = flow.steps[stepIndex].last_review_label;
    console.log(`Step ${stepIndex + 1} review label: ${label}`);
    if (label !== 'SATISFIED') throw new Error(`Step ${stepIndex + 1} semantic result was ${label}; stopping without finalizing a failed step.`);
  }
  await waitOutContest(flowId);
  await write(recipient.client, 'finalize_active_step', [flowId]);
}

flow = asJson(await read('get_flow', [flowId]));
const accounting = await read('get_accounting');
const history = asJson(await read('get_step_amendment_history', [flowId, 0n, 32n]));
const active = flow.state === 'COMPLETED' ? null : asJson(await read('get_active_step', [flowId]));
const result = {
  network: 'GenLayer Studionet', chainId: 61999, contract: CONTRACT, flowId: String(flowId),
  payer: flow.payer, recipient: flow.recipient, state: flow.state,
  funded: String(flow.funded), released: String(flow.released), refunded: String(flow.refunded), remaining: String(flow.remaining),
  escrowInvariant: BigInt(flow.funded) === BigInt(flow.released) + BigInt(flow.refunded) + BigInt(flow.remaining),
  amendmentHistory: history, step3Version: flow.steps[2].version, step3ConfigDigest: flow.steps[2].config_digest,
  step3Manifest: flow.manifests.find((item) => Number(item.step_index) === 2 && item.phase === 'PRIMARY'),
  activeStep: active, accounting, transactions,
};
if (flow.state !== 'COMPLETED' || !result.escrowInvariant || BigInt(flow.released) !== total || (!SKIP_AMENDMENT && Number(flow.steps[2].version) !== 2)) {
  throw new Error(`Lifecycle verification failed: ${JSON.stringify(result)}`);
}
console.log(`FINAL_EVIDENCE ${JSON.stringify(result)}`);
