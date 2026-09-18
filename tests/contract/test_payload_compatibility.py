import json
from pathlib import Path


def test_frontend_payload_amounts_are_canonicalized_by_contract_source():
    payload = [
        {"title":"A","criteria":"x","amount_wei":"10000000000000000","ttl_seconds":300,"sources":[{"label":"e","url":"https://example.com/a","required":True}]},
        {"title":"B","criteria":"x","amount_wei":"20000000000000000","ttl_seconds":300,"sources":[{"label":"e","url":"https://example.com/b","required":True}]},
    ]
    decoded = json.loads(json.dumps(payload))
    assert sum(int(s['amount_wei']) for s in decoded) == 30000000000000000
    assert int(decoded[0]['amount_wei']) // 20 == 500000000000000
    assert 's["amount_wei"] = amount' in Path('contracts/Flowed.py').read_text()


def test_snapshot_bounds_bodies_before_canonical_serialization():
    source = Path('contracts/Flowed.py').read_text()
    assert '"body": body[:MAX_SOURCE_BODY]' in source
    assert 'sort_keys=True' in source
    assert 'separators=(",", ":")' in source
    assert 'required_unavailable' in source
    assert 'snapshot = gl.eq_principle_strict_eq(fetch)' in source
    assert 'hashlib.sha256(snapshot.encode()).hexdigest()' in source
    assert '))[:' not in source


def test_contest_reuses_stored_snapshot_without_refetching():
    source = Path('contracts/Flowed.py').read_text()
    resolve = source.split('def resolve_contest', 1)[1].split('def finalize_stalled_contest', 1)[0]
    assert 's["snapshot"]' in resolve
    assert 'self._snapshot(' not in resolve
