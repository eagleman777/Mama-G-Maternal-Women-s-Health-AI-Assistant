import { StructuredTriageResult } from '../types';
import climateExtensionJson from './climate_triage_extension.json';

export type ClimateRiskFactorId =
  | 'extreme_ambient_heat'
  | 'post_flood_water_contamination'
  | 'peak_mosquito_vector_season';

export interface ClimatePhraseMapping {
  id: string;
  concept: string;
  englishPrompt: string;
  ibibioEquivalent: string;
  phoneticGuide?: string;
  gloss: string;
  riskFactor: ClimateRiskFactorId;
}

export interface ClimateTriageRule {
  id: string;
  ruleSet: 'Rule Set A: Extreme Heat Stress & Gestational Hypertension' | 'Rule Set B: Climate-Triggered Vector-Borne Fever (Malaria in Pregnancy)' | 'Rule Set C: Post-Flood Water-Borne Risk';
  level: 'Level 1 (Emergency / Immediate Referral)' | 'Level 2 (Urgent Warning / Standard Triage)';
  severity: 'EMERGENCY' | 'URGENT';
  triggerConditions: string;
  action: string;
}

export const CLIMATE_TRIAGE_EXTENSION = climateExtensionJson;

export const CLIMATE_RISK_FACTORS: {
  id: ClimateRiskFactorId;
  label: string;
  emoji: string;
  shortDesc: string;
}[] = [
  {
    id: 'extreme_ambient_heat',
    label: 'Extreme Ambient Heat & Humidity',
    emoji: '☀️',
    shortDesc: 'Coastal heatwave / high indoor humidity / gestational hypertension watch',
  },
  {
    id: 'peak_mosquito_vector_season',
    label: 'Peak Mosquito / Rainy Season',
    emoji: '🦟',
    shortDesc: 'Standing water / high Malaria & Dengue vector transmission zone',
  },
  {
    id: 'post_flood_water_contamination',
    label: 'Post-Flood Water Contamination',
    emoji: '🌊',
    shortDesc: 'Flooded boreholes or wells / diarrheal & cholera dehydration risk',
  },
];

export const IBIBIO_CLIMATE_LEXICON: ClimatePhraseMapping[] = [
  {
    id: 'heat_stress',
    concept: 'Extreme Heat Stress',
    englishPrompt: 'Are you feeling dizzy from the severe heat?',
    ibibioEquivalent: 'Idem kpon̄ ut mama? / Ekeme ndikot udim ufan̄ obio usen emi?',
    phoneticGuide: 'Ee-dehm kpawng oot mah-mah? · Eh-keh-meh n-dee-koht oo-deem oo-fahng oh-bee-oh oo-sehn eh-mee?',
    gloss: 'Body hot too much / dizzy from severe environmental heat?',
    riskFactor: 'extreme_ambient_heat',
  },
  {
    id: 'sudden_swelling',
    concept: 'Sudden Swelling',
    englishPrompt: 'Do you have sudden swelling in your face or hands?',
    ibibioEquivalent: 'Idem usụhọ / Isọn̄ ke ubọk ye iso',
    phoneticGuide: 'Ee-dehm oo-suh-haw · Ee-sawng keh oo-bawk yeh ee-soh',
    gloss: 'Sudden puffy swelling on your hands and face',
    riskFactor: 'extreme_ambient_heat',
  },
  {
    id: 'vector_fever',
    concept: 'Vector Fever / Chills',
    englishPrompt: 'Are you having chills and fever from mosquito illness?',
    ibibioEquivalent: 'Utọdọn̄ / Usen ofụn̄ mîkpon̄',
    phoneticGuide: 'Oo-taw-dawng · Oo-sehn oh-fuhng mee-kpawng',
    gloss: 'High body fever accompanied by shaking chills',
    riskFactor: 'peak_mosquito_vector_season',
  },
];

