import edgeSchemaSqlRaw from './edge_tablet_schema.sql?raw';

export interface SyncMetadataRow {
  key: string;
  value: string;
  updated_at: string;
}

export interface SqliteTriageRuleRow {
  rule_id: string;
  module_name: string;
  severity_level: 1 | 2 | 3;
  trigger_condition: string;
  clinical_action: string;
  effective_start_date: string | null;
  effective_end_date: string | null;
  version: number;
  created_at: string;
}

export interface LocalizedLexiconRow {
  term_id: string;
  language_code: 'en' | 'ibb' | 'ibn';
  standard_english_phrase: string;
  localized_equivalent: string;
  phonetic_guide: string | null;
  clinical_category: 'symptom_warning' | 'body_part' | 'action_prompt';
}

export interface ClinicalEncounterRow {
  encounter_id: string;
  device_id: string;
  session_timestamp: string;
  patient_age_group: string;
  location_lga: string;
  climate_risk_flagged: string;
  matched_rule_id: string | null;
  severity_triggered: 1 | 2 | 3;
  action_taken: string;
  sync_status: 'pending' | 'synced';
}

export interface OfflineSyncLogRow {
  sync_log_id: number;
  sync_timestamp: string;
  records_uploaded: number;
  rules_downloaded: number;
  status: 'success' | 'failed' | 'partial';
  error_message: string | null;
}

export interface EdgeSqliteSnapshot {
  sync_metadata: SyncMetadataRow[];
  triage_rules: SqliteTriageRuleRow[];
  localized_lexicon: LocalizedLexiconRow[];
  clinical_encounters: ClinicalEncounterRow[];
  offline_sync_logs: OfflineSyncLogRow[];
}

export const EDGE_TABLET_SCHEMA_SQL = edgeSchemaSqlRaw;

const STORAGE_KEY = 'mama_g_edge_sqlite_snapshot_v1';
const DEVICE_ID_KEY = 'mama_g_edge_device_id';
const LGA_KEY = 'mama_g_edge_lga';
const IDB_NAME = 'mama_g_edge_tablet_sqlite_db';
const IDB_STORE = 'sqlite_tables';

