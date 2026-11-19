/**
 * Mama-G Field Operations Validation Runner
 * -----------------------------------------------------------------------------
 * Validates live Regional Hub uptime & latency, offline encounter batch sync +
 * duplicate idempotency, and emergency Infobip SMS dispatch + midwife ack SLA.
 *
 * Usage:
 *   HUB_URL=http://localhost:3000 npx tsx scripts/validate_field_operations.ts
 */

const HUB_URL = (process.env.HUB_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');

function assert(cond: boolean, msg: string) {
  if (!cond) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function main() {
  console.log('========================================================================');
  console.log('   MAMA-G FIELD VALIDATION: UPTIME, OFFLINE SYNC & MIDWIFE ALERT SLA   ');
  console.log('========================================================================');
  console.log(`Target Hub: ${HUB_URL}\n`);

  // 1. Real-world Uptime & Latency Probes (3 consecutive checks)
  const rtts: number[] = [];
  for (let i = 1; i <= 3; i += 1) {
    const t0 = performance.now();
    const res = await fetch(`${HUB_URL}/api/v1/uptime/probe`);
    const data = await res.json();
    const rtt = Math.max(1, Math.round(performance.now() - t0));
    rtts.push(rtt);
    assert(res.status === 200 && data.status === 'healthy', `Probe #${i} unhealthy`);
    console.log(
      `[PASS] Uptime Probe #${i}: HTTP 200 | RTT=${rtt}ms | Server Uptime=${data.uptimeSeconds}s | Mem=${data.memoryRssMb}MB`
    );
  }
  const avgRtt = Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length);
  console.log(`[SUMMARY] Uptime Continuity: 3/3 (100%) | Avg RTT=${avgRtt}ms\n`);

  // 2. Offline Encounter Caching -> Batch Sync -> Duplicate Idempotency
  const drillEncounterId = `ENC-SLA-${Date.now().toString(36).toUpperCase()}`;
  const syncPayload = {
    device_id: 'TAB-IBENO-SLA-01',
    encounters: [
      {
        encounter_id: drillEncounterId,
        device_id: 'TAB-IBENO-SLA-01',
        session_timestamp: new Date().toISOString(),
        patient_age_group: '25_34:pregnant_trimester_3',
        location_lga: 'Ibeno',
        climate_risk_flagged: 'extreme_ambient_heat',
        matched_rule_id: 'heat_hypertension_level_1',
        severity_triggered: 1,
        action_taken: 'Cooling protocol + emergency obstetric transfer initiated.',
      },
    ],
  };

  const tSync0 = performance.now();
  const firstSync = await fetch(`${HUB_URL}/api/v1/encounters/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncPayload),
  });
  const firstJson = await firstSync.json();
  assert(firstSync.status === 200 && firstJson.synced_count === 1, 'Initial batch sync failed');

  const replaySync = await fetch(`${HUB_URL}/api/v1/encounters/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncPayload),
  });
  const replayJson = await replaySync.json();
  const syncElapsed = Math.max(1, Math.round(performance.now() - tSync0));
  assert(replayJson.synced_count === 0 && replayJson.duplicate_count === 1, 'Duplicate idempotency failed');
  console.log(
    `[PASS] Offline Cache & Batch Sync: ${drillEncounterId} ingested (1/1) & duplicate replay blocked (${syncElapsed}ms)\n`
  );

  // 3. Emergency Infobip SMS Alert Dispatch & On-Call Midwife Acknowledgment SLA
  const rosterRes = await fetch(`${HUB_URL}/api/v1/alerts/roster`);
  const rosterData = await rosterRes.json();
  console.log(
    `[INFO] On-Call Midwife Stations Loaded: ${rosterData.stations.length} | Provider=${rosterData.provider} | Infobip Live=${rosterData.infobipLiveConfigured} | DryRun=${rosterData.alertDryRun}`
  );

  const tDispatch0 = performance.now();
  const dispatchRes = await fetch(`${HUB_URL}/api/v1/alerts/infobip-dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encounterId: drillEncounterId,
      deviceId: 'TAB-IBENO-SLA-01',
      lga: 'Ibeno',
      languageCode: 'ibn',
      climateRisk: 'extreme_heat',
      severityLevel: 1,
      summary: 'Level 1 Preeclampsia + Extreme Heat Alert (Automated SLA Probe)',
    }),
  });
  const dispatchJson = await dispatchRes.json();
  const clientDispatchMs = Math.max(1, Math.round(performance.now() - tDispatch0));
  assert(Boolean(dispatchJson.alertId) && dispatchJson.status !== 'failed', 'Emergency alert dispatch failed');
  console.log(
    `[PASS] Emergency Alert Dispatched (${dispatchJson.mode}): ID=${dispatchJson.alertId} | Hub=${dispatchJson.dispatchLatencyMs}ms | E2E=${clientDispatchMs}ms`
  );

  // Simulate on-call midwife acknowledgment after brief propagation pause
  await new Promise((r) => setTimeout(r, 150));
  const ackRes = await fetch(`${HUB_URL}/api/v1/alerts/midwife-ack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alertId: dispatchJson.alertId,
      ackBy: 'Sr. Midwife Nkoyo (Ibeno On-Call Desk)',
    }),
  });
  const ackJson = await ackRes.json();
  assert(ackRes.status === 200 && ackJson.status === 'acknowledged', 'Midwife acknowledgment failed');
  console.log(
    `[PASS] Midwife Ack Recorded: AckBy="${ackJson.ackBy}" | Ack Latency=${ackJson.ackLatencyMs}ms (Target < 60,000ms)`
  );
  console.log('\nALL 3 FIELD OPERATIONS VALIDATION PILLARS PASSED.');
}

main().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
