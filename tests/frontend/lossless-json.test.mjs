import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLosslessJson, stringifyJsonIntegers } from '../../lossless-json.js';

test('preserves wei integers above Number.MAX_SAFE_INTEGER exactly', () => {
  const parsed = parseLosslessJson('{"escrow":30000000000000000,"step":{"amount_wei":10000000000000001}}');
  assert.equal(parsed.escrow, '30000000000000000');
  assert.equal(parsed.step.amount_wei, '10000000000000001');
  assert.equal(BigInt(parsed.step.amount_wei), 10000000000000001n);
});

test('preserves nested integer state while leaving strings untouched', () => {
  const parsed = parseLosslessJson('{"active":0,"timestamps":[1720000000,1720000120],"criteria":"value 10000000000000001 is text"}');
  assert.equal(parsed.active, '0');
  assert.deepEqual(parsed.timestamps, ['1720000000', '1720000120']);
  assert.equal(parsed.criteria, 'value 10000000000000001 is text');
});

test('does not rewrite decimal or exponent JSON numbers', () => {
  const rewritten = stringifyJsonIntegers('{"integer":42,"decimal":1.5,"exp":1e3}');
  assert.equal(rewritten, '{"integer":"42","decimal":1.5,"exp":1e3}');
});
