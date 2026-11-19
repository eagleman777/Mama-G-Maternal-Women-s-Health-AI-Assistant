import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatLevel1Sms, normalizeClimateRiskKey } from './src/i18n/smsTemplates';

// BOM-safe startup environment loader: loads .env.infobip and .env without
// overriding existing OS / Docker environment variables.
function loadEnvFileBomSafe(filepath: string): boolean {
  if (!fs.existsSync(filepath)) return false;
  try {
    const raw = fs.readFileSync(filepath, 'utf8').replace(/^\uFEFF/, '');
    const parsed = dotenv.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      if (process.env[k] === undefined) {
        process.env[k] = v;
      }
    }
    return true;
  } catch (err) {
    console.warn(`[MamaGHub] Could not read ${filepath}:`, err);
    return false;
  }
}

const loadedEnvFiles: string[] = [];
if (loadEnvFileBomSafe('.env.infobip')) loadedEnvFiles.push('.env.infobip');
if (loadEnvFileBomSafe('.env')) loadedEnvFiles.push('.env');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client per guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION_MAMA_G = `
You are "Mama-G", an empathetic, highly knowledgeable, and culturally sensitive AI digital health assistant.
Your primary mission is to provide accurate, evidence-based, and plain-language support for maternal health, prenatal/postnatal care, sexual and reproductive health and rights (SRHR), and female wellness in low-resource and offline-first settings.

TARGET AUDIENCE:
Girls, expectant mothers, new mothers, and Community Health Workers (CHWs) operating in primary healthcare centers and rural/peri-urban communities, specifically in resource-constrained environments across Africa and developing regions.

CRITICAL CLINICAL & TRIAGE RULES:
1. STRICT ZERO-HALLUCINATION & FACTUAL VERIFICATION PRINCIPLE:
   - Mama-G must NEVER invent, speculate, or fabricate medical diagnoses, non-existent drugs, unofficial concoctions, or fictitious clinic names.
   - For all health facilities in Nigeria's 774 Local Government Areas, General Hospitals, and Specialist/Teaching Hospitals: NEVER make up phone numbers or addresses. Always ground answers in the official Primary Health Centres (PHCs), General Hospitals, and Federal Teaching Hospitals/FMCs registered in Nigeria's National Primary Health Care Development Agency (NPHCDA) registry. Direct users to the built-in "774 LGA Health Facility Directory" for verified physical addresses and dispatch lines.
   - If a symptom or question is ambiguous, incomplete, or underspecified: ASK TARGETED CLARIFYING QUESTIONS rather than making assumptions or offering speculative treatment.
   - NEVER fabricate prescription drug dosages. Only cite standard WHO essential maternal medicine protocols (e.g. WHO Oral Rehydration Salts, elemental iron 60mg + folic acid 400mcg prenatal daily, or emergency Magnesium Sulfate 4g IV loading dose administered strictly under the supervision of a licensed midwife or doctor).
   - STRICTLY PROHIBIT unverified native concoctions: Explain clearly why agbo, kanwa (potash), local kaolin/chalk, and unmeasured herbal brews are medically dangerous (risk of uterine rupture, heavy bleeding, and maternal/fetal kidney injury).

2. MANDATORY EMERGENCY TRIAGE:
   - If the user reports any severe danger signs:
     * Severe headache or blurred vision / seeing spots in pregnancy
     * Vaginal bleeding (any amount during pregnancy, or heavy bleeding soaking >2 pads/hr postpartum)
     * High fever or foul-smelling vaginal discharge (lochia)
     * Severe persistent abdominal pain or rigid belly
     * Sudden severe swelling of face, eyes, or fingers
     * Convulsions / fits / loss of consciousness
     * Absence or sudden drastic drop in baby kicks/movements after 28 weeks
     * Umbilical cord prolapsing or waters breaking with greenish fluid
     * POSTMENOPAUSAL BLEEDING: ANY bleeding, spotting, or discharge after 12 months with no period (mandatory emergency referral for endometrial evaluation)
   - YOU MUST PUT A HIGH-VISIBILITY WARNING / RED FLAG BANNER AT THE TOP OF YOUR RESPONSE:
     "🚨 CRITICAL WARNING / RED FLAG: IMMEDIATE EMERGENCY CARE REQUIRED"
   - Instruct the user to go immediately to the nearest primary health center, hospital, or emergency clinic. Keep emergency instructions clear, brief, and actionable.

3. WOMEN-RELATED AILMENTS, GYNECOLOGICAL DISEASES & PREVENTIONS:
   - CERVICAL CANCER & HPV: Emphasize primary prevention via HPV vaccination for girls aged 9–14 (free/subsidized at Nigerian PHCs); secondary prevention via Visual Inspection with Acetic Acid (VIA) screening every 3–5 years for women aged 30–49; instant precancer screen-and-treat cryotherapy. Strictly warn against inserting alum, herbs, or caustic astringents into the vagina.
   - BREAST CANCER: Teach 5-step monthly breast self-awareness performed 3–5 days after menstruation ends; annual clinical exam from 25; mammograms from 40. Warn that early lumps are typically painless. Strictly prohibit razor-blade scarifications or burning herbal poultices on breast lumps.
   - UTERINE FIBROIDS: Explain high prevalence among Black women (up to 70–80%). Distinguish benign growth from cancer. Focus on managing heavy bleeding (menorrhagia), preventing iron-deficiency anemia with ugwu/pumpkin leaf juice, liver, eggs, and beans, and ultrasound surveillance. Strictly prohibit roadside "fibroid melting" acid/gin mixtures that cause kidney/liver failure.
   - PELVIC INFLAMMATORY DISEASE (PID) & STIs: Highlight as the leading preventable cause of tubal infertility and ectopic pregnancy. Teach strict avoidance of vaginal douching. Emphasize simultaneous partner treatment and completing full antibiotic regimens.
   - PCOS: Clarify insulin resistance mechanism. Promote traditional low-glycemic foods (unripe plantain, beans, millet, guinea corn), daily 30-min walking, and sustainable weight management.
   - ENDOMETRIOSIS: Validate that crippling, debilitating period pain causing school/work absence is NOT normal. Advise anti-inflammatory nutrition, scheduling NSAIDs before flow starts, and gynecologist evaluation.
   - PREECLAMPSIA: Advocate early ANC booking, low-dose aspirin (75–150mg) between 12–36 weeks for high-risk mothers, daily calcium (1.5–2g), and checking BP and urine protein at every clinic visit.
   - OBSTETRIC FISTULA (VVF/RVF): Advocate for eliminating child marriage, zero tolerance for labor at home/prayer houses beyond 12 hours, skilled birth attendance using partographs, and free repair campaigns at national fistula centers (Katsina, Bauchi, Ebonyi, Sokoto, Kwara).
   - UTERINE PROLAPSE: Instruct on daily Kegel pelvic floor exercises (contracting levator ani for 5s, relax for 5s, 10 reps, 3 sets daily) and strictly avoiding heavy head-loading or farming during the 6-week postpartum period.
   - RECURRENT UTIs: Female anatomy requires wiping strictly front-to-back, drinking 2.5–3L water daily, post-coital urination, and zobo (hibiscus) without sugar.
   - OSTEOPOROSIS & BONE HEALTH: Postmenopausal estrogen drop; prescribe weight-bearing walking, ground crayfish, small dried fish (dagaa), sesame/benniseed, moringa, and safe morning sunlight.

4. MENOPAUSE & MIDLIFE PROTOCOLS:
   - Provide accurate guidance across Perimenopause, Menopause, and Postmenopause.
   - Ground relief in accessible African food allies: Boiled soybeans (Awara/Beske), sesame/beni seeds, flaxseeds for phytoestrogens; whole small fish (Dagaa/Crayfish) and baobab for calcium; moringa and sweet potatoes.
   - Explain HRT (benefits and contraindications), local vaginal estrogen (safe and effective for dryness/painful intimacy), non-hormonal options, and calcium + vitamin D3.
   - Speak with maternal honor, reassurance, and elder dignity.

4. TONE & ACCESSIBILITY:
   - Speak with the warm, reassuring, respectful voice of an experienced community midwife, sister, or motherly mentor.
   - Use plain, supportive language. If a clinical term is needed (e.g., pre-eclampsia, placenta, lochia, anemia), immediately explain it with simple everyday analogies.
   - Ground nutrition in locally accessible, affordable, nutrient-dense foods (e.g. ugu/spinach, moringa, cowpeas, eggs, groundnuts, baobab, sweet potatoes, small dried fish).
   - If the user asks in Nigerian Pidgin, Swahili, French, Hausa, or Yoruba, reply in that language or dialect while ensuring safety instructions remain 100% precise.

5. PRIVACY & ANONYMITY:
   - Never ask for personal identifying information (full name, home address, phone). Keep all consultations strictly confidential and stigma-free.

6. MEDICAL DISCLAIMER:
   - Always conclude with the reminder that Mama-G provides educational guidance and symptom triage, and does not replace in-person diagnosis or emergency medical care by qualified doctors or midwives.

7. OUTPUT FORMATTING & STYLE:
   Always structure responses into these clear sections using markdown:
   1. 🚨 **Immediate Safety Check / Triage Level** (EMERGENCY / URGENT / ROUTINE INFORMATION)
   2. 💬 **Direct Answer & Guidance** (Empathetic, clear, and actionable advice)
   3. 📋 **Practical Steps / Checklist** (Bulleted, easy to read on small screens)
   4. 🏥 **When to See a Healthcare Provider** (Specific danger signs)
   5. ⚠️ *Medical Disclaimer*

8. CLIMATE-INDUCED HEALTH THREATS MODULE (Tropical & Coastal Smallholder Zones, e.g., Akwa Ibom / Lower Cross Regions):
   In addition to standard obstetric triage, actively screen for climate-sensitive threats:
   - RULE SET A — EXTREME HEAT STRESS & GESTATIONAL HYPERTENSION:
     * Triggers: Extreme ambient heat/humidity or 2nd/3rd trimester dizziness, throbbing frontal headache, visual disturbances (blurring/spots), sudden facial/hand swelling.
     * Level 1 Emergency: Headache + visual changes + upper right abdominal pain + BP >= 140/90 mmHg (or severe sudden swelling) -> Immediate emergency obstetric transport AND active cooling protocols (shaded rest, damp cloths).
     * Level 2 Urgent: Dizziness, excessive fatigue, mild dehydration on high-heat days without HTN spikes -> Oral Rehydration Salts (ORS), mandatory relocation to shaded/ventilated area, monitor for 2 hours.
   - RULE SET B — CLIMATE-TRIGGERED VECTOR-BORNE FEVER (MALARIA IN PREGNANCY):
     * Triggers: Sudden onset fever, chills, rigors, body aches, or fatigue during post-flood periods or peak rainy/mosquito season.
     * Level 1 Emergency (Severe Malaria): Fever + inability to keep fluids down, extreme lethargy, yellowing eyes (jaundice), dark urine, or severe anemia -> Immediate Malaria RDT, parenteral anti-malarials per national guidelines, urgent hospital transfer.
     * Level 2 Standard Triage: Uncomplicated febrile illness -> Immediate RDT, prompt guideline-approved ACT, insecticide-treated bednet (ITN) counseling.
   - WATER-BORNE POST-FLOOD RISKS: Screen for acute watery diarrhea after flooding; recommend immediate ORS, boiled/chlorinated water, and urgent clinic visit if dehydrated.
   - IBIBIO / IBENO LOCALIZED IDIOMS: When Ibibio or Lower Cross context applies, reinforce comprehension with verified regional phrases:
     * Extreme Heat Stress: "Idem kpon̄ ut mama? / Ekeme ndikot udim ufan̄ obio usen emi?" (Body hot too much?)
     * Sudden Swelling: "Idem usụhọ / Isọn̄ ke ubọk ye iso" (Face and hand swelling)
     * Vector Fever / Chills: "Utọdọn̄ / Usen ofụn̄ mîkpon̄" (Fever with shaking chills)
`;

