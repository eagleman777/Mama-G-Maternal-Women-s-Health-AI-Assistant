import process from 'node:process';
import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import {
  formatLevel1Sms,
  normalizeClimateRiskKey,
  normalizeSmsLocale,
} from '../../src/i18n/smsTemplates';

interface InfobipDispatchRequest {
  text?: string;
  lga?: string;
  to?: string;
  locale?: 'en' | 'ibb' | 'ibn' | string;
  risk?: string;
  encounterId?: string;
  deviceId?: string;
  stationId?: string;
  languageCode?: 'en' | 'ibb' | 'ibn' | string;
  climateRisk?: string;
  severityLevel?: 1 | 2 | number;
  summary?: string;
}

interface MidwifeStationMeta {
  stationId: string;
  lga: 'Uyo' | 'Ibeno' | 'Mbo';
  lgaKey: 'UYO' | 'IBENO' | 'MBO';
  stationName: string;
  midwifeRole: string;
  envKey: 'MIDWIFE_ONCALL_UYO' | 'MIDWIFE_ONCALL_IBENO' | 'MIDWIFE_ONCALL_MBO';
}

const REGIONAL_MIDWIFE_STATIONS: MidwifeStationMeta[] = [
  {
    stationId: 'MW-UYO-01',
    lga: 'Uyo',
    lgaKey: 'UYO',
    stationName: 'Uyo Regional Hub · Maternity Emergency Desk',
    midwifeRole: 'Senior On-Call Regional Midwife',
    envKey: 'MIDWIFE_ONCALL_UYO',
  },
  {
    stationId: 'MW-IBENO-02',
    lga: 'Ibeno',
    lgaKey: 'IBENO',
    stationName: 'Ibeno Coastal PHC · Emergency Desk',
    midwifeRole: 'On-Call Community Midwife Lead',
    envKey: 'MIDWIFE_ONCALL_IBENO',
  },
  {
    stationId: 'MW-MBO-03',
    lga: 'Mbo',
    lgaKey: 'MBO',
    stationName: 'Mbo General Outpost · Maternal Triage',
    midwifeRole: 'On-Call Obstetric Nurse-Midwife',
    envKey: 'MIDWIFE_ONCALL_MBO',
  },
];

const DIALECT_CUES: Record<'en' | 'ibb' | 'ibn', string> = {
  en: 'EN · Immediate midwife escalation required',
  ibb: 'IBB (Ibibio) · Ufan̄ mbọm mme eka: Nyene un̄wam idahaemi',
  ibn: 'IBN (Ibeno) · Obio Ibeno mbọm eka: Koot midwife idahaemi',
};

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};

