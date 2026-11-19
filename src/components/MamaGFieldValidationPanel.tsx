import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  BellRing,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  MessageSquare,
  PhoneCall,
  FileCode2,
} from 'lucide-react';
import {
  RosterResponse,
  ThreePillarValidationReport,
  fetchMidwifeAlertRoster,
  runFullThreePillarValidation,
  dispatchEmergencyMidwifeAlert,
  acknowledgeMidwifeAlert,
} from '../data/fieldValidationEngine';
import { getEdgeTabletLga } from '../data/edgeSqliteStore';
import alertServicePyRaw from '../../mamag_emergency_alert_service.py?raw';

export const MamaGFieldValidationPanel: React.FC = () => {
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const [languageCode, setLanguageCode] = useState<'en' | 'ibb' | 'ibn'>('en');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [dispatchingStationId, setDispatchingStationId] = useState<string | null>(null);
  const [ackingAlertId, setAckingAlertId] = useState<string | null>(null);
  const [report, setReport] = useState<ThreePillarValidationReport | null>(null);
  const [showPythonService, setShowPythonService] = useState<boolean>(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const loadRoster = async () => {
    try {
      const data = await fetchMidwifeAlertRoster();
      setRoster(data);
      setPanelError(null);
    } catch (err: any) {
      setPanelError(err?.message || 'Unable to load regional midwife roster.');
    }
  };

  useEffect(() => {
    loadRoster();
  }, []);

  const handleRunFullValidation = async () => {
    setIsValidating(true);
    setPanelError(null);
    try {
      const res = await runFullThreePillarValidation({
        lga: getEdgeTabletLga(),
        languageCode,
      });
      setReport(res);
      await loadRoster();
    } catch (err: any) {
      setPanelError(err?.message || 'Field validation probe encountered an error.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDispatchDrillToStation = async (stationId: string, lga: string) => {
    setDispatchingStationId(stationId);
    setPanelError(null);
    try {
      await dispatchEmergencyMidwifeAlert({
        stationId,
        lga,
        languageCode,
        climateRisk: 'extreme_heat',
        severityLevel: 1,
        summary: `Emergency Drill: Level 1 Pre-eclampsia & Heat Stress in ${lga} — Acknowledge receipt`,
      });
      await loadRoster();
    } catch (err: any) {
      setPanelError(err?.message || 'Alert dispatch failed.');
    } finally {
      setDispatchingStationId(null);
    }
  };

  const handleConfirmMidwifeAck = async (alertId: string, stationName: string) => {
    setAckingAlertId(alertId);
    setPanelError(null);
    try {
      await acknowledgeMidwifeAlert(alertId, `On-Call Midwife · ${stationName}`);
      await loadRoster();
    } catch (err: any) {
      setPanelError(err?.message || 'Failed to record midwife acknowledgment.');
    } finally {
      setAckingAlertId(null);
    }
  };

  const handleDownloadAuditReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      validationReport: report,
      rosterAndAlertLog: roster,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mamag_field_sla_validation_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPythonService = () => {
    const blob = new Blob([alertServicePyRaw], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mamag_emergency_alert_service.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400">
            <BellRing className="w-4 h-4" />
            <span>Field Reliability &amp; Midwife Escalation SLA Harness</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-400 font-normal">
              {roster?.alertDryRun
                ? `Infobip Dry-Run Mode (${roster.smsSender})`
                : roster?.infobipLiveConfigured
                ? `Infobip Live SMS Active (${roster.smsSender})`
                : 'Regional Hub SLA Sandbox Mode (Infobip)'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Uptime Probes, Offline Cache Durability &amp; Midwife Alert Response Times
          </h3>
          <p className="text-xs text-stone-400 max-w-2xl">
            Benchmark live Regional Hub uptime, IndexedDB/SQLite offline buffering &amp; idempotency, and Infobip REST API (/sms/2/text/advanced) emergency escalation latency with on-call midwives across Uyo, Ibeno, and Mbo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Dialect Context Segmented Selector */}
          <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl">
            {(['en', 'ibb', 'ibn'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguageCode(code)}
                className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  languageCode === code
                    ? 'bg-sky-600 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {code === 'en' ? (
                  <PhoneCall className="w-3.5 h-3.5" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5" />
                )}
                <span>{code === 'en' ? 'EN SMS' : code === 'ibb' ? 'Ibibio (ibb)' : 'Ibeno (ibn)'}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRunFullValidation}
            disabled={isValidating}
            className="min-h-[42px] px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running 3-Pillar Probe...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Run Full Field Validation</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadAuditReport}
            className="min-h-[42px] px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {panelError && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
          <span>{panelError}</span>
          <button
            type="button"
            onClick={() => setPanelError(null)}
            className="font-bold text-rose-200 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Pillar Live Benchmark Readout */}
      {report ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pillar 1 */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Hub Uptime Continuity</span>
              </span>
              <span className={report.uptime.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {report.uptime.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {report.uptime.availabilityPct}% · {report.uptime.avgLatencyMs}ms
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed tabular-nums">
              {report.uptime.detail}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Offline Cache &amp; Sync</span>
              </span>
              <span className={report.offlineCache.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {report.offlineCache.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              1/1 Synced · {report.offlineCache.roundTripLatencyMs}ms
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed tabular-nums">
              {report.offlineCache.detail}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-300 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Alert Dispatch SLA</span>
              </span>
              <span className={report.emergencyAlert.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {report.emergencyAlert.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {report.emergencyAlert.dispatchLatencyMs}ms Dispatch
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed tabular-nums">
              {report.emergencyAlert.detail}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-stone-950/60 border border-dashed border-stone-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <span>
            No 3-pillar SLA benchmark executed in this session yet. Tap <strong>Run Full Field Validation</strong> to measure live uptime RTT, offline IndexedDB persistence, and emergency alert dispatch latency.
          </span>
        </div>
      )}

      {/* Regional On-Call Midwife Roster Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-stone-200">
            Regional On-Call Midwife Escalation Roster (Infobip SMS · {languageCode.toUpperCase()})
          </h4>
          <button
            type="button"
            onClick={loadRoster}
            className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Roster</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-stone-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">Station / LGA</th>
                <th className="py-2.5 px-3.5 font-semibold">On-Call Midwife Role</th>
                <th className="py-2.5 px-3.5 font-semibold">Routing Target</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">SLA Target</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Drill Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 bg-stone-900/50">
              {(roster?.stations || []).map((st) => {
                const isSending = dispatchingStationId === st.stationId;
                return (
                  <tr key={st.stationId} className="hover:bg-stone-800/40">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white">{st.stationName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        {st.stationId} · {st.lga} LGA
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-stone-300">{st.midwifeRole}</td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-stone-300">
                      {st.maskedNumber}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums text-amber-300 font-semibold">
                      &le; {st.slaTargetSec}s
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => handleDispatchDrillToStation(st.stationId, st.lga)}
                        className="min-h-[36px] px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {isSending ? 'Dispatching...' : `Send Infobip SMS (${languageCode.toUpperCase()})`}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Alert Response & Midwife Ack SLA Audit Table */}
      {roster && roster.recentAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-stone-200">
            Emergency Alert &amp; Midwife Acknowledgment SLA Log ({roster.recentAlerts.length})
          </h4>
          <div className="overflow-x-auto border border-stone-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Alert ID · Station</th>
                  <th className="py-2.5 px-3.5 font-semibold">Channel · Mode</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Dispatch RTT</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Midwife Ack</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 bg-stone-900/50">
                {roster.recentAlerts.map((alert) => {
                  const acked = alert.status === 'acknowledged';
                  const failed = alert.status === 'failed';
                  return (
                    <tr key={alert.alertId} className="hover:bg-stone-800/40">
                      <td className="py-3 px-3.5">
                        <div className="font-mono text-stone-100 font-semibold">{alert.alertId}</div>
                        <div className="text-[11px] text-stone-400">
                          {alert.lga} LGA · {alert.encounterId}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-stone-300">
                        <span className="uppercase font-semibold">
                          Infobip SMS ({alert.languageCode || 'en'})
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span className="text-stone-400">
                          {alert.mode === 'infobip_live'
                            ? `Infobip (${alert.messageId?.slice(0, 10)})`
                            : alert.mode === 'dry_run'
                            ? 'Dry-Run Log'
                            : 'Hub SLA Sandbox'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-sky-300">
                        {alert.dispatchLatencyMs}ms
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        {acked ? (
                          <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {(alert.ackLatencyMs! / 1000).toFixed(2)}s
                          </span>
                        ) : failed ? (
                          <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        ) : (
                          <span className="text-amber-300">Awaiting Ack</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        {!acked && !failed ? (
                          <button
                            type="button"
                            disabled={ackingAlertId === alert.alertId}
                            onClick={() => handleConfirmMidwifeAck(alert.alertId, alert.lga)}
                            className="min-h-[36px] px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            {ackingAlertId === alert.alertId ? 'Confirming...' : 'Confirm Midwife Ack'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400">
                            {alert.ackBy || (failed ? alert.errorDetail : '—')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Python Infobip Dispatcher Source Inspection & Download */}
      <div className="pt-2 border-t border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowPythonService((prev) => !prev)}
            className="min-h-[36px] text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode2 className="w-4 h-4" />
            <span>
              {showPythonService
                ? 'Hide Python Infobip Service (mamag_emergency_alert_service.py)'
                : 'Inspect Python Infobip Alert Dispatcher (mamag_emergency_alert_service.py)'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPythonService}
            className="min-h-[36px] px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download Dispatcher (.py)</span>
          </button>
        </div>

        {showPythonService && (
          <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
            {alertServicePyRaw}
          </pre>
        )}
      </div>
    </div>
  );
};
