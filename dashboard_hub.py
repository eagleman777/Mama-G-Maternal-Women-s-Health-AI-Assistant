"""
Mama-G Regional Hub FastAPI Service
--------------------------------------------------------------------------------
Target Hub: https://hub.mamag-health.org
Edge Node:  https://github.com/mamag/edge-node

Receives edge field tablet heartbeats/telemetry and idempotent clinical
encounter batches synchronized from rural Akwa Ibom / Lower Cross clinics
(Uyo, Ibeno, Mbo). Triggers Infobip Level 1 midwife SMS alerts without ever
breaking offline SQLite/edge sync batch ingestion on external API failure.
"""

from contextlib import asynccontextmanager
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from mamag_emergency_alert_service import (
    MamaGEmergencyAlertService,
    MamaGEmergencyConfig,
    initialize_emergency_env,
)

logger = logging.getLogger("MamaGRegionalHub")

DATABASE_URL = "sqlite:///./mama_g_regional_hub.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class TabletFleetModel(Base):
    __tablename__ = "tablet_fleet"

    device_id = Column(String, primary_key=True, index=True)
    location_lga = Column(String, nullable=False, index=True)
    battery_level = Column(Float, nullable=True)
    signal_strength = Column(String, nullable=True)
    pending_sync_count = Column(Integer, default=0)
    firmware_version = Column(String, default="1.0.0")
    last_heartbeat_at = Column(DateTime, default=datetime.utcnow)


