import type { SupportedLga } from '../components/TriageEscalationCard';
import type { ClimateRiskKey, MamaGLocale } from './climateTooltips';

export interface SmsTemplateParams {
  lga: SupportedLga | string;
  locale: MamaGLocale | string;
  risk: ClimateRiskKey | string;
  encounterId: string;
}

const TEMPLATES: Record<
  MamaGLocale,
  Record<ClimateRiskKey, (lga: string, id: string) => string>
> = {
  en: {
    heat_stress: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Heat stress + maternal risk. Cool/hydrate now; urgent midwife review needed.`,
    vector_malaria: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Fever/malaria risk in pregnancy. Urgent midwife triage & check needed now.`,
    post_flood_waterborne: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Post-flood illness/vomiting in pregnancy. Safe water + midwife care now.`,
  },
  ibb: {
    heat_stress: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Ufiop eyo ye afina idibi. Nwon mmon, du ke mbiet; kot midwife usop usop.`,
    vector_malaria: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Ufiop utok ye ekpok ke idibi. Se usop usop; midwife oyom ndise idahaemi.`,
    post_flood_waterborne: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Mbia mmon ukwo ke idibi. Da eti mmon; kot midwife usop usop idahaemi.`,
  },
  ibn: {
    heat_stress: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Okok ofum ye afina eyen-owuo. Nwon mmon, dok ke mbiet; tot midwife usop.`,
    vector_malaria: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Utom utok ye ekpok ke idibi. Se usop usop; tot midwife edieke ufiop odokde.`,
    post_flood_waterborne: (lga, id) =>
      `MAMA-G L1 [${lga}] ID:${id} Mbia mmon ukwo ke idibi. Da mmon emi asanade; tot midwife usop idahaemi.`,
  },
};

export function normalizeClimateRiskKey(risk?: string | null): ClimateRiskKey {
  const raw = (risk || '').trim().toLowerCase();
  if (raw === 'vector_malaria' || raw === 'peak_mosquito_vector_season' || raw.includes('malaria')) {
    return 'vector_malaria';
  }
  if (
    raw === 'post_flood_waterborne' ||
    raw === 'post_flood_water_contamination' ||
    raw.includes('flood') ||
    raw.includes('water')
  ) {
    return 'post_flood_waterborne';
  }
  return 'heat_stress';
}

export function normalizeSmsLocale(locale?: string | null): MamaGLocale {
  const raw = (locale || 'en').trim().toLowerCase();
  if (raw === 'ibb' || raw === 'ibibio') return 'ibb';
  if (raw === 'ibn' || raw === 'ibeno') return 'ibn';
  return 'en';
}

export function formatLevel1Sms({ lga, locale, risk, encounterId }: SmsTemplateParams): string {
  const safeLga = (lga || 'UYO').trim().toUpperCase();
  const safeId = (encounterId || 'ENC-00').trim();
  const safeLocale = normalizeSmsLocale(locale);
  const safeRisk = normalizeClimateRiskKey(risk);
  const langBundle = TEMPLATES[safeLocale] || TEMPLATES.en;
  const builder = langBundle[safeRisk] || TEMPLATES.en.heat_stress;
  const msg = builder(safeLga, safeId);
  return msg.length <= 160 ? msg : `${msg.slice(0, 157)}...`;
}
