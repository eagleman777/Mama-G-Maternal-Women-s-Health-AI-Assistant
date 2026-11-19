import {
  recordClinicalEncounterToSqlite,
  loadEdgeSqliteSnapshot,
  markEncountersSyncedInSqlite,
  getOrCreateDeviceId,
  getEdgeTabletLga,
} from './edgeSqliteStore';

export interface MidwifeStationRoster {
  stationId: string;
  lga: string;
  stationName: string;
  midwifeRole: string;
  slaTargetSec: number;
  livePhoneConfigured: boolean;
  maskedNumber: string;
}

export interface MidwifeAlertRecord {
  alertId: string;
  encounterId: string;
  deviceId: string;
  lga: string;
  stationId: string;
  stationName: string;
  midwifeRole: string;
  channel: 'sms';
  languageCode: 'en' | 'ibb' | 'ibn';
  severityLevel: 1 | 2;
  summary: string;
  provider: 'infobip';
  mode: 'infobip_live' | 'dry_run' | 'sandbox_verification';
  messageId: string | null;
  status: 'dispatched_awaiting_ack' | 'acknowledged' | 'failed';
  dispatchedAt: string;
  dispatchedEpochMs: number;
  dispatchLatencyMs: number;
  acknowledgedAt: string | null;
  ackLatencyMs: number | null;
  ackBy: string | null;
  errorDetail: string | null;
}

export interface RosterResponse {
  provider: 'infobip';
  hubUrl: string;
  edgeRepo: string;
  infobipLiveConfigured: boolean;
  infobipBaseUrlConfigured: boolean;
  smsSender: string;
  alertDryRun: boolean;
  stations: MidwifeStationRoster[];
  recentAlerts: MidwifeAlertRecord[];
}

export interface UptimeProbeResult {
  passed: boolean;
  probesSucceeded: number;
  probesTotal: number;
  availabilityPct: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  hubUptimeSeconds: number;
  memoryRssMb: number;
  detail: string;
}

export interface OfflineCacheValidationResult {
  passed: boolean;
  encounterId: string;
  persistedOffline: boolean;
  syncedCount: number;
  idempotentDuplicateBlocked: boolean;
  roundTripLatencyMs: number;
  detail: string;
}

export interface AlertDispatchValidationResult {
  passed: boolean;
  alertRecord: MidwifeAlertRecord | null;
  dispatchLatencyMs: number;
  mode: 'infobip_live' | 'dry_run' | 'sandbox_verification' | 'unavailable';
  detail: string;
}

export interface ThreePillarValidationReport {
  executedAt: string;
  deviceId: string;
  lga: string;
  uptime: UptimeProbeResult;
  offlineCache: OfflineCacheValidationResult;
  emergencyAlert: AlertDispatchValidationResult;
}

export async function fetchMidwifeAlertRoster(): Promise<RosterResponse> {
  const res = await fetch('/api/v1/alerts/roster');
  if (!res.ok) {
    throw new Error(`Roster endpoint HTTP ${res.status}`);
  }
  return res.json();
}

export async function dispatchEmergencyMidwifeAlert(params: {
  encounterId?: string;
  lga: string;
  stationId?: string;
  languageCode?: 'en' | 'ibb' | 'ibn';
  climateRisk?: string;
  severityLevel?: 1 | 2;
  summary: string;
}): Promise<MidwifeAlertRecord> {
  const res = await fetch('/api/v1/alerts/infobip-dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      deviceId: getOrCreateDeviceId(),
    }),
  });
  const data = await res.json();
  if (!res.ok && !data?.alertId) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function acknowledgeMidwifeAlert(
  alertId: string,
  ackBy: string
): Promise<MidwifeAlertRecord> {
  const res = await fetch('/api/v1/alerts/midwife-ack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alertId, ackBy }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Ack HTTP ${res.status}`);
  }
  return data;
}

export async function runUptimeContinuityProbe(iterations: number = 3): Promise<UptimeProbeResult> {
  const latencies: number[] = [];
  let succeeded = 0;
  let hubUptimeSeconds = 0;
  let memoryRssMb = 0;

  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    try {
      const res = await fetch('/api/v1/uptime/probe', { cache: 'no-store' });
      const data = await res.json();
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      if (res.ok && data.status === 'healthy') {
        succeeded += 1;
        latencies.push(elapsed);
        hubUptimeSeconds = data.uptimeSeconds ?? 0;
        memoryRssMb = data.memoryRssMb ?? 0;
      }
    } catch {
      // Probe failure recorded via missed count
    }
  }

  const avgLatencyMs =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;
  const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : 0;
  const availabilityPct = Math.round((succeeded / iterations) * 1000) / 10;
  const passed = succeeded === iterations && maxLatencyMs < 3000;

  return {
    passed,
    probesSucceeded: succeeded,
    probesTotal: iterations,
    availabilityPct,
    avgLatencyMs,
    maxLatencyMs,
    hubUptimeSeconds,
    memoryRssMb,
    detail: passed
      ? `${succeeded}/${iterations} probes healthy (${avgLatencyMs}ms avg RTT, Hub up ${hubUptimeSeconds}s)`
      : `Only ${succeeded}/${iterations} uptime probes reachable.`,
  };
}