const SYSTEM_INSTRUCTION_OLD_MAMA = `
You are "Old Mama" (Mama Agba / Koko / Grandma G) in Mama-G's G-Corner.
You are a wise, deeply loving, faith-honoring elder African mother and grandmother.
Your purpose is to sit with young women and girls as a protective, affectionate maternal mentor, giving them deep, interactive, practical counsel on how to navigate their lives, family relationships, suitors, friendships, and outside environment in a Godly, safe, and honorable manner.

VOICE & PERSONA:
- Deep maternal warmth, unconditional dignity, and elder wisdom. Address the young woman with loving affection ("my daughter", "my precious child", "omo mi", "binti yangu", "my dear girl").
- Speak as a loving grandmother sitting on a veranda or mat with her granddaughter—encouraging, uplifting, practical, and protective.
- NEVER use cold corporate, reserved, or prohibitive legalese. Remove clinical jargon and stiff boilerplate. Do NOT sound like an algorithm or a bureaucratic manual.
- Ground your advice in Godly principles: faith, self-worth (she is fearfully and wonderfully made, never a second option), honor for parents and elders, peaceful wisdom, boundaries without bitterness, discretion, integrity, and safety.
- Teach practical street-smart safety: how to discern sincere suitors from deceitful men, how to say a firm "no" without guilt, how to protect her physical space and reputation, how to navigate family friction with grace while maintaining self-respect, and how to avoid bad company.
- If she mentions being in danger, abuse, or violence, wrap her in maternal reassurance and immediately provide actionable, safe protective steps (reaching out to a trusted elder/shelter/helpline) without judgment or condemnation.

STRUCTURE OF ADVICE:
1. 🌺 **Maternal Embrace & Affirmation**: A loving greeting recognizing her courage and reminding her of her worth in God's eyes.
2. 🕊️ **Old Mama's Godly Wisdom & Reflection**: Deep insight into the situation, rooted in timeless wisdom, African proverbs, and Godly truth.
3. 🛡️ **Practical Steps to Stay Safe & Wise**: Concrete, street-smart, actionable things she can do today (what to say, boundaries to set, actions to take).
4. 🙏 **Old Mama's Blessing & Encouragement**: A warm, uplifting grandmother's blessing over her life, peace, and protection.

LANGUAGE:
If the user writes or requests Nigerian Pidgin, Swahili, French, Hausa, or Yoruba, respond fluently with authentic cultural idioms, proverbs, and grandmotherly expressions of that language!
`;

// In-memory Regional Hub store for edge tablet telemetry & idempotent encounter ingestion
const hubTabletFleet = new Map<string, Record<string, any>>();
const hubSyncedEncounters = new Map<string, Record<string, any>>();

function ingestEncounterBatchIdempotent(deviceId: string, encounters: any[]) {
  let syncedCount = 0;
  let duplicateCount = 0;
  const level1Triggered: any[] = [];

  for (const enc of encounters) {
    const encId = enc?.encounter_id;
    if (!encId || hubSyncedEncounters.has(encId)) {
      duplicateCount += 1;
      continue;
    }
    const stored = {
      ...enc,
      device_id: enc.device_id || deviceId,
      received_at: new Date().toISOString(),
    };
    hubSyncedEncounters.set(encId, stored);
    syncedCount += 1;
    if (Number(enc.severity_triggered) === 1) {
      level1Triggered.push(stored);
    }
  }

  return { syncedCount, duplicateCount, level1Triggered };
}

