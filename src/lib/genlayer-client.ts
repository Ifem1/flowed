import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus, TransactionHashVariant } from 'genlayer-js/types';
import type { CalldataEncodable, Hash } from 'genlayer-js/types';
import type { Address } from 'viem';
import type { CreateFlowPayload } from './protocol';

export const flowedChain = studionet;
export const FLOWED_CHAIN_ID = 61999;
export const FLOWED_RPC = 'https://studio.genlayer.com/api';

if (flowedChain.id !== FLOWED_CHAIN_ID) {
  throw new Error(`genlayer-js studionet chain mismatch: expected ${FLOWED_CHAIN_ID}, got ${flowedChain.id}`);
}

export type EIP1193Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

export function createReadClient() {
  return createClient({ chain: flowedChain });
}

export function createWalletClient(address: Address, provider: EIP1193Provider) {
  return createClient({ chain: flowedChain, account: address, provider });
}

export async function connectStudionet(client: ReturnType<typeof createWalletClient>) {
  await client.connect('studionet');
}

export async function getFlowCount(client: ReturnType<typeof createReadClient>, address: Address) {
  return client.readContract({ address, functionName: 'get_flow_count', args: [], transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
}

export async function getFlow(client: ReturnType<typeof createReadClient>, address: Address, flowId: bigint) {
  return client.readContract({ address, functionName: 'get_flow', args: [flowId], transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
}

export async function getActiveStep(client: ReturnType<typeof createReadClient>, address: Address, flowId: bigint) {
  return client.readContract({ address, functionName: 'get_active_step', args: [flowId], transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
}

export async function getAccounting(client: ReturnType<typeof createReadClient>, address: Address) {
  return client.readContract({ address, functionName: 'get_accounting', args: [], transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
}

type WalletClient = ReturnType<typeof createWalletClient>;

async function write(client: WalletClient, address: Address, functionName: string, args: CalldataEncodable[], value = 0n): Promise<Hash> {
  return client.writeContract({ address, functionName, args, value });
}

export function createFlow(client: WalletClient, address: Address, payload: CreateFlowPayload) {
  return write(client, address, 'create_flow', [payload.recipient, payload.title, payload.summary, payload.accept_by, payload.contest_window_seconds, payload.escrow_amount, payload.steps_json], payload.escrow_amount);
}
export function acceptFlow(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'accept_flow', [flowId]); }
export function declineFlow(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'decline_flow', [flowId]); }
export function withdrawOffer(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'withdraw_offer', [flowId]); }
export function expireUnacceptedFlow(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'expire_unaccepted_flow', [flowId]); }
export function reviewActiveStep(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'review_active_step', [flowId]); }
export function contestActiveStep(client: WalletClient, address: Address, flowId: bigint, bond: bigint) { return write(client, address, 'contest_active_step', [flowId], bond); }
export function resolveContest(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'resolve_contest', [flowId]); }
export function finalizeActiveStep(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'finalize_active_step', [flowId]); }
export function finalizeStalledContest(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'finalize_stalled_contest', [flowId]); }
export function abandonFlow(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'abandon_flow', [flowId]); }
export function expireActiveFlow(client: WalletClient, address: Address, flowId: bigint) { return write(client, address, 'expire_active_flow', [flowId]); }

export async function waitForFinalizedSuccess(client: ReturnType<typeof createReadClient>, hash: Hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, fullTransaction: true } as any);
  const finalized =
    receipt.statusName === TransactionStatus.FINALIZED || Number(receipt.status) === 7;
  const leaderReceiptRaw = (receipt as any).consensus_data?.leader_receipt;
  const leaderReceipts = Array.isArray(leaderReceiptRaw)
    ? leaderReceiptRaw
    : leaderReceiptRaw
      ? [leaderReceiptRaw]
      : [];
  const succeeded =
    receipt.txExecutionResultName === 'FINISHED_WITH_RETURN' ||
    Number(receipt.txExecutionResult) === 1 ||
    leaderReceipts.some((item: any) => item?.execution_result === 'SUCCESS');
  if (!finalized || !succeeded) {
    throw new Error(`GenLayer transaction finalized without success: ${String(receipt.txExecutionResultName ?? receipt.txExecutionResult ?? 'unknown')}`);
  }
  return receipt;
}