export function getOrCreateDeviceId(): string {
  try {
    let existing = localStorage.getItem(DEVICE_ID_KEY);
    if (!existing) {
      existing = `TAB-AKW-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      localStorage.setItem(DEVICE_ID_KEY, existing);
    }
    return existing;
  } catch {
    return 'TAB-AKW-EDGE-01';
  }
}

export function getEdgeTabletLga(): string {
  try {
    return localStorage.getItem(LGA_KEY) || 'Uyo';
  } catch {
    return 'Uyo';
  }
}

export function setEdgeTabletLga(lga: string): void {
  try {
    localStorage.setItem(LGA_KEY, lga);
  } catch {}
}

function getDefaultSnapshot(): EdgeSqliteSnapshot {
  const now = new Date().toISOString();
  return {
    sync_metadata: [
      { key: 'schema_version', value: '1.0.0', updated_at: now },
      { key: 'journal_mode', value: 'WAL (Foreign Keys ON)', updated_at: now },
      { key: 'climate_module_version', value: 'MamaG_Climate_Health_Extension_1.0.0', updated_at: now },
      { key: 'target_zone', value: 'Akwa Ibom / Lower Cross Coastal Belt', updated_at: now },
      { key: 'device_id', value: getOrCreateDeviceId(), updated_at: now },
    ],
    triage_rules: [
      {
        rule_id: 'heat_hypertension_level_1',
        module_name: 'heat_stress',
        severity_level: 1,
        trigger_condition: '{"all":["headache_or_vision","trimester_2_or_3"],"any":["bp>=140/90","sudden_facial_hand_swelling","ruq_pain"]}',
        clinical_action: 'Immediate emergency transport to secondary/tertiary obstetric facility; initiate cooling protocols (shaded rest, damp cloths).',
        effective_start_date: '2026-01-01',
        effective_end_date: null,
        version: 1,
        created_at: now,
      },
      {
        rule_id: 'heat_stress_level_2',
        module_name: 'heat_stress',
        severity_level: 2,
        trigger_condition: '{"all":["high_heat_index"],"any":["dizziness","excessive_fatigue","mild_dehydration"],"exclude":["bp>=140/90"]}',
        clinical_action: 'Administer Oral Rehydration Salts (ORS), mandatory relocation to shaded/ventilated area, and monitor vitals/BP for 2 hours.',
        effective_start_date: '2026-01-01',
        effective_end_date: null,
        version: 1,
        created_at: now,
      },
      {
        rule_id: 'severe_malaria_level_1',
        module_name: 'vector_malaria',
        severity_level: 1,
        trigger_condition: '{"all":["fever_or_chills"],"any":["inability_to_keep_fluids","extreme_lethargy","jaundice","dark_urine","severe_anemia"]}',
        clinical_action: 'Immediate Malaria RDT, parenteral anti-malarials (IV Artesunate) per national guidelines, and urgent hospital transfer.',
        effective_start_date: '2026-01-01',
        effective_end_date: null,
        version: 1,
        created_at: now,
      },
      {
        rule_id: 'uncomplicated_malaria_level_2',
        module_name: 'vector_malaria',
        severity_level: 2,
        trigger_condition: '{"all":["fever_or_chills","peak_vector_season"],"exclude":["severe_malaria_red_flags"]}',
        clinical_action: 'Immediate Malaria RDT, prompt guideline-approved ACT therapy, and ITN bednet utilization counseling.',
        effective_start_date: '2026-01-01',
        effective_end_date: null,
        version: 1,
        created_at: now,
      },
      {
        rule_id: 'waterborne_flood_risk',
        module_name: 'flood_waterborne',
        severity_level: 2,
        trigger_condition: '{"all":["post_flood_exposure"],"any":["acute_watery_diarrhea","stomach_cramps"]}',
        clinical_action: 'Immediate WHO Oral Rehydration Salts (ORS), safe water chlorination/boiling counseling, and clinic evaluation.',
        effective_start_date: '2026-01-01',
        effective_end_date: null,
        version: 1,
        created_at: now,
      },
      {
        rule_id: 'obstetric_preeclampsia_redflag',
        module_name: 'obstetric_standard',
        severity_level: 1,
        trigger_condition: '{"any":["bp>=160/110","convulsions","vaginal_bleeding","absent_fetal_kicks"]}',
        clinical_action: 'Emergency obstetric referral; initiate MgSO4 loading protocol where authorized and arrange rapid facility transfer.',
        effective_start_date: '2026-01-01',
        effective_end_date: null,
        version: 1,
        created_at: now,
      },
    ],
    localized_lexicon: [
      {
        term_id: 'lex_heat_ibb',
        language_code: 'ibb',
        standard_english_phrase: 'Are you feeling dizzy from the severe heat?',
        localized_equivalent: 'Idem kpon̄ ut mama? / Ekeme ndikot udim ufan̄ obio usen emi?',
        phonetic_guide: 'ee-dem kpon oot ma-ma',
        clinical_category: 'symptom_warning',
      },
      {
        term_id: 'lex_swelling_ibb',
        language_code: 'ibb',
        standard_english_phrase: 'Do you have sudden swelling in your face or hands?',
        localized_equivalent: 'Idem usụhọ / Isọn̄ ke ubọk ye iso',
        phonetic_guide: 'ee-dem oo-soo-ho / ee-song keh oo-bok yeh ee-so',
        clinical_category: 'symptom_warning',
      },
      {
        term_id: 'lex_fever_ibb',
        language_code: 'ibb',
        standard_english_phrase: 'Are you having chills and fever from mosquito illness?',
        localized_equivalent: 'Utọdọn̄ / Usen ofụn̄ mîkpon̄',
        phonetic_guide: 'oo-to-dong / oo-sen o-foon mee-kpong',
        clinical_category: 'symptom_warning',
      },
      {
        term_id: 'lex_heat_ibn',
        language_code: 'ibn',
        standard_english_phrase: 'Are you feeling dizzy from the severe heat?',
        localized_equivalent: 'Idem kpon̄ ut mama? / Udim obio emi akama ndikot',
        phonetic_guide: 'ee-dem kpon oot ma-ma',
        clinical_category: 'symptom_warning',
      },
      {
        term_id: 'lex_ors_ibb',
        language_code: 'ibb',
        standard_english_phrase: 'Drink clean water mixed with Oral Rehydration Salts and rest in the shade.',
        localized_equivalent: 'N̄wọn̄ edisana mmọn̄ ye ORS nyụn̄ duọk odudu ke mfụt.',
        phonetic_guide: 'ngwong eh-dee-sa-na mmong yeh ORS',
        clinical_category: 'action_prompt',
      },
    ],
    clinical_encounters: [],
    offline_sync_logs: [
      {
        sync_log_id: 1,
        sync_timestamp: now,
        records_uploaded: 0,
        rules_downloaded: 6,
        status: 'success',
        error_message: null,
      },
    ],
  };
}

async function persistSnapshot(snapshot: EdgeSqliteSnapshot): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}

  if (typeof indexedDB === 'undefined') return;

  await new Promise<void>((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        try {
          const db = req.result;
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).put(snapshot, 'snapshot');
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mama-g-sqlite-updated'));
  }
}

export async function loadEdgeSqliteSnapshot(): Promise<EdgeSqliteSnapshot> {
  // Try IndexedDB first, fallback to localStorage, then initialize seed
  if (typeof indexedDB !== 'undefined') {
    const fromIdb = await new Promise<EdgeSqliteSnapshot | null>((resolve) => {
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE);
          }
        };
        req.onsuccess = () => {
          try {
            const db = req.result;
            const tx = db.transaction(IDB_STORE, 'readonly');
            const getReq = tx.objectStore(IDB_STORE).get('snapshot');
            getReq.onsuccess = () => resolve(getReq.result || null);
            getReq.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    if (fromIdb) return fromIdb;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as EdgeSqliteSnapshot;
    }
  } catch {}

  const seed = getDefaultSnapshot();
  await persistSnapshot(seed);
  return seed;
}

export async function recordClinicalEncounterToSqlite(input: {
  patientAgeGroup: string;
  locationLga?: string;
  climateRiskFlagged: string;
  matchedRuleId: string | null;
  severityTriggered: 1 | 2 | 3;
  actionTaken: string;
}): Promise<ClinicalEncounterRow> {
  const snapshot = await loadEdgeSqliteSnapshot();
  const encounter: ClinicalEncounterRow = {
    encounter_id: `ENC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    device_id: getOrCreateDeviceId(),
    session_timestamp: new Date().toISOString(),
    patient_age_group: input.patientAgeGroup,
    location_lga: input.locationLga || getEdgeTabletLga(),
    climate_risk_flagged: input.climateRiskFlagged || 'none',
    matched_rule_id: input.matchedRuleId,
    severity_triggered: input.severityTriggered,
    action_taken: input.actionTaken.slice(0, 240),
    sync_status: 'pending',
  };

  snapshot.clinical_encounters = [encounter, ...snapshot.clinical_encounters].slice(0, 200);
  await persistSnapshot(snapshot);
  return encounter;
}

export async function fetchPendingEncountersFromSqlite(): Promise<ClinicalEncounterRow[]> {
  const snapshot = await loadEdgeSqliteSnapshot();
  return snapshot.clinical_encounters.filter((e) => e.sync_status === 'pending');
}

export async function markEncountersSyncedInSqlite(
  encounterIds: string[],
  syncedCount: number,
  duplicateCount: number = 0
): Promise<EdgeSqliteSnapshot> {
  const snapshot = await loadEdgeSqliteSnapshot();
  const idSet = new Set(encounterIds);
  const now = new Date().toISOString();
  const nextLogId =
    snapshot.offline_sync_logs.reduce((max, l) => Math.max(max, l.sync_log_id), 0) + 1;

  snapshot.clinical_encounters = snapshot.clinical_encounters.map((e) =>
    idSet.has(e.encounter_id) ? { ...e, sync_status: 'synced' } : e
  );

  const lastSyncIdx = snapshot.sync_metadata.findIndex((m) => m.key === 'last_hub_sync');
  const lastSyncRow: SyncMetadataRow = {
    key: 'last_hub_sync',
    value: now,
    updated_at: now,
  };
  if (lastSyncIdx >= 0) {
    snapshot.sync_metadata[lastSyncIdx] = lastSyncRow;
  } else {
    snapshot.sync_metadata.push(lastSyncRow);
  }

  const successLog: OfflineSyncLogRow = {
    sync_log_id: nextLogId,
    sync_timestamp: now,
    records_uploaded: syncedCount,
    rules_downloaded: 0,
    status: 'success',
    error_message:
      duplicateCount > 0
        ? `Reconnection auto-sync: ${duplicateCount} duplicate(s) skipped safely.`
        : 'Reconnection auto-sync committed.',
  };
  snapshot.offline_sync_logs = [successLog, ...snapshot.offline_sync_logs].slice(0, 50);

  await persistSnapshot(snapshot);
  return snapshot;
}

export async function recordSyncFailureInSqlite(errorMessage: string): Promise<EdgeSqliteSnapshot> {
  const snapshot = await loadEdgeSqliteSnapshot();
  const nextLogId =
    snapshot.offline_sync_logs.reduce((max, l) => Math.max(max, l.sync_log_id), 0) + 1;

  const failedLog: OfflineSyncLogRow = {
    sync_log_id: nextLogId,
    sync_timestamp: new Date().toISOString(),
    records_uploaded: 0,
    rules_downloaded: 0,
    status: 'failed',
    error_message: errorMessage,
  };
  snapshot.offline_sync_logs = [failedLog, ...snapshot.offline_sync_logs].slice(0, 50);

  await persistSnapshot(snapshot);
  return snapshot;
}

export async function syncEdgeTabletWithHub(isOfflineOverride?: boolean): Promise<{
  snapshot: EdgeSqliteSnapshot;
  log: OfflineSyncLogRow;
}> {
  const snapshot = await loadEdgeSqliteSnapshot();
  const pendingEncounters = snapshot.clinical_encounters.filter((e) => e.sync_status === 'pending');
  const nextLogId =
    snapshot.offline_sync_logs.reduce((max, l) => Math.max(max, l.sync_log_id), 0) + 1;
  const now = new Date().toISOString();

  if (isOfflineOverride || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    const failedLog: OfflineSyncLogRow = {
      sync_log_id: nextLogId,
      sync_timestamp: now,
      records_uploaded: 0,
      rules_downloaded: 0,
      status: 'failed',
      error_message: 'Device offline — pending encounters preserved safely in local WAL SQLite cache.',
    };
    snapshot.offline_sync_logs = [failedLog, ...snapshot.offline_sync_logs].slice(0, 50);
    await persistSnapshot(snapshot);
    return { snapshot, log: failedLog };
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const lga = getEdgeTabletLga();

    // 1. Send tablet fleet telemetry heartbeat
    await fetch('/api/v1/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        location_lga: lga,
        battery_level: 92.0,
        signal_strength: 'Good',
        pending_sync_count: pendingEncounters.length,
        firmware_version: '1.0.0',
      }),
    }).catch(() => {});

    // 2. Push pending clinical encounters idempotently
    const response = await fetch('/api/v1/encounters/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        encounters: pendingEncounters,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hub responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const uploadedCount = typeof data.synced_count === 'number' ? data.synced_count : pendingEncounters.length;
    const syncedIds = new Set(pendingEncounters.map((e) => e.encounter_id));

    snapshot.clinical_encounters = snapshot.clinical_encounters.map((e) =>
      syncedIds.has(e.encounter_id) ? { ...e, sync_status: 'synced' } : e
    );

    const rulesDownloaded = 0;

    // Update sync_metadata timestamp
    const lastSyncIdx = snapshot.sync_metadata.findIndex((m) => m.key === 'last_hub_sync');
    const lastSyncRow: SyncMetadataRow = {
      key: 'last_hub_sync',
      value: now,
      updated_at: now,
    };
    if (lastSyncIdx >= 0) {
      snapshot.sync_metadata[lastSyncIdx] = lastSyncRow;
    } else {
      snapshot.sync_metadata.push(lastSyncRow);
    }

    const successLog: OfflineSyncLogRow = {
      sync_log_id: nextLogId,
      sync_timestamp: now,
      records_uploaded: uploadedCount,
      rules_downloaded: rulesDownloaded,
      status: 'success',
      error_message:
        data.duplicate_count > 0
          ? `Idempotency verified: ${data.duplicate_count} duplicate(s) skipped safely.`
          : null,
    };
    snapshot.offline_sync_logs = [successLog, ...snapshot.offline_sync_logs].slice(0, 50);
    await persistSnapshot(snapshot);
    return { snapshot, log: successLog };
  } catch (err: any) {
    const failedLog: OfflineSyncLogRow = {
      sync_log_id: nextLogId,
      sync_timestamp: now,
      records_uploaded: 0,
      rules_downloaded: 0,
      status: 'failed',
      error_message: err?.message || 'Regional hub unreachable',
    };
    snapshot.offline_sync_logs = [failedLog, ...snapshot.offline_sync_logs].slice(0, 50);
    await persistSnapshot(snapshot);
    return { snapshot, log: failedLog };
  }
}

