import { createClient } from 'genlayer-js';
import type { Address } from 'viem';

export const flowedChain = {
  id: 61999,
  name: 'GenLayer Studionet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://studio.genlayer.com/api'] } }
} as const;

export const flowedAbi = [
  { type: 'function', name: 'get_flow', stateMutability: 'view', inputs: [{ name: 'flow_id', type: 'uint256' }], outputs: [{ type: 'tuple' }] },
  { type: 'function', name: 'get_accounting', stateMutability: 'view', inputs: [], outputs: [{ type: 'tuple' }] },
  { type: 'function', name: 'accept_flow', stateMutability: 'nonpayable', inputs: [{ name: 'flow_id', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'review_active_step', stateMutability: 'nonpayable', inputs: [{ name: 'flow_id', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'contest_active_step', stateMutability: 'payable', inputs: [{ name: 'flow_id', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'finalize_active_step', stateMutability: 'nonpayable', inputs: [{ name: 'flow_id', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'abandon_flow', stateMutability: 'nonpayable', inputs: [{ name: 'flow_id', type: 'uint256' }], outputs: [] }
] as const;

export function createReadClient() { return createClient({ chain: flowedChain }); }
export function createWalletClient(address: Address, provider: EIP1193Provider) { return createClient({ chain: flowedChain, account: address, provider }); }
export type EIP1193Provider = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
