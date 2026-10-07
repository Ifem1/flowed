import pathlib


def test_contract_has_single_production_class_and_complete_surface():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert source.count('class Flowed(') == 1
    for name in [
        'create_flow', 'accept_flow', 'decline_flow', 'withdraw_offer',
        'expire_unaccepted_flow', 'review_active_step', 'contest_active_step',
        'resolve_contest', 'finalize_active_step', 'finalize_stalled_contest',
        'abandon_flow', 'expire_active_flow', 'get_flow_count', 'get_flow',
        'get_active_step', 'get_accounting', 'propose_step_amendment',
        'approve_step_amendment', 'reject_step_amendment', 'cancel_step_amendment',
        'get_step_amendment_history',
    ]:
        assert f'def {name}' in source


def test_scalar_labels_and_exact_five_percent_bond_are_frozen():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert 'LABELS = ("SATISFIED", "NOT_SATISFIED", "INCONCLUSIVE")' in source
    assert 'MODEL_OUTPUT_INVALID' in source and 'SOURCE_UNAVAILABLE' in source
    assert 'amount_wei"] // 20' in source
    assert 'gl.message.value == bond' in source


def test_global_and_per_flow_accounting_equations_are_enforced():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert 'f["funded"] == f["released"] + f["refunded"] + f["remaining"]' in source
    assert 'self.bonds_received == self.bonds_locked + self.bonds_returned + self.bonds_forfeited' in source
    assert 'f["bonds_received"] == f["bonds_locked"] + f["bonds_returned"] + f["bonds_forfeited"]' in source

def test_manifests_are_bound_to_active_step_version_and_digest():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert '"step_version": s["version"]' in source
    assert '"config_digest": s["config_digest"]' in source
    assert '"snapshot_digest": s["snapshot_digest"]' in source

def test_amendment_bounds_and_economic_fields_are_explicit():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert 'MAX_AMENDMENTS_PER_STEP = 4' in source
    assert 'MAX_AMENDMENT_PROPOSALS_PER_STEP = 8' in source
    assert 'assert sender != proposal["proposer"]' in source
    assert 'assert proposal["base_version"] == step["version"]' in source
    assert 'amount_wei' not in source.split('def approve_step_amendment', 1)[1].split('def reject_step_amendment', 1)[0]
