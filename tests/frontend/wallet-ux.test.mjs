import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FLOWED_CHAIN_ID,
  FLOWED_CHAIN_HEX,
  FLOWED_CHAIN_PARAMS,
  applyChainChanged,
  copyFullWalletAddress,
  disconnectFlowedState,
  ensureWriteNetwork,
  switchToStudionet,
  walletMenuItems,
} from '../../wallet-ux.js';

const ADDRESS = '0x95b3000000000000000000000000000000005375';

test('wallet menu exposes correct actions for correct and wrong chain', () => {
  assert.deepEqual(walletMenuItems({ wallet: ADDRESS, chainId: FLOWED_CHAIN_ID }), [
    'Copy address',
    'Disconnect from Flowed',
  ]);
  assert.deepEqual(walletMenuItems({ wallet: ADDRESS, chainId: 61997 }), [
    'Copy address',
    'Switch to Studionet',
    'Disconnect from Flowed',
  ]);
});

test('copy uses the full 42-character wallet address', async () => {
  let copied = '';
  const clipboard = { writeText: async (value) => { copied = value; } };
  const result = await copyFullWalletAddress(ADDRESS, clipboard);
  assert.equal(result, ADDRESS);
  assert.equal(copied, ADDRESS);
  assert.equal(copied.length, 42);
});

test('local disconnect resets Flowed connection but preserves public read state', () => {
  const flows = [{ id: '1' }];
  const accounting = { funded: '1' };
  const state = { wallet: ADDRESS, chainId: FLOWED_CHAIN_ID, flows, accounting, selected: '1' };
  disconnectFlowedState(state);
  assert.equal(state.wallet, '');
  assert.equal(state.chainId, 0);
  assert.equal(state.flows, flows);
  assert.equal(state.accounting, accounting);
  assert.equal(state.selected, '1');
});

test('wrong-chain switch requests Studionet 61999 directly', async () => {
  const calls = [];
  const provider = { request: async (request) => { calls.push(request); return null; } };
  const result = await switchToStudionet(provider);
  assert.equal(result, FLOWED_CHAIN_ID);
  assert.deepEqual(calls, [{
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: FLOWED_CHAIN_HEX }],
  }]);
});

test('4902 fallback adds Studionet and retries the switch', async () => {
  const calls = [];
  let first = true;
  const provider = {
    request: async (request) => {
      calls.push(request);
      if (request.method === 'wallet_switchEthereumChain' && first) {
        first = false;
        const error = new Error('unknown chain');
        error.code = 4902;
        throw error;
      }
      return null;
    },
  };
  await switchToStudionet(provider);
  assert.equal(calls[0].method, 'wallet_switchEthereumChain');
  assert.equal(calls[1].method, 'wallet_addEthereumChain');
  assert.deepEqual(calls[1].params[0], FLOWED_CHAIN_PARAMS);
  assert.equal(calls[2].method, 'wallet_switchEthereumChain');
  assert.equal(calls[2].params[0].chainId, '0xf22f');
});

test('chainChanged updates local chain state without reload semantics', () => {
  const state = { chainId: 0 };
  assert.equal(applyChainChanged(state, '0xf22f'), FLOWED_CHAIN_ID);
  assert.equal(state.chainId, FLOWED_CHAIN_ID);
  assert.equal(applyChainChanged(state, '0xf22d'), 61997);
});

test('wrong-network write preparation switches before returning', async () => {
  const calls = [];
  const provider = { request: async (request) => { calls.push(request.method); return null; } };
  const state = { wallet: ADDRESS, chainId: 61997 };
  await ensureWriteNetwork(provider, state);
  assert.equal(calls[0], 'wallet_switchEthereumChain');
  assert.equal(state.chainId, FLOWED_CHAIN_ID);
});
