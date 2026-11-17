import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Copy,
  Check,
  FileCode2,
  Languages,
  ClipboardCheck,
  History,
  ShieldCheck,
  WifiOff,
  MapPin,
  Volume2,
  AlertTriangle,
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Mic,
  Square,
  RotateCcw,
} from 'lucide-react';
import {
  EDGE_TABLET_SCHEMA_SQL,
  EdgeSqliteSnapshot,
  IntegrationTestCaseResult,
  loadEdgeSqliteSnapshot,
  syncEdgeTabletWithHub,
  generateSeededSqliteDump,
  runEdgeToHubIntegrationDiagnostics,
  getOrCreateDeviceId,
  getEdgeTabletLga,
  setEdgeTabletLga,
} from '../data/edgeSqliteStore';
import {
  CLINICAL_ASR_MANIFEST,
  ASRValidationSummary,
  evaluateAsrManifest,
  getDefaultOfflineAsrHypothesis,
} from '../data/asrValidator';
import pytestSyncRaw from '../../test_mamag_sync_integration.py?raw';
import asrValidatorPyRaw from '../../mamag_asr_validator.py?raw';
import asrManifestRaw from '../../clinical_asr_manifest.json?raw';
import { useMamaGPronunciation } from '../utils/useMamaGPronunciation';
import { SupportedLanguage as TtsLanguage } from '../utils/mamagVoicePronunciation';
import { MamaGTelemetryWidget } from './MamaGTelemetryWidget';
import { usePwa } from '../context/PwaContext';

const FIELD_LGA_PRESETS = [
  'Uyo',
  'Ibeno',
  'Mbo',
  'Eket',
  'Oron',
  'Ikot Ekpene',
  'Itu',
  'Calabar South',
  'Yenagoa',
  'Ikeja',
  'Kano Municipal',
];

type InspectorTab =
  | 'schema'
  | 'triage_rules'
  | 'localized_lexicon'
  | 'clinical_encounters'
  | 'offline_sync_logs'
  | 'sync_tests'
  | 'asr_validator';

