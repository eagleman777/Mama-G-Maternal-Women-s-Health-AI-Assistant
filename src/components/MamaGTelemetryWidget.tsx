/**
 * Mama-G Field Tablet Hardware & Sync Telemetry Widget
 * --------------------------------------------------------------------------------
 * Monitors battery level, charging status, network connectivity, and pending
 * SQLite/IndexedDB sync queues in real time to prevent field data loss during outages.
 */

import React, { useState, useEffect } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Wifi,
  WifiOff,
  Database,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { usePwa } from '../context/PwaContext';

interface TelemetryData {
  batteryLevel: number | null; // 0 - 100
  isCharging: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  lastPingTime: string;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface MamaGTelemetryWidgetProps {
  deviceId: string;
  pendingCount: number;
  lga?: string;
  onSyncRequest?: () => void;
}

export const MamaGTelemetryWidget: React.FC<MamaGTelemetryWidgetProps> = ({
  deviceId,
  pendingCount,
  lga = 'Uyo',
  onSyncRequest,
}) => {
  const { isOffline } = usePwa();
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    batteryLevel: null,
    isCharging: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingSyncCount: pendingCount,
    lastPingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });
  const [isPingingHub, setIsPingingHub] = useState(false);

  useEffect(() => {
    const handleOnline = () =>
      setTelemetry((prev) => ({
        ...prev,
        isOnline: true,
        lastPingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
    const handleOffline = () =>
      setTelemetry((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let batteryManager: BatteryManager | null = null;
    let updateBatteryFn: (() => void) | null = null;
    const nav = navigator as NavigatorWithBattery;

    if (nav.getBattery) {
      nav
        .getBattery()
        .then((bat) => {
          batteryManager = bat;
          const syncBattery = () => {
            setTelemetry((prev) => ({
              ...prev,
              batteryLevel: Math.round(bat.level * 100),
              isCharging: bat.charging,
            }));
          };
          updateBatteryFn = syncBattery;
          syncBattery();

          bat.addEventListener('levelchange', syncBattery);
          bat.addEventListener('chargingchange', syncBattery);
        })
        .catch(() => {
          // Graceful fallback on browsers where Battery Status API is restricted
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (batteryManager && updateBatteryFn) {
        batteryManager.removeEventListener('levelchange', updateBatteryFn);
        batteryManager.removeEventListener('chargingchange', updateBatteryFn);
      }
    };
  }, []);

  useEffect(() => {
    setTelemetry((prev) => ({
      ...prev,
      pendingSyncCount: pendingCount,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine && !isOffline : !isOffline,
    }));
  }, [pendingCount, isOffline]);

  const effectiveOnline = telemetry.isOnline && !isOffline;

  const handleSendTelemetryPing = async () => {
    if (!effectiveOnline || isPingingHub) return;
    setIsPingingHub(true);
    try {
      await fetch('/api/v1/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          location_lga: lga,
          battery_level: telemetry.batteryLevel ?? 100,
          signal_strength: effectiveOnline ? 'Good' : 'Offline',
          pending_sync_count: telemetry.pendingSyncCount,
          firmware_version: '1.0.0',
        }),
      });
      setTelemetry((prev) => ({
        ...prev,
        lastPingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
    } catch {
      // Ignore transient ping errors
    } finally {
      setIsPingingHub(false);
    }
  };

  const batteryTextColor =
    telemetry.batteryLevel === null
      ? 'text-stone-300'
      : telemetry.batteryLevel > 30
      ? 'text-emerald-400'
      : telemetry.batteryLevel > 15
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-inner">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
            Field Node Hardware Telemetry
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-sm font-bold font-mono text-amber-300">{deviceId}</code>
            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
              {lga} LGA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${
              effectiveOnline
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {effectiveOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{effectiveOnline ? 'Online (Hub Connected)' : 'Offline (Edge Mode)'}</span>
          </div>

          <button
            type="button"
            onClick={handleSendTelemetryPing}
            disabled={!effectiveOnline || isPingingHub}
            className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 border border-stone-700 text-stone-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Send hardware telemetry heartbeat to regional hub"
          >
            <Radio className={`w-3 h-3 text-emerald-400 ${isPingingHub ? 'animate-ping' : ''}`} />
            <span>{isPingingHub ? 'Pinging...' : 'Ping Hub'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Battery Card */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block">Battery Power Status</span>
            <div className={`text-xl font-extrabold mt-0.5 flex items-baseline gap-1.5 ${batteryTextColor}`}>
              <span>{telemetry.batteryLevel !== null ? `${telemetry.batteryLevel}%` : 'AC / Host'}</span>
              {telemetry.isCharging && (
                <span className="text-[11px] font-semibold text-amber-300">⚡ Charging</span>
              )}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
            {telemetry.isCharging ? (
              <BatteryCharging className="w-5 h-5 text-amber-400" />
            ) : telemetry.batteryLevel !== null && telemetry.batteryLevel <= 20 ? (
              <BatteryWarning className="w-5 h-5 text-rose-400" />
            ) : (
              <Battery className={`w-5 h-5 ${batteryTextColor}`} />
            )}
          </div>
        </div>

        {/* Sync Queue Card */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block">Pending SQLite Sync Queue</span>
            <div
              className={`text-xl font-extrabold mt-0.5 flex items-baseline gap-1.5 ${
                telemetry.pendingSyncCount > 0 ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              <span>{telemetry.pendingSyncCount}</span>
              <span className="text-[11px] font-normal text-stone-400">
                encounter{telemetry.pendingSyncCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSyncRequest && telemetry.pendingSyncCount > 0 && effectiveOnline && (
              <button
                type="button"
                onClick={onSyncRequest}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Flush</span>
              </button>
            )}
            <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-500 font-mono">
        <span>Hardware Engine: Edge Browser / Chromium Runtime</span>
        <span>Last Ping: {telemetry.lastPingTime}</span>
      </div>
    </div>
  );
};
