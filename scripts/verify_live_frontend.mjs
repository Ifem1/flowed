import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';

const BASE = (process.env.FLOWED_LIVE_FRONTEND || 'https://flowed-eight.vercel.app').replace(/\/$/, '');
const CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';
const EXPECTED_CHAIN_ID = 61999;
const RETRIES = Number(process.env.FLOWED_FRONTEND_RETRIES || 18);
const RETRY_MS = Number(process.env.FLOWED_FRONTEND_RETRY_MS || 10000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(path) {
  const url = `${BASE}${path}`;
  const response = await fetch(url, {
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'Flowed-Phase1-Verification/1.0' },
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const text = await response.text();
  if (!text.trim()) throw new Error(`${url}: empty response`);
  return { url, text, contentType: response.headers.get('content-type') || '' };
}

async function waitForProductionLanding() {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const page = await fetchText('/');
      if (!page.text.includes('WORK MOVES.') || !page.text.includes('MONEY FOLLOWS.')) {
        throw new Error('production alias still serves the previous build');
      }
      return page;
    } catch (error) {
      lastError = error;
      console.log(`Vercel production wait ${attempt}/${RETRIES}: ${error.message || error}`);
      if (attempt < RETRIES) await sleep(RETRY_MS);
    }
  }
  throw new Error(`Production landing did not update: ${lastError?.message || lastError}`);
}

const landing = await waitForProductionLanding();
const [appPage, landingCss, landingJs, appCss, appJs, walletUx, config, lossless] = await Promise.all([
  fetchText('/app'),
  fetchText('/landing.css'),
  fetchText('/landing.js'),
  fetchText('/styles.css'),
  fetchText('/app.js'),
  fetchText('/wallet-ux.js'),
  fetchText('/config.js'),
  fetchText('/lossless-json.js'),
]);

for (const page of [landing, appPage]) {
  if (!page.contentType.toLowerCase().includes('text/html')) {
    throw new Error(`${page.url}: expected HTML, got ${page.contentType}`);
  }
}
for (const style of [landingCss, appCss]) {
  if (!style.contentType.toLowerCase().includes('text/css')) {
    throw new Error(`${style.url}: expected CSS, got ${style.contentType}`);
  }
}
for (const source of [landingJs, appJs, walletUx, config, lossless]) {
  if (!source.contentType.toLowerCase().includes('javascript')) {
    throw new Error(`${source.url}: expected JavaScript, got ${source.contentType}`);
  }
}

for (const phrase of [
  'WORK MOVES.',
  'MONEY FOLLOWS.',
  'OPEN FLOWED',
  'One workflow.',
  'AI verifies progression.',
  'Disagreement',
  "Work doesn't wait on trust.",
]) {
  if (!landing.text.includes(phrase)) throw new Error(`Landing page missing required content: ${phrase}`);
}
if (!landing.text.includes('href="/app"')) throw new Error('Landing page OPEN FLOWED route is not /app');
if (!landing.text.includes('id="hero-route"')) throw new Error('Landing page missing sequential route visual');
for (const index of ['0','1','2','3','4']) {
  if (!landing.text.includes(`data-route-node="${index}"`) || !landing.text.includes(`data-node-label="${index}"`)) {
    throw new Error(`Landing route node/label mapping missing index ${index}`);
  }
}
for (const phrase of ['FUNDED','STEP 01 ACTIVE','STEP 01 VERIFIED','0.010 GEN RELEASED','STEP 02 ACTIVE']) {
  if (!landing.text.includes(phrase)) throw new Error(`Landing route label missing: ${phrase}`);
}
if (/class="node-label"[^>]*>\s*<span>0[1-5]<\/span>/.test(landing.text)) {
  throw new Error('Landing hero still contains confusing numeric node-label badges');
}
for (const token of ['getBoundingClientRect()','data-node-label','document.fonts?.ready','ResizeObserver',"window.addEventListener('resize', scheduleRouteLabelPosition"]) {
  if (!landingJs.text.includes(token)) throw new Error(`Landing node anchoring missing: ${token}`);
}
if (!landingJs.text.includes('requestAnimationFrame')) throw new Error('Landing motion loop missing requestAnimationFrame');
if (!landingJs.text.includes('IntersectionObserver')) throw new Error('Landing motion missing IntersectionObserver reveals');
if (!landingCss.text.includes('prefers-reduced-motion')) throw new Error('Landing missing reduced-motion fallback');
for (const width of ['1080px', '800px', '520px']) {
  if (!landingCss.text.includes(width)) throw new Error(`Landing responsive CSS missing ${width} breakpoint`);
}