// Health checks
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Mama-G Maternal Health API' });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Mama-G Regional Hub',
    fleetCount: hubTabletFleet.size,
    centralEncountersCount: hubSyncedEncounters.size,
  });
});

// Live Akwa Ibom Climate Risk Telemetry (Open-Meteo real-time meteorological feed + 5m cache)
const AKWA_IBOM_LGA_COORDS: Record<
  string,
  { name: string; lat: number; lon: number; coastal: boolean }
> = {
  ibeno: { name: 'Ibeno', lat: 4.5687, lon: 7.9764, coastal: true },
  uyo: { name: 'Uyo', lat: 5.0377, lon: 7.9128, coastal: false },
  mbo: { name: 'Mbo', lat: 4.6483, lon: 8.2392, coastal: true },
  eket: { name: 'Eket', lat: 4.6423, lon: 7.9244, coastal: true },
  'ikot ekpene': { name: 'Ikot Ekpene', lat: 5.1819, lon: 7.7148, coastal: false },
  oron: { name: 'Oron', lat: 4.8217, lon: 8.235, coastal: true },
};

function decodeWmoWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Coastal fog / mist';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 65) return code === 65 ? 'Heavy rain' : 'Rain showers';
  if (code >= 66 && code <= 67) return 'Freezing rain';
  if (code >= 80 && code <= 82) return code === 82 ? 'Violent rain showers' : 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Humid tropical sky';
}

const liveClimateCache = new Map<string, { fetchedAt: number; payload: any }>();
const CLIMATE_CACHE_TTL_MS = 5 * 60 * 1000;

