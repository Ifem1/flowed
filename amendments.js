export function amendmentStepView(flow, wallet, index) {
  const terminal = !['ACTIVE', 'PROVISIONAL', 'CONTESTED'].includes(flow.state);
  const future = !terminal && index > Number(flow.active);
  const participant = wallet.toLowerCase() === String(flow.payer).toLowerCase()
    || wallet.toLowerCase() === String(flow.recipient).toLowerCase();
  const pending = flow.steps[index]?.pending_amendment;
  const proposer = pending?.proposer?.toLowerCase() === wallet.toLowerCase();
  const counterparty = Boolean(pending && participant && !proposer);
  return { future, canPropose: future && participant && !pending,
    canApprove: future && counterparty, canReject: future && counterparty,
    canCancel: future && Boolean(pending && proposer) };
}

export function finalizedExecutionSucceeded(receipt) {
  const normalized = (value) => String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  const status = normalized(receipt?.statusName ?? receipt?.status_name ?? receipt?.status);
  if (status !== 'FINALIZED' && Number(receipt?.status) !== 7) return false;

  const consensus = receipt?.consensus_data ?? receipt?.consensusData ?? {};
  const leadersRaw = consensus.leader_receipt ?? consensus.leaderReceipt;
  const leaders = Array.isArray(leadersRaw) ? leadersRaw : leadersRaw ? [leadersRaw] : [];
  const consensusValues = [];
  const collectConsensusValues = (value) => {
    if (typeof value === 'string' || typeof value === 'number') consensusValues.push(normalized(value));
    else if (Array.isArray(value)) value.forEach(collectConsensusValues);
    else if (value && typeof value === 'object') Object.values(value).forEach(collectConsensusValues);
  };
  collectConsensusValues(consensus);
  const outcomeFields = [
    receipt?.statusName, receipt?.status_name, receipt?.resultName, receipt?.result_name,
    receipt?.txExecutionResultName, receipt?.tx_execution_result_name,
    receipt?.txExecutionResult, receipt?.tx_execution_result,
    consensus?.statusName, consensus?.status_name, consensus?.resultName, consensus?.result_name,
    ...leaders.flatMap((leader) => [leader?.execution_result, leader?.executionResult,
      leader?.statusName, leader?.status_name, leader?.resultName, leader?.result_name]),
  ...consensusValues,
  ].map(normalized).filter(Boolean);
  if (outcomeFields.some((value) => /(?:MAJORITY_DISAGREE|NO_MAJORITY|DISAGREE|DISAGREEMENT|NO_CONSENSUS|FAIL(?:ED|URE)?|ERROR|REVERT(?:ED)?|WITHOUT_RETURN)/.test(value))) return false;

  const rawExecution = receipt?.txExecutionResult ?? receipt?.tx_execution_result;
  if ((typeof rawExecution === 'number' || (typeof rawExecution === 'string' && /^\d+$/.test(rawExecution)))
    && Number(rawExecution) !== 1) return false;

  const execution = normalized(receipt?.txExecutionResultName ?? receipt?.tx_execution_result_name
    ?? receipt?.txExecutionResult ?? receipt?.tx_execution_result);
  const explicitExecutionSuccess = execution === 'FINISHED_WITH_RETURN'
    || (typeof receipt?.txExecutionResult === 'number' && receipt.txExecutionResult === 1)
    || (typeof receipt?.tx_execution_result === 'number' && receipt.tx_execution_result === 1)
    || leaders.some((leader) => normalized(leader?.execution_result ?? leader?.executionResult) === 'SUCCESS');
  return explicitExecutionSuccess;
}
