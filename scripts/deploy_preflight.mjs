import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const RPC = 'https://studio.genlayer.com/api';
const EXPECTED_CHAIN_ID = 61999n;
const source = await readFile('contracts/Flowed.py');
const text = source.toString('utf8');
const sha256 = createHash('sha256').update(source).digest('hex');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

if (!text.includes('class Flowed(gl.Contract)')) throw new Error('Production Flowed contract class not found');
if (!/def __init__\(self\):/.test(text)) throw new Error('Flowed must deploy without constructor arguments');
if (!text.includes('py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6')) throw new Error('Unexpected production SDK dependency');

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

const chainRaw = await rpc('eth_chainId');
const chainId = BigInt(chainRaw);
if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Wrong RPC chain: expected 61999, got ${chainId}`);

let balance = null;
const deployer = (process.env.DEPLOYER_ADDRESS || '').trim();
if (deployer) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(deployer)) throw new Error('DEPLOYER_ADDRESS is invalid');
  balance = BigInt(await rpc('eth_getBalance', [deployer, 'latest']));
}

console.log(JSON.stringify({
  status: 'PASS',
  network: 'GenLayer Studionet',
  chainId: Number(chainId),
  rpc: RPC,
  contract: 'contracts/Flowed.py',
  constructorArgs: [],
  sourceCommit: head,
  sourceSha256: sha256,
  deployer: deployer || null,
  deployerBalanceWei: balance === null ? null : balance.toString(),
  nextAction: 'A funded wallet must sign the deployment; no private key is required by this script.',
}, null, 2));
