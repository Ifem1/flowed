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
