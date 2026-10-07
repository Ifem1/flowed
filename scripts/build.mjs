import { cp, mkdir, writeFile } from 'node:fs/promises';

const HISTORICAL_CONTRACT = '0xE7aE476b544afe3A38954BBf15f7BE3A4FA4D8Ad';

await mkdir('dist/app', { recursive: true });
for (const file of ['index.html', 'landing.css', 'landing.js', 'styles.css', 'app.js', 'wallet-ux.js', 'lossless-json.js', 'amendments.js']) {
  await cp(file, `dist/${file}`);
}
await cp('app/index.html', 'dist/app/index.html');

const address = (process.env.FLOWED_CONTRACT_ADDRESS || '').trim();
if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('FLOWED_CONTRACT_ADDRESS must be a 20-byte hex address');
if (address.toLowerCase() === HISTORICAL_CONTRACT.toLowerCase()) {
  throw new Error(`The historical contract ${HISTORICAL_CONTRACT} does not implement amendments and cannot back the milestone app`);
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

console.log(`static production build: PASS (landing / + operational /app + ${address ? `milestone contract ${address}` : 'milestone deployment pending'})`);
