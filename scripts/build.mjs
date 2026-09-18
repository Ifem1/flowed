import { cp, mkdir, writeFile } from 'node:fs/promises';

const CANONICAL_CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) await cp(file, `dist/${file}`);

const address = (process.env.FLOWED_CONTRACT_ADDRESS || CANONICAL_CONTRACT).trim();
if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
  throw new Error('FLOWED_CONTRACT_ADDRESS must be a 20-byte hex address');
}
if (address.toLowerCase() !== CANONICAL_CONTRACT.toLowerCase()) {
  throw new Error(`Production build must target canonical Flowed contract ${CANONICAL_CONTRACT}`);
}

await writeFile(
  'dist/config.js',
  `window.FLOWED_CONFIG = Object.freeze(${JSON.stringify({
    network: 'GenLayer Studionet',
    chainId: 61999,
    rpc: 'https://studio.genlayer.com/api',
    contractAddress: address,
  })});\n`,
);

console.log(`static production build: PASS (canonical contract ${address})`);
