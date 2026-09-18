import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const RPC = 'https://studio.genlayer.com/api';
const EXPECTED_CHAIN_ID = 61999n;
const CANONICAL_SOURCE_COMMIT = 'c628a86951d59de4c774d89cb4c8ae5cbb1e4e47';
const CANONICAL_SOURCE_SHA256 = '0aac468a81efe683798271e0c38c6e582eeef515386bb8e4a1d8eed8defd72b4';
const CANONICAL_GIT_BLOB = 'b8c351464cf876fedb1c1b0312670a1a4d693b5b';
const CANONICAL_CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';
const DEPLOYMENT_TX = '0xdb045eda9076fc5c2053fc1f23655856005b8962dd1a7eebfca873ba7be5326a';

const source = await readFile('contracts/Flowed.py');
const text = source.toString('utf8');
const sha256 = createHash('sha256').update(source).digest('hex');
const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const currentBlob = execFileSync('git', ['hash-object', 'contracts/Flowed.py'], { encoding: 'utf8' }).trim();

const expectedVersion = '# v0.2.16';
const expectedDepends = '# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }';
const physicalLines = text.split(/\r?\n/);

if (physicalLines[0] !== expectedVersion || physicalLines[1] !== expectedDepends || physicalLines[2] !== '') {
  throw new Error('Flowed header must remain exactly v0.2.16, stable Depends, then a blank line');
}
if (!text.includes('class Flowed(gl.Contract)')) throw new Error('Production Flowed contract class not found');
if (!/def __init__\(self\):/.test(text)) throw new Error('Flowed must remain zero-argument at deployment');
if (sha256 !== CANONICAL_SOURCE_SHA256) throw new Error(`Flowed.py SHA-256 changed: ${sha256}`);
if (currentBlob !== CANONICAL_GIT_BLOB) throw new Error(`Flowed.py Git blob changed: ${currentBlob}`);

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

const chainId = BigInt(await rpc('eth_chainId'));
if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Wrong RPC chain: expected 61999, got ${chainId}`);

console.log(JSON.stringify({
  status: 'PASS',
  network: 'GenLayer Studionet',
  chainId: Number(chainId),
  rpc: RPC,
  canonicalContract: CANONICAL_CONTRACT,
  deploymentTx: DEPLOYMENT_TX,
  canonicalSourceCommit: CANONICAL_SOURCE_COMMIT,
  canonicalSourceSha256: CANONICAL_SOURCE_SHA256,
  canonicalGitBlob: CANONICAL_GIT_BLOB,
  currentRepositoryHead: currentHead,
  contractSourceUnchangedAfterDeployment: true,
  runtime: 'v0.2.16',
  runner: 'py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6',
  constructorArgs: [],
  constructorValueWei: '0',
  nextAction: 'No redeployment. Verify the canonical live deployment and execute the live Flow against the existing address.',
}, null, 2));
