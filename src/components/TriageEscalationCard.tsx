import React, { useState, useEffect } from 'react';
import { ClimateTooltip } from './ClimateTooltip';
import {
  getClimateTooltip,
  type ClimateRiskKey,
  type MamaGLocale,
} from '../i18n/climateTooltips';
import { formatLevel1Sms } from '../i18n/smsTemplates';

export type SupportedLga = 'UYO' | 'IBENO' | 'MBO';

export interface TriageEscalationCardProps {
  encounterId: string;
  patientLabel: string;
  defaultLga?: SupportedLga;
  defaultLocale?: MamaGLocale;
  defaultRisk?: ClimateRiskKey;
  dispatchEndpoint?: string;
  onLocaleChange?: (locale: MamaGLocale) => void;
  onSpeak?: (text: string, locale: MamaGLocale) => void;
}

export const TriageEscalationCard: React.FC<TriageEscalationCardProps> = ({
  encounterId,
  patientLabel,
  defaultLga = 'UYO',
  defaultLocale = 'en',
  defaultRisk = 'heat_stress',
  dispatchEndpoint = '/api/v1/alerts/infobip-dispatch',
  onLocaleChange,
  onSpeak,
}) => {
  const [lga, setLga] = useState<SupportedLga>(defaultLga);
  const [locale, setLocale] = useState<MamaGLocale>(defaultLocale);
  const [risk, setRisk] = useState<ClimateRiskKey>(defaultRisk);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setLocale(defaultLocale);
  }, [defaultLocale]);

  useEffect(() => {
    setLga(defaultLga);
  }, [defaultLga]);

  useEffect(() => {
    setRisk(defaultRisk);
  }, [defaultRisk]);

  const tooltip = getClimateTooltip(risk, locale);

  const alertText = formatLevel1Sms({
    lga,
    locale,
    risk,
    encounterId,
  });

  const handleLocaleChange = (nextLocale: MamaGLocale) => {
    setLocale(nextLocale);
    onLocaleChange?.(nextLocale);
  };

  async function handleDispatchAlert() {
    setSubmitting(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const res = await fetch(dispatchEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId,
          lga,
          locale,
          languageCode: locale,
          risk,
          climateRisk: risk,
          severityLevel: 1,
          summary: `${tooltip.title} (${patientLabel})`,
          text: alertText,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const modeTag = String(data?.mode || '').toUpperCase();
      const statusTag = String(data?.status || '').toUpperCase();

      if (!res.ok || data?.ok === false || statusTag === 'FAILED') {
        setIsError(true);
        setStatusMessage(
          data?.error ||
            data?.errorDetail ||
            `Alert dispatch failed (HTTP ${res.status}). Local sync remains safe.`
        );
      } else if (modeTag === 'DRY_RUN' || statusTag === 'DRY_RUN' || data?.dryRun === true) {
        setIsError(false);
        setStatusMessage(
          `DRY_RUN recorded for ${lga} (${locale}) -> ${data?.to || 'configured recipient'}.`
        );
      } else if (modeTag === 'SANDBOX_VERIFICATION') {
        setIsError(false);
        setStatusMessage(
          `Sandbox verification alert logged for ${lga} (${locale}) · ID ${data?.alertId || encounterId}.`
        );
      } else {
        setIsError(false);
        setStatusMessage(
          `Level 1 alert dispatched for ${lga} (${locale})${data?.messageId ? ` · Msg ${data.messageId}` : ''}.`
        );
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage(
        `Network/dispatch error: ${err instanceof Error ? err.message : 'Unable to reach endpoint'}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-label="Level 1 Triage Escalation Card"
      className="rounded-xl border border-rose-500/40 bg-slate-950 p-4 text-slate-100 shadow-md"
    >
      {/* Top Row: Severity Badge, Localized Climate Tooltip, and Locale Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-rose-600/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-rose-300 border border-rose-500/40">
            Level 1 Urgent
          </span>

          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 border border-amber-500/30">
            <span>{tooltip.title}</span>
            <ClimateTooltip
              label={tooltip.title}
              detail={tooltip.detail}
              locale={locale}
              onSpeak={onSpeak ? (spoken) => onSpeak(spoken, locale) : undefined}
            />
          </span>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-slate-300">
          <span>Language:</span>
          <select
            aria-label="Alert and tooltip language"
            value={locale}
            onChange={(e) => handleLocaleChange(e.target.value as MamaGLocale)}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 cursor-pointer"
          >
            <option value="en">English (en)</option>
            <option value="ibb">Ibibio (ibb)</option>
            <option value="ibn">Ibeno (ibn)</option>
          </select>
        </label>
      </div>

      {/* Middle Row: Encounter Metadata & Controls */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-slate-400">Encounter / Patient</div>
          <div className="text-sm font-semibold text-slate-100">
            {encounterId} · {patientLabel}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <label className="flex flex-col text-xs text-slate-300">
            <span className="mb-1 text-slate-400">Climate Factor</span>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value as ClimateRiskKey)}
              className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 cursor-pointer"
            >
              <option value="heat_stress">Heat Stress</option>
              <option value="vector_malaria">Vector Malaria</option>
              <option value="post_flood_waterborne">Post-Flood Waterborne</option>
            </select>
          </label>

          <label className="flex flex-col text-xs text-slate-300">
            <span className="mb-1 text-slate-400">LGA Hub</span>
            <select
              value={lga}
              onChange={(e) => setLga(e.target.value as SupportedLga)}
              className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 cursor-pointer"
            >
              <option value="UYO">Uyo</option>
              <option value="IBENO">Ibeno</option>
              <option value="MBO">Mbo</option>
            </select>
          </label>
        </div>
      </div>

      {/* Alert Preview Box */}
      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-slate-300">
        <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          <span>Outbound Alert Preview</span>
          <span className="font-mono text-[10px] text-emerald-300/90 normal-case">
            GSM-7 · {alertText.length}/160 chars
          </span>
        </div>
        <p className="leading-relaxed text-slate-200">{alertText}</p>
      </div>

      {/* Bottom Row: Dispatch Trigger & Status Feedback */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleDispatchAlert}
          disabled={submitting}
          className="min-h-[40px] inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors"
        >
          {submitting ? 'Dispatching Alert...' : `Dispatch Level 1 Alert (${lga})`}
        </button>

        {statusMessage && (
          <div
            role="status"
            className={`rounded-md px-3 py-1.5 text-xs ${
              isError
                ? 'border border-rose-500/40 bg-rose-950/60 text-rose-200'
                : 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
            }`}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </section>
  );
};