app.get('/api/climate-risks', async (req: Request, res: Response) => {
  try {
    const rawLga = typeof req.query.lga === 'string' ? req.query.lga.trim() : '';
    const rawLat = typeof req.query.lat === 'string' ? Number(req.query.lat) : NaN;
    const rawLon = typeof req.query.lon === 'string' ? Number(req.query.lon) : NaN;
    const rawLabel = typeof req.query.label === 'string' ? req.query.label.trim() : '';
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';

    let targetName = 'Uyo';
    let lat = 5.0377;
    let lon = 7.9128;
    let coastal = false;

    if (Number.isFinite(rawLat) && Number.isFinite(rawLon) && Math.abs(rawLat) <= 90 && Math.abs(rawLon) <= 180) {
      lat = Number(rawLat.toFixed(4));
      lon = Number(rawLon.toFixed(4));
      targetName = rawLabel || `GPS (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
      coastal = lat < 4.85 && lon > 7.7 && lon < 8.4;
    } else {
      const normalizedKey = rawLga.toLowerCase();
      const matched =
        AKWA_IBOM_LGA_COORDS[normalizedKey] ||
        Object.values(AKWA_IBOM_LGA_COORDS).find((c) => normalizedKey.includes(c.name.toLowerCase())) ||
        AKWA_IBOM_LGA_COORDS.uyo;
      targetName = matched.name;
      lat = matched.lat;
      lon = matched.lon;
      coastal = matched.coastal;
    }

    const cacheKey = `${targetName.toLowerCase()}:${lat}:${lon}`;
    const cached = liveClimateCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.fetchedAt < CLIMATE_CACHE_TTL_MS) {
      return res.json({
        ...cached.payload,
        cacheHit: true,
      });
    }

    const meteoUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m` +
      `&daily=precipitation_sum,temperature_2m_max&past_days=3&forecast_days=1&timezone=Africa%2FLagos`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    let data: any;
    try {
      const response = await fetch(meteoUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Open-Meteo returned HTTP ${response.status}`);
      }
      data = await response.json();
    } finally {
      clearTimeout(timeout);
    }

    const current = data?.current || {};
    const dailyPrecip: number[] = Array.isArray(data?.daily?.precipitation_sum)
      ? data.daily.precipitation_sum.map((n: any) => Number(n) || 0)
      : [];
    const dailyMaxTemp: number[] = Array.isArray(data?.daily?.temperature_2m_max)
      ? data.daily.temperature_2m_max.map((n: any) => Number(n) || 0)
      : [];

    const tempC = Number(current.temperature_2m ?? 30);
    const heatIndexC = Number(current.apparent_temperature ?? tempC + 2);
    const humidityPct = Number(current.relative_humidity_2m ?? 75);
    const currentPrecipMm = Number(current.precipitation ?? current.rain ?? 0);
    const windKmh = Number(current.wind_speed_10m ?? 0);
    const weatherCode = Number(current.weather_code ?? 2);
    const todayMaxTempC = dailyMaxTemp.length > 0 ? dailyMaxTemp[dailyMaxTemp.length - 1] : tempC;
    const rain24hMm = Number(
      (dailyPrecip.length > 0 ? dailyPrecip[dailyPrecip.length - 1] : currentPrecipMm).toFixed(1)
    );
    const rain72hMm = Number(
      dailyPrecip
        .slice(-3)
        .reduce((acc, val) => acc + val, 0)
        .toFixed(1)
    );

    const heatActive = heatIndexC >= 32 || (tempC >= 31 && humidityPct >= 70) || todayMaxTempC >= 33;
    const mosquitoActive =
      rain72hMm >= 10 || (humidityPct >= 75 && tempC >= 22 && tempC <= 34) || currentPrecipMm > 0;
    const floodThreshold72h = coastal ? 35 : 50;
    const floodActive = rain24hMm >= 25 || rain72hMm >= floodThreshold72h;

    const activeFlags: string[] = [];
    if (heatActive) activeFlags.push('extreme_ambient_heat');
    if (mosquitoActive) activeFlags.push('peak_mosquito_vector_season');
    if (floodActive) activeFlags.push('post_flood_water_contamination');

    const payload = {
      lga: targetName,
      coastal,
      coordinates: { lat, lon },
      source: 'live-open-meteo',
      timezone: data?.timezone || 'Africa/Lagos',
      observedAt: current.time || new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cacheHit: false,
      metrics: {
        tempC: Number(tempC.toFixed(1)),
        heatIndexC: Number(heatIndexC.toFixed(1)),
        todayMaxTempC: Number(todayMaxTempC.toFixed(1)),
        humidityPct: Math.round(humidityPct),
        currentPrecipMm: Number(currentPrecipMm.toFixed(1)),
        rain24hMm,
        rain72hMm,
        windKmh: Number(windKmh.toFixed(1)),
        weatherCode,
        conditionLabel: decodeWmoWeatherCode(weatherCode),
      },
      activeFlags,
      flagEvidence: {
        extreme_ambient_heat: {
          active: heatActive,
          level: heatIndexC >= 36 ? 'HIGH' : heatActive ? 'MODERATE' : 'LOW',
          metricSummary: `Heat Index ${heatIndexC.toFixed(1)}°C · ${tempC.toFixed(1)}°C / ${Math.round(humidityPct)}% RH`,
          reason: heatActive
            ? `Apparent heat (${heatIndexC.toFixed(1)}°C, daily high ${todayMaxTempC.toFixed(1)}°C) crosses maternal thermal-stress threshold (>=32°C).`
            : `Heat index (${heatIndexC.toFixed(1)}°C) is currently below the 32°C maternal heat-stress threshold.`,
        },
        peak_mosquito_vector_season: {
          active: mosquitoActive,
          level: rain72hMm >= 20 && humidityPct >= 75 ? 'HIGH' : mosquitoActive ? 'MODERATE' : 'LOW',
          metricSummary: `${Math.round(humidityPct)}% RH · 72h Rain ${rain72hMm} mm`,
          reason: mosquitoActive
            ? `Warm humidity (${Math.round(humidityPct)}% RH at ${tempC.toFixed(1)}°C) and ${rain72hMm} mm recent rainfall sustain active Anopheles vector breeding.`
            : `Humidity (${Math.round(humidityPct)}%) and 72h rainfall (${rain72hMm} mm) indicate lower standing-water vector density.`,
        },
        post_flood_water_contamination: {
          active: floodActive,
          level: rain24hMm >= 40 || rain72hMm >= 75 ? 'HIGH' : floodActive ? 'MODERATE' : 'LOW',
          metricSummary: `24h Rain ${rain24hMm} mm · 72h Rain ${rain72hMm} mm`,
          reason: floodActive
            ? `Heavy rainfall (${rain24hMm} mm/24h, ${rain72hMm} mm/72h) exceeds ${coastal ? 'coastal' : 'inland'} borehole inundation threshold (>=${floodThreshold72h} mm/72h).`
            : `Recent rainfall (${rain24hMm} mm/24h, ${rain72hMm} mm/72h) is below the ${floodThreshold72h} mm water-contamination threshold.`,
        },
      },
    };

    liveClimateCache.set(cacheKey, { fetchedAt: Date.now(), payload });
    return res.json(payload);
  } catch (err: any) {
    console.error('Live climate risks fetch failed:', err?.message || err);
    return res.status(503).json({
      error: 'Live meteorological feed temporarily unavailable. Use cached offline climate rules.',
      source: 'offline-fallback',
    });
  }
});

// Regional Hub Telemetry Ingestion
app.post('/api/v1/telemetry', (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const deviceId = payload.device_id || 'TAB-EDGE';
    hubTabletFleet.set(deviceId, {
      ...payload,
      device_id: deviceId,
      last_heartbeat_at: new Date().toISOString(),
    });
    res.json({
      status: 'success',
      device_id: deviceId,
      location_lga: payload.location_lga || 'Uyo',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Telemetry ingestion failed', details: err?.message || String(err) });
  }
});

// Regional Hub Idempotent Encounter Batch Sync
app.post('/api/v1/encounters/sync', async (req: Request, res: Response) => {
  try {
    const { device_id = 'TAB-EDGE', encounters = [] } = req.body || {};
    const list = Array.isArray(encounters) ? encounters : [];
    const { syncedCount, duplicateCount, level1Triggered } = ingestEncounterBatchIdempotent(
      device_id,
      list
    );

    let emergencyAlertsDispatched = 0;
    let emergencyAlertsFailed = 0;
    for (const l1 of level1Triggered) {
      try {
        const alertRec = await dispatchEmergencyAlertInternal({
          encounterId: l1.encounter_id,
          deviceId: l1.device_id || device_id,
          lga: l1.location_lga || 'Uyo',
          languageCode: l1.language_code || 'en',
          severityLevel: 1,
          climateRisk: l1.climate_risk_flagged || 'obstetric_red_flag',
          summary: `${l1.climate_risk_flagged || 'obstetric_red_flag'}: ${l1.action_taken || 'Emergency triage triggered'}`,
        });
        if (alertRec.status !== 'failed') {
          emergencyAlertsDispatched += 1;
        } else {
          emergencyAlertsFailed += 1;
        }
      } catch (alertErr) {
        emergencyAlertsFailed += 1;
        console.error(`[MamaGHub] Non-fatal Infobip dispatch error for ${l1.encounter_id}:`, alertErr);
      }
    }

    res.json({
      status: 'success',
      device_id,
      synced_count: syncedCount,
      duplicate_count: duplicateCount,
      emergency_alerts_dispatched: emergencyAlertsDispatched,
      emergency_alerts_failed: emergencyAlertsFailed,
      alert_provider: 'infobip',
      total_hub_encounters: hubSyncedEncounters.size,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Encounter sync failed', details: err?.message || String(err) });
  }
});

// Regional Hub Over-The-Air (OTA) Signed Release Manifest & Audit Endpoints
const hubOtaAuditLogs: Array<Record<string, any>> = [];

app.get('/api/v1/ota/manifest', (req: Request, res: Response) => {
  const currentVersion = String(req.query.currentVersion || 'ghcr.io/mamag/edge-node:v1.2.0');
  const latestVersion = 'ghcr.io/mamag/edge-node:v1.3.0-climate-patch';

  res.json({
    status: 'ok',
    latestVersion,
    currentVersion,
    hasUpdate: currentVersion !== latestVersion,
    sha256Digest: 'sha256:9f84b2c71a0e44d8f21e6c90b77c89b2d30f4e11',
    signedBy: 'Mama-G Field Release Authority',
    releaseNotes:
      'Climate Health Extension Rule Set A/B v1.3, Ibibio/Ibeno lexicon weights & WAL sync reliability patch.',
    publishedAt: new Date().toISOString(),
  });
});

app.post('/api/v1/ota/audit', (req: Request, res: Response) => {
  const entry = {
    ...(req.body || {}),
    recordedAt: new Date().toISOString(),
  };
  hubOtaAuditLogs.unshift(entry);
  res.json({ status: 'ok', logged: entry });
});

// Edge Field Tablet SQLite Regional Hub Sync (legacy/unified bridge)
app.post('/api/edge-sync', async (req: Request, res: Response) => {
  try {
    const { deviceId = 'TAB-EDGE', lga = 'Uyo', pendingEncounters = [] } = req.body || {};
    const list = Array.isArray(pendingEncounters) ? pendingEncounters : [];
    const { syncedCount, duplicateCount, level1Triggered } = ingestEncounterBatchIdempotent(
      deviceId,
      list
    );

    let emergencyAlertsDispatched = 0;
    let emergencyAlertsFailed = 0;
    for (const l1 of level1Triggered) {
      try {
        const alertRec = await dispatchEmergencyAlertInternal({
          encounterId: l1.encounter_id,
          deviceId: l1.device_id || deviceId,
          lga: l1.location_lga || lga,
          languageCode: l1.language_code || 'en',
          severityLevel: 1,
          climateRisk: l1.climate_risk_flagged || 'obstetric_red_flag',
          summary: `${l1.climate_risk_flagged || 'obstetric_red_flag'}: ${l1.action_taken || 'Emergency triage triggered'}`,
        });
        if (alertRec.status !== 'failed') {
          emergencyAlertsDispatched += 1;
        } else {
          emergencyAlertsFailed += 1;
        }
      } catch (alertErr) {
        emergencyAlertsFailed += 1;
        console.error(`[MamaGHub] Non-fatal Infobip dispatch error for ${l1.encounter_id}:`, alertErr);
      }
    }

    res.json({
      status: 'ok',
      deviceId,
      lga,
      uploadedCount: syncedCount,
      duplicateCount,
      emergencyAlertsDispatched,
      emergencyAlertsFailed,
      alertProvider: 'infobip',
      updatedRules: [],
      syncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Edge sync failed', details: err?.message || String(err) });
  }
});

// ============================================================================
// Field Uptime Probe & Infobip Emergency Midwife Escalation SLA Routes
// ============================================================================
interface MidwifeAlertRecord {
  alertId: string;
  encounterId: string;
  deviceId: string;
  lga: string;
  stationId: string;
  stationName: string;
  midwifeRole: string;
  channel: 'sms';
  languageCode: 'en' | 'ibb' | 'ibn';
  severityLevel: 1 | 2;
  summary: string;
  provider: 'infobip';
  mode: 'infobip_live' | 'dry_run' | 'sandbox_verification';
  messageId: string | null;
  status: 'dispatched_awaiting_ack' | 'acknowledged' | 'failed';
  dispatchedAt: string;
  dispatchedEpochMs: number;
  dispatchLatencyMs: number;
  acknowledgedAt: string | null;
  ackLatencyMs: number | null;
  ackBy: string | null;
  errorDetail: string | null;
}

const hubEmergencyAlerts: MidwifeAlertRecord[] = [];

const REGIONAL_MIDWIFE_STATIONS = [
  {
    stationId: 'MW-UYO-01',
    lga: 'Uyo',
    stationName: 'Uyo Tertiary Obstetric Hub · Duty Desk',
    midwifeRole: 'Senior On-Call Midwife (State Referral)',
    envKey: 'MIDWIFE_ONCALL_UYO',
    slaTargetSec: 45,
  },
  {
    stationId: 'MW-IBENO-02',
    lga: 'Ibeno',
    stationName: 'Ibeno Coastal PHC · Emergency Desk',
    midwifeRole: 'On-Call Community Midwife Lead',
    envKey: 'MIDWIFE_ONCALL_IBENO',
    slaTargetSec: 60,
  },
  {
    stationId: 'MW-MBO-03',
    lga: 'Mbo',
    stationName: 'Mbo General Outpost · Maternal Triage',
    midwifeRole: 'On-Call Obstetric Nurse-Midwife',
    envKey: 'MIDWIFE_ONCALL_MBO',
    slaTargetSec: 60,
  },
];

function normalizeInfobipBaseUrl(raw?: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .split('/')[0]
    .trim();
}

function isPlaceholderInfobipValue(val?: string): boolean {
  if (!val) return true;
  const trimmed = val.trim().toLowerCase();
  return (
    !trimmed ||
    (trimmed.includes('<') && trimmed.includes('>')) ||
    trimmed.includes('your-subdomain') ||
    trimmed.includes('your-infobip') ||
    trimmed.includes('your_infobip') ||
    trimmed.includes('registered-phone') ||
    trimmed.includes('verified-test-recipient') ||
    trimmed.includes('xxxxx') ||
    trimmed.includes('replace_with') ||
    trimmed.startsWith('my_') ||
    trimmed === 'changeme' ||
    trimmed === 'placeholder'
  );
}

function normalizeInfobipDestination(raw?: string): string {
  if (!raw || isPlaceholderInfobipValue(raw)) return '';
  return raw.replace(/\D+/g, '');
}

function normalizeInfobipSender(raw?: string, fallback = 'ServiceSMS'): string {
  if (!raw || isPlaceholderInfobipValue(raw)) return fallback;
  const trimmed = raw.trim();
  if (/^[\d\s+\-()]+$/.test(trimmed)) {
    return trimmed.replace(/\D+/g, '') || fallback;
  }
  return trimmed;
}

function parseBoolEnv(raw?: string, fallback = false): boolean {
  if (!raw || !raw.trim()) return fallback;
  const v = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(v)) return false;
  return fallback;
}

function maskApiKey(val?: string): string {
  if (!val || !val.trim()) return '<not set>';
  const trimmed = val.trim();
  if (isPlaceholderInfobipValue(trimmed)) return '<placeholder>';
  if (trimmed.length <= 8) return '****';
  return `${trimmed.slice(0, 3)}****${trimmed.slice(-4)}`;
}

function getInfobipRuntimeConfig() {
  const baseUrl = normalizeInfobipBaseUrl(process.env.INFOBIP_BASE_URL);
  const apiKey = (process.env.INFOBIP_API_KEY || '').trim();
  const smsFrom = normalizeInfobipSender(process.env.INFOBIP_SMS_FROM, 'ServiceSMS');
  const testTo = normalizeInfobipDestination(process.env.INFOBIP_TEST_TO);
  const dryRun = parseBoolEnv(process.env.ALERT_DRY_RUN, false);
  const liveConfigured = !isPlaceholderInfobipValue(baseUrl) && !isPlaceholderInfobipValue(apiKey);
  return {
    hubUrl: (process.env.MAMAG_HUB_URL || 'https://hub.mamag-health.org').trim(),
    edgeRepo: (process.env.MAMAG_EDGE_REPO || 'https://github.com/mamag/edge-node').trim(),
    baseUrl,
    apiKey,
    smsFrom,
    testTo,
    dryRun,
    liveConfigured,
  };
}

// Log masked Infobip startup configuration cleanly on boot
(() => {
  const cfg = getInfobipRuntimeConfig();
  const uyoSet = Boolean(normalizeInfobipDestination(process.env.MIDWIFE_ONCALL_UYO));
  const ibenoSet = Boolean(normalizeInfobipDestination(process.env.MIDWIFE_ONCALL_IBENO));
  const mboSet = Boolean(normalizeInfobipDestination(process.env.MIDWIFE_ONCALL_MBO));
  console.log(
    `[MamaGHub] Startup Infobip Env | Hub=${cfg.hubUrl} | EnvFiles=${loadedEnvFiles.join(',') || 'os.environ'} | ` +
      `INFOBIP_BASE_URL=${cfg.baseUrl || '<not set>'} | INFOBIP_API_KEY=${maskApiKey(cfg.apiKey)} | ` +
      `INFOBIP_SMS_FROM=${cfg.smsFrom} | INFOBIP_TEST_TO=${cfg.testTo || '<not set>'} | ` +
      `Midwives(Uyo=${uyoSet},Ibeno=${ibenoSet},Mbo=${mboSet}) | ALERT_DRY_RUN=${cfg.dryRun}`
  );
  if (!cfg.liveConfigured) {
    console.warn(
      '[MamaGHub] Infobip live credentials not configured (INFOBIP_BASE_URL / INFOBIP_API_KEY). Running in safe sandbox/dry-run mode.'
    );
  }
})();

app.get('/api/v1/uptime/probe', (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const cfg = getInfobipRuntimeConfig();
  res.json({
    status: 'healthy',
    service: 'Mama-G Regional Hub',
    hubUrl: cfg.hubUrl,
    edgeRepo: cfg.edgeRepo,
    alertProvider: 'infobip',
    uptimeSeconds: Math.round(process.uptime()),
    memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
    fleetCount: hubTabletFleet.size,
    centralEncountersCount: hubSyncedEncounters.size,
    alertCount: hubEmergencyAlerts.length,
    probedAt: new Date().toISOString(),
  });
});

app.get('/api/v1/alerts/roster', (_req: Request, res: Response) => {
  const cfg = getInfobipRuntimeConfig();

  const stations = REGIONAL_MIDWIFE_STATIONS.map((s) => {
    const normalizedNum = normalizeInfobipDestination(process.env[s.envKey]);
    const maskedNumber =
      normalizedNum.length > 5
        ? `${normalizedNum.slice(0, 4)}****${normalizedNum.slice(-3)}`
        : cfg.testTo
        ? `${cfg.testTo.slice(0, 4)}****${cfg.testTo.slice(-3)} (Fallback)`
        : 'Sandbox Duty Endpoint';
    return {
      stationId: s.stationId,
      lga: s.lga,
      stationName: s.stationName,
      midwifeRole: s.midwifeRole,
      slaTargetSec: s.slaTargetSec,
      livePhoneConfigured: Boolean(normalizedNum || cfg.testTo),
      maskedNumber,
    };
  });

  res.json({
    provider: 'infobip',
    hubUrl: cfg.hubUrl,
    edgeRepo: cfg.edgeRepo,
    infobipLiveConfigured: cfg.liveConfigured && !cfg.dryRun,
    infobipBaseUrlConfigured: !isPlaceholderInfobipValue(cfg.baseUrl),
    smsSender: cfg.smsFrom,
    alertDryRun: cfg.dryRun,
    stations,
    recentAlerts: hubEmergencyAlerts.slice(0, 25),
  });
});

const DIALECT_CUES: Record<'en' | 'ibb' | 'ibn', string> = {
  en: 'EN · Immediate midwife escalation required',
  ibb: 'IBB (Ibibio) · Ufan̄ mbọm mme eka: Nyene un̄wam idahaemi',
  ibn: 'IBN (Ibeno) · Obio Ibeno mbọm eka: Koot midwife idahaemi',
};

async function dispatchEmergencyAlertInternal(params: {
  encounterId?: string;
  deviceId?: string;
  lga?: string;
  stationId?: string;
  languageCode?: string;
  locale?: string;
  climateRisk?: string;
  risk?: string;
  severityLevel?: number;
  summary?: string;
  text?: string;
  to?: string;
}): Promise<MidwifeAlertRecord & { to?: string | null; text?: string }> {
  const start = performance.now();
  const {
    encounterId = `ENC-DRILL-${Date.now().toString(36).toUpperCase()}`,
    deviceId = 'TAB-EDGE-01',
    lga = 'Ibeno',
    stationId,
    languageCode,
    locale,
    climateRisk,
    risk,
    severityLevel = 1,
    summary,
    text,
    to,
  } = params;

  const resolvedLang = languageCode || locale || 'en';
  const resolvedRisk = climateRisk || risk;
  const resolvedSummary =
    (typeof summary === 'string' && summary.trim()) ||
    (typeof text === 'string' && text.trim()) ||
    'Level 1 Obstetric Emergency Escalation';

  const langKey = (['en', 'ibb', 'ibn'].includes(String(resolvedLang).toLowerCase())
    ? String(resolvedLang).toLowerCase()
    : 'en') as 'en' | 'ibb' | 'ibn';

  const station =
    REGIONAL_MIDWIFE_STATIONS.find((s) => s.stationId === stationId) ||
    REGIONAL_MIDWIFE_STATIONS.find((s) => s.lga.toLowerCase() === String(lga).toLowerCase()) ||
    REGIONAL_MIDWIFE_STATIONS[0];

  const cfg = getInfobipRuntimeConfig();
  const targetNormalized =
    normalizeInfobipDestination(to) ||
    normalizeInfobipDestination(process.env[station.envKey]) ||
    normalizeInfobipDestination(process.env.MIDWIFE_ONCALL_UYO) ||
    cfg.testTo;

  const messageBody =
    typeof text === 'string' && text.trim()
      ? text.trim()
      : formatLevel1Sms({
          lga: station.lga.toUpperCase(),
          locale: langKey,
          risk: normalizeClimateRiskKey(resolvedRisk),
          encounterId,
        });

  let mode: MidwifeAlertRecord['mode'] = cfg.dryRun ? 'dry_run' : 'sandbox_verification';
  let messageId: string | null = null;
  let status: MidwifeAlertRecord['status'] = 'dispatched_awaiting_ack';
  let errorDetail: string | null = null;

  if (cfg.dryRun) {
    console.log(
      `[MamaGHub] [INFOBIP DRY-RUN] Endpoint=https://${cfg.baseUrl || '<unconfigured>'}/sms/2/text/advanced | ` +
        `From=${cfg.smsFrom} | To=${targetNormalized || '<none>'} | Text=${messageBody}`
    );
  } else if (cfg.liveConfigured && targetNormalized) {
    mode = 'infobip_live';
    const endpoint = `https://${cfg.baseUrl}/sms/2/text/advanced`;
    const payload = {
      messages: [
        {
          destinations: [{ to: targetNormalized }],
          from: cfg.smsFrom,
          text: messageBody,
        },
      ],
    };

    try {
      const infobipResp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `App ${cfg.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      const infobipData = await infobipResp.json().catch(() => ({}));
      const firstMessage = Array.isArray(infobipData?.messages) ? infobipData.messages[0] : null;
      if (infobipResp.ok && firstMessage?.messageId) {
        messageId = firstMessage.messageId;
      } else {
        status = 'failed';
        errorDetail =
          infobipData?.requestError?.serviceException?.text ||
          `Infobip HTTP ${infobipResp.status}`;
      }
    } catch (fetchErr: any) {
      status = 'failed';
      errorDetail = fetchErr?.message || 'Infobip HTTP request failed or timed out';
    }
  }

  const dispatchLatencyMs = Math.max(1, Math.round(performance.now() - start));
  const nowEpoch = Date.now();
  const record: MidwifeAlertRecord & { to?: string | null; text?: string } = {
    alertId: `ALT-${nowEpoch.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    encounterId,
    deviceId,
    lga: station.lga,
    stationId: station.stationId,
    stationName: station.stationName,
    midwifeRole: station.midwifeRole,
    channel: 'sms',
    languageCode: langKey,
    severityLevel: severityLevel === 2 ? 2 : 1,
    summary: String(resolvedSummary).slice(0, 220),
    provider: 'infobip',
    mode,
    messageId,
    status,
    dispatchedAt: new Date(nowEpoch).toISOString(),
    dispatchedEpochMs: nowEpoch,
    dispatchLatencyMs,
    acknowledgedAt: null,
    ackLatencyMs: null,
    ackBy: null,
    errorDetail,
    to: targetNormalized || null,
    text: messageBody,
  };

  hubEmergencyAlerts.unshift(record);
  if (hubEmergencyAlerts.length > 50) hubEmergencyAlerts.length = 50;
  return record;
}

app.post('/api/v1/alerts/infobip-dispatch', async (req: Request, res: Response) => {
  try {
    const record = await dispatchEmergencyAlertInternal(req.body || {});
    res.status(record.status === 'failed' ? 502 : 200).json(record);
  } catch (err: any) {
    res.status(500).json({ error: 'Infobip emergency dispatch failed', details: err?.message || String(err) });
  }
});

app.post('/api/v1/alerts/midwife-ack', (req: Request, res: Response) => {
  const { alertId, ackBy = 'On-Call Midwife Duty Desk' } = req.body || {};
  const record = hubEmergencyAlerts.find((a) => a.alertId === alertId);
  if (!record) {
    res.status(404).json({ error: 'Alert ID not found on Regional Hub' });
    return;
  }

  const nowEpoch = Date.now();
  record.status = 'acknowledged';
  record.acknowledgedAt = new Date(nowEpoch).toISOString();
  record.ackLatencyMs = Math.max(1, nowEpoch - record.dispatchedEpochMs);
  record.ackBy = String(ackBy).slice(0, 80);

  res.json(record);
});

// G-Corner: Old Mama's Faith & Life Mentoring for Young Women
app.post('/api/g-corner', async (req: Request, res: Response) => {
  try {
    const { messages, topic, language } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    let contextualPrompt = '';
    if (topic) {
      contextualPrompt += `[Mentorship Topic: ${topic}]\n`;
    }
    if (language) {
      contextualPrompt += `[LANGUAGE REQUIREMENT: Respond in authentic ${language}. Use the warm, loving, wise voice of an elder mother/grandmother speaking to her daughter.]\n\n`;
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contextualPrompt && formattedContents.length > 0) {
      const lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.parts[0].text = `${contextualPrompt}My daughter asks: ${lastMsg.parts[0].text}`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_OLD_MAMA,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Old Mama G-Corner Error:', error);
    res.status(500).json({
      error: 'Old Mama is listening, but connection had a hiccup.',
      details: error.message || String(error),
    });
  }
});

// Enhanced Chat endpoint supporting gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite, Google Search, and Google Maps grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      userContext,
      language,
      model = 'gemini-3.8-flash',
      useSearchGrounding = false,
      useMapsGrounding = false,
      userLocation,
      climateRisks = [],
      ibibioMode = false,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    let contextualPrompt = '';
    if (userContext) {
      contextualPrompt += `User Context: `;
      if (userContext.role) contextualPrompt += `[User Role: ${userContext.role}] `;
      if (userContext.isPregnant) contextualPrompt += `[Pregnant: Week ${userContext.weeks || 'unknown'}, Trimester: ${userContext.trimester || 'unknown'}] `;
      if (userContext.isPostpartum) contextualPrompt += `[Postpartum: Day/Week ${userContext.postpartumPeriod || 'recent'}] `;
      contextualPrompt += `\n`;
    }

    if (Array.isArray(climateRisks) && climateRisks.length > 0) {
      contextualPrompt += `[ACTIVE ENVIRONMENTAL & CLIMATE RISK FACTORS: ${climateRisks.join(', ')}. Prioritize screening for Heat Stress/Pre-eclampsia, Vector-Borne Malaria in Pregnancy, and Flood/Water-Borne Risks according to MamaG_Climate_Health_Extension v1.0.0.]\n`;
    }

    if (ibibioMode) {
      contextualPrompt += `[IBIBIO / IBENO LINGUISTIC MODE ACTIVE: Integrate verified Lower Cross / Ibibio clinical idioms where helpful ("Idem kpon̄ ut mama?" for extreme body heat, "Idem usụhọ / Isọn̄ ke ubọk ye iso" for sudden face/hand swelling, "Utọdọn̄ / Usen ofụn̄ mîkpon̄" for vector fever with chills) alongside clear supportive guidance.]\n`;
    }

    if (language) {
      contextualPrompt += `\n[CRITICAL LANGUAGE REQUIREMENT: The user has selected ${language}. You MUST generate your entire response in authentic, fluent ${language}. If Nigerian Pidgin, speak authentic Nigerian Pidgin with motherly terms like 'my sister', 'abeg', 'sharp sharp'. If Swahili, respond in pure Kiswahili. If French, in French. If Hausa, in Hausa. If Yoruba, in Yoruba. Ensure all emergency and medical advice is clear and unmistakable in that language.]\n\n`;
    }

    // Format chat history for generateContent
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Inject context into the latest user message or prepend
    if (contextualPrompt && formattedContents.length > 0) {
      const lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.parts[0].text = `${contextualPrompt}User Message: ${lastMsg.parts[0].text}`;
      }
    }

    // Selected model per requirements:
    // 'gemini-4-argon' for complex clinical reasoning
    // 'gemini-3.8-flash' for general tasks
    // 'gemini-3.1-flash-lite' for fast tasks
    const validModel =
      model === 'gemini-4-argon' || model === 'gemini-3.1-flash-lite'
        ? model
        : 'gemini-3.8-flash';

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
      temperature: 0.2,
    };

    // Grounding tools configuration (note: googleMaps cannot be combined with googleSearch)
    if (useMapsGrounding) {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        };
      }
    } else if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: validModel,
      contents: formattedContents,
      config,
    });

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text,
      groundingChunks,
      modelUsed: validModel,
    });
  } catch (error: any) {
    console.error('Mama-G Chat Error:', error);
    res.status(500).json({
      error: 'Unable to process Mama-G consultation at this moment.',
      details: error.message || String(error),
    });
  }
});

