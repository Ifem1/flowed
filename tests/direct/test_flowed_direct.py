"""Genuine Direct Mode smoke tests using genlayer-test's in-memory harness."""
import pytest

try:
    from gltest import get_contract_factory
except ImportError:  # keeps collection explicit when runtime is absent in CI
    get_contract_factory = None

pytestmark = pytest.mark.direct

@pytest.mark.skipif(get_contract_factory is None, reason='genlayer-test Direct Mode unavailable')
def test_flowed_direct_constructor_and_view_surface():
    contract = get_contract_factory(contract_file_path='Flowed.py').deploy()
    accounting = contract.get_accounting()
    assert accounting['funded'] == 0
    assert accounting['released'] == 0
    assert accounting['refunded'] == 0
    assert accounting['bonds_received'] == 0
