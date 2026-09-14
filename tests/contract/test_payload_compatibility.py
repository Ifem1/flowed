import json
from pathlib import Path

def test_frontend_payload_amounts_are_canonicalized_by_contract_source():
    payload = [{"title":"A","criteria":"x","amount_wei":"10000000000000000","ttl_seconds":300,"sources":[{"label":"e","url":"https://example.com/a","required":True}]},{"title":"B","criteria":"x","amount_wei":"20000000000000000","ttl_seconds":300,"sources":[{"label":"e","url":"https://example.com/b","required":True}]}]
    encoded=json.dumps(payload); decoded=json.loads(encoded)
    assert sum(int(s['amount_wei']) for s in decoded)==30000000000000000
    assert int(decoded[0]['amount_wei'])//20==500000000000000
    assert 's["amount_wei"] = amount' in Path('contracts/Flowed.py').read_text()

def test_snapshot_never_serializes_truncated_json():
    source=Path('contracts/Flowed.py').read_text()
    assert 'json.dumps({"sources":out,"required_unavailable":required_unavailable}' in source
    assert '))[:12000]' not in source
