import test from 'node:test'; import assert from 'node:assert/strict';
const parseGen = (v)=>{if(!/^\d+(\.\d{1,18})?$/.test(v.trim()))throw Error();const [w,f='']=v.trim().split('.');return BigInt(w)*10n**18n+BigInt(f.padEnd(18,'0'))};
const formatGen = (x)=>{const w=x/10n**18n;const f=(x%10n**18n).toString().padStart(18,'0').replace(/0+$/,'');return f?`${w}.${f}`:`${w}`};
test('exact GEN conversion',()=>{for(const x of ['1','0.1','0.01','0.000000000000000001','123.456'])assert.equal(formatGen(parseGen(x)),x)});
test('rejects precision overflow',()=>assert.throws(()=>parseGen('0.0000000000000000001')));