function stripWrappingQuotes(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^["']+|["']+$/g, '').trim();
}

function isPlaceholderValue(raw?: string): boolean {
  const val = stripWrappingQuotes(raw).toLowerCase();
  if (!val) return true;
  return (
    (val.includes('<') && val.includes('>')) ||
    val.includes('your-subdomain') ||
    val.includes('your-infobip') ||
    val.includes('your_infobip') ||
    val.includes('registered-phone') ||
    val.includes('verified-test-recipient') ||
    val.includes('xxxxx') ||
    val.includes('replace_with') ||
    val.startsWith('my_') ||
    val === 'changeme' ||
    val === 'placeholder'
  );
}

export function normalizeInfobipBaseUrl(raw?: string): string {
  const unquoted = stripWrappingQuotes(raw);
  if (!unquoted || isPlaceholderValue(unquoted)) return '';
  return unquoted
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .split('/')[0]
    .trim();
}

export function normalizePhoneDigits(raw?: string): string {
  const unquoted = stripWrappingQuotes(raw);
  if (!unquoted || isPlaceholderValue(unquoted)) return '';
  return unquoted.replace(/\D+/g, '');
}

export function normalizeInfobipSender(raw?: string, fallback = 'ServiceSMS'): string {
  const unquoted = stripWrappingQuotes(raw);
  if (!unquoted || isPlaceholderValue(unquoted)) return fallback;
  if (/^[\d\s+\-()]+$/.test(unquoted)) {
    return unquoted.replace(/\D+/g, '') || fallback;
  }
  return unquoted;
}

export function isDryRunEnabled(raw?: string): boolean {
  const val = stripWrappingQuotes(raw).toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'on';
}

function resolveStation(lga?: string, stationId?: string): MidwifeStationMeta {
  if (stationId) {
    const byId = REGIONAL_MIDWIFE_STATIONS.find(
      (s) => s.stationId.toLowerCase() === stationId.trim().toLowerCase()
    );
    if (byId) return byId;
  }
  const normalizedLga = stripWrappingQuotes(lga).toUpperCase();
  const byLga = REGIONAL_MIDWIFE_STATIONS.find(
    (s) => s.lgaKey === normalizedLga || normalizedLga.includes(s.lgaKey)
  );
  return byLga || REGIONAL_MIDWIFE_STATIONS[0];
}

function resolveDestinationNumber(explicitTo: string | undefined, station: MidwifeStationMeta): string {
  const overrideDigits = normalizePhoneDigits(explicitTo);
  if (overrideDigits) return overrideDigits;

  const lgaNumber = normalizePhoneDigits(process.env[station.envKey]);
  if (lgaNumber) return lgaNumber;

  const uyoFallback = normalizePhoneDigits(process.env.MIDWIFE_ONCALL_UYO);
  if (uyoFallback) return uyoFallback;

  return normalizePhoneDigits(process.env.INFOBIP_TEST_TO);
}

function jsonResponse(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: JSON_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed. Use POST with JSON body { text?, lga?, to? }.',
    });
  }

  const startedAt = Date.now();

  let payload: InfobipDispatchRequest = {};
  if (event.body) {
    try {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : event.body;
      payload = JSON.parse(rawBody) as InfobipDispatchRequest;
    } catch {
      return jsonResponse(400, {
        error: 'Invalid JSON request body.',
      });
    }
  }

  const station = resolveStation(payload.lga, payload.stationId);
  const langKey = normalizeSmsLocale(payload.languageCode || payload.locale);
  const resolvedRisk = normalizeClimateRiskKey(payload.climateRisk || payload.risk);
  const severityLevel: 1 | 2 = Number(payload.severityLevel) === 2 ? 2 : 1;
  const encounterId =
    payload.encounterId || `ENC-NETLIFY-${startedAt.toString(36).toUpperCase()}`;
  const deviceId = payload.deviceId || 'NETLIFY-EDGE';
  const summary =
    (typeof payload.summary === 'string' && payload.summary.trim()) ||
    (typeof payload.text === 'string' && payload.text.trim()) ||
    'Level 1 Obstetric Emergency Escalation';

  const smsText =
    typeof payload.text === 'string' && payload.text.trim()
      ? payload.text.trim()
      : formatLevel1Sms({
          lga: station.lgaKey,
          locale: langKey,
          risk: resolvedRisk,
          encounterId,
        });

  const baseUrl = normalizeInfobipBaseUrl(process.env.INFOBIP_BASE_URL);
  const apiKey = stripWrappingQuotes(process.env.INFOBIP_API_KEY);
  const apiKeyValid = Boolean(apiKey && !isPlaceholderValue(apiKey));
  const smsFrom = normalizeInfobipSender(process.env.INFOBIP_SMS_FROM, 'ServiceSMS');
  const destinationTo = resolveDestinationNumber(payload.to, station);
  const dryRun = isDryRunEnabled(process.env.ALERT_DRY_RUN);

  const alertId = `ALT-${startedAt.toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;
  const endpoint = baseUrl
    ? `https://${baseUrl}/sms/2/text/advanced`
    : 'https://<unconfigured-infobip-base-url>/sms/2/text/advanced';

  const baseRecord = {
    alertId,
    encounterId,
    deviceId,
    lga: station.lga,
    stationId: station.stationId,
    stationName: station.stationName,
    midwifeRole: station.midwifeRole,
    channel: 'sms' as const,
    languageCode: langKey,
    severityLevel,
    summary: summary.slice(0, 220),
    provider: 'infobip' as const,
    dispatchedAt: new Date(startedAt).toISOString(),
    dispatchedEpochMs: startedAt,
    acknowledgedAt: null,
    ackLatencyMs: null,
    ackBy: null,
  };

  if (dryRun) {
    return jsonResponse(200, {
      ...baseRecord,
      status: 'DRY_RUN',
      dryRun: true,
      mode: 'dry_run',
      endpoint,
      from: smsFrom,
      to: destinationTo || null,
      text: smsText,
      messageId: null,
      dispatchLatencyMs: Math.max(1, Date.now() - startedAt),
      errorDetail: null,
    });
  }

  if (!baseUrl || !apiKeyValid) {
    return jsonResponse(500, {
      ...baseRecord,
      status: 'failed',
      mode: 'infobip_live',
      messageId: null,
      dispatchLatencyMs: Math.max(1, Date.now() - startedAt),
      error: 'Infobip live credentials missing. Set INFOBIP_BASE_URL and INFOBIP_API_KEY in Netlify environment variables.',
      errorDetail: 'INFOBIP_BASE_URL or INFOBIP_API_KEY is not configured.',
    });
  }

  if (!destinationTo) {
    return jsonResponse(400, {
      ...baseRecord,
      status: 'failed',
      mode: 'infobip_live',
      messageId: null,
      dispatchLatencyMs: Math.max(1, Date.now() - startedAt),
      error: `No valid destination phone number configured for ${station.lga} LGA (checked request "to", ${station.envKey}, MIDWIFE_ONCALL_UYO, INFOBIP_TEST_TO).`,
      errorDetail: 'Missing destination phone number.',
    });
  }

  const infobipPayload = {
    messages: [
      {
        destinations: [{ to: destinationTo }],
        from: smsFrom,
        text: smsText,
      },
    ],
  };

  try {
    const upstreamRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `App ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(infobipPayload),
      signal: AbortSignal.timeout(10000),
    });

    const rawText = await upstreamRes.text();
    let parsedUpstream: Record<string, unknown> | null = null;
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsedUpstream = parsed as Record<string, unknown>;
        }
      } catch {
        parsedUpstream = null;
      }
    }

    const firstMsg =
      parsedUpstream && Array.isArray(parsedUpstream.messages)
        ? (parsedUpstream.messages[0] as Record<string, unknown> | undefined)
        : undefined;
    const messageId = typeof firstMsg?.messageId === 'string' ? firstMsg.messageId : null;
    const serviceError =
      (parsedUpstream?.requestError as { serviceException?: { text?: string } } | undefined)
        ?.serviceException?.text || null;

    const dispatchLatencyMs = Math.max(1, Date.now() - startedAt);
    const responseBody = {
      ...(parsedUpstream ?? { upstreamBody: rawText }),
      ...baseRecord,
      mode: 'infobip_live' as const,
      from: smsFrom,
      to: destinationTo,
      text: smsText,
      messageId,
      upstreamStatus: upstreamRes.status,
      status: upstreamRes.ok ? ('dispatched_awaiting_ack' as const) : ('failed' as const),
      dispatchLatencyMs,
      errorDetail: upstreamRes.ok ? null : serviceError || rawText || `Infobip HTTP ${upstreamRes.status}`,
    };

    return jsonResponse(upstreamRes.status, responseBody);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Infobip upstream request failed or timed out';
    return jsonResponse(502, {
      ...baseRecord,
      status: 'failed',
      mode: 'infobip_live',
      messageId: null,
      dispatchLatencyMs: Math.max(1, Date.now() - startedAt),
      error: 'Infobip upstream request failed',
      errorDetail: errMsg,
    });
  }
};
