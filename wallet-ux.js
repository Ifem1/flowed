export const FLOWED_CHAIN_ID = 61999;
export const FLOWED_CHAIN_HEX = '0xf22f';
export const FLOWED_RPC = 'https://studio.genlayer.com/api';

export const FLOWED_CHAIN_PARAMS = Object.freeze({
  chainId: FLOWED_CHAIN_HEX,
  chainName: 'GenLayer Studionet',
  nativeCurrency: Object.freeze({ name: 'GEN', symbol: 'GEN', decimals: 18 }),
  rpcUrls: Object.freeze([FLOWED_RPC]),
});

export function shortenWalletAddress(address) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—';
}

export function parseChainId(chain) {
  if (typeof chain === 'number') return chain;
  return Number.parseInt(String(chain), 16);
}

export function disconnectFlowedState(state) {
  state.wallet = '';
  state.chainId = 0;
  return state;
}

export function applyChainChanged(state, chain) {
  state.chainId = parseChainId(chain);
  return state.chainId;
}

export function walletMenuItems(state) {
  if (!state.wallet) return [];
  const items = ['Copy address'];
  if (state.chainId !== FLOWED_CHAIN_ID) items.push('Switch to Studionet');
  items.push('Disconnect from Flowed');
  return items;
}

export async function copyFullWalletAddress(address, clipboard) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('No full wallet address is connected.');
  const target = clipboard || globalThis.navigator?.clipboard;
  if (!target?.writeText) throw new Error('Clipboard access is unavailable.');
  await target.writeText(address);
  return address;
}

export async function switchToStudionet(provider) {
  if (!provider?.request) throw new Error('No injected wallet provider found.');
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FLOWED_CHAIN_HEX }],
    });
  } catch (error) {
    if (error?.code !== 4902) throw error;
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [FLOWED_CHAIN_PARAMS],
    });
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FLOWED_CHAIN_HEX }],
    });
  }
  return FLOWED_CHAIN_ID;
}

export async function ensureWriteNetwork(provider, state) {
  if (state.chainId !== FLOWED_CHAIN_ID) {
    state.chainId = await switchToStudionet(provider);
  }
  return state.chainId;
}
