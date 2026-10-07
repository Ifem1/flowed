import test from 'node:test';
import assert from 'node:assert/strict';
import { amendmentStepView, finalizedExecutionSucceeded } from '../../amendments.js';

const parseGen = (v) => {
  if (!/^\d+(\.\d{1,18})?$/.test(v.trim())) throw Error();
  const [w, f = ''] = v.trim().split('.');
  return BigInt(w) * 10n ** 18n + BigInt(f.padEnd(18, '0'));
};
const formatGen = (x) => {
  const w = x / 10n ** 18n;
  const f = (x % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '');
  return f ? `${w}.${f}` : `${w}`;
};

test('exact GEN conversion', () => {
  for (const x of ['1', '0.1', '0.01', '0.000000000000000001', '123.456']) {
    assert.equal(formatGen(parseGen(x)), x);
  }
});

test('large GEN values stay exact beyond JavaScript safe integers', () => {
  const value = '123456789012345678901234567890.123456789012345678';
  assert.equal(formatGen(parseGen(value)), value);
});

test('contest bond arithmetic is exact integer division by 20', () => {
  assert.equal(parseGen('0.01') / 20n, parseGen('0.0005'));
});

test('rejects precision overflow', () => {
  assert.throws(() => parseGen('0.0000000000000000001'));
});

const amendmentFlow = (state = 'ACTIVE', active = 0, pending) => ({
  state, active, payer: '0xpayer', recipient: '0xrecipient',
  steps: [{}, {}, { pending_amendment: pending }],
});
test('amendment proposal is available to either participant only on future steps', () => {
  for (const wallet of ['0xPAYER', '0xrecipient']) assert.equal(amendmentStepView(amendmentFlow(), wallet, 2).canPropose, true);
  assert.equal(amendmentStepView(amendmentFlow(), '0xstranger', 2).canPropose, false);
});
test('amendment actions are hidden on active, completed, and terminal steps', () => {
  assert.equal(amendmentStepView(amendmentFlow(), '0xpayer', 0).canPropose, false);
  assert.equal(amendmentStepView(amendmentFlow('COMPLETED', 1), '0xpayer', 2).canPropose, false);
  assert.equal(amendmentStepView(amendmentFlow('ACTIVE', 1), '0xpayer', 1).canPropose, false);
});
test('pending proposal actions are limited to counterparty or proposer', () => {
  const pending = { proposer: '0xpayer' };
  const counterparty = amendmentStepView(amendmentFlow('ACTIVE', 0, pending), '0xrecipient', 2);
  const proposer = amendmentStepView(amendmentFlow('ACTIVE', 0, pending), '0xpayer', 2);
  assert.equal(counterparty.canApprove, true); assert.equal(counterparty.canReject, true); assert.equal(counterparty.canCancel, false);
  assert.equal(proposer.canCancel, true); assert.equal(proposer.canApprove, false);
});
test('finalized execution result requires explicit success evidence', () => {
  assert.equal(finalizedExecutionSucceeded({ statusName: 'FINALIZED', txExecutionResultName: 'FINISHED_WITH_RETURN' }), true);
  assert.equal(finalizedExecutionSucceeded({ statusName: 'FINALIZED', consensus_data: { leader_receipt: { execution_result: 'SUCCESS' } } }), true);
  assert.equal(finalizedExecutionSucceeded({ statusName: 'FINALIZED' }), false);
  assert.equal(finalizedExecutionSucceeded({ statusName: 'ACCEPTED', txExecutionResultName: 'FINISHED_WITH_RETURN' }), false);
});
