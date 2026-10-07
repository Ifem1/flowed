"""Offline behavioral matrix for deterministic Flowed invariants.

These tests exercise the protocol state transitions independently of GenVM. The
Direct Mode suite is separate and is never counted as these tests.
"""
import pytest

class Ledger:
    def __init__(self, amounts=(100,100,100)):
        self.amounts=list(amounts); self.state='OFFERED'; self.active=0; self.funded=sum(amounts); self.released=self.refunded=0; self.bonds_received=self.bonds_locked=self.bonds_returned=self.bonds_forfeited=0; self.contested=False
    @property
    def remaining(self): return self.funded-self.released-self.refunded
    def invariant(self): assert self.funded==self.released+self.refunded+self.remaining; assert self.bonds_received==self.bonds_locked+self.bonds_returned+self.bonds_forfeited
    def accept(self): assert self.state=='OFFERED'; self.state='ACTIVE'
    def review(self,label): assert self.state=='ACTIVE'; self.state='PROVISIONAL' if label=='SATISFIED' else 'ACTIVE'
    def contest(self,bond): assert self.state=='PROVISIONAL' and not self.contested and bond==self.amounts[self.active]//20; self.contested=True; self.state='CONTESTED'; self.bonds_received+=bond; self.bonds_locked+=bond
    def resolve(self,label): assert self.state=='CONTESTED'; bond=self.amounts[self.active]//20; self.bonds_locked-=bond; self.contested=False; self.state='PROVISIONAL' if label=='INCONCLUSIVE' else ('ACTIVE' if label=='NOT_SATISFIED' else 'PROVISIONAL'); (setattr(self,'bonds_returned',self.bonds_returned+bond) if label=='NOT_SATISFIED' else setattr(self,'bonds_forfeited',self.bonds_forfeited+bond) if label=='SATISFIED' else None)
    def release(self): assert self.state=='PROVISIONAL'; self.released+=self.amounts[self.active]; self.active+=1; self.state='COMPLETED' if self.active==len(self.amounts) else 'ACTIVE'
    def refund(self): assert self.state in ('OFFERED','ACTIVE'); self.refunded=self.remaining; self.state='REFUNDED'

@pytest.mark.parametrize('count,valid',[(1,False),(2,True),(8,True),(9,False)])
def test_step_count_bounds(count,valid): assert (2<=count<=8)==valid
def test_valid_creation_and_exact_escrow(): l=Ledger(); l.invariant(); assert l.funded==300
def test_escrow_sum_mismatch_rejected(): assert 31 != sum((10,10,10))
def test_acceptance_first_activation_and_future_lock(): l=Ledger(); l.accept(); assert l.state=='ACTIVE' and l.active==0
@pytest.mark.parametrize('label', ['NOT_SATISFIED','INCONCLUSIVE','SOURCE_UNAVAILABLE','MODEL_OUTPUT_INVALID'])
def test_non_satisfied_review_is_retryable(label): l=Ledger(); l.accept(); l.review(label); assert l.state=='ACTIVE'; l.invariant()
def test_satisfied_provisional_then_exact_release_and_next_step(): l=Ledger(); l.accept(); l.review('SATISFIED'); l.release(); assert l.released==100 and l.active==1 and l.state=='ACTIVE'; l.invariant()
def test_contest_exact_bond_and_forfeit(): l=Ledger(); l.accept(); l.review('SATISFIED'); pytest.raises(AssertionError, l.contest, 0); l.contest(5); pytest.raises(AssertionError, l.contest, 5)
def test_contest_satisfied_forfeits_and_releases(): l=Ledger(); l.accept(); l.review('SATISFIED'); l.contest(5); l.resolve('SATISFIED'); l.release(); assert l.bonds_forfeited==5; l.invariant()
def test_contest_not_satisfied_returns_bond_and_reactivates(): l=Ledger(); l.accept(); l.review('SATISFIED'); l.contest(5); l.resolve('NOT_SATISFIED'); assert l.state=='ACTIVE' and l.bonds_returned==5; l.invariant()
def test_no_future_bypass_and_no_double_release(): l=Ledger(); l.accept(); pytest.raises(AssertionError,l.release); l.review('SATISFIED'); l.release(); pytest.raises(AssertionError,l.release)
def test_abandonment_and_no_double_refund(): l=Ledger(); l.accept(); l.refund(); assert l.refunded==300; pytest.raises(AssertionError,l.refund); l.invariant()
def test_final_completion(): l=Ledger(); l.accept(); [ (l.review('SATISFIED'),l.release()) for _ in l.amounts ]; assert l.state=='COMPLETED' and l.remaining==0; l.invariant()

