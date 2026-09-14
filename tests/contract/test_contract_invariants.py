import json, pathlib

def test_contract_has_single_production_class_and_surface():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert source.count('class Flowed(') == 1
    for name in ['create_flow','accept_flow','review_active_step','contest_active_step','resolve_contest','finalize_active_step','abandon_flow','expire_active_flow']:
        assert f'def {name}' in source

def test_spec_constants_and_scalar_labels_are_frozen():
    source = pathlib.Path('contracts/Flowed.py').read_text()
    assert 'BOND_BPS = 500' in source
    assert 'SATISFIED' in source and 'NOT_SATISFIED' in source and 'INCONCLUSIVE' in source
    assert 'MODEL_OUTPUT_INVALID' in source and 'SOURCE_UNAVAILABLE' in source
