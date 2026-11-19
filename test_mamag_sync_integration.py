"""
Mama-G Edge-to-Hub Synchronization & Infobip Alert Integration Tests
--------------------------------------------------------------------------------
Validates:
1. BOM-safe .env.infobip / .env startup initialization, URL & phone normalization,
   masked API key diagnostics, and ALERT_DRY_RUN handling.
2. Infobip REST API (/sms/2/text/advanced) dispatch formatting with LGA routing
   (Uyo, Ibeno, Mbo) and Ibibio (ibb) / Ibeno (ibn) / English climate-health notes.
3. FastAPI offline encounter batch ingestion, duplicate idempotency, and fault
   isolation so external Infobip timeouts/errors never break SQLite edge sync.
"""

from datetime import datetime
import types

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import dashboard_hub
from dashboard_hub import Base, CentralEncounterModel, app
from mamag_emergency_alert_service import (
    MamaGEmergencyAlertService,
    MamaGEmergencyConfig,
    initialize_emergency_env,
    mask_secret,
    normalize_infobip_base_url,
    normalize_phone_destination,
    parse_bool_env,
)


@pytest.fixture(scope="function")
def test_db():
    """Create an isolated in-memory SQLite database for regional hub testing."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    yield TestingSessionLocal

    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def client(test_db, monkeypatch):
    """FastAPI TestClient fixture wired to the isolated test database."""
    monkeypatch.setattr(dashboard_hub, "SessionLocal", test_db)
    with TestClient(app) as c:
        yield c


def test_env_normalization_and_bom_loading(tmp_path, monkeypatch):
    """Verify URL/phone normalization, BOM-safe utf-8-sig loading, and API key masking."""
    assert normalize_infobip_base_url("https://abc123.api.infobip.com///") == "abc123.api.infobip.com"
    assert normalize_infobip_base_url("http://xyz999.api.infobip.com/sms/2/text/advanced") == "xyz999.api.infobip.com"
    assert normalize_phone_destination(" +234 803-000-0002 ") == "2348030000002"
    assert normalize_phone_destination("<verified-test-recipient-digits-without-plus>") is None
    assert parse_bool_env("true") is True
    assert parse_bool_env("false") is False
    assert mask_secret("infobip_live_9876543210abcd") == "inf****abcd"
    assert mask_secret("<your-infobip-api-key>") == "<placeholder>"

    env_file = tmp_path / ".env.infobip"
    env_file.write_bytes(
        b"\xef\xbb\xbf"
        b"INFOBIP_BASE_URL=https://testnode.api.infobip.com/\n"
        b"INFOBIP_API_KEY=live_secret_token_9911\n"
        b"INFOBIP_SMS_FROM=ServiceSMS\n"
        b"INFOBIP_TEST_TO=2348030000099\n"
        b"MIDWIFE_ONCALL_UYO=+234 803 000 0001\n"
        b"MIDWIFE_ONCALL_IBENO=+2348030000002\n"
        b"MIDWIFE_ONCALL_MBO=+2348030000003\n"
        b"ALERT_DRY_RUN=true\n"
    )

    for k in (
        "INFOBIP_BASE_URL",
        "INFOBIP_API_KEY",
        "INFOBIP_SMS_FROM",
        "INFOBIP_TEST_TO",
        "MIDWIFE_ONCALL_UYO",
        "MIDWIFE_ONCALL_IBENO",
        "MIDWIFE_ONCALL_MBO",
        "ALERT_DRY_RUN",
    ):
        monkeypatch.delenv(k, raising=False)

    summary = initialize_emergency_env(fail_fast=False, env_files=(str(env_file),))
    assert summary["infobip_base_url"] == "testnode.api.infobip.com"
    assert summary["infobip_api_key"] == "liv****9911"
    assert summary["alert_dry_run"] is True
    assert MamaGEmergencyConfig.get_midwife_for_lga("Uyo") == "2348030000001"
    assert MamaGEmergencyConfig.get_midwife_for_lga("Ibeno") == "2348030000002"
    assert MamaGEmergencyConfig.get_midwife_for_lga("Mbo") == "2348030000003"


def test_infobip_payload_and_dialect_routing(monkeypatch):
    """Verify Infobip /sms/2/text/advanced Authorization header, JSON schema, and ibb/ibn notes."""
    captured = {}

    class DummyResponse:
        status_code = 200

        def json(self):
            return {
                "messages": [
                    {
                        "messageId": "ib-msg-42",
                        "status": {"groupName": "PENDING", "name": "PENDING_ENROUTE"},
                    }
                ]
            }

    def fake_post(url, headers=None, json=None, timeout=None):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        captured["timeout"] = timeout
        return DummyResponse()

    import mamag_emergency_alert_service as svc_mod

    fake_requests = types.SimpleNamespace(
        post=fake_post,
        Timeout=TimeoutError,
        RequestException=RuntimeError,
    )
    monkeypatch.setattr(svc_mod, "requests", fake_requests)

    service = MamaGEmergencyAlertService(
        secrets_override={
            "INFOBIP_BASE_URL": "https://clinic1.api.infobip.com/",
            "INFOBIP_API_KEY": "real_key_1234567890",
            "INFOBIP_SMS_FROM": "ServiceSMS",
            "MIDWIFE_ONCALL_IBENO": "+234 803 000 0002",
            "ALERT_DRY_RUN": "false",
        }
    )

    res = service.dispatch_level1_emergency(
        encounter_id="enc-ibn-01",
        device_id="TAB-IBENO-09",
        location_lga="Ibeno",
        climate_risk="vector_malaria",
        action_taken="Parenteral artesunate & urgent transfer",
        language_code="ibn",
    )

    assert res["status"] == "success"
    assert res["sms_sent"] is True
    assert res["message_id"] == "ib-msg-42"
    assert captured["url"] == "https://clinic1.api.infobip.com/sms/2/text/advanced"
    assert captured["headers"]["Authorization"] == "App real_key_1234567890"
    assert captured["json"]["messages"][0]["destinations"] == [{"to": "2348030000002"}]
    assert captured["json"]["messages"][0]["from"] == "ServiceSMS"
    assert "IBN (Ibeno)" in captured["json"]["messages"][0]["text"]
    assert "malaria" in captured["json"]["messages"][0]["text"].lower()


def test_hub_health_endpoint(client):
    """Verify regional hub health check endpoint reports Infobip provider cleanly."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["alert_provider"] == "infobip"


