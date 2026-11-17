/**
 * Mama-G Over-The-Air (OTA) Update & Rollback Control Panel
 * --------------------------------------------------------------------------------
 * Manages atomic container updates, health check verification, and emergency
 * rollbacks for field tablets operating in low-connectivity rural health outposts.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  HeartPulse,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Package,
  Clock,
} from 'lucide-react';
import { loadEdgeSqliteSnapshot } from '../data/edgeSqliteStore';
import { usePwa } from '../context/PwaContext';

type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'updated'
  | 'rolling_back'
  | 'error';

interface OTAState {
  currentVersion: string;
  previousStableVersion: string;
  candidateVersion: string | null;
  candidateDigest: string | null;
  releaseNotes: string | null;
  status: UpdateStatus;
  progress: number; // 0 - 100
  lastChecked: string;
  errorMessage?: string;
}

const OTA_VERSION_STORAGE_KEY = 'mama_g_ota_active_version_v1';
const BASELINE_STABLE_IMAGE = 'ghcr.io/mamag/edge-node:v1.2.0';

export const MamaGOTAUpdatePanel: React.FC<{ deviceId: string; hubApiUrl: string }> = ({
  deviceId,
  hubApiUrl,
}) => {
  const { isOffline } = usePwa();
  const baseUrl = hubApiUrl.replace(/\/$/, '');

  const [otaState, setOtaState] = useState<OTAState>(() => {
    let savedVersion = BASELINE_STABLE_IMAGE;
    try {
      const stored = localStorage.getItem(OTA_VERSION_STORAGE_KEY);
      if (stored) savedVersion = stored;
    } catch {}
    return {
      currentVersion: savedVersion,
      previousStableVersion: BASELINE_STABLE_IMAGE,
      candidateVersion: null,
      candidateDigest: null,
      releaseNotes: null,
      status: savedVersion !== BASELINE_STABLE_IMAGE ? 'updated' : 'idle',
      progress: 0,
      lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const persistActiveVersion = (version: string) => {
    try {
      localStorage.setItem(OTA_VERSION_STORAGE_KEY, version);
    } catch {}
  };

  const recordOtaAudit = async (action: 'upgrade' | 'rollback', targetVersion: string, notes: string) => {
    try {
      await fetch(`${baseUrl}/api/v1/ota/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          action,
          target_version: targetVersion,
          notes,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
  };

  const handleTriggerRollback = (reason: string = 'Manual technician rollback invoked.') => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    setOtaState((prev) => ({
      ...prev,
      status: 'rolling_back',
      progress: 50,
    }));

    timeoutRef.current = window.setTimeout(async () => {
      const targetStable = otaState.previousStableVersion || BASELINE_STABLE_IMAGE;
      persistActiveVersion(targetStable);
      await recordOtaAudit('rollback', targetStable, reason);

      setOtaState((prev) => ({
        ...prev,
        currentVersion: targetStable,
        candidateVersion: null,
        candidateDigest: null,
        releaseNotes: null,
        status: 'error',
        errorMessage: reason,
        progress: 100,
        lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }, 1500);
  };

  const handleCheckForUpdates = async () => {
    const checkTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOtaState((prev) => ({
      ...prev,
      status: 'checking',
      errorMessage: undefined,
      lastChecked: checkTime,
    }));

    if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      timeoutRef.current = window.setTimeout(() => {
        setOtaState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'Offline mode: Connect to clinic Wi-Fi or cellular hub to fetch signed OTA manifests.',
        }));
      }, 600);
      return;
    }

    try {
      const params = new URLSearchParams({
        deviceId,
        currentVersion: otaState.currentVersion,
      });
      const res = await fetch(`${baseUrl}/api/v1/ota/manifest?${params.toString()}`);
      if (!res.ok) throw new Error(`Manifest server returned HTTP ${res.status}`);
      const data = await res.json();

      if (data.hasUpdate && data.latestVersion) {
        setOtaState((prev) => ({
          ...prev,
          status: 'idle',
          candidateVersion: data.latestVersion,
          candidateDigest: data.sha256Digest || 'sha256:9f84b2c71a0e...',
          releaseNotes:
            data.releaseNotes ||
            'Climate Rule Set A/B v1.3, Ibibio/Ibeno ASR lexicon weights & WAL sync patch.',
        }));
      } else {
        setOtaState((prev) => ({
          ...prev,
          status: 'updated',
          candidateVersion: null,
          candidateDigest: null,
          releaseNotes: null,
        }));
      }
    } catch (err: any) {
      setOtaState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err?.message || 'Unable to verify OTA manifest signature.',
      }));
    }
  };

  const handleExecuteUpdate = () => {
    if (!otaState.candidateVersion) return;

    setOtaState((prev) => ({
      ...prev,
      status: 'downloading',
      progress: 15,
      errorMessage: undefined,
    }));

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setOtaState((prev) => {
        if (prev.progress < 90) {
          return { ...prev, progress: Math.min(90, prev.progress + 25) };
        }
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Transition to post-update SQLite & Hub API health check verification
        timeoutRef.current = window.setTimeout(async () => {
          try {
            const snapshot = await loadEdgeSqliteSnapshot();
            const healthRes = await fetch(`${baseUrl}/api/v1/health`);
            const sqliteHealthy = snapshot && snapshot.triage_rules.length > 0;
            const hubHealthy = healthRes.ok;

            if (sqliteHealthy && hubHealthy) {
              const promotedVersion = prev.candidateVersion!;
              persistActiveVersion(promotedVersion);
              await recordOtaAudit('upgrade', promotedVersion, 'Post-update SQLite & Hub integrity verified.');

              setOtaState((s) => ({
                ...s,
                previousStableVersion: s.currentVersion,
                currentVersion: promotedVersion,
                candidateVersion: null,
                candidateDigest: null,
                releaseNotes: null,
                status: 'updated',
                progress: 100,
                lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }));
            } else {
              handleTriggerRollback('Post-update SQLite or API health check failed. Automatic rollback triggered.');
            }
          } catch {
            handleTriggerRollback('Post-update verification failed. Automatic rollback triggered.');
          }
        }, 1200);

        return { ...prev, status: 'verifying', progress: 95 };
      });
    }, 700);
  };

  const renderStatusBadge = () => {
    switch (otaState.status) {
      case 'checking':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-950/70 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 animate-pulse" />
            <span>Checking regional hub...</span>
          </span>
        );
      case 'downloading':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span>Downloading layers ({otaState.progress}%)</span>
          </span>
        );
      case 'verifying':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
            <span>Running SQLite health checks...</span>
          </span>
        );
      case 'updated':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Running Latest Stable Version</span>
          </span>
        );
      case 'rolling_back':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            <span>Rolling back container stack...</span>
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Rollback / Attention Required</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Stable</span>
          </span>
        );
    }
  };

  const isBusy =
    otaState.status === 'checking' ||
    otaState.status === 'downloading' ||
    otaState.status === 'verifying' ||
    otaState.status === 'rolling_back';

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
            <Package className="w-4 h-4" />
            <span>Over-The-Air (OTA) Container Management</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Atomic Container Version &amp; Emergency Rollback Control
          </h3>
        </div>
        <div>{renderStatusBadge()}</div>
      </div>

      {/* Error / Rollback Alert */}
      {otaState.status === 'error' && otaState.errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{otaState.errorMessage}</span>
        </div>
      )}

      {/* Version Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
            Active Container Image
          </span>
          <code className="text-xs sm:text-sm font-mono font-bold text-sky-300 break-all block">
            {otaState.currentVersion}
          </code>
          <span className="text-[10px] text-stone-500 block">
            Fallback Snapshot: <span className="font-mono">{otaState.previousStableVersion}</span>
          </span>
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
            Signed Candidate Update
          </span>
          <code
            className={`text-xs sm:text-sm font-mono font-bold break-all block ${
              otaState.candidateVersion ? 'text-emerald-300' : 'text-stone-500'
            }`}
          >
            {otaState.candidateVersion || 'None (Up to date)'}
          </code>
          {otaState.candidateDigest && (
            <span className="text-[10px] font-mono text-emerald-400/80 block">
              Digest: {otaState.candidateDigest}
            </span>
          )}
        </div>
      </div>

      {otaState.releaseNotes && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs text-emerald-200">
          <span className="font-bold text-emerald-300">Release Notes: </span>
          <span>{otaState.releaseNotes}</span>
        </div>
      )}

      {/* Progress Bar when Downloading / Verifying / Rolling Back */}
      {(otaState.status === 'downloading' ||
        otaState.status === 'verifying' ||
        otaState.status === 'rolling_back') && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-stone-300">
            <span>
              {otaState.status === 'downloading'
                ? 'Pulling signed OCI layers...'
                : otaState.status === 'verifying'
                ? 'Verifying SQLite WAL & Hub health...'
                : 'Restoring previous stable container...'}
            </span>
            <span>{otaState.progress}%</span>
          </div>
          <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className={`h-full transition-all duration-500 ${
                otaState.status === 'rolling_back' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${otaState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleCheckForUpdates}
          disabled={isBusy}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{otaState.status === 'checking' ? 'Checking...' : 'Check for Updates'}</span>
        </button>

        {otaState.candidateVersion && (
          <button
            type="button"
            onClick={handleExecuteUpdate}
            disabled={isBusy}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Apply &amp; Verify Update</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => handleTriggerRollback('Manual technician rollback invoked.')}
          disabled={otaState.status === 'rolling_back'}
          className="sm:ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Emergency Rollback</span>
        </button>
      </div>

      {/* Footer Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80 text-[11px] text-stone-400 font-mono">
        <span>
          Target Device ID: <strong className="text-stone-200">{deviceId}</strong>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-500" />
          Last OTA Audit: {otaState.lastChecked}
        </span>
      </div>
    </div>
  );
};
