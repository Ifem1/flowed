import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const RPC = 'https://studio.genlayer.com/api';
const EXPECTED_CHAIN_ID = 61999n;
const HISTORICAL_CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';
const HISTORICAL_SOURCE_COMMIT = 'c628a86951d59de4c774d89cb4c8ae5cbb1e4e47';
const MILESTONE_CONTRACT = '0xAcCc2C3361e7ac143B835e0CEDf97CDecfe69443';
const MILESTONE_DEPLOYMENT_TX = '0x90f6de1e85f2308fe0cfbe803e58bbcdbc3219a3f7682a11b3d6dc4184990bb1';
const MILESTONE_SOURCE_BLOB = '8c12fd7524fb29e68097ce3adb0c348c791edcc7';
const bytes = await readFile('contracts/Flowed.py');
const source = bytes.toString('utf8');
const sha256 = createHash('sha256').update(bytes).digest('hex');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const blob = execFileSync('git', ['hash-object', 'contracts/Flowed.py'], { encoding: 'utf8' }).trim();
if (blob !== MILESTONE_SOURCE_BLOB) {
  throw new Error('Contract source differs from the deployed milestone fingerprint; deploy and verify a fresh contract before building this release.');
}
const lines = source.split(/\r?\n/);
if (lines[0] !== '# v0.2.16' || !lines[1].includes('py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6')) {
  throw new Error('Expected pinned stable GenLayer v0.2.16 contract runtime');
}
for (const method of ['propose_step_amendment', 'approve_step_amendment', 'reject_step_amendment', 'cancel_step_amendment']) {
  if (!source.includes(`def ${method}(`)) throw new Error(`Missing amendment entry point ${method}`);
}

const response = await fetch(RPC, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
});
if (!response.ok) throw new Error(`Studionet RPC returned HTTP ${response.status}`);
const payload = await response.json();
if (payload.error) throw new Error(`Studionet RPC error: ${JSON.stringify(payload.error)}`);
const chainId = BigInt(payload.result);
if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Wrong RPC chain: expected 61999, got ${chainId}`);

console.log(JSON.stringify({
  status: 'PASS', network: 'GenLayer Studionet', chainId: Number(chainId), rpc: RPC,
  sourceCommit: head, sourceSha256: sha256, sourceGitBlob: blob,
  historicalContract: HISTORICAL_CONTRACT, historicalSourceCommit: HISTORICAL_SOURCE_COMMIT,
  milestoneDeploymentVerified: true, milestoneContract: MILESTONE_CONTRACT,
  deploymentTransaction: MILESTONE_DEPLOYMENT_TX,
  constructorArgs: [], constructorValueWei: '0',
}, null, 2));