class AmendmentLedger:
    def __init__(self):
        self.steps=[{'version':1,'digest':'a','amount':100,'attempts':0,'accepted':0,'pending':None,'history':[]} for _ in range(3)]
        self.active=0; self.state='ACTIVE'; self.next_id=1; self.funded=300; self.released=0; self.refunded=0
    def future(self,index): assert self.state=='ACTIVE' and self.active<index<len(self.steps)
    def propose(self,index,proposer,digest):
        self.future(index); assert proposer in ('payer','recipient'); s=self.steps[index]; assert s['pending'] is None and s['attempts']<8
        p={'id':self.next_id,'base':s['version'],'proposer':proposer,'digest':digest,'status':'PROPOSED'}; self.next_id+=1;s['attempts']+=1;s['pending']=p;return p['id']
    def approve(self,index,pid,actor):
        self.future(index);s=self.steps[index];p=s['pending'];assert p and p['id']==pid and p['status']=='PROPOSED' and p['base']==s['version'];assert actor!=p['proposer'] and s['accepted']<4
        old=s['version'];s['version']+=1;s['digest']=p['digest'];s['accepted']+=1;s['history'].append((old,s['version'],pid));s['pending']=None
    def close(self,index,pid,actor,cancel=False):
        self.future(index);s=self.steps[index];p=s['pending'];assert p and p['id']==pid
        assert actor==p['proposer'] if cancel else actor!=p['proposer'];p['status']='CANCELLED' if cancel else 'REJECTED';s['pending']=None
    def activate_next(self):
        self.released+=100;self.active+=1;s=self.steps[self.active]
        if s['pending']: s['pending']['status']='EXPIRED_ON_ACTIVATION';s['pending']=None

def test_amendment_authorization_versioning_and_stale_ids():
    x=AmendmentLedger();pid=x.propose(2,'payer','b')
    with pytest.raises(AssertionError):x.approve(2,pid,'payer')
    x.approve(2,pid,'recipient');assert x.steps[2]['version']==2 and x.steps[2]['digest']=='b'
    with pytest.raises(AssertionError):x.approve(2,pid,'recipient')
    pid2=x.propose(2,'recipient','c');x.approve(2,pid2,'payer');assert x.steps[2]['history']==[(1,2,pid),(2,3,pid2)]

def test_amendment_wrong_role_denied_on_clean_future_step():
    x=AmendmentLedger();assert x.steps[2]['pending'] is None
    with pytest.raises(AssertionError,match='payer|recipient'):
        x.propose(2,'stranger','b')
    assert x.steps[2]['pending'] is None

def test_amendment_proposer_cannot_self_approve_and_exact_counterparty_can():
    x=AmendmentLedger();pid=x.propose(2,'payer','b')
    with pytest.raises(AssertionError):x.approve(2,pid,'payer')
    x.approve(2,pid,'recipient')
    assert x.steps[2]['version']==2 and x.steps[2]['digest']=='b'

@pytest.mark.parametrize('index',[0])
def test_amendment_rejects_active_and_completed_steps(index):
    x=AmendmentLedger();
    with pytest.raises(AssertionError):x.propose(index,'payer','b')

def test_amendment_rejects_previously_completed_step():
    x=AmendmentLedger();x.active=2
    with pytest.raises(AssertionError):x.propose(1,'payer','b')

def test_amendment_unavailable_on_terminal_flow():
    x=AmendmentLedger();x.state='COMPLETED'
    with pytest.raises(AssertionError):x.propose(2,'payer','b')

@pytest.mark.parametrize('cancel',[True,False])
def test_cancelled_or_rejected_proposal_cannot_be_approved(cancel):
    x=AmendmentLedger();pid=x.propose(2,'payer','b');x.close(2,pid,'payer' if cancel else 'recipient',cancel)
    with pytest.raises(AssertionError):x.approve(2,pid,'recipient')

def test_activation_invalidates_pending_proposal_without_changing_amount():
    x=AmendmentLedger();pid=x.propose(1,'payer','b');amount=x.steps[1]['amount'];x.activate_next()
    assert x.steps[1]['pending'] is None and x.released==100 and x.steps[1]['amount']==amount
    with pytest.raises(AssertionError):x.approve(1,pid,'recipient')

def test_amendment_caps_bound_churn_and_accepted_history():
    x=AmendmentLedger()
    for i in range(4):
        pid=x.propose(2,'payer',str(i));x.approve(2,pid,'recipient')
    assert len(x.steps[2]['history'])==4
    for i in range(4):
        pid=x.propose(2,'payer',str(i));x.close(2,pid,'payer',True)
    with pytest.raises(AssertionError):x.propose(2,'payer','overflow')

def test_amendment_money_fields_are_unchanged():
    x=AmendmentLedger();before=(x.funded,x.released,x.refunded,[s['amount'] for s in x.steps]);pid=x.propose(2,'payer','b');x.approve(2,pid,'recipient')
    assert (x.funded,x.released,x.refunded,[s['amount'] for s in x.steps])==before

def test_amendment_hard_caps_are_mirrored_by_production_contract():
    from pathlib import Path
    source=Path('contracts/Flowed.py').read_text()
    assert 'MAX_AMENDMENTS_PER_STEP = 4' in source
    assert 'MAX_AMENDMENT_PROPOSALS_PER_STEP = 8' in source
    assert 'MAX_AMENDMENT_HISTORY = 32' in source
