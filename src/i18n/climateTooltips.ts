import type { ClimateRiskFactorId } from '../data/climateTriageEngine';

export type MamaGLocale = 'en' | 'ibb' | 'ibn';
export type ClimateRiskKey = 'heat_stress' | 'vector_malaria' | 'post_flood_waterborne';

export interface ClimateTooltipEntry {
  title: string;
  detail: string;
}

export const CLIMATE_TOOLTIPS: Record<
  MamaGLocale,
  Record<ClimateRiskKey, ClimateTooltipEntry>
> = {
  en: {
    heat_stress: {
      title: 'Heat Stress Risk',
      detail:
        'High heat and dehydration strain pregnancy and can trigger dizziness, weakness, or preterm labor—cool down, hydrate, and escalate early if symptoms appear.',
    },
    vector_malaria: {
      title: 'Vector Malaria Window',
      detail:
        'Mosquito activity increases fever and malaria risk during pregnancy, which can cause severe anemia or distress—test early, use net care, and escalate urgent fever.',
    },
    post_flood_waterborne: {
      title: 'Post-Flood Waterborne Risk',
      detail:
        'Flooded drains and stagnant water raise diarrheal and infection risks during pregnancy—use safe water only, wash hands often, and escalate vomiting, diarrhea, or fever.',
    },
  },
  ibb: {
    heat_stress: {
      title: 'Ufiop Eyọ / Idọk Ufiop',
      detail:
        'Akamba ufiop ye nsat mmọn̄ ekeme ndinam owo emi oyom eyen afịna, ibuot akama m̀mê adaha uman usọp usọp—n̄wọn̄ mmọn̄, du ke mbiet, nyụn̄ sọp kot owo usọp.',
    },
    vector_malaria: {
      title: 'Ukpọk Ibọk Utọk / Ekpọk',
      detail:
        'Utọk esinam ọfiọn̄ ye ekpọk ekọri ke ini idịbi, emi ekemede ndisịn iyịp esịt m̀mê afịna—nam ndụn̄ọde usọp, da net n̄kụk, nyụn̄ sọp tọt owo edieke ufiop ọdọkde.',
    },
    post_flood_waterborne: {
      title: 'Afai Mmọn̄ Ukwọ / Mbia Mmọn̄',
      detail:
        'Mmọn̄ ukwọ ye mmọn̄ emi mîwọrọke ekeme ndinam udọn̄ọ idịbi ye mfịna ke ini idịbi—da eti mmọn̄ kpọt, yet ubọk kpukpru ini, nyụn̄ sọp tọt owo edieke esịnde m̀mê afịna.',
    },
  },
  ibn: {
    heat_stress: {
      title: 'Ọkọk Ọfụm / Ufiop',
      detail:
        'Ekpuk ufiop ye nsat mmọn̄ ọtọkọ ndinam eyen-owuo afịna, ibuot akama m̀mê uman adaha—n̄wọn̄ mmọn̄, dọk ke mbiet, ọkpọk sọp tọt midwife.',
    },
    vector_malaria: {
      title: 'Utọk / Ekpọk Idịbi',
      detail:
        'Utọk ọkọkọ ndinam ekpọk ke ini idịbi, emi ọtọkọ ndinam iyịp osụhọde m̀mê eyen afịna—se usọp, kụk net, ọkpọk sọp tọt midwife edieke ufiop edide.',
    },
    post_flood_waterborne: {
      title: 'Afai Mmọn̄ / Mbia Mmọn̄',
      detail:
        'Mmọn̄ ukwọ ye mmọn̄ emi adade ke itie kiet ọtọkọ ndinam udọn̄ọ idịbi ke ini idịbi—da mmọn̄ emi asanade kpọt, yet ubọk, ọkpọk tọt midwife edieke udọn̄ọ ọdọkde.',
    },
  },
};

export function climateRiskFactorToKey(riskId: ClimateRiskFactorId): ClimateRiskKey {
  switch (riskId) {
    case 'extreme_ambient_heat':
      return 'heat_stress';
    case 'peak_mosquito_vector_season':
      return 'vector_malaria';
    case 'post_flood_water_contamination':
      return 'post_flood_waterborne';
  }
}

export function getClimateTooltip(
  risk: ClimateRiskKey,
  locale?: string | null
): ClimateTooltipEntry {
  const normalized = (locale || 'en').trim().toLowerCase() as MamaGLocale;
  const bundle = CLIMATE_TOOLTIPS[normalized] || CLIMATE_TOOLTIPS.en;
  return bundle[risk] || CLIMATE_TOOLTIPS.en[risk];
}