def test_telemetry_ingestion(client):
    """Test field tablet heartbeat and battery telemetry ingestion."""
    telemetry_payload = {
        "device_id": "TAB-IBENO-042",
        "location_lga": "Ibeno",
        "battery_level": 85.5,
        "signal_strength": "Good",
        "pending_sync_count": 3,
        "firmware_version": "1.0.0",
    }

    response = client.post("/api/v1/telemetry", json=telemetry_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["device_id"] == "TAB-IBENO-042"


def test_end_to_end_encounter_sync_resilient_to_infobip_timeout(client, test_db, monkeypatch):
    """
    Validate that even if the external Infobip alert call fails or times out,
    the Level 1 + Level 2 encounter batch still commits cleanly to SQLite.
    """
    def failing_dispatch(*args, **kwargs):
        raise TimeoutError("Simulated Infobip gateway timeout")

    monkeypatch.setattr(
        dashboard_hub.emergency_alert_service,
        "dispatch_level1_emergency",
        failing_dispatch,
    )

    sync_batch_payload = {
        "device_id": "TAB-IBENO-042",
        "encounters": [
            {
                "encounter_id": "enc-uuid-9991",
                "device_id": "TAB-IBENO-042",
                "session_timestamp": datetime.utcnow().isoformat(),
                "patient_age_group": "pregnant_trimester_3",
                "location_lga": "Ibeno",
                "climate_risk_flagged": "extreme_heat",
                "severity_triggered": 1,
                "action_taken": "Immediate cooling, blood pressure check, and emergency referral initiated.",
                "language_code": "ibb",
            },
            {
                "encounter_id": "enc-uuid-9992",
                "device_id": "TAB-IBENO-042",
                "session_timestamp": datetime.utcnow().isoformat(),
                "patient_age_group": "pregnant_trimester_2",
                "location_lga": "Ibeno",
                "climate_risk_flagged": "vector_malaria",
                "severity_triggered": 2,
                "action_taken": "Administered RDT test and prescribed ACT per regional protocol.",
                "language_code": "en",
            },
        ],
    }

    response = client.post("/api/v1/encounters/sync", json=sync_batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["synced_count"] == 2
    assert data["emergency_alerts_failed"] == 1

    # Verify both encounters persisted in SQLite despite external alert failure
    db = test_db()
    try:
        assert db.query(CentralEncounterModel).count() == 2
    finally:
        db.close()


def test_encounter_sync_idempotency(client):
    """Verify that re-syncing the same encounter batch does not create duplicate records."""
    encounter_payload = {
        "device_id": "TAB-MBO-012",
        "encounters": [
            {
                "encounter_id": "enc-uuid-dup-01",
                "device_id": "TAB-MBO-012",
                "session_timestamp": datetime.utcnow().isoformat(),
                "patient_age_group": "pregnant_trimester_1",
                "location_lga": "Mbo",
                "climate_risk_flagged": "waterborne_flood_risk",
                "severity_triggered": 2,
                "action_taken": "Provided oral rehydration salts and boil-water advisory.",
            }
        ],
    }

    res1 = client.post("/api/v1/encounters/sync", json=encounter_payload)
    assert res1.status_code == 200
    assert res1.json()["synced_count"] == 1

    res2 = client.post("/api/v1/encounters/sync", json=encounter_payload)
    assert res2.status_code == 200
    assert res2.json()["synced_count"] == 0
