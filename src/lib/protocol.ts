export const STUDIONET = { chainId: 61999, rpc: 'https://studio.genlayer.com/api', currency: 'GEN' } as const;
export type FlowState = 'OFFERED'|'ACTIVE'|'PROVISIONAL'|'CONTESTED'|'COMPLETED'|'DECLINED'|'WITHDRAWN'|'EXPIRED'|'ABANDONED';
export type Step = { title:string; criteria:string; amount_wei:string; ttl_seconds:number; sources:Array<{label:string;url:string;required:boolean}> };
export type CreateFlowPayload = { recipient:string; title:string; summary:string; accept_by:bigint; contest_window_seconds:bigint; escrow_amount:bigint; steps_json:string };
export function buildCreatePayload(input:{recipient:string;title:string;summary:string;acceptBy:number;contestWindow:number;steps:Step[]}):CreateFlowPayload {
  const escrow=input.steps.reduce((a,s)=>a+BigInt(s.amount_wei),0n);
  return {recipient:input.recipient,title:input.title,summary:input.summary,accept_by:BigInt(input.acceptBy),contest_window_seconds:BigInt(input.contestWindow),escrow_amount:escrow,steps_json:JSON.stringify(input.steps)};
}
export function contestBond(stepAmountWei:bigint):bigint { return stepAmountWei/20n; }
export function canWrite(wallet:string|undefined, chainId:number):boolean { return Boolean(wallet) && chainId===STUDIONET.chainId; }