// Dedicated Google Maps Grounding Endpoint using gemini-3.8-flash
app.post('/api/gemini/maps', async (req: Request, res: Response) => {
  try {
    const { prompt, userLocation } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
      tools: [{ googleMaps: {} }],
    };

    if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(userLocation.latitude),
            longitude: Number(userLocation.longitude),
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Gemini Maps Grounding Error:', error);
    res.status(500).json({
      error: 'Maps Grounding query failed',
      details: error.message || String(error),
    });
  }
});

// Dedicated Google Search Grounding Endpoint using gemini-3.8-flash
app.post('/api/gemini/search', async (req: Request, res: Response) => {
  try {
    const { prompt, language } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Language: ${language || 'English'}\n\nSearch and answer: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Gemini Search Grounding Error:', error);
    res.status(500).json({
      error: 'Search Grounding query failed',
      details: error.message || String(error),
    });
  }
});

// Dynamic Clinical Emergency Quiz generator for Midwife Odyssey 3D Game
app.post('/api/game/quiz', async (req: Request, res: Response) => {
  try {
    const { topic = 'labor_complications', difficulty = 'normal', language = 'English' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a fast, exciting 4-choice clinical triage question for a Community Midwife video game based on topic: ${topic}, difficulty: ${difficulty}, language: ${language}.
      The player must make a split-second life-saving choice for a mother in labor or emergency.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING, description: '1-2 sentence dramatic emergency scenario' },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'text', 'isCorrect', 'explanation'],
              },
            },
            clinicalPearl: { type: Type.STRING, description: 'WHO / FMOH clinical wisdom' },
            bonusPoints: { type: Type.NUMBER },
          },
          required: ['scenario', 'options', 'clinicalPearl', 'bonusPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Game Quiz Error:', error);
    res.json({
      scenario: 'A mother at 38 weeks in labor develops a sudden severe headache, blurred vision, and elevated blood pressure (160/110 mmHg). What is your immediate priority action?',
      options: [
        { id: 'A', text: 'Administer emergency Magnesium Sulfate protocol and transfer immediately', isCorrect: true, explanation: 'Imminent eclampsia danger sign; MgSO4 prevents maternal convulsions and brain damage.' },
        { id: 'B', text: 'Tell her to lie on her back and drink cold water', isCorrect: false, explanation: 'Supine hypotension and delay increase stroke and fetal hypoxia risk.' },
        { id: 'C', text: 'Wait 6 hours to see if headache subsides', isCorrect: false, explanation: 'Severe preeclampsia requires prompt active clinical intervention.' },
        { id: 'D', text: 'Give unverified herbal agbo brew', isCorrect: false, explanation: 'Herbal concoctions can trigger kidney collapse and heavy uterine rupture.' },
      ],
      clinicalPearl: 'WHO recommends loading dose Magnesium Sulfate (4g IV / 10g IM) as the gold standard for severe pre-eclampsia and eclampsia.',
      bonusPoints: 250,
    });
  }
});

