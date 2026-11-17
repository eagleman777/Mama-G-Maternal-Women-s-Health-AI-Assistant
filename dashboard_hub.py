"""
Mama-G Regional Hub FastAPI Service
--------------------------------------------------------------------------------
Receives edge field tablet heartbeats/telemetry and idempotent clinical
encounter batches synchronized from rural Akwa Ibom / Lower Cross clinics.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

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

app = FastAPI(
    title="Mama-G Regional Hub API",
    version="1.0.0",
    description="Central synchronization hub for Mama-G offline-first field tablets.",
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


class EncounterSyncBatch(BaseModel):
    device_id: str
    encounters: List[EncounterItem]


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Mama-G Regional Hub"}


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
    seen_in_batch = set()

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

    db.commit()
    return {
        "status": "success",
        "device_id": batch.device_id,
        "synced_count": synced_count,
        "duplicate_count": duplicate_count,
    }