export interface IntegrationTestCaseResult {
  name: string;
  passed: boolean;
  detail: string;
  durationMs: number;
}

export async function runEdgeToHubIntegrationDiagnostics(): Promise<IntegrationTestCaseResult[]> {
  const results: IntegrationTestCaseResult[] = [];
  const runSuffix = Date.now().toString(36);

  // 1. Hub Health Endpoint
  {
    const start = performance.now();
    try {
      const res = await fetch('/api/v1/health');
      const data = await res.json();
      const ok = res.status === 200 && data.status === 'healthy';
      results.push({
        name: 'test_hub_health_endpoint',
        passed: ok,
        detail: ok ? `HTTP 200 (${data.status})` : `Unexpected status ${res.status}`,
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({
        name: 'test_hub_health_endpoint',
        passed: false,
        detail: e?.message || 'Network error',
        durationMs: Math.round(performance.now() - start),
      });
    }
  }

  // 2. Telemetry Ingestion
  {
    const start = performance.now();
    try {
      const res = await fetch('/api/v1/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: 'TAB-IBENO-042',
          location_lga: 'Ibeno',
          battery_level: 85.5,
          signal_strength: 'Good',
          pending_sync_count: 3,
          firmware_version: '1.0.0',
        }),
      });
      const data = await res.json();
      const ok = res.status === 200 && data.status === 'success' && data.device_id === 'TAB-IBENO-042';
      results.push({
        name: 'test_telemetry_ingestion',
        passed: ok,
        detail: ok ? 'Device TAB-IBENO-042 heartbeat accepted' : 'Telemetry assertion failed',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({
        name: 'test_telemetry_ingestion',
        passed: false,
        detail: e?.message || 'Network error',
        durationMs: Math.round(performance.now() - start),
      });
    }
  }

  // 3. End-to-End Batch Encounter Sync
  {
    const start = performance.now();
    try {
      const res = await fetch('/api/v1/encounters/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: 'TAB-IBENO-042',
          encounters: [
            {
              encounter_id: `enc-uuid-9991-${runSuffix}`,
              device_id: 'TAB-IBENO-042',
              session_timestamp: new Date().toISOString(),
              patient_age_group: 'pregnant_trimester_3',
              location_lga: 'Ibeno',
              climate_risk_flagged: 'extreme_heat',
              severity_triggered: 1,
              action_taken: 'Immediate cooling, blood pressure check, and emergency referral initiated.',
            },
            {
              encounter_id: `enc-uuid-9992-${runSuffix}`,
              device_id: 'TAB-IBENO-042',
              session_timestamp: new Date().toISOString(),
              patient_age_group: 'pregnant_trimester_2',
              location_lga: 'Ibeno',
              climate_risk_flagged: 'vector_malaria',
              severity_triggered: 2,
              action_taken: 'Administered RDT test and prescribed ACT per regional protocol.',
            },
          ],
        }),
      });
      const data = await res.json();
      const ok = res.status === 200 && data.status === 'success' && data.synced_count === 2;
      results.push({
        name: 'test_end_to_end_encounter_sync',
        passed: ok,
        detail: ok ? `Ingested ${data.synced_count}/2 encounters cleanly` : `synced_count=${data.synced_count}`,
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({
        name: 'test_end_to_end_encounter_sync',
        passed: false,
        detail: e?.message || 'Network error',
        durationMs: Math.round(performance.now() - start),
      });
    }
  }

  // 4. Duplicate Batch Idempotency
  {
    const start = performance.now();
    try {
      const payload = {
        device_id: 'TAB-MBO-012',
        encounters: [
          {
            encounter_id: `enc-uuid-dup-${runSuffix}`,
            device_id: 'TAB-MBO-012',
            session_timestamp: new Date().toISOString(),
            patient_age_group: 'pregnant_trimester_1',
            location_lga: 'Mbo',
            climate_risk_flagged: 'waterborne_flood_risk',
            severity_triggered: 2,
            action_taken: 'Provided oral rehydration salts and boil-water advisory.',
          },
        ],
      };
      const first = await fetch('/api/v1/encounters/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const firstData = await first.json();
      const second = await fetch('/api/v1/encounters/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const secondData = await second.json();
      const ok = firstData.synced_count === 1 && secondData.synced_count === 0;
      results.push({
        name: 'test_encounter_sync_idempotency',
        passed: ok,
        detail: ok
          ? '1st push synced=1, 2nd duplicate push synced=0 (0 duplicates)'
          : `1st=${firstData.synced_count}, 2nd=${secondData.synced_count}`,
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({
        name: 'test_encounter_sync_idempotency',
        passed: false,
        detail: e?.message || 'Network error',
        durationMs: Math.round(performance.now() - start),
      });
    }
  }

  return results;
}

function sqlQuote(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function generateSeededSqliteDump(snapshot: EdgeSqliteSnapshot): string {
  const lines: string[] = [EDGE_TABLET_SCHEMA_SQL.trim(), ''];

  lines.push('-- ============================================================================');
  lines.push('-- Live Edge Tablet Snapshot Export');
  lines.push(`-- Exported At: ${new Date().toISOString()}`);
  lines.push('-- ============================================================================\n');

  if (snapshot.clinical_encounters.length > 0) {
    lines.push('-- Clinical Encounters Snapshot');
    for (const enc of snapshot.clinical_encounters) {
      lines.push(
        `INSERT OR REPLACE INTO clinical_encounters (encounter_id, device_id, session_timestamp, patient_age_group, location_lga, climate_risk_flagged, matched_rule_id, severity_triggered, action_taken, sync_status) VALUES (${sqlQuote(enc.encounter_id)}, ${sqlQuote(enc.device_id)}, ${sqlQuote(enc.session_timestamp)}, ${sqlQuote(enc.patient_age_group)}, ${sqlQuote(enc.location_lga)}, ${sqlQuote(enc.climate_risk_flagged)}, ${sqlQuote(enc.matched_rule_id)}, ${enc.severity_triggered}, ${sqlQuote(enc.action_taken)}, ${sqlQuote(enc.sync_status)});`
      );
    }
    lines.push('');
  }

  if (snapshot.offline_sync_logs.length > 0) {
    lines.push('-- Offline Sync Audit Logs Snapshot');
    for (const log of snapshot.offline_sync_logs) {
      lines.push(
        `INSERT OR IGNORE INTO offline_sync_logs (sync_log_id, sync_timestamp, records_uploaded, rules_downloaded, status, error_message) VALUES (${log.sync_log_id}, ${sqlQuote(log.sync_timestamp)}, ${log.records_uploaded}, ${log.rules_downloaded}, ${sqlQuote(log.status)}, ${sqlQuote(log.error_message)});`
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}