export const CLIMATE_TRIAGE_RULES: ClimateTriageRule[] = [
  {
    id: 'heat_hypertension_level_1',
    ruleSet: 'Rule Set A: Extreme Heat Stress & Gestational Hypertension',
    level: 'Level 1 (Emergency / Immediate Referral)',
    severity: 'EMERGENCY',
    triggerConditions:
      'Headache + visual changes (blurring/spots) + upper right abdominal pain + BP >= 140/90 mmHg (or severe sudden facial/hand swelling) during 2nd/3rd trimester under extreme heat.',
    action:
      'Immediate emergency transport to secondary/tertiary obstetric facility; initiate cooling protocols (move to shade, damp cool cloths on forehead/neck).',
  },
  {
    id: 'heat_stress_level_2',
    ruleSet: 'Rule Set A: Extreme Heat Stress & Gestational Hypertension',
    level: 'Level 2 (Urgent Warning / Standard Triage)',
    severity: 'URGENT',
    triggerConditions:
      'Dizziness, excessive fatigue, or mild dehydration symptoms during high heat index days without hypertensive blood pressure spikes.',
    action:
      'Administer Oral Rehydration Salts (ORS), mandatory relocation to shaded/ventilated area, cool sponging, and monitor vitals/BP closely for 2 hours.',
  },
  {
    id: 'severe_malaria_level_1',
    ruleSet: 'Rule Set B: Climate-Triggered Vector-Borne Fever (Malaria in Pregnancy)',
    level: 'Level 1 (Emergency / Immediate Referral)',
    severity: 'EMERGENCY',
    triggerConditions:
      'Sudden fever/chills accompanied by inability to keep fluids down, extreme lethargy, yellowing of eyes (jaundice), dark urine, or severe anemia signs during post-flood/rainy season.',
    action:
      'Immediate Rapid Diagnostic Test (RDT) for malaria, parenteral anti-malarials (IV Artesunate) per national guidelines, and urgent hospital transfer.',
  },
  {
    id: 'uncomplicated_malaria_level_2',
    ruleSet: 'Rule Set B: Climate-Triggered Vector-Borne Fever (Malaria in Pregnancy)',
    level: 'Level 2 (Urgent Warning / Standard Triage)',
    severity: 'URGENT',
    triggerConditions:
      'Uncomplicated febrile illness, chills, rigors, or body aches in pregnancy during high mosquito vector density periods.',
    action:
      'Immediate RDT testing, prompt artemisinin-based combination therapy (ACT) per trimester protocol, and insecticide-treated bednet (ITN) counseling.',
  },
  {
    id: 'waterborne_flood_risk',
    ruleSet: 'Rule Set C: Post-Flood Water-Borne Risk',
    level: 'Level 2 (Urgent Warning / Standard Triage)',
    severity: 'URGENT',
    triggerConditions:
      'Acute watery diarrhea, stomach cramps, or nausea following heavy flooding or contaminated water consumption.',
    action:
      'Immediate WHO Oral Rehydration Salts (ORS) replacement, water boiling/chlorination counseling, and clinic check if sunken eyes or decreased urination occurs.',
  },
];

// Offline IndexedDB Rule Cache for Field Tablets (Zero Connectivity Execution)
const IDB_NAME = 'mama_g_climate_offline_db';
const IDB_STORE = 'climate_rules_cache';
const CACHE_KEY = 'climate_triage_pack_v1';

export async function syncClimateRulesToCache(): Promise<{
  cachedAt: number;
  source: 'indexeddb' | 'localstorage';
}> {
  const payload = {
    extension: CLIMATE_TRIAGE_EXTENSION,
    rules: CLIMATE_TRIAGE_RULES,
    lexicon: IBIBIO_CLIMATE_LEXICON,
    riskFactors: CLIMATE_RISK_FACTORS,
    cachedAt: Date.now(),
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {}

  if (typeof indexedDB === 'undefined') {
    return { cachedAt: payload.cachedAt, source: 'localstorage' };
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => {
        try {
          const db = request.result;
          const tx = db.transaction(IDB_STORE, 'readwrite');
          const store = tx.objectStore(IDB_STORE);
          store.put(payload, CACHE_KEY);
          tx.oncomplete = () => resolve({ cachedAt: payload.cachedAt, source: 'indexeddb' });
          tx.onerror = () => resolve({ cachedAt: payload.cachedAt, source: 'localstorage' });
        } catch {
          resolve({ cachedAt: payload.cachedAt, source: 'localstorage' });
        }
      };
      request.onerror = () => resolve({ cachedAt: payload.cachedAt, source: 'localstorage' });
    } catch {
      resolve({ cachedAt: payload.cachedAt, source: 'localstorage' });
    }
  });
}