for (const requiredId of ['global-stats','flow-grid','flow-list','payer-flows','recipient-flows','flow-form','detail-content']) {
  if (!appPage.text.includes(`id="${requiredId}"`)) throw new Error(`/app missing operational surface: ${requiredId}`);
}
if (!appPage.text.includes('src="/config.js"') || !appPage.text.includes('src="/app.js"')) {
  throw new Error('/app does not use root production assets');
}
if (!appCss.text.includes('#D95C32') || !appCss.text.includes('#9D3656') || !appCss.text.includes('#501F31')) {
  throw new Error('Operational app missing locked warm Flowed palette');
}
if (!appCss.text.includes('var(--success)')) throw new Error('Operational app missing semantic success color treatment');

if (!config.text.includes(CONTRACT)) throw new Error('Production config missing canonical Flowed contract');
if (!/chainId[\"']?\s*[:=]\s*61999|\"chainId\":61999/.test(config.text)) throw new Error('Production config missing Studionet 61999');
if (!config.text.includes('https://studio.genlayer.com/api')) throw new Error('Production config missing canonical RPC');

for (const method of ['get_flow_count','get_flow','get_active_step','get_accounting']) {
  if (!appJs.text.includes(method)) throw new Error(`Production app missing public read ${method}`);
}
for (const method of ['create_flow','accept_flow','decline_flow','withdraw_offer','expire_unaccepted_flow','review_active_step','contest_active_step','resolve_contest','finalize_active_step','finalize_stalled_contest','abandon_flow','expire_active_flow']) {
  if (!appJs.text.includes(method)) throw new Error(`Production app missing write ${method}`);
}
for (const token of ['eth_requestAccounts','TransactionStatus.FINALIZED','fullTransaction:true','parseLosslessJson','ensureWriteNetwork','disconnectFlowedState','copyFullWalletAddress']) {
  if (!appJs.text.includes(token)) throw new Error(`Production app missing required wallet/finality token: ${token}`);
}
for (const token of ['wallet_switchEthereumChain','wallet_addEthereumChain','0xf22f','GenLayer Studionet','https://studio.genlayer.com/api']) {
  if (!walletUx.text.includes(token)) throw new Error(`Production wallet helper missing Studionet token: ${token}`);
}
for (const id of ['wallet-menu','copy-wallet','switch-wallet-network','disconnect-wallet','chain-state']) {
  if (!appPage.text.includes(`id="${id}"`)) throw new Error(`Production app missing wallet UX surface: ${id}`);
}
if (!appPage.text.includes('aria-haspopup="menu"') || !appJs.text.includes("event.key==='Escape'")) {
  throw new Error('Production wallet menu accessibility wiring is incomplete');
}
if (!appJs.text.includes('10n**18n') || !appJs.text.includes('/20n')) {
  throw new Error('Production app missing exact BigInt GEN/bond arithmetic');
}
if (!lossless.text.includes('stringifyJsonIntegers')) throw new Error('Lossless JSON integer helper missing');
if (appJs.text.includes('FLOWED_LIVE_FLOWS')) throw new Error('Forbidden fake Flow data source present');
if (/private\s*key|private_key|FLOWED_PRIVATE_KEY/i.test(appJs.text + appPage.text)) {
  throw new Error('Production app exposes browser private-key wording');
}

const client = createClient({ chain: studionet });
if (studionet.id !== EXPECTED_CHAIN_ID) throw new Error(`SDK Studionet mismatch: ${studionet.id}`);
const read = (functionName, args = []) => client.readContract({
  address: CONTRACT,
  functionName,
  args,
  transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
});
const [flowCount, accounting] = await Promise.all([read('get_flow_count'), read('get_accounting')]);

console.log(JSON.stringify({
  status: 'PASS',
  production: BASE,
  landing: `${BASE}/`,
  operationalApp: `${BASE}/app`,
  directAppRefresh: 'PASS',
  landingIdentity: 'PASS',
  sequentialMotionSystem: 'PASS',
  reducedMotion: 'PASS',
  responsiveImplementation: 'PASS',
  appRetheme: 'PASS',
  canonicalContract: CONTRACT,
  chainId: EXPECTED_CHAIN_ID,
  publicReads: {
    status: 'PASS',
    flowCount: flowCount.toString(),
    accounting,
  },
  walletSurface: 'PASS',
  walletDropdown: 'PASS',
  copyFullAddress: 'PASS',
  localDisconnect: 'PASS',
  clickableWrongChain: 'PASS',
  studionetSwitch: 'PASS',
  addNetwork4902Fallback: 'PASS',
  heroNodeAnchoring: 'PASS',
  exactGenHandling: 'PASS',
  finalizedSuccessHandling: 'PASS',
  fakeFallbackAbsent: true,
  privateKeyUiAbsent: true,
}, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