class CentralEncounterModel(Base):
    __tablename__ = "central_encounters"

    encounter_id = Column(String, primary_key=True, index=True)
    device_id = Column(String, nullable=False, index=True)
    session_timestamp = Column(String, nullable=False)
    patient_age_group = Column(String, nullable=True)
    location_lga = Column(String, nullable=True, index=True)
    climate_risk_flagged = Column(String, default="none")
    matched_rule_id = Column(String, nullable=True)
    severity_triggered = Column(Integer, nullable=False)
    action_taken = Column(Text, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

# Module-level service refreshed cleanly during FastAPI startup lifespan
emergency_alert_service = MamaGEmergencyAlertService()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global emergency_alert_service
    initialize_emergency_env(fail_fast=False)
    emergency_alert_service = MamaGEmergencyAlertService()
    yield


app = FastAPI(
    title="Mama-G Regional Hub API",
    version="2.0.0",
    description=(
        "Central synchronization hub (https://hub.mamag-health.org) for Mama-G "
        "offline-first field tablets (https://github.com/mamag/edge-node) with "
        "Infobip emergency midwife SMS dispatch."
    ),
    lifespan=lifespan,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TelemetryPayload(BaseModel):
    device_id: str
    location_lga: str
    battery_level: Optional[float] = None
    signal_strength: Optional[str] = None
    pending_sync_count: int = 0
    firmware_version: str = "1.0.0"


class EncounterItem(BaseModel):
    encounter_id: str
    device_id: str
    session_timestamp: str
    patient_age_group: Optional[str] = None
    location_lga: Optional[str] = None
    climate_risk_flagged: str = "none"
    matched_rule_id: Optional[str] = None
    severity_triggered: int = Field(ge=1, le=3)
    action_taken: str
    language_code: Optional[str] = "en"


class EncounterSyncBatch(BaseModel):
    device_id: str
    encounters: List[EncounterItem]


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Mama-G Regional Hub",
        "hub_url": MamaGEmergencyConfig.MAMAG_HUB_URL,
        "edge_repo": MamaGEmergencyConfig.MAMAG_EDGE_REPO,
        "alert_provider": "infobip",
        "infobip_live_configured": MamaGEmergencyConfig.has_live_credentials(),
        "alert_dry_run": MamaGEmergencyConfig.ALERT_DRY_RUN,
    }


@app.post("/api/v1/telemetry")
def ingest_telemetry(payload: TelemetryPayload, db: Session = Depends(get_db)):
    existing = (
        db.query(TabletFleetModel)
        .filter(TabletFleetModel.device_id == payload.device_id)
        .first()
    )
    if existing:
        existing.location_lga = payload.location_lga
        existing.battery_level = payload.battery_level
        existing.signal_strength = payload.signal_strength
        existing.pending_sync_count = payload.pending_sync_count
        existing.firmware_version = payload.firmware_version
        existing.last_heartbeat_at = datetime.utcnow()
    else:
        db.add(
            TabletFleetModel(
                device_id=payload.device_id,
                location_lga=payload.location_lga,
                battery_level=payload.battery_level,
                signal_strength=payload.signal_strength,
                pending_sync_count=payload.pending_sync_count,
                firmware_version=payload.firmware_version,
                last_heartbeat_at=datetime.utcnow(),
            )
        )
    db.commit()
    return {
        "status": "success",
        "device_id": payload.device_id,
        "location_lga": payload.location_lga,
    }


@app.post("/api/v1/encounters/sync")
def sync_encounters(batch: EncounterSyncBatch, db: Session = Depends(get_db)):
    synced_count = 0
    duplicate_count = 0
    emergency_alerts_dispatched = 0
    emergency_alerts_failed = 0
    alert_results: List[Dict[str, Any]] = []
    seen_in_batch = set()
    level1_encounters: List[EncounterItem] = []

    for enc in batch.encounters:
        if enc.encounter_id in seen_in_batch:
            duplicate_count += 1
            continue
        seen_in_batch.add(enc.encounter_id)

        exists = (
            db.query(CentralEncounterModel)
            .filter(CentralEncounterModel.encounter_id == enc.encounter_id)
            .first()
        )
        if exists:
            duplicate_count += 1
            continue

        db.add(
            CentralEncounterModel(
                encounter_id=enc.encounter_id,
                device_id=enc.device_id,
                session_timestamp=enc.session_timestamp,
                patient_age_group=enc.patient_age_group,
                location_lga=enc.location_lga,
                climate_risk_flagged=enc.climate_risk_flagged,
                matched_rule_id=enc.matched_rule_id,
                severity_triggered=enc.severity_triggered,
                action_taken=enc.action_taken,
                received_at=datetime.utcnow(),
            )
        )
        synced_count += 1
        if enc.severity_triggered == 1:
            level1_encounters.append(enc)

    # Always commit clinical encounters first so offline SQLite edge-sync durability
    # is never blocked or rolled back by external Infobip network outages/timeouts.
    db.commit()

    for l1_enc in level1_encounters:
        try:
            dispatch_res = emergency_alert_service.dispatch_level1_emergency(
                encounter_id=l1_enc.encounter_id,
                device_id=l1_enc.device_id,
                location_lga=l1_enc.location_lga or "Uyo",
                climate_risk=l1_enc.climate_risk_flagged or "obstetric_emergency",
                action_taken=l1_enc.action_taken,
                language_code=l1_enc.language_code or "en",
            )
            alert_results.append(
                {
                    "encounter_id": l1_enc.encounter_id,
                    "lga": dispatch_res.get("location_lga"),
                    "status": dispatch_res.get("status"),
                    "dry_run": dispatch_res.get("dry_run", False),
                    "message_id": dispatch_res.get("message_id"),
                }
            )
            if dispatch_res.get("status") in {"success", "dry_run"}:
                emergency_alerts_dispatched += 1
            else:
                emergency_alerts_failed += 1
        except Exception as exc:  # Defensive isolation around external alert path
            emergency_alerts_failed += 1
            logger.exception(
                "Infobip dispatch raised unexpected error for Encounter %s; batch sync preserved: %s",
                l1_enc.encounter_id,
                exc,
            )
            alert_results.append(
                {
                    "encounter_id": l1_enc.encounter_id,
                    "lga": l1_enc.location_lga or "Uyo",
                    "status": "failed",
                    "dry_run": False,
                    "message_id": None,
                    "error": str(exc),
                }
            )

    return {
        "status": "success",
        "device_id": batch.device_id,
        "synced_count": synced_count,
        "duplicate_count": duplicate_count,
        "emergency_alerts_dispatched": emergency_alerts_dispatched,
        "emergency_alerts_failed": emergency_alerts_failed,
        "alert_provider": "infobip",
        "alert_results": alert_results,
    }
