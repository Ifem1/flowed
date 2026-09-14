// Live verification runner. It deliberately refuses to claim success without a deployed address.
const required=['FLOWED_PRIVATE_KEY','FLOWED_CONTRACT_ADDRESS'];
const missing=required.filter(k=>!process.env[k]);
if(missing.length){console.error(`Missing ${missing.join(', ')}. Set these only in a secure deployment environment.`); process.exitCode=2;}
else { console.log('Target network: GenLayer Studionet / chain 61999'); console.log('Runner ready: create → accept → review → finalize/contest → complete.'); console.log('Wire the pinned genlayer-js transaction/finality calls before executing live funds.'); }
