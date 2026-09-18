const BASE = 'https://raw.githack.com/Ifem1/flowed/d2016d4d2a164fc557caaaa83aafdd40bf68129b';
const CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';

async function get(path) {
  const url = `${BASE}/${path}`;
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const text = await response.text();
  if (!text.trim()) throw new Error(`${url}: empty response`);
  return { url, text, contentType: response.headers.get('content-type') || '' };
}

const [index, styles, app, config, lossless] = await Promise.all([
  get('index.html'),
  get('styles.css'),
  get('app.js'),
  get('config.js'),
  get('lossless-json.js'),
]);

if (!index.contentType.toLowerCase().includes('text/html')) throw new Error(`Live HTML has wrong content type: ${index.contentType}`);
if (!styles.contentType.toLowerCase().includes('text/css')) throw new Error(`Live CSS has wrong content type: ${styles.contentType}`);
if (!app.contentType.toLowerCase().includes('javascript')) throw new Error(`Live app JS has wrong content type: ${app.contentType}`);
if (!config.contentType.toLowerCase().includes('javascript')) throw new Error(`Live config JS has wrong content type: ${config.contentType}`);
if (!lossless.contentType.toLowerCase().includes('javascript')) throw new Error(`Live lossless JS has wrong content type: ${lossless.contentType}`);
if (!index.text.includes('Work moves. Money follows.')) throw new Error('Live HTML missing Flowed identity');
if (!config.text.includes(CONTRACT)) throw new Error('Live config missing canonical contract');
if (!config.text.includes('chainId: 61999')) throw new Error('Live config missing Studionet chain 61999');
if (!config.text.includes('https://studio.genlayer.com/api')) throw new Error('Live config missing canonical RPC');
for (const method of ['get_flow_count', 'get_flow', 'get_active_step', 'get_accounting']) {
  if (!app.text.includes(method)) throw new Error(`Live app missing public read ${method}`);
}
for (const method of ['create_flow','accept_flow','review_active_step','contest_active_step','resolve_contest','finalize_active_step']) {
  if (!app.text.includes(method)) throw new Error(`Live app missing write ${method}`);
}
if (!app.text.includes('wallet_switchEthereumChain')) throw new Error('Live app missing wrong-network switch handling');
if (!app.text.includes('TransactionStatus.FINALIZED')) throw new Error('Live app missing finalized transaction handling');
if (!app.text.includes("parseLosslessJson")) throw new Error('Live app missing lossless contract JSON parsing');
if (!lossless.text.includes('stringifyJsonIntegers')) throw new Error('Live lossless JSON module missing');
if (app.text.includes('FLOWED_LIVE_FLOWS')) throw new Error('Live app contains forbidden mock flow source');
if (/private\s*key|private_key|FLOWED_PRIVATE_KEY/i.test(app.text + index.text)) {
  throw new Error('Live frontend exposes private-key wording');
}

console.log(JSON.stringify({
  status: 'PASS',
  liveFrontend: index.url,
  sourceCommit: 'd2016d4d2a164fc557caaaa83aafdd40bf68129b',
  contract: CONTRACT,
  chainId: 61999,
  resources: {
    html: index.contentType,
    css: styles.contentType,
    js: app.contentType,
    config: config.contentType,
    losslessJson: lossless.contentType,
  },
  publicReads: 'PASS',
  writeSurface: 'PASS',
  wrongNetworkHandling: 'PASS',
  finalizedHandlingPresent: 'PASS',
  losslessContractJson: 'PASS',
  mockFallbackAbsent: true,
  privateKeyUiAbsent: true,
}, null, 2));
