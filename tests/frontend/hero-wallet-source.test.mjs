import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [landingHtml, landingJs, appJs, appHtml] = await Promise.all([
  readFile(new URL('../../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../../landing.js', import.meta.url), 'utf8'),
  readFile(new URL('../../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../../app/index.html', import.meta.url), 'utf8'),
]);

test('hero labels map one-to-one to the five SVG route nodes', () => {
  const nodeIds = [...landingHtml.matchAll(/data-route-node="(\d+)"/g)].map((match) => match[1]);
  const labelIds = [...landingHtml.matchAll(/data-node-label="(\d+)"/g)].map((match) => match[1]);
  assert.deepEqual(nodeIds, ['0', '1', '2', '3', '4']);
  assert.deepEqual(labelIds, nodeIds);
  for (const phrase of ['FUNDED', 'STEP 01 ACTIVE', 'STEP 01 VERIFIED', '0.010 GEN RELEASED', 'STEP 02 ACTIVE']) {
    assert.ok(landingHtml.includes(phrase), phrase);
  }
});

test('hero route labels contain no confusing numbered badges', () => {
  assert.doesNotMatch(landingHtml, /class="node-label"[^>]*>\s*<span>0[1-5]<\/span>/);
});

test('responsive hero labels are positioned from rendered SVG node coordinates', () => {
  assert.ok(landingJs.includes('getBoundingClientRect()'));
  assert.ok(landingJs.includes("window.addEventListener('resize', scheduleRouteLabelPosition"));
  assert.ok(landingJs.includes('document.fonts?.ready'));
  assert.ok(landingJs.includes('ResizeObserver'));
  assert.ok(landingJs.includes('mobileOffsets'));
  assert.ok(landingJs.includes('data-node-label'));
});

test('wallet menu and wrong-chain control are present and accessible', () => {
  assert.ok(appHtml.includes('aria-haspopup="menu"'));
  assert.ok(appHtml.includes('role="menu"'));
  assert.ok(appHtml.includes('id="copy-wallet"'));
  assert.ok(appHtml.includes('id="disconnect-wallet"'));
  assert.ok(appHtml.includes('id="switch-wallet-network"'));
  assert.ok(appHtml.includes('id="chain-state"'));
  assert.ok(appJs.includes("event.key==='Escape'"));
});

test('simple connect does not force a network switch, but writes do', () => {
  const connectStart = appJs.indexOf('async function connectWallet()');
  const switchStart = appJs.indexOf('async function switchNetwork()');
  const connectBody = appJs.slice(connectStart, switchStart);
  assert.ok(connectBody.includes('eth_requestAccounts'));
  assert.doesNotMatch(connectBody, /switchNetwork|ensureWriteNetwork/);

  const walletClientStart = appJs.indexOf('async function walletClient()');
  const executeStart = appJs.indexOf('async function execute(');
  const walletClientBody = appJs.slice(walletClientStart, executeStart);
  assert.ok(walletClientBody.includes('ensureWriteNetwork(window.ethereum,state)'));
});

test('injected provider remains the only wallet source', () => {
  assert.ok(appJs.includes('window.ethereum'));
  assert.doesNotMatch(appJs + appHtml, /private\s*key|seed phrase|\bWalletConnect\b|\bPrivy\b|\bSnaps\b/i);
});
