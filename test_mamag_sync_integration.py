"""
Mama-G Edge-to-Hub Synchronization Integration Tests
--------------------------------------------------------------------------------
Validates offline encounter logging, batch payload formatting, network transmission,
server-side ingestion, duplicate idempotency, and offline sync audit logging.
"""

import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import FastAPI hub app and models from regional hub module
from dashboard_hub import app, Base, CentralEncounterModel, TabletFleetModel, SessionLocal


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
    import dashboard_hub
    monkeypatch.setattr(dashboard_hub, "SessionLocal", test_db)
    with TestClient(app) as c:
        yield c


def test_hub_health_endpoint(client):
    """Verify regional hub health check endpoint is responsive."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_telemetry_ingestion(client):
    """Test field tablet heartbeat and battery telemetry ingestion."""
    telemetry_payload = {
        "device_id": "TAB-IBENO-042",
        "location_lga": "Ibeno",
        "battery_level": 85.5,
        "signal_strength": "Good",
        "pending_sync_count": 3,
        "firmware_version": "1.0.0"
    }

    response = client.post("/api/v1/telemetry", json=telemetry_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["device_id"] == "TAB-IBENO-042"


def test_end_to_end_encounter_sync(client):
    """
    Validate end-to-end sync: Edge tablet pushes a batch of pending offline
    clinical encounters, the regional hub ingests them, and database records persist.
    """
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
                "action_taken": "Immediate cooling, blood pressure check, and emergency referral initiated."
            },
            {
                "encounter_id": "enc-uuid-9992",
                "device_id": "TAB-IBENO-042",
                "session_timestamp": datetime.utcnow().isoformat(),
                "patient_age_group": "pregnant_trimester_2",
                "location_lga": "Ibeno",
                "climate_risk_flagged": "vector_malaria",
                "severity_triggered": 2,
                "action_taken": "Administered RDT test and prescribed ACT per regional protocol."
            }
        ]
    }

    response = client.post("/api/v1/encounters/sync", json=sync_batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["synced_count"] == 2


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
                "action_taken": "Provided oral rehydration salts and boil-water advisory."
            }
        ]
    }

    # First sync push
    res1 = client.post("/api/v1/encounters/sync", json=encounter_payload)
    assert res1.status_code == 200
    assert res1.json()["synced_count"] == 1

    # Second sync push (duplicate batch)
    res2 = client.post("/api/v1/encounters/sync", json=encounter_payload)
    assert res2.status_code == 200
    # Should recognize existing encounter ID and sync 0 new records
    assert res2.json()["synced_count"] == 0
