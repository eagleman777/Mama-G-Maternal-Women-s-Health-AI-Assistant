import assert from 'node:assert/strict';

const BASE_URL = process.env.MAMA_G_HUB_URL || 'http://127.0.0.1:3000';

async function runTests() {
  console.log(`Running Mama-G Edge-to-Hub Sync Integration Tests against ${BASE_URL}...`);

  // 1. Hub health endpoint
  const healthRes = await fetch(`${BASE_URL}/api/v1/health`);
  assert.equal(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.equal(healthData.status, 'healthy');
  console.log('✓ test_hub_health_endpoint passed');

  // 2. Telemetry ingestion
  const telemetryRes = await fetch(`${BASE_URL}/api/v1/telemetry`, {
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
  assert.equal(telemetryRes.status, 200);
  const telemetryData = await telemetryRes.json();
  assert.equal(telemetryData.status, 'success');
  assert.equal(telemetryData.device_id, 'TAB-IBENO-042');
  console.log('✓ test_telemetry_ingestion passed');

  // 3. End-to-end encounter sync
  const batchId = Date.now().toString(36);
  const syncRes = await fetch(`${BASE_URL}/api/v1/encounters/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: 'TAB-IBENO-042',
      encounters: [
        {
          encounter_id: `enc-uuid-9991-${batchId}`,
          device_id: 'TAB-IBENO-042',
          session_timestamp: new Date().toISOString(),
          patient_age_group: 'pregnant_trimester_3',
          location_lga: 'Ibeno',
          climate_risk_flagged: 'extreme_heat',
          severity_triggered: 1,
          action_taken: 'Immediate cooling, blood pressure check, and emergency referral initiated.',
        },
        {
          encounter_id: `enc-uuid-9992-${batchId}`,
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
  assert.equal(syncRes.status, 200);
  const syncData = await syncRes.json();
  assert.equal(syncData.status, 'success');
  assert.equal(syncData.synced_count, 2);
  console.log('✓ test_end_to_end_encounter_sync passed');

  // 4. Duplicate idempotency
  const dupPayload = {
    device_id: 'TAB-MBO-012',
    encounters: [
      {
        encounter_id: `enc-uuid-dup-${batchId}`,
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

  const firstPush = await fetch(`${BASE_URL}/api/v1/encounters/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dupPayload),
  });
  assert.equal(firstPush.status, 200);
  assert.equal((await firstPush.json()).synced_count, 1);

  const secondPush = await fetch(`${BASE_URL}/api/v1/encounters/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dupPayload),
  });
  assert.equal(secondPush.status, 200);
  assert.equal((await secondPush.json()).synced_count, 0);
  console.log('✓ test_encounter_sync_idempotency passed');

  console.log('All 4 Edge-to-Hub Synchronization Integration Tests Passed.');
}

runTests().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