export async function runOfflineCacheAndIdempotencyProbe(lga: string): Promise<OfflineCacheValidationResult> {
  const start = performance.now();
  const enc = await recordClinicalEncounterToSqlite({
    patientAgeGroup: '25_34:pregnant_trimester_3',
    locationLga: lga,
    climateRiskFlagged: 'extreme_ambient_heat',
    matchedRuleId: 'heat_hypertension_level_1',
    severityTriggered: 1,
    actionTaken: 'SLA Drill: Cooling protocol initiated; urgent preeclampsia transfer test.',
  });

  // 1. Verify persisted locally with pending status
  const snapshotAfterWrite = await loadEdgeSqliteSnapshot();
  const persistedRecord = snapshotAfterWrite.clinical_encounters.find(
    (e) => e.encounter_id === enc.encounter_id && e.sync_status === 'pending'
  );

  if (!persistedRecord) {
    return {
      passed: false,
      encounterId: enc.encounter_id,
      persistedOffline: false,
      syncedCount: 0,
      idempotentDuplicateBlocked: false,
      roundTripLatencyMs: Math.round(performance.now() - start),
      detail: 'IndexedDB / localStorage write verification failed.',
    };
  }

  // 2. Sync batch and verify idempotent replay protection
  try {
    const payload = {
      device_id: enc.device_id,
      encounters: [persistedRecord],
    };

    const firstRes = await fetch('/api/v1/encounters/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const firstData = await firstRes.json();

    const replayRes = await fetch('/api/v1/encounters/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const replayData = await replayRes.json();

    await markEncountersSyncedInSqlite(
      [enc.encounter_id],
      firstData.synced_count ?? 1,
      replayData.duplicate_count ?? 1
    );

    const roundTripLatencyMs = Math.max(1, Math.round(performance.now() - start));
    const idempotentBlocked = (replayData.synced_count ?? 0) === 0 && (replayData.duplicate_count ?? 0) >= 1;
    const passed = firstRes.ok && (firstData.synced_count ?? 0) === 1 && idempotentBlocked;

    return {
      passed,
      encounterId: enc.encounter_id,
      persistedOffline: true,
      syncedCount: firstData.synced_count ?? 0,
      idempotentDuplicateBlocked: idempotentBlocked,
      roundTripLatencyMs,
      detail: passed
        ? `Cached ${enc.encounter_id} locally -> synced 1/1 -> duplicate replay safely blocked in ${roundTripLatencyMs}ms`
        : 'Sync endpoint or idempotency replay check failed.',
    };
  } catch (err: any) {
    return {
      passed: false,
      encounterId: enc.encounter_id,
      persistedOffline: true,
      syncedCount: 0,
      idempotentDuplicateBlocked: false,
      roundTripLatencyMs: Math.round(performance.now() - start),
      detail: `Encounter safely preserved offline (${enc.encounter_id}); hub unreachable (${err?.message || 'network'}).`,
    };
  }
}

export async function runFullThreePillarValidation(params: {
  lga?: string;
  languageCode?: 'en' | 'ibb' | 'ibn';
  stationId?: string;
}): Promise<ThreePillarValidationReport> {
  const activeLga = params.lga || getEdgeTabletLga();
  const uptime = await runUptimeContinuityProbe(3);
  const offlineCache = await runOfflineCacheAndIdempotencyProbe(activeLga);

  let emergencyAlert: AlertDispatchValidationResult;
  try {
    const alertRecord = await dispatchEmergencyMidwifeAlert({
      encounterId: offlineCache.encounterId,
      lga: activeLga,
      stationId: params.stationId,
      languageCode: params.languageCode || 'en',
      climateRisk: 'extreme_heat',
      severityLevel: 1,
      summary: `SLA Readiness Drill: Level 1 Heat Hypertension (${activeLga}) — Awaiting midwife confirmation`,
    });
    const passed = alertRecord.status !== 'failed' && alertRecord.dispatchLatencyMs < 5000;
    const modeLabel =
      alertRecord.mode === 'infobip_live'
        ? `Infobip Message ID ${alertRecord.messageId}`
        : alertRecord.mode === 'dry_run'
        ? 'Infobip Dry-Run Mode'
        : 'Hub SLA Sandbox';
    emergencyAlert = {
      passed,
      alertRecord,
      dispatchLatencyMs: alertRecord.dispatchLatencyMs,
      mode: alertRecord.mode,
      detail: passed
        ? `Infobip SMS (${alertRecord.languageCode.toUpperCase()}) dispatched to ${alertRecord.stationName} in ${alertRecord.dispatchLatencyMs}ms (${modeLabel})`
        : `Dispatch failed: ${alertRecord.errorDetail || 'Gateway error'}`,
    };
  } catch (err: any) {
    emergencyAlert = {
      passed: false,
      alertRecord: null,
      dispatchLatencyMs: 0,
      mode: 'unavailable',
      detail: err?.message || 'Alert dispatch endpoint unreachable',
    };
  }

  return {
    executedAt: new Date().toISOString(),
    deviceId: getOrCreateDeviceId(),
    lga: activeLga,
    uptime,
    offlineCache,
    emergencyAlert,
  };
}