export async function getCachedClimateRules(): Promise<{
  cachedAt: number | null;
  rules: ClimateTriageRule[];
  lexicon: ClimatePhraseMapping[];
}> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        cachedAt: parsed.cachedAt || null,
        rules: parsed.rules || CLIMATE_TRIAGE_RULES,
        lexicon: parsed.lexicon || IBIBIO_CLIMATE_LEXICON,
      };
    }
  } catch {}

  return {
    cachedAt: null,
    rules: CLIMATE_TRIAGE_RULES,
    lexicon: IBIBIO_CLIMATE_LEXICON,
  };
}

export const AKWA_IBOM_CLIMATE_LGAS = [
  'Ibeno',
  'Uyo',
  'Mbo',
  'Eket',
  'Ikot Ekpene',
  'Oron',
] as const;

export type AkwaIbomClimateLga = (typeof AKWA_IBOM_CLIMATE_LGAS)[number];

export interface LiveClimateFlagEvidence {
  active: boolean;
  level: 'HIGH' | 'MODERATE' | 'LOW';
  metricSummary: string;
  reason: string;
}

export interface LiveClimateRiskSnapshot {
  lga: string;
  coastal: boolean;
  coordinates: { lat: number; lon: number };
  source: 'live-open-meteo' | 'cached-live' | 'offline-fallback';
  timezone: string;
  observedAt: string;
  fetchedAt: string;
  cacheHit?: boolean;
  metrics: {
    tempC: number;
    heatIndexC: number;
    todayMaxTempC: number;
    humidityPct: number;
    currentPrecipMm: number;
    rain24hMm: number;
    rain72hMm: number;
    windKmh: number;
    weatherCode: number;
    conditionLabel: string;
  };
  activeFlags: ClimateRiskFactorId[];
  flagEvidence: Record<ClimateRiskFactorId, LiveClimateFlagEvidence>;
}

const LIVE_CLIMATE_CACHE_KEY = 'mama_g_live_climate_snapshot_v1';

