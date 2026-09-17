"""Genuine Direct Mode tests: execute contracts/Flowed.py in-memory via genlayer-test."""
import json

import pytest
from gltest.direct import create_address

CONTRACT = "contracts/Flowed.py"
SDK_VERSION = "v0.6.0-rc5"
BASE_TIME = "2026-09-17T20:00:00Z"
ACCEPT_BY = 1_800_000_000
STEP = 10**16  # 0.01 GEN


def deploy(direct_deploy):
    return direct_deploy(CONTRACT, sdk_version=SDK_VERSION)


def addresses():
    return create_address("alice"), create_address("bob")


def steps_json():
    return json.dumps([
        {
            "title": "Architecture delivered",
            "criteria": "The evidence states that architecture is delivered.",
            "amount_wei": str(STEP),
            "ttl_seconds": 300,
            "sources": [{"label": "Step 1", "url": "https://example.com/step-1", "required": True}],
        },
        {
            "title": "Frontend live",
            "criteria": "The evidence states that the frontend is live.",
            "amount_wei": str(STEP),
            "ttl_seconds": 300,
            "sources": [{"label": "Step 2", "url": "https://example.com/step-2", "required": True}],
        },
    ])


def create(contract, vm, payer, recipient, title="Direct flow"):
    vm.sender = payer
    vm.value = STEP * 2
    contract.create_flow(recipient, title, "Direct Mode lifecycle", ACCEPT_BY, 60, STEP * 2, steps_json())
    vm.value = 0


def flow(contract, flow_id=1):
    return json.loads(contract.get_flow(flow_id))


def test_constructor_and_global_accounting(direct_vm, direct_deploy):
    direct_vm.warp(BASE_TIME)
    contract = deploy(direct_deploy)
    accounting = contract.get_accounting()
    assert accounting == {
        "funded": 0,
        "released": 0,
        "refunded": 0,
        "remaining": 0,
        "bonds_received": 0,
        "bonds_locked": 0,
        "bonds_returned": 0,
        "bonds_forfeited": 0,
    }
    assert contract.get_flow_count() == 0


def test_create_uses_frontend_payload_shape_and_exact_funding(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE_TIME)
    contract = deploy(direct_deploy)
    alice, bob = addresses()
    create(contract, direct_vm, alice, bob)
    f = flow(contract)
    assert f["state"] == "OFFERED"
    assert f["escrow"] == STEP * 2
    assert f["released"] == 0 and f["refunded"] == 0 and f["remaining"] == STEP * 2
    assert len(f["steps"]) == 2 and f["active"] == 0
    assert contract.get_accounting()["funded"] == STEP * 2


def test_accept_activates_only_step_one(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE_TIME)
    contract = deploy(direct_deploy)
    alice, bob = addresses()
    create(contract, direct_vm, alice, bob)
    direct_vm.sender = bob
    contract.accept_flow(1)
    f = flow(contract)
    assert f["state"] == "ACTIVE"
    assert f["active"] == 0
    assert f["steps"][0]["deadline"] - f["steps"][0]["activated_at"] == 300
    assert "activated_at" not in f["steps"][1]
    active = json.loads(contract.get_active_step(1))
    assert active["title"] == "Architecture delivered"


def test_withdraw_refunds_exactly_and_cannot_replay(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE_TIME)
    contract = deploy(direct_deploy)
    alice, bob = addresses()
    create(contract, direct_vm, alice, bob)
    direct_vm.sender = alice
    contract.withdraw_offer(1)
    f = flow(contract)
    assert f["state"] == "WITHDRAWN"
    assert f["refunded"] == STEP * 2 and f["remaining"] == 0
    accounting = contract.get_accounting()
    assert accounting["funded"] == accounting["refunded"] == STEP * 2
    assert accounting["remaining"] == 0
    with pytest.raises(AssertionError):
        contract.withdraw_offer(1)


def test_decline_on_second_flow_preserves_global_and_per_flow_invariants(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE_TIME)
    contract = deploy(direct_deploy)
    alice, bob = addresses()
    create(contract, direct_vm, alice, bob, "Flow one")
    create(contract, direct_vm, alice, bob, "Flow two")
    direct_vm.sender = bob
    contract.decline_flow(2)
    f1, f2 = flow(contract, 1), flow(contract, 2)
    assert f1["escrow"] == f1["released"] + f1["refunded"] + f1["remaining"]
    assert f2["escrow"] == f2["released"] + f2["refunded"] + f2["remaining"]
    g = contract.get_accounting()
    assert g["funded"] == g["released"] + g["refunded"] + g["remaining"]


def test_satisfied_review_uses_frozen_snapshot_and_becomes_provisional(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE_TIME)
    contract = deploy(direct_deploy)
    alice, bob = addresses()
    create(contract, direct_vm, alice, bob)
    direct_vm.sender = bob
    contract.accept_flow(1)
    direct_vm.mock_web(r"example\.com/step-1", {"status": 200, "body": "Architecture is delivered."})
    direct_vm.mock_llm(r"frozen acceptance criteria", "SATISFIED")
    contract.review_active_step(1)
    f = flow(contract)
    assert f["state"] == "PROVISIONAL"
    step = f["steps"][0]
    assert step["last_review_label"] == "SATISFIED"
    assert len(step["snapshot_digest"]) == 64
    assert step["snapshot"]
    assert f["manifests"][-1]["phase"] == "PRIMARY"
    assert f["manifests"][-1]["snapshot_digest"] == step["snapshot_digest"]
