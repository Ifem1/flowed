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
  const leaders = Array.isArray(receipt?.consensus_data?.leader_receipt)
    ? receipt.consensus_data.leader_receipt
    : (receipt?.consensus_data?.leader_receipt ? [receipt.consensus_data.leader_receipt] : []);
  const executionOk = receipt?.txExecutionResultName === 'FINISHED_WITH_RETURN'
    || Number(receipt?.txExecutionResult) === 1
    || leaders.some((x) => x?.execution_result === 'SUCCESS');
  return (receipt?.statusName === 'FINALIZED' || Number(receipt?.status) === 7) && executionOk;
}