export function getCachedLiveClimateRisks(lga?: string): LiveClimateRiskSnapshot | null {
  try {
    const key = lga ? `${LIVE_CLIMATE_CACHE_KEY}:${lga.toLowerCase()}` : LIVE_CLIMATE_CACHE_KEY;
    const raw = localStorage.getItem(key) || localStorage.getItem(LIVE_CLIMATE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveClimateRiskSnapshot;
    if (!parsed?.metrics || !Array.isArray(parsed.activeFlags)) return null;
    return { ...parsed, source: 'cached-live' };
  } catch {
    return null;
  }
}

export async function fetchLiveClimateRisks(params: {
  lga?: string;
  lat?: number;
  lon?: number;
  label?: string;
  forceRefresh?: boolean;
}): Promise<LiveClimateRiskSnapshot | null> {
  const query = new URLSearchParams();
  if (typeof params.lat === 'number' && typeof params.lon === 'number') {
    query.set('lat', String(params.lat));
    query.set('lon', String(params.lon));
    if (params.label) query.set('label', params.label);
  } else if (params.lga) {
    query.set('lga', params.lga);
  }
  if (params.forceRefresh) {
    query.set('refresh', '1');
  }

  try {
    const res = await fetch(`/api/climate-risks?${query.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as LiveClimateRiskSnapshot;
    if (!data?.metrics || !Array.isArray(data.activeFlags)) {
      throw new Error('Malformed live climate payload');
    }
    try {
      localStorage.setItem(LIVE_CLIMATE_CACHE_KEY, JSON.stringify(data));
      if (data.lga) {
        localStorage.setItem(
          `${LIVE_CLIMATE_CACHE_KEY}:${data.lga.toLowerCase()}`,
          JSON.stringify(data)
        );
      }
    } catch {}
    return data;
  } catch {
    return getCachedLiveClimateRisks(params.lga);
  }
}

/**
 * Evaluate Climate-Induced Health Threats offline per Rule Set A & Rule Set B
 */
export function evaluateClimateTriageOffline(params: {
  selectedSymptoms: string[];
  bpSystolic?: number;
  bpDiastolic?: number;
  temperature?: number;
  customNote?: string;
  climateRisks?: ClimateRiskFactorId[];
  ibibioMode?: boolean;
}): StructuredTriageResult | null {
  const {
    selectedSymptoms,
    bpSystolic = 0,
    bpDiastolic = 0,
    temperature = 0,
    customNote = '',
    climateRisks = [],
    ibibioMode = false,
  } = params;

  const combinedText = `${selectedSymptoms.join(' ')} ${customNote}`.toLowerCase();
  const isBpElevatedHeatThreshold = bpSystolic >= 140 || bpDiastolic >= 90;
  const isFever = temperature >= 38.0 || combinedText.includes('fever') || combinedText.includes('chills') || combinedText.includes('rigors');

  // Rule Set B - Level 1: Severe Malaria in Pregnancy Emergency
  const hasSevereMalariaRedFlags =
    isFever &&
    (combinedText.includes('jaundice') ||
      combinedText.includes('yellowing of eyes') ||
      combinedText.includes('dark urine') ||
      combinedText.includes('lethargy') ||
      combinedText.includes('anemia') ||
      combinedText.includes('inability to keep fluids') ||
      combinedText.includes('unable to keep water'));

  if (hasSevereMalariaRedFlags) {
    return {
      severity: 'EMERGENCY',
      headline:
        '🚨 SEVERE VECTOR-BORNE MALARIA EMERGENCY (Level 1): Immediate RDT & Parenteral Hospital Care Required',
      dangerSignsDetected: [
        'Sudden Fever / Chills during Vector Season',
        'Severe Malaria Indicators (Jaundice / Dark Urine / Lethargy / Fluid Intolerance)',
      ],
      plainLanguageExplanation:
        ibibioMode
          ? 'Utọdọn̄ / Usen ofụn̄ mîkpon̄: High fever with vomiting, extreme weakness, yellowing of the eyes, or dark urine indicates severe malaria in pregnancy. This requires emergency hospital anti-malarial treatment today.'
          : 'High fever accompanied by extreme lethargy, inability to keep fluids down, yellowing eyes (jaundice), or dark urine during peak mosquito/post-flood season signals Severe Malaria in Pregnancy — an immediate threat to mother and baby.',
      immediateActions: [
        'Rush to the nearest secondary or tertiary health facility immediately.',
        'Keep the mother cool with damp tepid sponging (avoid ice water) while arranging transport.',
        'Do NOT give native herbal mixtures or unprescribed painkillers.',
        ...(ibibioMode
          ? ['Ibibio Field Check: Ask "Utọdọn̄ / Usen ofụn̄ mîkpon̄?" (Fever with shaking chills?)']
          : []),
      ],
      chwClinicalNotes: [
        'Perform immediate Malaria Rapid Diagnostic Test (mRDT).',
        'Initiate parenteral anti-malarials (IV Artesunate) per national malaria guidelines and arrange urgent hospital transfer.',
        'Check hemoglobin/hematocrit and random blood sugar (severe malaria causes hypoglycemia).',
      ],
      whenToRushToHospital:
        'IMMEDIATELY. Severe malaria in pregnancy can cause cerebral malaria, pulmonary edema, or fetal loss within hours.',
    };
  }

  // Rule Set A - Level 1: Extreme Heat Stress & Gestational Hypertension Emergency
  const hasHeadacheOrVision =
    combinedText.includes('headache') ||
    combinedText.includes('blurry vision') ||
    combinedText.includes('visual disturbances') ||
    combinedText.includes('spots');
  const hasSwellingOrRuq =
    combinedText.includes('swelling') ||
    combinedText.includes('edema') ||
    combinedText.includes('upper right abdominal');

  if (
    (hasHeadacheOrVision && isBpElevatedHeatThreshold) ||
    (hasHeadacheOrVision && hasSwellingOrRuq && (isBpElevatedHeatThreshold || climateRisks.includes('extreme_ambient_heat')))
  ) {
    return {
      severity: 'EMERGENCY',
      headline:
        '🚨 LEVEL 1 HEAT STRESS & GESTATIONAL HYPERTENSION EMERGENCY: Immediate Obstetric Transport & Cooling',
      dangerSignsDetected: [
        ...(isBpElevatedHeatThreshold ? [`Elevated BP (${bpSystolic}/${bpDiastolic} ≥ 140/90 mmHg)`] : []),
        'Frontal Headache / Visual Disturbances + Facial/Hand Edema',
        ...(climateRisks.includes('extreme_ambient_heat') ? ['Extreme Ambient Heat Exposure'] : []),
      ],
      plainLanguageExplanation:
        ibibioMode
          ? 'Idem kpon̄ ut mama / Idem usụhọ (Isọn̄ ke ubọk ye iso): Extreme coastal heat can dangerously compound pregnancy hypertension (pre-eclampsia). Immediate hospital care and body cooling are required right away.'
          : 'Extreme ambient heat and humidity combined with throbbing headache, visual blurring/spots, sudden facial/hand swelling, or blood pressure ≥ 140/90 mmHg signals acute pre-eclampsia exacerbated by heat stress.',
      immediateActions: [
        'Arrange immediate emergency transport to a secondary/tertiary obstetric facility.',
        'Initiate rapid cooling protocols: Move immediately into deep shade/ventilated room and apply cool damp cloths to neck, forehead, and wrists.',
        'Lie gently on the left side; avoid bright light, noise, and exertion.',
        ...(ibibioMode
          ? ['Ibibio Field Check: "Idem usụhọ / Isọn̄ ke ubọk ye iso" — confirm face & hand swelling speed.']
          : []),
      ],
      chwClinicalNotes: [
        'Rule Set A (Level 1): Check BP (>=140/90 mmHg threshold with neuro/visual signs) and urine protein.',
        'Initiate cooling protocols (shade, wet compresses, cool sips of water if alert) while preparing MgSO4 / antihypertensive protocol per FMOH guidelines.',
        'Monitor fetal heart tones closely during rapid transfer.',
      ],
      whenToRushToHospital:
        'IMMEDIATELY. Do not wait for ambient temperatures to cool down.',
    };
  }

  // Rule Set B - Level 2: Uncomplicated Climate-Triggered Vector-Borne Fever
  if (
    isFever &&
    (climateRisks.includes('peak_mosquito_vector_season') ||
      climateRisks.includes('post_flood_water_contamination') ||
      combinedText.includes('chills') ||
      combinedText.includes('rigors') ||
      combinedText.includes('mosquito'))
  ) {
    return {
      severity: 'URGENT',
      headline:
        '⚠️ LEVEL 2 VECTOR-BORNE FEVER TRIAGE (Malaria Screen): Same-Day RDT & ACT Protocol',
      dangerSignsDetected: [
        'Febrile Illness / Chills / Body Aches',
        ...(climateRisks.includes('peak_mosquito_vector_season') ? ['Peak Mosquito / Rainy Season Risk'] : []),
      ],
      plainLanguageExplanation:
        ibibioMode
          ? 'Utọdọn̄ / Usen ofụn̄ mîkpon̄: Sudden fever, chills, or body aches during mosquito/flooding season must be tested for malaria today to protect mother and baby.'
          : 'Uncomplicated febrile illness in pregnancy during high mosquito vector density requires a prompt Malaria Rapid Diagnostic Test (RDT) and guideline-approved Artemisinin Combination Therapy (ACT).',
      immediateActions: [
        'Visit your primary health clinic today for an immediate Malaria Rapid Diagnostic Test (RDT).',
        'Complete your prescribed pregnancy-safe antimalarial treatment; sleep under an Insecticide-Treated Net (ITN) every night.',
        'Hydrate well with clean boiled/treated water or Oral Rehydration Salts.',
      ],
      chwClinicalNotes: [
        'Rule Set B (Level 2): Perform immediate mRDT. If positive, deploy prompt ACT (or 1st trimester protocol per national guidelines).',
        'Counsel household on clearing stagnant post-flood water and consistent ITN bednet utilization.',
      ],
      whenToRushToHospital:
        'Visit clinic today; rush to hospital immediately if vomiting prevents keeping fluids down, eyes turn yellow, or urine turns dark.',
    };
  }

  // Rule Set A - Level 2: Heat Stress Dizziness / Fatigue / Mild Dehydration
  const hasHeatExhaustionSigns =
    combinedText.includes('dizzy') ||
    combinedText.includes('dizziness') ||
    combinedText.includes('heat stress') ||
    combinedText.includes('fatigue') ||
    combinedText.includes('dehydration');

  if (
    hasHeatExhaustionSigns &&
    (climateRisks.includes('extreme_ambient_heat') || combinedText.includes('heat')) &&
    !isBpElevatedHeatThreshold
  ) {
    return {
      severity: 'URGENT',
      headline:
        '⚠️ LEVEL 2 EXTREME HEAT STRESS WARNING: Move to Shade, Start ORS & Monitor 2 Hours',
      dangerSignsDetected: [
        'Dizziness / Excessive Fatigue / Heat Dehydration',
        'High Heat Index Exposure without Hypertensive Spike',
      ],
      plainLanguageExplanation:
        ibibioMode
          ? 'Idem kpon̄ ut mama? Rest immediately in a cool shaded place and sip clean Oral Rehydration Salts (ORS) slowly.'
          : 'Pregnant women overheat faster due to higher blood volume and metabolic heat. Dizziness and fatigue on extreme heat days require active cooling and oral rehydration.',
      immediateActions: [
        'Relocate immediately to a cool, shaded, well-ventilated space and loosen tight clothing.',
        'Drink small, frequent sips of WHO Oral Rehydration Salts (ORS) or clean water.',
        'Loosen headwraps, wipe arms/neck with cool damp cloths, and rest on your left side.',
        'Monitor closely for 2 hours — if severe headache, blurred vision, or vomiting begins, rush to clinic.',
      ],
      chwClinicalNotes: [
        'Rule Set A (Level 2): Administer ORS, relocate mother to shaded clinic waiting zone, and repeat Blood Pressure + Temp check over 2 hours.',
        'Escalate to Level 1 emergency protocol immediately if BP rises >= 140/90 mmHg or visual/neurological signs appear.',
      ],
      whenToRushToHospital:
        'If dizziness persists after 2 hours in shade with ORS, or if headache/blurred vision develops.',
    };
  }

  // Rule Set C: Post-Flood Water-Borne Illness
  if (
    combinedText.includes('diarrhea') ||
    combinedText.includes('water-borne') ||
    combinedText.includes('contaminated water') ||
    (climateRisks.includes('post_flood_water_contamination') && combinedText.includes('vomiting'))
  ) {
    return {
      severity: 'URGENT',
      headline:
        '⚠️ POST-FLOOD WATER-BORNE RISK TRIAGE: Immediate Rehydration (ORS) & Clinic Check',
      dangerSignsDetected: [
        'Acute Diarrheal / GI Symptoms during Post-Flood Period',
      ],
      plainLanguageExplanation:
        'Floodwaters contaminate boreholes and wells, increasing risk of acute diarrheal disease in pregnant mothers. Rapid Oral Rehydration prevents dangerous maternal dehydration and preterm contractions.',
      immediateActions: [
        'Begin sipping WHO Oral Rehydration Salts (ORS) or safe salt-sugar water immediately after every loose stool.',
        'Boil all drinking water for at least 1 full minute or treat with water guard chlorine tablets.',
        'Seek clinic care today if stool is profuse/watery ("rice-water"), or if you cannot keep fluids down.',
      ],
      chwClinicalNotes: [
        'Assess dehydration severity (skin turgor, pulse, urine output, sunken eyes).',
        'Distribute ORS packets and Aquatabs/chlorination guidance to household.',
      ],
      whenToRushToHospital:
        'Rush to hospital if profuse watery diarrhea, severe cramping, or persistent vomiting occurs.',
    };
  }

  return null;
}

/**
 * Offline Chat Fallback for Climate-Induced Health Threats
 */
export function checkClimateChatFallback(
  query: string,
  climateRisks: ClimateRiskFactorId[] = [],
  ibibioMode: boolean = false
): string | null {
  const q = query.toLowerCase();
  const isHeatQuery =
    q.includes('heat') ||
    q.includes('dizzy') ||
    q.includes('idem kpon') ||
    q.includes('idem usụhọ') ||
    q.includes('swelling') ||
    climateRisks.includes('extreme_ambient_heat');
  const isVectorQuery =
    q.includes('malaria') ||
    q.includes('mosquito') ||
    q.includes('flood') ||
    q.includes('utọdọn̄') ||
    q.includes('chills') ||
    q.includes('jaundice') ||
    climateRisks.includes('peak_mosquito_vector_season');

  if (isHeatQuery && (q.includes('headache') || q.includes('blur') || q.includes('swelling') || q.includes('bp') || q.includes('140'))) {
    return `🚨 **CRITICAL WARNING / RED FLAG: EXTREME HEAT STRESS & GESTATIONAL HYPERTENSION CHECK**\n\n💬 **Direct Answer & Guidance:**\n${
      ibibioMode ? '**Ibibio Check:** *Idem kpon̄ ut mama? / Idem usụhọ ke ubọk ye iso.* \n' : ''
    }Throbbing frontal headache, blurry vision, or sudden swelling of face/hands during extreme heat can indicate life-threatening pre-eclampsia (BP ≥ 140/90 mmHg).\n\n📋 **Practical Steps / Checklist:**\n- Move immediately to a cool, shaded, well-ventilated place\n- Cool skin gently with damp cloths and rest on your left side\n- Arrange urgent transport to your nearest hospital or Primary Health Centre today\n\n🏥 **When to See a Healthcare Provider:**\nGo immediately for blood pressure, urine protein, and fetal heart checks.\n\n⚠️ *Educational triage guidance; seek in-person clinical evaluation right away.*`;
  }

  if (isVectorQuery && (q.includes('fever') || q.includes('chills') || q.includes('malaria') || q.includes('utọdọn̄'))) {
    return `⚠️ **URGENT CLINICAL SCREENING: CLIMATE-TRIGGERED MALARIA IN PREGNANCY**\n\n💬 **Direct Answer & Guidance:**\n${
      ibibioMode ? '**Ibibio Check:** *Utọdọn̄ / Usen ofụn̄ mîkpon̄.* \n' : ''
    }Sudden fever, shaking chills, or body aches during peak rainy/post-flood periods require urgent Malaria Rapid Diagnostic Testing (RDT). Malaria in pregnancy causes severe anemia and miscarriage risk.\n\n📋 **Practical Steps / Checklist:**\n- Get an immediate RDT blood test at your clinic today (do NOT delay)\n- Rush to hospital immediately if eyes turn yellow (jaundice), urine turns dark, or you cannot keep fluids down\n- Sleep under an insecticide-treated bednet (ITN) every night\n\n🏥 **When to See a Healthcare Provider:**\nToday for an RDT test and safe trimester-approved ACT medicine.`;
  }

  if (isHeatQuery && (q.includes('dizzy') || q.includes('heat') || q.includes('tired') || q.includes('idem'))) {
    return `⚠️ **URGENT WARNING: HEAT STRESS IN PREGNANCY (Level 2)**\n\n💬 **Direct Answer & Guidance:**\n${
      ibibioMode ? '**Ibibio Check:** *Idem kpon̄ ut mama?* \n' : ''
    }High coastal heat and humidity increase dizziness and dehydration risks during pregnancy.\n\n📋 **Practical Steps / Checklist:**\n- Relocate immediately to a cool, shaded, ventilated room\n- Sip WHO Oral Rehydration Salts (ORS) and clean water slowly\n- Monitor for 2 hours; check blood pressure if a clinic/CHW is nearby\n\n🏥 **When to See a Healthcare Provider:**\nGo immediately if dizziness worsens, headache/blurred vision appears, or you feel faint.`;
  }

  return null;
}