export const EdgeSqliteSyncPanel: React.FC = () => {
  const { isOffline } = usePwa();
  const [snapshot, setSnapshot] = useState<EdgeSqliteSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>('schema');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedLga, setSelectedLga] = useState<string>(getEdgeTabletLga());
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<IntegrationTestCaseResult[] | null>(null);
  const [asrHypotheses, setAsrHypotheses] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const s of CLINICAL_ASR_MANIFEST) {
      initial[s.sample_id] = getDefaultOfflineAsrHypothesis(s);
    }
    return initial;
  });
  const [asrReport, setAsrReport] = useState<ASRValidationSummary>(() =>
    evaluateAsrManifest({})
  );
  const [recordingSampleId, setRecordingSampleId] = useState<string | null>(null);
  const [asrNotice, setAsrNotice] = useState<string | null>(null);
  const {
    playPronunciation,
    stopPronunciation,
    isPlaying: isPronunciationPlaying,
    activeTerm: activePronunciationTerm,
  } = useMamaGPronunciation();
  const deviceId = getOrCreateDeviceId();

  useEffect(() => {
    const refresh = () => {
      loadEdgeSqliteSnapshot().then(setSnapshot);
    };
    refresh();
    window.addEventListener('mama-g-sqlite-updated', refresh);
    return () => {
      window.removeEventListener('mama-g-sqlite-updated', refresh);
    };
  }, []);

  const handleLgaChange = (val: string) => {
    setSelectedLga(val);
    setEdgeTabletLga(val);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const { snapshot: updated, log } = await syncEdgeTabletWithHub(isOffline);
    setSnapshot(updated);
    setIsSyncing(false);

    if (log.status === 'success') {
      setSyncFeedback({
        type: 'success',
        message: `Hub sync complete: ${log.records_uploaded} encounter(s) uploaded, rule pack verified.`,
      });
    } else {
      setSyncFeedback({
        type: 'error',
        message: log.error_message || 'Offline: Pending encounters kept safely in local SQLite cache.',
      });
    }
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(EDGE_TABLET_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  };

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunIntegrationTests = async () => {
    setIsRunningTests(true);
    const results = await runEdgeToHubIntegrationDiagnostics();
    setTestResults(results);
    setIsRunningTests(false);
  };

  const handleRunAsrEvaluation = (customHypotheses?: Record<string, string>) => {
    const mapToUse = customHypotheses || asrHypotheses;
    setAsrReport(evaluateAsrManifest(mapToUse));
  };

  const handleResetAsrHypotheses = () => {
    const reset: Record<string, string> = {};
    for (const s of CLINICAL_ASR_MANIFEST) {
      reset[s.sample_id] = getDefaultOfflineAsrHypothesis(s);
    }
    setAsrHypotheses(reset);
    setAsrReport(evaluateAsrManifest(reset));
    setAsrNotice(null);
  };

  const handleDictateAsrSample = (sampleId: string) => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setAsrNotice('SpeechRecognition unavailable in this browser; edit the hypothesis text directly.');
      return;
    }
    setAsrNotice(null);
    setRecordingSampleId(sampleId);
    try {
      const rec = new SpeechRec();
      rec.lang = 'en-NG';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (evt: any) => {
        const transcript = evt.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          const updated = { ...asrHypotheses, [sampleId]: transcript };
          setAsrHypotheses(updated);
          handleRunAsrEvaluation(updated);
        }
      };
      rec.onerror = () => {
        setRecordingSampleId(null);
      };
      rec.onend = () => {
        setRecordingSampleId(null);
      };
      rec.start();
    } catch {
      setRecordingSampleId(null);
    }
  };

  const handleSpeak = (text: string, lang: TtsLanguage = 'ibb') => {
    if (isPronunciationPlaying && activePronunciationTerm === text) {
      stopPronunciation();
    } else {
      playPronunciation(text, lang);
    }
  };

  const pendingCount = snapshot
    ? snapshot.clinical_encounters.filter((e) => e.sync_status === 'pending').length
    : 0;
  const lastSyncMeta = snapshot?.sync_metadata.find((m) => m.key === 'last_hub_sync');

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-md">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Database className="w-4 h-4" />
            <span>Edge Field Tablet SQLite Engine</span>
            <span className="text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">
              PRAGMA journal_mode = WAL
            </span>
            <span className="text-[10px] font-mono bg-sky-500/15 border border-sky-500/30 text-sky-300 px-2 py-0.5 rounded">
              Auto-Sync on Reconnect
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Offline Triage Rule Cache, Encounter Log & Regional Hub Sync
          </h3>
          <p className="text-xs text-stone-400 max-w-2xl">
            Normalized 5-table SQLite schema (<span className="font-mono text-stone-300">sync_metadata</span>,{' '}
            <span className="font-mono text-stone-300">triage_rules</span>,{' '}
            <span className="font-mono text-stone-300">localized_lexicon</span>,{' '}
            <span className="font-mono text-stone-300">clinical_encounters</span>,{' '}
            <span className="font-mono text-stone-300">offline_sync_logs</span>) for zero-connectivity execution on rural clinic tablets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isOffline ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{isSyncing ? 'Syncing Hub...' : `Sync with Hub (${pendingCount})`}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerDownload('mama_g_edge_tablet_schema.sql', EDGE_TABLET_SCHEMA_SQL)}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql Schema</span>
          </button>

          {snapshot && (
            <button
              type="button"
              onClick={() => triggerDownload('mama_g_edge_tablet_snapshot.sql', generateSeededSqliteDump(snapshot))}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Live DB (.sql)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Hardware & Sync Telemetry Widget */}
      <MamaGTelemetryWidget
        deviceId={deviceId}
        pendingCount={pendingCount}
        lga={selectedLga}
        onSyncRequest={handleSyncNow}
      />

      {/* Tablet Hardware & LGA Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <span className="text-[11px] text-stone-400 block">Tablet Device ID</span>
          <span className="font-mono font-bold text-stone-200 mt-0.5 block">{deviceId}</span>
        </div>

        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <label className="text-[11px] text-stone-400 flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>Deployment Field LGA</span>
          </label>
          <select
            value={selectedLga}
            onChange={(e) => handleLgaChange(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
          >
            {FIELD_LGA_PRESETS.map((lga) => (
              <option key={lga} value={lga}>
                {lga} LGA
              </option>
            ))}
          </select>
        </div>

        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <span className="text-[11px] text-stone-400 block">Cached Rules &amp; Lexicon</span>
          <span className="font-bold text-emerald-300 mt-0.5 block">
            {snapshot ? `${snapshot.triage_rules.length} Rules · ${snapshot.localized_lexicon.length} Terms` : 'Loading...'}
          </span>
        </div>

        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <span className="text-[11px] text-stone-400 block">Pending Encounters / Last Sync</span>
          <span className="font-bold text-amber-300 mt-0.5 block">
            {pendingCount} Pending · {lastSyncMeta ? new Date(lastSyncMeta.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Seed Initialized'}
          </span>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncFeedback.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-stone-400 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inspector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'schema', label: 'SQLite Schema (.sql)', icon: FileCode2 },
          { id: 'triage_rules', label: `triage_rules (${snapshot?.triage_rules.length ?? 0})`, icon: ShieldCheck },
          { id: 'localized_lexicon', label: `localized_lexicon (${snapshot?.localized_lexicon.length ?? 0})`, icon: Languages },
          { id: 'clinical_encounters', label: `clinical_encounters (${snapshot?.clinical_encounters.length ?? 0})`, icon: ClipboardCheck },
          { id: 'offline_sync_logs', label: `offline_sync_logs (${snapshot?.offline_sync_logs.length ?? 0})`, icon: History },
          { id: 'sync_tests', label: 'E2E Sync Tests (4)', icon: FlaskConical },
          { id: 'asr_validator', label: `ASR Validator (${CLINICAL_ASR_MANIFEST.length})`, icon: Mic },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as InspectorTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                active
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-stone-800/70 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'schema' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-400">
              src/data/edge_tablet_schema.sql
            </span>
            <button
              type="button"
              onClick={handleCopySchema}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy Schema SQL'}</span>
            </button>
          </div>
          <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
            {EDGE_TABLET_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {activeTab === 'triage_rules' && snapshot && (
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">rule_id</th>
                <th className="px-3 py-2.5">module_name</th>
                <th className="px-3 py-2.5">severity</th>
                <th className="px-3 py-2.5">clinical_action</th>
                <th className="px-3 py-2.5">ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-900/50">
              {snapshot.triage_rules.map((r) => (
                <tr key={r.rule_id} className="hover:bg-stone-800/40">
                  <td className="px-3 py-2.5 font-mono text-amber-300 font-semibold">{r.rule_id}</td>
                  <td className="px-3 py-2.5 font-mono text-stone-300">{r.module_name}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.severity_level === 1
                          ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      Level {r.severity_level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-stone-300 max-w-md">{r.clinical_action}</td>
                  <td className="px-3 py-2.5 font-mono text-stone-400">v{r.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'localized_lexicon' && snapshot && (
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">lang</th>
                <th className="px-3 py-2.5">category</th>
                <th className="px-3 py-2.5">standard_english_phrase</th>
                <th className="px-3 py-2.5">localized_equivalent</th>
                <th className="px-3 py-2.5">listen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-900/50">
              {snapshot.localized_lexicon.map((lex) => (
                <tr key={lex.term_id} className="hover:bg-stone-800/40">
                  <td className="px-3 py-2.5 font-mono font-bold text-emerald-300 uppercase">{lex.language_code}</td>
                  <td className="px-3 py-2.5 font-mono text-stone-400">{lex.clinical_category}</td>
                  <td className="px-3 py-2.5 text-stone-300">{lex.standard_english_phrase}</td>
                  <td className="px-3 py-2.5 text-amber-200 font-semibold">
                    {lex.localized_equivalent}
                    {lex.phonetic_guide && (
                      <span className="block text-[10px] font-mono text-stone-400 font-normal mt-0.5">
                        [{lex.phonetic_guide}]
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSpeak(lex.localized_equivalent, lex.language_code as TtsLanguage)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                        isPronunciationPlaying && activePronunciationTerm === lex.localized_equivalent
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                      }`}
                      title={
                        isPronunciationPlaying && activePronunciationTerm === lex.localized_equivalent
                          ? 'Stop pronunciation'
                          : `Play (${lex.language_code.toUpperCase()} / en-NG cadence)`
                      }
                    >
                      {isPronunciationPlaying && activePronunciationTerm === lex.localized_equivalent ? (
                        <Square className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'clinical_encounters' && snapshot && (
        <div className="space-y-2">
          {snapshot.clinical_encounters.length === 0 ? (
            <div className="p-6 text-center bg-stone-950/60 border border-dashed border-stone-800 rounded-xl text-xs text-stone-400">
              No triage encounters cached on this tablet yet. Run an evaluation in the <strong>Symptom Triage Matrix</strong> to log an offline SQLite encounter row automatically.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">encounter_id</th>
                    <th className="px-3 py-2.5">lga</th>
                    <th className="px-3 py-2.5">climate_risk</th>
                    <th className="px-3 py-2.5">severity</th>
                    <th className="px-3 py-2.5">sync_status</th>
                    <th className="px-3 py-2.5">timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 bg-stone-900/50">
                  {snapshot.clinical_encounters.map((enc) => (
                    <tr key={enc.encounter_id} className="hover:bg-stone-800/40">
                      <td className="px-3 py-2.5 font-mono text-stone-200">{enc.encounter_id}</td>
                      <td className="px-3 py-2.5 text-stone-300">{enc.location_lga}</td>
                      <td className="px-3 py-2.5 font-mono text-amber-300">{enc.climate_risk_flagged}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            enc.severity_triggered === 1
                              ? 'bg-rose-600/30 text-rose-300'
                              : enc.severity_triggered === 2
                              ? 'bg-amber-600/30 text-amber-300'
                              : 'bg-emerald-600/30 text-emerald-300'
                          }`}
                        >
                          Level {enc.severity_triggered}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            enc.sync_status === 'synced'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {enc.sync_status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-stone-400">
                        {new Date(enc.session_timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'offline_sync_logs' && snapshot && (
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">sync_log_id</th>
                <th className="px-3 py-2.5">sync_timestamp</th>
                <th className="px-3 py-2.5">uploaded</th>
                <th className="px-3 py-2.5">rules</th>
                <th className="px-3 py-2.5">status</th>
                <th className="px-3 py-2.5">notes / error_message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-900/50">
              {snapshot.offline_sync_logs.map((log) => (
                <tr key={log.sync_log_id} className="hover:bg-stone-800/40">
                  <td className="px-3 py-2.5 font-mono text-stone-300">#{log.sync_log_id}</td>
                  <td className="px-3 py-2.5 text-stone-300">
                    {new Date(log.sync_timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-emerald-300">{log.records_uploaded}</td>
                  <td className="px-3 py-2.5 font-mono text-amber-300">{log.rules_downloaded}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        log.status === 'success'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : log.status === 'partial'
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-rose-900/60 text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-stone-400 text-[11px]">
                    {log.error_message || 'Clean WAL transaction committed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'sync_tests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/70 border border-stone-800 rounded-xl p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>Edge-to-Hub Synchronization Integration Suite</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Tests regional hub health, field tablet telemetry ingestion, batch clinical encounter persistence, and duplicate batch idempotency live against the hub API.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRunIntegrationTests}
                disabled={isRunningTests}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isRunningTests ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{isRunningTests ? 'Running Suite...' : 'Run Live E2E Sync Tests'}</span>
              </button>
              <button
                type="button"
                onClick={() => triggerDownload('test_mamag_sync_integration.py', pytestSyncRaw)}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download pytest (.py)</span>
              </button>
            </div>
          </div>

          {testResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {testResults.map((t) => (
                <div
                  key={t.name}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    t.passed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-mono font-bold block">{t.name}</span>
                      <span className="text-[11px] text-stone-300 mt-0.5 block">{t.detail}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400 shrink-0">{t.durationMs}ms</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-xs font-mono text-stone-400 block">
              test_mamag_sync_integration.py (pytest + FastAPI TestClient)
            </span>
            <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-sky-200/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
              {pytestSyncRaw}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'asr_validator' && (
        <div className="space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-stone-950/70 border border-stone-800 rounded-xl p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Offline ASR Lexicon Validation Harness (Ibibio &amp; Ibeno)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Benchmarks transcription Word Error Rate (WER), Character Error Rate (CER), and critical obstetric/climate keyword recall against gold-standard regional manifest samples.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRunAsrEvaluation()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run ASR Benchmark</span>
              </button>
              <button
                type="button"
                onClick={handleResetAsrHypotheses}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={() => triggerDownload('mamag_asr_validator.py', asrValidatorPyRaw)}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Validator (.py)</span>
              </button>
              <button
                type="button"
                onClick={() => triggerDownload('clinical_asr_manifest.json', asrManifestRaw)}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manifest (.json)</span>
              </button>
            </div>
          </div>

          {asrNotice && (
            <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
              <span>{asrNotice}</span>
              <button type="button" onClick={() => setAsrNotice(null)} className="font-bold text-amber-300">
                Dismiss
              </button>
            </div>
          )}

          {/* Aggregate Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-400 block">Gold Samples Tested</span>
              <span className="text-lg font-extrabold text-white mt-0.5 block">
                {asrReport.total_samples}
              </span>
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-400 block">Mean Word Error Rate (WER)</span>
              <span className={`text-lg font-extrabold mt-0.5 block ${asrReport.mean_word_error_rate <= 0.15 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {(asrReport.mean_word_error_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-400 block">Mean Char Error Rate (CER)</span>
              <span className={`text-lg font-extrabold mt-0.5 block ${asrReport.mean_char_error_rate <= 0.1 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {(asrReport.mean_char_error_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-400 block">Clinical Keyword Recall</span>
              <span className={`text-lg font-extrabold mt-0.5 block ${asrReport.mean_keyword_recall >= 0.85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(asrReport.mean_keyword_recall * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Per-sample interactive evaluation cards */}
          <div className="space-y-3">
            {asrReport.detailed_results.map((item) => {
              const sampleObj = CLINICAL_ASR_MANIFEST.find((s) => s.sample_id === item.sample_id);
              const isRecording = recordingSampleId === item.sample_id;
              return (
                <div
                  key={item.sample_id}
                  className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300">{item.sample_id}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-500/30 font-mono text-[10px] uppercase text-emerald-300">
                        {item.language}
                      </span>
                      {item.clinical_concept && (
                        <span className="text-stone-300 font-semibold">{item.clinical_concept}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-stone-300">WER: <strong className="text-white">{item.wer}</strong></span>
                      <span className="text-stone-300">CER: <strong className="text-white">{item.cer}</strong></span>
                      <span className={item.keyword_recall >= 0.8 ? 'text-emerald-400' : 'text-rose-400'}>
                        Recall: <strong>{(item.keyword_recall * 100).toFixed(0)}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-900/90 border border-stone-800 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block">Gold Ground Truth</span>
                      <span className="text-stone-100 font-medium">{item.ground_truth}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(item.ground_truth, (item.language as TtsLanguage) || 'ibb')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        isPronunciationPlaying && activePronunciationTerm === item.ground_truth
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                      }`}
                    >
                      {isPronunciationPlaying && activePronunciationTerm === item.ground_truth ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Hear Phrase ({item.language.toUpperCase()})</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-stone-400 flex items-center justify-between">
                      <span>ASR Hypothesis Transcript (Edit or Dictate to Re-score)</span>
                      <span className="font-mono text-stone-500">{sampleObj?.audio_path}</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={asrHypotheses[item.sample_id] ?? item.hypothesis}
                        onChange={(e) => {
                          const updated = { ...asrHypotheses, [item.sample_id]: e.target.value };
                          setAsrHypotheses(updated);
                          handleRunAsrEvaluation(updated);
                        }}
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleDictateAsrSample(item.sample_id)}
                        disabled={isRecording}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isRecording
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-stone-700'
                        }`}
                      >
                        {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isRecording ? 'Listening...' : 'Voice Test'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase text-stone-400 mr-1">Critical Keywords:</span>
                    {item.matched_keywords.map((kw) => (
                      <span
                        key={`m-${kw}`}
                        className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                    {item.missed_keywords.map((kw) => (
                      <span
                        key={`x-${kw}`}
                        className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[10px] font-mono"
                      >
                        ✗ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