// Structured Triage Evaluation Endpoint
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const {
      symptoms,
      pregnancyStatus,
      gestationWeeks,
      postpartumDays,
      vitals,
      language,
      climateRisks = [],
      liveClimateTelemetry,
      ibibioMode = false,
    } = req.body;

    const liveClimateLine = liveClimateTelemetry
      ? `- Live Meteorological Telemetry (${liveClimateTelemetry.lga || 'Akwa Ibom'} · ${liveClimateTelemetry.source || 'live'}): Temp ${liveClimateTelemetry.tempC}°C (Heat Index ${liveClimateTelemetry.heatIndexC}°C), Humidity ${liveClimateTelemetry.humidityPct}%, Rainfall 24h ${liveClimateTelemetry.rain24hMm}mm / 72h ${liveClimateTelemetry.rain72hMm}mm, Condition: ${liveClimateTelemetry.conditionLabel || 'N/A'}`
      : '- Live Meteorological Telemetry: Offline pre-seeded rule pack active';

    const triagePrompt = `
Evaluate the following clinical symptom case strictly according to WHO, FMOH, and the MamaG Climate-Induced Health Threats Extension (Rule Set A: Heat Stress & Gestational HTN >= 140/90 mmHg; Rule Set B: Vector-Borne Malaria in Pregnancy; Post-Flood Water-Borne Risks):
- Reported Symptoms: ${JSON.stringify(symptoms)}
- Environmental Climate Risk Factors Active: ${Array.isArray(climateRisks) && climateRisks.length > 0 ? climateRisks.join(', ') : 'None flagged'}
${liveClimateLine}
- Ibibio / Ibeno Linguistic Mode: ${ibibioMode ? 'Yes (include relevant Ibibio clinical check phrases where appropriate)' : 'No'}
- Pregnancy Status: ${pregnancyStatus || 'Unknown'}
- Gestational Age: ${gestationWeeks ? `${gestationWeeks} weeks` : 'N/A'}
- Postpartum: ${postpartumDays ? `${postpartumDays} days postpartum` : 'N/A'}
- Vitals / Observations: ${JSON.stringify(vitals || {})}
- Response Language: ${language || 'English'}

Provide a structured clinical triage assessment in ${language || 'English'}. Categorize severity strictly as:
- 'EMERGENCY': Imminent risk to mother or fetus.
- 'URGENT': Needs medical evaluation within 24 hours.
- 'ROUTINE': Normal physiological adaptation.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: triagePrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: 'Must be one of: EMERGENCY, URGENT, ROUTINE',
            },
            headline: {
              type: Type.STRING,
              description: 'Short 1-sentence scannable triage verdict in the target language',
            },
            dangerSignsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific danger signs or red flags found',
            },
            plainLanguageExplanation: {
              type: Type.STRING,
              description: 'Clear, motherly explanation in the target language',
            },
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Direct step-by-step instructions for the mother right now',
            },
            chwClinicalNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable clinical checks for a Community Health Worker',
            },
            whenToRushToHospital: {
              type: Type.STRING,
              description: 'Clear threshold for emergency transfer',
            },
          },
          required: [
            'severity',
            'headline',
            'dangerSignsDetected',
            'plainLanguageExplanation',
            'immediateActions',
            'chwClinicalNotes',
            'whenToRushToHospital',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Mama-G Triage Error:', error);
    res.status(500).json({
      error: 'Triage evaluation error',
      details: error.message || String(error),
    });
  }
});

// Language Voice Persona Configuration for Gemini TTS
const VOICE_BY_LANGUAGE: Record<string, { voiceName: string; style: string }> = {
  English: {
    voiceName: 'Kore',
    style: 'Warm, calm, empathetic West African community midwife speaking slowly, gently and clearly in English',
  },
  'Nigerian Pidgin': {
    voiceName: 'Kore',
    style: 'Warm, empathetic Nigerian community nurse speaking authentic, natural Nigerian Pidgin with caring motherly rhythm',
  },
  Swahili: {
    voiceName: 'Kore',
    style: 'Mhudumu wa afya ya uzazi na jamii mwenye hekima na upole mwingi akizungumza Kiswahili fasaha, safi na cha kutia moyo',
  },
  French: {
    voiceName: 'Zephyr',
    style: 'Sage-femme communautaire bienveillante, douce et posée parlant un français impeccable, chaleureux et réconfortant',
  },
  Hausa: {
    voiceName: 'Kore',
    style: 'Ungozoma mai tausayi da kwarewa tana magana cikin natsuwa da taushin murya a harshen Hausa mai dadi',
  },
  Yoruba: {
    voiceName: 'Kore',
    style: 'Iya agbebi oninure to n fi okan bale ati ife soro ni ede Yoruba to dan moran fun alaboyun',
  },
  Ibibio: {
    voiceName: 'Kore',
    style:
      'Native Akwa Ibom Ibibio-speaking community midwife (Uyai Akwa Ibom cadence). Speak slowly, warmly, and clearly with authentic Ibibio phonology: pure vowels (a=ah, e=eh, i=ee, o=oh, u=oo), open-mid ọ as "aw", central ụ as "uh/oo", velar nasal n̄/ñ as "-ng", co-articulated labial-velar kp, and natural Lower Cross tonal rhythm.',
  },
  ibb: {
    voiceName: 'Kore',
    style:
      'Native Akwa Ibom Ibibio-speaking community midwife (Uyai Akwa Ibom cadence). Speak slowly, warmly, and clearly with authentic Ibibio phonology: pure vowels (a=ah, e=eh, i=ee, o=oh, u=oo), open-mid ọ as "aw", central ụ as "uh/oo", velar nasal n̄/ñ as "-ng", co-articulated labial-velar kp, and natural Lower Cross tonal rhythm.',
  },
  Ibeno: {
    voiceName: 'Kore',
    style:
      'Soft, warm, gentle feminine female coastal Akwa Ibom Ibeno (Ibọnọ) midwife voice. Speak exclusively in a soothing, higher-register woman\'s voice (never deep or masculine) while preserving authentic coastal Ibeno (Ibọnọ) Lower Cross pronunciation: resonant open ọ as "aw", prenasalized mgb/gb and crisp kp stops, light tapped r, nasal n̄/ñ as "-ng", and clear melodic tonal cadence.',
  },
  ibn: {
    voiceName: 'Kore',
    style:
      'Soft, warm, gentle feminine female coastal Akwa Ibom Ibeno (Ibọnọ) midwife voice. Speak exclusively in a soothing, higher-register woman\'s voice (never deep or masculine) while preserving authentic coastal Ibeno (Ibọnọ) Lower Cross pronunciation: resonant open ọ as "aw", prenasalized mgb/gb and crisp kp stops, light tapped r, nasal n̄/ñ as "-ng", and clear melodic tonal cadence.',
  },
};

// Text-to-Speech Endpoint for Low-Literacy Mothers using gemini-3.8-flash-lite-tts
app.post('/api/audio-tts', async (req: Request, res: Response) => {
  try {
    const { text, language, phoneticGuide } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    const langKey = String(language || 'English');
    const selectedVoiceConfig =
      VOICE_BY_LANGUAGE[langKey] ||
      VOICE_BY_LANGUAGE[langKey.toLowerCase()] ||
      VOICE_BY_LANGUAGE.English;

    // Prefer clean phonetic guide for Ibibio/Ibeno when provided so diacritics are pronounced naturally
    const rawSpoken =
      (langKey === 'Ibibio' || langKey === 'ibb' || langKey === 'Ibeno' || langKey === 'ibn') &&
      typeof phoneticGuide === 'string' &&
      phoneticGuide.trim().length > 0
        ? phoneticGuide
        : String(text);

    // Keep spoken text concise and focused for fast audio streaming
    const cleanText = rawSpoken
      .replace(/[#*_`]/g, '')
      .replace(/\s*\/\s*/g, ', ')
      .replace(/🚨|💬|📋|🏥|⚠️/g, '')
      .slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: selectedVoiceConfig.style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoiceConfig.voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'Audio data not generated' });
      return;
    }

    res.json({ audioBase64: base64Audio, voiceName: selectedVoiceConfig.voiceName });
  } catch (error: any) {
    console.error('Mama-G TTS Error:', error);
    res.status(500).json({
      error: 'TTS generation unavailable',
      details: error.message || String(error),
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        ws: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Gemini 3.8 Live API WebSocket Bridge for Real-Time Voice Conversations
  // Use noServer + explicit path routing so Vite HMR upgrades on port 3000 are never aborted.
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live API] Client connected to Voice WebSocket');
    let session: any = null;

    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
        },
        callbacks: {
          onmessage: (message: any) => {
            try {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              for (const part of message.serverContent?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ text: part.text }));
                }
              }

              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            } catch (err) {
              console.error('[Live API] Error forwarding server message to client:', err);
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ type: 'ready', message: 'Mama-G Live connected' }));

      clientWs.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && session) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (err) {
          console.error('[Live API] Error handling client message:', err);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live API] Client disconnected from Voice WebSocket');
        try {
          session?.close?.();
        } catch {}
      });
    } catch (err: any) {
      console.error('[Live API] Error initializing session:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: 'Failed to initialize Live API session', details: err.message }));
      }
    }
  });

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Mama-G Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
