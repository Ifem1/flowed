import { cp, mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) await cp(file, `dist/${file}`);
const address = (process.env.FLOWED_CONTRACT_ADDRESS || '').trim();
if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('FLOWED_CONTRACT_ADDRESS must be a 20-byte hex address');
await writeFile('dist/config.js', `window.FLOWED_CONFIG = Object.freeze(${JSON.stringify({ network: 'GenLayer Studionet', chainId: 61999, rpc: 'https://studio.genlayer.com/api', contractAddress: address })});\n`);
console.log(`static production build: PASS (${address ? 'canonical contract configured' : 'deployment-pending config'})`);
