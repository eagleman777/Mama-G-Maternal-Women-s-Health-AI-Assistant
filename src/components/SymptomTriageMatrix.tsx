import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  Stethoscope,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Check,
  Sun,
  Languages,
  Volume2,
  Database,
  Download,
  User,
  Thermometer,
  ClipboardCheck,
  MapPin,
  BellRing,
  PlayCircle,
  ExternalLink,
  RefreshCw,
  Navigation,
  CloudRain,
  Droplets,
  Wind,
  Radio,
} from 'lucide-react';
import { StructuredTriageResult, SupportedLanguage, TriageSeverity } from '../types';
import { EMERGENCY_RED_FLAGS } from '../data/clinicalKnowledge';
import {
  CLIMATE_RISK_FACTORS,
  CLIMATE_TRIAGE_RULES,
  IBIBIO_CLIMATE_LEXICON,
  AKWA_IBOM_CLIMATE_LGAS,
  ClimateRiskFactorId,
  LiveClimateRiskSnapshot,
  syncClimateRulesToCache,
  evaluateClimateTriageOffline,
  fetchLiveClimateRisks,
  getCachedLiveClimateRisks,
} from '../data/climateTriageEngine';
import {
  IBIBIO_YOUTUBE_REFERENCE,
  IBIBIO_SOUND_RULES,
  IBIBIO_LESSON_PHRASES,
  IBENO_YOUTUBE_REFERENCE,
  IBENO_SOUND_RULES,
  IBENO_LESSON_PHRASES,
} from '../data/ibibioPronunciationGuide';
import { recordClinicalEncounterToSqlite, getEdgeTabletLga } from '../data/edgeSqliteStore';
import { dispatchEmergencyMidwifeAlert, MidwifeAlertRecord } from '../data/fieldValidationEngine';
import { useMamaGPronunciation } from '../utils/useMamaGPronunciation';
import { WomenAilmentsSection } from './WomenAilmentsSection';
import { ClimateTooltip } from './ClimateTooltip';
import { TriageEscalationCard, type SupportedLga } from './TriageEscalationCard';
import {
  getClimateTooltip,
  climateRiskFactorToKey,
  type ClimateRiskKey,
  type MamaGLocale,
} from '../i18n/climateTooltips';
import { useCrypto } from '../context/CryptoContext';
import { NotarizedHealthReceipt } from '../utils/crypto';

function RiskBadge({
  risk,
  locale,
  onSpeak,
}: {
  risk: ClimateRiskKey;
  locale: MamaGLocale;
  onSpeak?: (text: string) => void;
}) {
  const tooltip = getClimateTooltip(risk, locale);
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-semibold">
      <span>{tooltip.title}</span>
      <ClimateTooltip
        label={tooltip.title}
        detail={tooltip.detail}
        locale={locale}
        onSpeak={onSpeak}
      />
    </span>
  );
}

const QUICK_REFERENCE_PDF_PATH =
  '/assets/aistudio/Mama-G_CHW_Field_Quick-Reference_Guide_d25316e5.pdf';

interface SymptomTriageMatrixProps {
  language: SupportedLanguage;
  onOpenEmergency: () => void;
  onAskMamaG?: (prompt: string) => void;
  onOpenFacilities?: () => void;
  onOpenVvf?: () => void;
  initialSubTab?: 'evaluator' | 'ailments';
}

export const SymptomTriageMatrix: React.FC<SymptomTriageMatrixProps> = ({
  language,
  onOpenEmergency,
  onAskMamaG,
  onOpenFacilities,
  onOpenVvf,
  initialSubTab = 'evaluator',
}) => {
  const [mainView, setMainView] = useState<'evaluator' | 'ailments'>(initialSubTab);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [patientAgeBand, setPatientAgeBand] = useState<'under_18' | '18_24' | '25_34' | '35_plus'>('25_34');
  const [patientType, setPatientType] = useState<'pregnant' | 'postpartum' | 'non_pregnant'>('pregnant');
  const [gestationWeeks, setGestationWeeks] = useState<number>(28);
  const [postpartumDays, setPostpartumDays] = useState<number>(3);
  const [symptomFilter, setSymptomFilter] = useState<'all' | 'danger' | 'climate'>('all');

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [bpSystolic, setBpSystolic] = useState<string>('');
  const [bpDiastolic, setBpDiastolic] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const [selectedClimateLga, setSelectedClimateLga] = useState<string>(() => {
    const tabletLga = getEdgeTabletLga();
    const matched = AKWA_IBOM_CLIMATE_LGAS.find(
      (lga) => lga.toLowerCase() === tabletLga.toLowerCase()
    );
    return matched || 'Ibeno';
  });
  const [liveClimate, setLiveClimate] = useState<LiveClimateRiskSnapshot | null>(() =>
    getCachedLiveClimateRisks(getEdgeTabletLga())
  );
  const [isLoadingClimate, setIsLoadingClimate] = useState<boolean>(false);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [climateError, setClimateError] = useState<string | null>(null);
  const [climateManualOverride, setClimateManualOverride] = useState<boolean>(false);

  const [activeClimateRisks, setActiveClimateRisks] = useState<ClimateRiskFactorId[]>(() => {
    const cached = getCachedLiveClimateRisks(getEdgeTabletLga());
    return cached ? cached.activeFlags : ['extreme_ambient_heat', 'peak_mosquito_vector_season'];
  });
  const [fieldDialect, setFieldDialect] = useState<'en' | 'ibb' | 'ibn'>('en');
  const [ibibioMode, setIbibioMode] = useState<boolean>(false);
  const [pronunciationRefDialect, setPronunciationRefDialect] = useState<'ibb' | 'ibn'>('ibn');
  const [showClimateLexicon, setShowClimateLexicon] = useState<boolean>(false);
  const [showYoutubePronunciation, setShowYoutubePronunciation] = useState<boolean>(false);
  const [cacheSource, setCacheSource] = useState<'indexeddb' | 'localstorage' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StructuredTriageResult | null>(null);
  const [savedEncounterId, setSavedEncounterId] = useState<string | null>(null);
  const [isDispatchingMidwife, setIsDispatchingMidwife] = useState<boolean>(false);
  const [dispatchedMidwifeAlert, setDispatchedMidwifeAlert] = useState<MidwifeAlertRecord | null>(null);

  // Algorand cryptographic notarization hook
  const { notarizeHealthRecord, isNotarizing } = useCrypto();
  const [notarizedReceipt, setNotarizedReceipt] = useState<NotarizedHealthReceipt | null>(null);

  const {
    playPronunciation,
    stopPronunciation,
    isPlaying: isPronunciationPlaying,
    activeTerm: activePronunciationTerm,
  } = useMamaGPronunciation();

  const loadLiveClimate = useCallback(
    async (opts: {
      lga?: string;
      lat?: number;
      lon?: number;
      label?: string;
      forceRefresh?: boolean;
      applyFlags?: boolean;
    }) => {
      setIsLoadingClimate(true);
      setClimateError(null);
      try {
        const snapshot = await fetchLiveClimateRisks({
          lga: opts.lga,
          lat: opts.lat,
          lon: opts.lon,
          label: opts.label,
          forceRefresh: opts.forceRefresh,
        });
        if (snapshot) {
          setLiveClimate(snapshot);
          if (opts.applyFlags !== false) {
            setActiveClimateRisks(snapshot.activeFlags);
            setClimateManualOverride(false);
          }
          if (snapshot.source === 'cached-live') {
            setClimateError('Offline mode: displaying last cached live climate telemetry.');
          }
        } else {
          setClimateError('Live weather feed unreachable; using pre-seeded offline climate flags.');
        }
      } catch {
        setClimateError('Live weather feed unreachable; using pre-seeded offline climate flags.');
      } finally {
        setIsLoadingClimate(false);
      }
    },
    []
  );

  useEffect(() => {
    syncClimateRulesToCache().then((res) => {
      setCacheSource(res.source);
    });
  }, []);

  useEffect(() => {
    loadLiveClimate({ lga: selectedClimateLga, applyFlags: true });
  }, [selectedClimateLga, loadLiveClimate]);

  const handleUseGpsClimate = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setClimateError('GPS geolocation is not supported on this device; pick an Akwa Ibom LGA.');
      return;
    }
    setIsLocatingGps(true);
    setClimateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGps(false);
        loadLiveClimate({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: 'Current GPS Location',
          forceRefresh: true,
          applyFlags: true,
        });
      },
      () => {
        setIsLocatingGps(false);
        setClimateError('Location permission denied; using selected Akwa Ibom LGA live feed.');
      },
      { enableHighAccuracy: false, timeout: 7000 }
    );
  };

  const handleSelectDialect = (dialect: 'en' | 'ibb' | 'ibn') => {
    setFieldDialect(dialect);
    setIbibioMode(dialect !== 'en');
    if (dialect === 'ibb' || dialect === 'ibn') {
      setPronunciationRefDialect(dialect);
    }
  };

  const handleToggleClimateRisk = (riskId: ClimateRiskFactorId) => {
    setClimateManualOverride(true);
    setActiveClimateRisks((prev) =>
      prev.includes(riskId) ? prev.filter((r) => r !== riskId) : [...prev, riskId]
    );
  };

  const handleSyncToLiveClimate = () => {
    if (liveClimate) {
      setActiveClimateRisks(liveClimate.activeFlags);
      setClimateManualOverride(false);
    } else {
      loadLiveClimate({ lga: selectedClimateLga, forceRefresh: true, applyFlags: true });
    }
  };

  const handleSpeakPhrase = (text: string, overrideLang?: 'en' | 'ibb' | 'ibn') => {
    const langCode = overrideLang || fieldDialect;
    if (isPronunciationPlaying && activePronunciationTerm === text) {
      stopPronunciation();
    } else {
      playPronunciation(text, langCode);
    }
  };

  const handleEscalateToMidwife = async () => {
    if (!result) return;
    setIsDispatchingMidwife(true);
    try {
      const alertRec = await dispatchEmergencyMidwifeAlert({
        encounterId: savedEncounterId || undefined,
        lga: getEdgeTabletLga(),
        languageCode: fieldDialect,
        climateRisk: activeClimateRisks[0] || 'obstetric_red_flag',
        severityLevel: result.severity === 'EMERGENCY' ? 1 : 2,
        summary: `${result.severity}: ${result.headline}`.slice(0, 200),
      });
      setDispatchedMidwifeAlert(alertRec);
    } catch {
      // Errors handled gracefully if device offline
    } finally {
      setIsDispatchingMidwife(false);
    }
  };

  const handleAnchorTriage = async () => {
    if (!result) return;
    try {
      const rcpt = await notarizeHealthRecord('triage', `Triage: ${result.headline}`, {
        severity: result.severity,
        headline: result.headline,
        dangerSigns: result.dangerSignsDetected,
        bloodPressure: bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : 'Not measured',
        temperature: temperature || 'Normal',
        patientType,
        gestationWeeks: patientType === 'pregnant' ? gestationWeeks : undefined,
      });
      setNotarizedReceipt(rcpt);
    } catch (err) {
      console.error('Failed to anchor triage:', err);
    }
  };

  const symptomChecklist = [
    {
      id: 'headache_vision',
      label: 'Severe throbbing headache or blurry vision / flashes of light',
      category: 'danger',
      description: 'Danger sign of pre-eclampsia / high blood pressure',
    },
    {
      id: 'vaginal_bleeding',
      label: 'Vaginal bleeding or brown discharge',
      category: 'danger',
      description: 'Risk of placenta abruption, previa, or miscarriage',
    },
    {
      id: 'absent_kicks',
      label: 'Baby stopped moving or kicking (less than 4 kicks in 1 hour)',
      category: 'danger',
      description: 'Sign of fetal compromise or distress (after 26-28 weeks)',
    },
    {
      id: 'severe_abdo_pain',
      label: 'Severe constant belly pain or rigid hard uterus',
      category: 'danger',
      description: 'Abruptio placenta or obstructed labor sign',
    },
    {
      id: 'facial_swelling',
      label: 'Sudden puffy swelling of face, eyelids, or hands',
      category: 'danger',
      description: 'Rapid fluid retention from pre-eclampsia',
    },
    {
      id: 'high_fever',
      label: 'High fever (>38°C / 100.4°F) or severe shaking chills',
      category: 'danger',
      description: 'Malaria, severe sepsis, or kidney infection',
    },
    {
      id: 'heavy_lochia',
      label: 'Heavy bleeding soaking >2 pads per hour after delivery',
      category: 'danger',
      description: 'Postpartum Hemorrhage (PPH)',
    },
    {
      id: 'foul_lochia',
      label: 'Foul-smelling offensive vaginal discharge after birth',
      category: 'danger',
      description: 'Puerperal uterine infection / sepsis',
    },
    {
      id: 'fits_convulsion',
      label: 'Fits, convulsions, twitching, or momentary blackouts',
      category: 'danger',
      description: 'Eclampsia emergency',
    },
    {
      id: 'water_broke_green',
      label: 'Waters broke with green or dark stained fluid (meconium)',
      category: 'danger',
      description: 'Baby has passed stool in womb; fetal distress',
    },
    {
      id: 'severe_malaria_signs',
      label: 'Fever with yellowing eyes (jaundice), dark urine, extreme lethargy, or unable to keep fluids down',
      category: 'danger',
      description: 'Climate Vector Rule Set B (Level 1): Suspected Severe Malaria in Pregnancy',
    },
    {
      id: 'heat_stress_exhaustion',
      label: 'Dizziness, excessive fatigue, or mild dehydration during extreme heat / high humidity',
      category: 'urgent',
      description: 'Climate Heat Rule Set A (Level 2): Heat Stress Risk (Idem kpon̄ ut mama?)',
    },
    {
      id: 'flood_waterborne',
      label: 'Acute watery diarrhea or stomach cramps after flooding / borehole contamination',
      category: 'urgent',
      description: 'Climate Flood Risk: Post-flood water-borne dehydration hazard',
    },
    {
      id: 'painful_urination',
      label: 'Burning pain or frequency during urination',
      category: 'urgent',
      description: 'Urinary Tract Infection (UTI)',
    },
    {
      id: 'severe_vomiting',
      label: 'Vomiting constantly, unable to keep water down for 24 hours',
      category: 'urgent',
      description: 'Hyperemesis gravidarum with risk of dehydration',
    },
    {
      id: 'vvf_leakage',
      label: 'Continuous uncontrollable leakage of urine or stool after difficult birth (VVF / RVF)',
      category: 'urgent',
      description: 'Obstetric Fistula from prolonged labor (100% treatable & free surgery in Nigeria)',
    },
    {
      id: 'mild_nausea',
      label: 'Mild morning nausea without dehydration',
      category: 'routine',
      description: 'Normal first trimester physiological change',
    },
    {
      id: 'mild_ankle_edema',
      label: 'Slight ankle/foot swelling only at the end of the day',
      category: 'routine',
      description: 'Normal gravity-related fluid accumulation in 3rd trimester',
    },
  ];

  const handleToggleSymptom = (label: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setBpSystolic('');
    setBpDiastolic('');
    setTemperature('');
    setCustomNote('');
    setResult(null);
    setSavedEncounterId(null);
    setDispatchedMidwifeAlert(null);
    setNotarizedReceipt(null);
    setFormError(null);
    setWizardStep(1);
  };

  // Derive automatic climate cross-reference signals from Step 1 inputs
  const combinedSymptomText = `${selectedSymptoms.join(' ')} ${customNote}`.toLowerCase();
  const sysNum = Number(bpSystolic) || 0;
  const diaNum = Number(bpDiastolic) || 0;
  const tempNum = Number(temperature) || 0;
  const isBpElevated = sysNum >= 140 || diaNum >= 90;
  const isFeverTemp = tempNum >= 38.0 || combinedSymptomText.includes('fever') || combinedSymptomText.includes('chills');
  const hasSwellingOrHeadache =
    combinedSymptomText.includes('swelling') ||
    combinedSymptomText.includes('headache') ||
    combinedSymptomText.includes('blurry vision');
  const hasHeatSigns =
    combinedSymptomText.includes('dizziness') ||
    combinedSymptomText.includes('fatigue') ||
    combinedSymptomText.includes('dehydration') ||
    hasSwellingOrHeadache;
  const hasWaterborneSigns =
    combinedSymptomText.includes('diarrhea') ||
    combinedSymptomText.includes('vomiting') ||
    combinedSymptomText.includes('flood');

  const crossReferencedRules = [
    ...(hasSwellingOrHeadache && (isBpElevated || activeClimateRisks.includes('extreme_ambient_heat'))
      ? [
          {
            rule: CLIMATE_TRIAGE_RULES[0],
            matchReason: isBpElevated
              ? `Swelling / neurological symptoms + elevated BP (${bpSystolic || '—'}/${bpDiastolic || '—'} mmHg)`
              : 'Swelling / headache symptoms cross-referenced with active Extreme Ambient Heat exposure',
          },
        ]
      : hasHeatSigns && activeClimateRisks.includes('extreme_ambient_heat')
      ? [
          {
            rule: CLIMATE_TRIAGE_RULES[1],
            matchReason: 'Heat exhaustion / dehydration symptoms detected under Extreme Ambient Heat advisory',
          },
        ]
      : []),
    ...(isFeverTemp &&
    (combinedSymptomText.includes('jaundice') ||
      combinedSymptomText.includes('lethargy') ||
      combinedSymptomText.includes('dark urine') ||
      combinedSymptomText.includes('unable to keep fluids'))
      ? [
          {
            rule: CLIMATE_TRIAGE_RULES[2],
            matchReason: `Elevated temperature (${tempNum ? `${tempNum}°C` : 'reported fever'}) + severe malaria systemic signs`,
          },
        ]
      : isFeverTemp && activeClimateRisks.includes('peak_mosquito_vector_season')
      ? [
          {
            rule: CLIMATE_TRIAGE_RULES[3],
            matchReason: `Elevated temperature (${tempNum ? `${tempNum}°C` : 'fever/chills'}) cross-referenced with Peak Mosquito Vector Season`,
          },
        ]
      : []),
    ...(hasWaterborneSigns &&
    (activeClimateRisks.includes('post_flood_water_contamination') || combinedSymptomText.includes('diarrhea'))
      ? [
          {
            rule: CLIMATE_TRIAGE_RULES[4],
            matchReason: 'Acute GI / diarrheal symptoms cross-referenced with Post-Flood Water Contamination risk',
          },
        ]
      : []),
  ];

  const handleGoToStep2 = () => {
    setFormError(null);
    setWizardStep(2);
    if (!liveClimate && !isLoadingClimate) {
      loadLiveClimate({ lga: selectedClimateLga, applyFlags: !climateManualOverride });
    }
    requestAnimationFrame(() => {
      wizardTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const runLocalOfflineTriage = (): StructuredTriageResult => {
    const isBpHigh = Number(bpSystolic) >= 140 || Number(bpDiastolic) >= 90;
    const isBpSevere = Number(bpSystolic) >= 160 || Number(bpDiastolic) >= 110;
    const isFever = Number(temperature) >= 38.0;

    // 1. Evaluate Climate-Induced Health Threats (Rule Set A & B) offline cache first
    const climateEvaluation = evaluateClimateTriageOffline({
      selectedSymptoms,
      bpSystolic: Number(bpSystolic) || 0,
      bpDiastolic: Number(bpDiastolic) || 0,
      temperature: Number(temperature) || 0,
      customNote,
      climateRisks: activeClimateRisks,
      ibibioMode,
    });
    if (climateEvaluation) {
      return climateEvaluation;
    }

    const hasRedFlagSymptom = selectedSymptoms.some(
      (s) =>
        s.includes('headache') ||
        s.includes('bleeding') ||
        s.includes('stopped moving') ||
        s.includes('severe constant belly') ||
        s.includes('swelling of face') ||
        s.includes('Heavy bleeding') ||
        s.includes('Foul-smelling') ||
        s.includes('Fits') ||
        s.includes('green') ||
        s.includes('jaundice')
    );

    if (hasRedFlagSymptom || isBpSevere) {
      return {
        severity: 'EMERGENCY',
        headline: '🚨 IMMEDIATE RED FLAG DETECTED: Rush to Nearest Health Centre or Hospital',
        dangerSignsDetected: selectedSymptoms.filter((s) => !s.includes('mild')),
        plainLanguageExplanation:
          'Your reported symptoms point to an obstetric or postpartum emergency. Conditions like severe pre-eclampsia, hemorrhage, or fetal distress can worsen rapidly without clinic intervention.',
        immediateActions: [
          'Arrange emergency transport immediately to the nearest primary health center or hospital.',
          'Lie down flat on your left side to maximize oxygen flow to your heart and baby.',
          'Do NOT take herbal concoctions, native chalk, or unprescribed pain tablets.',
          'If bleeding after birth: vigorously massage your lower abdomen in a circular motion.',
          'Take your ANC card and clean cloth with you.',
        ],
        chwClinicalNotes: [
          'Immediate Vitals: Blood pressure, pulse, temperature, and fetal heart rate (normal: 110-160 bpm).',
          'If BP >= 160/110 with neurological symptoms, initiate Magnesium Sulfate loading dose per national protocol.',
          'Establish IV access (16G or 18G cannula) with Normal Saline or Ringer Lactate.',
          'Alert receiving hospital prior to emergency transfer.',
        ],
        whenToRushToHospital:
          'Immediately. Do not wait for symptoms to subside at home.',
      };
    }

    const hasFistulaSymptom = selectedSymptoms.some(
      (s) => s.includes('leakage of urine') || s.includes('VVF')
    );

    if (hasFistulaSymptom) {
      return {
        severity: 'URGENT',
        headline: '💜 OBSTETRIC FISTULA (VVF / RVF) DETECTED: 100% Curable by Free Surgery',
        dangerSignsDetected: ['Postpartum continuous urine/fecal leakage'],
        plainLanguageExplanation:
          'Involuntary leakage of urine or stool after childbirth indicates an Obstetric Fistula caused by prolonged obstructed labor. Fistula is NOT a curse or spiritual attack — it is a biological wound that can be 100% repaired and cured through free surgery at accredited National Fistula Centres across Nigeria.',
        immediateActions: [
          'Call the National Toll-Free Fistula Helpline at 0800-FISTULA (0800 347 8852) to locate your nearest free surgical center.',
          'If you gave birth within the last 14 to 21 days: Go to a hospital immediately! Placing a continuous Foley catheter now can heal small fresh tears completely without needing surgery.',
          'Drink 3 to 4 liters of clean water daily to prevent strong ammonia smell and stop severe skin burning.',
          'Apply pure petroleum jelly (Vaseline) or raw shea butter liberally to vulva and inner thighs as a waterproof barrier.',
          'Strict Pelvic Rest: Zero sexual intercourse to prevent tearing and infection.',
        ],
        chwClinicalNotes: [
          'Assess onset: If within 14–21 days postpartum, insert a size 16F/18F Foley catheter with continuous drainage for conservative healing.',
          'Perform Sims speculum exam in left lateral position with diluted dye test to visualize fistula size and location.',
          'Register patient with the State or National Fistula Coordinator for the next free surgical outreach pool (e.g. Babbar Ruga, Ningi, Abakaliki, Laure Kano).',
          'Counsel family members on anti-stigma, zero-shame, and spousal support.',
        ],
        whenToRushToHospital:
          'Seek clinical evaluation at your primary health centre or nearest National Fistula Centre this week. If fever or flank pain develops, seek emergency care immediately.',
      };
    }

    const hasUrgent =
      selectedSymptoms.some((s) => s.includes('Burning') || s.includes('Vomiting')) ||
      isBpHigh ||
      isFever;

    if (hasUrgent) {
      return {
        severity: 'URGENT',
        headline: '⚠️ URGENT CLINICAL EVALUATION: Visit Clinic Within 24 Hours',
        dangerSignsDetected: selectedSymptoms,
        plainLanguageExplanation:
          'These symptoms indicate a possible infection (malaria, UTI) or moderate high blood pressure that requires clinical testing and safe prescription medication.',
        immediateActions: [
          'Visit your local primary healthcare clinic today.',
          'Drink small frequent sips of clean water, coconut water, or oral rehydration salts.',
          'Rest in a cool, ventilated area under a mosquito net.',
          'If symptoms suddenly worsen or severe headache develops, proceed to emergency immediately.',
        ],
        chwClinicalNotes: [
          'Perform Malaria Rapid Diagnostic Test (mRDT).',
          'Check urine dipstick for protein, nitrites, and leukocytes.',
          'Re-check blood pressure in 4 hours after resting.',
          'Ensure hemoglobin check for maternal anemia.',
        ],
        whenToRushToHospital:
          'Seek care at your primary clinic today, or immediately if vomiting prevents keeping any water down.',
      };
    }

    return {
      severity: 'ROUTINE',
      headline: 'ℹ️ ROUTINE PHYSIOLOGICAL SYMPTOMS: Standard Care Advised',
      dangerSignsDetected: [],
      plainLanguageExplanation:
        'Your symptoms appear to be common normal physiological adaptations during pregnancy. Continue routine antenatal care and healthy local nutrition.',
      immediateActions: [
        'Eat small, frequent meals with iron-rich foods (ugu/spinach, beans, eggs, groundnuts).',
        'Take your daily iron and folic acid supplements with water or orange juice.',
        'Elevate your feet on a low stool when sitting down to relieve normal evening ankle swelling.',
        'Attend your next scheduled Antenatal Care (ANC) appointment.',
      ],
      chwClinicalNotes: [
        'Verify mother is sleeping under an insecticide-treated net (ITN).',
        'Confirm tetanus vaccination (TT) and IPTp-SP antimalarial schedule.',
        'Review birth preparedness plan and emergency transport savings.',
      ],
      whenToRushToHospital:
        'Visit the clinic if you develop any sudden headache, bleeding, fever, or notice your baby is moving less.',
    };
  };

  const handleRunTriage = async () => {
    if (selectedSymptoms.length === 0 && !customNote && !bpSystolic && !temperature) {
      setFormError('Please select at least one symptom or enter vitals (e.g. BP / Temperature) to evaluate.');
      return;
    }

    setFormError(null);
    setIsLoading(true);
    setResult(null);
    setSavedEncounterId(null);

    let resolvedResult: StructuredTriageResult;
    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          pregnancyStatus: patientType,
          gestationWeeks: patientType === 'pregnant' ? gestationWeeks : undefined,
          postpartumDays: patientType === 'postpartum' ? postpartumDays : undefined,
          climateRisks: activeClimateRisks,
          liveClimateTelemetry: liveClimate
            ? {
                lga: liveClimate.lga,
                source: liveClimate.source,
                observedAt: liveClimate.observedAt,
                ...liveClimate.metrics,
              }
            : undefined,
          ibibioMode,
          vitals: {
            bp: bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : undefined,
            temperature: temperature ? `${temperature}°C` : undefined,
            notes: customNote,
          },
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      resolvedResult = await response.json();
    } catch (err) {
      console.warn('Falling back to local WHO triage rule engine:', err);
      resolvedResult = runLocalOfflineTriage();
    } finally {
      setIsLoading(false);
    }

    setResult(resolvedResult);
    setWizardStep(3);

    // Record anonymized clinical encounter into offline edge SQLite store
    try {
      const severityNum: 1 | 2 | 3 =
        resolvedResult.severity === 'EMERGENCY' ? 1 : resolvedResult.severity === 'URGENT' ? 2 : 3;
      const stageCode =
        patientType === 'pregnant'
          ? gestationWeeks <= 12
            ? 'pregnant_trimester_1'
            : gestationWeeks <= 26
            ? 'pregnant_trimester_2'
            : 'pregnant_trimester_3'
          : patientType === 'postpartum'
          ? 'postpartum'
          : 'non_pregnant';
      const ageGroup = `${patientAgeBand}:${stageCode}`;
      const headlineLower = resolvedResult.headline.toLowerCase();
      const matchedRuleId = headlineLower.includes('severe vector-borne')
        ? 'severe_malaria_level_1'
        : headlineLower.includes('level 1 heat stress')
        ? 'heat_hypertension_level_1'
        : headlineLower.includes('vector-borne fever')
        ? 'uncomplicated_malaria_level_2'
        : headlineLower.includes('level 2 extreme heat')
        ? 'heat_stress_level_2'
        : headlineLower.includes('water-borne')
        ? 'waterborne_flood_risk'
        : resolvedResult.severity === 'EMERGENCY'
        ? 'obstetric_preeclampsia_redflag'
        : null;

      const enc = await recordClinicalEncounterToSqlite({
        patientAgeGroup: ageGroup,
        climateRiskFlagged: activeClimateRisks.length > 0 ? activeClimateRisks[0] : 'none',
        matchedRuleId,
        severityTriggered: severityNum,
        actionTaken: resolvedResult.immediateActions?.[0] || resolvedResult.headline,
      });
      setSavedEncounterId(enc.encounter_id);
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>WHO & UNICEF Clinical Triage Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Rapid Maternal & Neonatal Symptom Triage Matrix
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Evaluate reported symptoms in seconds to distinguish between normal physiological changes, urgent infections, and life-threatening obstetric emergencies.
          </p>
        </div>
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          <a
            href={QUICK_REFERENCE_PDF_PATH}
            download="Mama-G_CHW_Field_Quick-Reference_Guide.pdf"
            className="px-3 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 rounded-xl text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CHW Quick-Ref (PDF)</span>
          </a>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium border border-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Matrix</span>
          </button>
        </div>
      </div>

      {/* Sub-tab switcher under Symptom Triage */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          type="button"
          onClick={() => setMainView('evaluator')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border ${
            mainView === 'evaluator'
              ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
              : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-300" />
          <span>Symptom Triage Evaluator</span>
        </button>

        <button
          type="button"
          onClick={() => setMainView('ailments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border ${
            mainView === 'ailments'
              ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
              : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-300" />
          <span>Women's Ailments & Preventions (11 Conditions)</span>
        </button>
      </div>

      {mainView === 'ailments' ? (
        <WomenAilmentsSection
          language={language}
          onAskMamaG={onAskMamaG}
          onOpenEmergency={onOpenEmergency}
          onOpenFacilities={onOpenFacilities}
          onOpenVvf={onOpenVvf}
        />
      ) : (
        <>
          <div ref={wizardTopRef} className="space-y-6">
          {/* Step-by-Step Field Triage Wizard Progress Stepper */}
          <nav
            aria-label="Field Triage Steps"
            className="bg-stone-900 border border-stone-800 rounded-2xl p-2 grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {[
              {
                step: 1 as const,
                title: '1. Patient Intake Screen',
                subtitle: 'Age group, trimester & symptoms',
                unlocked: true,
              },
              {
                step: 2 as const,
                title: '2. Climate Risk Flags',
                subtitle:
                  crossReferencedRules.length > 0
                    ? `${crossReferencedRules.length} live rule match${crossReferencedRules.length > 1 ? 'es' : ''}`
                    : liveClimate
                    ? `Live ${liveClimate.lga}: ${liveClimate.metrics.tempC}°C · ${activeClimateRisks.length} flag${activeClimateRisks.length === 1 ? '' : 's'}`
                    : 'Live weather & offline rules',
                unlocked: true,
              },
              {
                step: 3 as const,
                title: '3. Clear Action Card',
                subtitle: result ? `${result.severity} protocol ready` : 'Severity badge & referral steps',
                unlocked: Boolean(result),
              },
            ].map((item) => {
              const isCurrent = wizardStep === item.step;
              const isDone = wizardStep > item.step || (item.step === 3 && Boolean(result));
              return (
                <button
                  key={item.step}
                  type="button"
                  disabled={!item.unlocked}
                  onClick={() => {
                    if (item.unlocked) {
                      setFormError(null);
                      setWizardStep(item.step);
                    }
                  }}
                  className={`min-h-[52px] px-4 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : isDone
                      ? 'bg-stone-800/80 text-stone-100 hover:bg-stone-800 border border-stone-700'
                      : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 border border-stone-800/80'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold whitespace-nowrap truncate tabular-nums">
                      {item.title}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isCurrent ? 'text-stone-900/80 font-medium' : 'text-stone-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 tabular-nums ${
                      isCurrent
                        ? 'bg-stone-950 text-amber-400'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    {isDone && !isCurrent ? <Check className="w-3.5 h-3.5" /> : item.step}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* STEP 1: PATIENT INTAKE SCREEN */}
          {wizardStep === 1 && (
            <div className="space-y-5">
              {/* Patient Age Group, Maternal Stage & Dialect Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Age Group & Maternal Stage */}
                <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-400" />
                        <span>Patient Intake Profile</span>
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Select mother’s age group, pregnancy trimester, and local audio dialect.
                      </p>
                    </div>
                    {/* Quick Dialect Switcher (EN / IBB / IBN) */}
                    <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl">
                      {[
                        { code: 'en' as const, label: 'English' },
                        { code: 'ibb' as const, label: 'Ibibio [ibb]' },
                        { code: 'ibn' as const, label: 'Ibeno [ibn]' },
                      ].map((langOpt) => (
                        <button
                          key={langOpt.code}
                          type="button"
                          onClick={() => handleSelectDialect(langOpt.code)}
                          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            fieldDialect === langOpt.code
                              ? 'bg-amber-500 text-stone-950'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {langOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Group Prompts */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-300 block">
                      Patient Age Group
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'under_18' as const, label: 'Under 18 yrs' },
                        { id: '18_24' as const, label: '18–24 yrs' },
                        { id: '25_34' as const, label: '25–34 yrs' },
                        { id: '35_plus' as const, label: '35+ yrs' },
                      ].map((age) => (
                        <button
                          key={age.id}
                          type="button"
                          onClick={() => setPatientAgeBand(age.id)}
                          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
                            patientAgeBand === age.id
                              ? 'bg-amber-500/20 text-amber-200 border-amber-500'
                              : 'bg-stone-800/70 text-stone-300 border-stone-700 hover:bg-stone-800'
                          }`}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Maternal Status & Trimester Prompts */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-stone-300 block">
                      Pregnancy Stage / Trimester
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'pregnant' as const, label: 'Pregnant Mother' },
                        { id: 'postpartum' as const, label: 'Postpartum (Delivered)' },
                        { id: 'non_pregnant' as const, label: 'Non-Pregnant / Adolescent' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setPatientType(st.id)}
                          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                            patientType === st.id
                              ? 'bg-amber-500/20 text-amber-200 border-amber-500'
                              : 'bg-stone-800/70 text-stone-300 border-stone-700 hover:bg-stone-800'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {patientType === 'pregnant' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Trimester 1 · Wks 1–12', weeks: 10, active: gestationWeeks <= 12 },
                            { label: 'Trimester 2 · Wks 13–26', weeks: 20, active: gestationWeeks > 12 && gestationWeeks <= 26 },
                            { label: 'Trimester 3 · Wks 27–42', weeks: 32, active: gestationWeeks > 26 },
                          ].map((tri) => (
                            <button
                              key={tri.label}
                              type="button"
                              onClick={() => setGestationWeeks(tri.weeks)}
                              className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer tabular-nums ${
                                tri.active
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/60'
                                  : 'bg-stone-950/70 text-stone-400 border-stone-800 hover:text-stone-200'
                              }`}
                            >
                              {tri.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-stone-950/70 px-3.5 py-2.5 rounded-xl border border-stone-800 text-xs">
                          <span className="text-stone-400">Exact Gestation:</span>
                          <div className="flex items-center gap-3 flex-1 max-w-xs justify-end">
                            <input
                              type="range"
                              min={4}
                              max={42}
                              value={gestationWeeks}
                              onChange={(e) => setGestationWeeks(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                            <span className="font-bold text-amber-300 whitespace-nowrap tabular-nums">
                              Week {gestationWeeks}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {patientType === 'postpartum' && (
                      <div className="bg-stone-950/70 px-3.5 py-2.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                        <span className="text-stone-300">Days Since Delivery:</span>
                        <select
                          value={postpartumDays}
                          onChange={(e) => setPostpartumDays(Number(e.target.value))}
                          className="min-h-[40px] bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 focus:outline-none"
                        >
                          <option value={1}>Day 1 (Within 24 hours)</option>
                          <option value={3}>Day 3 (First week)</option>
                          <option value={7}>Day 7 (One week)</option>
                          <option value={14}>Day 14 (Two weeks)</option>
                          <option value={42}>Week 6 (6-week checkup)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vitals & Dialect Verification Prompts */}
                <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-amber-400" />
                        <span>Quick Vitals &amp; Field Notes</span>
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Enter available vitals to auto-flag pre-eclampsia or heat/malaria fevers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-stone-300 font-medium block">
                          Blood Pressure (mmHg)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="120"
                            value={bpSystolic}
                            onChange={(e) => setBpSystolic(e.target.value)}
                            className="min-h-[44px] w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 tabular-nums"
                          />
                          <span className="text-stone-500 font-bold">/</span>
                          <input
                            type="number"
                            placeholder="80"
                            value={bpDiastolic}
                            onChange={(e) => setBpDiastolic(e.target.value)}
                            className="min-h-[44px] w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-stone-300 font-medium block">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 38.4"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          className="min-h-[44px] w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 tabular-nums"
                        />
                      </div>
                    </div>

                    {(isBpElevated || isFeverTemp) && (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="tabular-nums">
                          {isBpElevated && isFeverTemp
                            ? 'High BP and elevated temperature detected — climate & obstetric rules will escalate priority.'
                            : isBpElevated
                            ? `BP ${bpSystolic}/${bpDiastolic} mmHg exceeds 140/90 gestational hypertension threshold.`
                            : `Body temperature (${temperature || 'fever'}°C) triggers climate fever & malaria screening.`}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-stone-300 text-xs font-medium block">
                        Presenting Complaint / Observation (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Facial swelling since morning, dizzy in sun, shaking chills..."
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        className="w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Bilingual Dialect Audio Check Strip */}
                  <div className="pt-2 border-t border-stone-800 space-y-2">
                    <div className="text-[11px] font-semibold text-stone-400">
                      Audio Symptom Check ({fieldDialect === 'en' ? 'English' : fieldDialect === 'ibb' ? 'Ibibio [ibb]' : 'Ibeno [ibn]'})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {IBIBIO_CLIMATE_LEXICON.map((item) => {
                        const spokenText = fieldDialect === 'en' ? item.englishPrompt : item.ibibioEquivalent;
                        const active = isPronunciationPlaying && activePronunciationTerm === spokenText;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSpeakPhrase(spokenText)}
                            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                              active
                                ? 'bg-emerald-600 text-white border-emerald-400'
                                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.concept}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenting Symptoms Selector */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-amber-400" />
                      <span>Presenting Symptoms Checklist</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 tabular-nums">
                      Tap all observed symptoms ({selectedSymptoms.length} selected)
                    </p>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl self-start sm:self-auto">
                    {[
                      { id: 'all' as const, label: 'All Symptoms' },
                      { id: 'danger' as const, label: 'Obstetric Danger' },
                      { id: 'climate' as const, label: 'Climate & Fever' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSymptomFilter(tab.id)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          symptomFilter === tab.id
                            ? 'bg-stone-800 text-white'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {symptomChecklist
                    .filter((item) => {
                      if (symptomFilter === 'danger') return item.category === 'danger';
                      if (symptomFilter === 'climate') {
                        return (
                          item.id.includes('malaria') ||
                          item.id.includes('heat') ||
                          item.id.includes('flood') ||
                          item.id.includes('fever') ||
                          item.id.includes('swelling')
                        );
                      }
                      return true;
                    })
                    .map((item) => {
                      const isSelected = selectedSymptoms.includes(item.label);
                      const isDanger = item.category === 'danger';
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleSymptom(item.label)}
                          className={`min-h-[60px] p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? isDanger
                                ? 'bg-rose-950/75 border-rose-500 text-rose-100'
                                : 'bg-amber-950/70 border-amber-500 text-amber-100'
                              : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mt-1 rounded accent-amber-500 shrink-0 w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-semibold leading-snug">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-stone-400 mt-1 flex flex-wrap items-center gap-1.5">
                              {isDanger && (
                                <span className="font-bold text-rose-400">
                                  Red Flag
                                </span>
                              )}
                              {isDanger && <span aria-hidden="true">·</span>}
                              <span>{item.description}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3">
                    <span>{formError}</span>
                    <button
                      type="button"
                      onClick={() => setFormError(null)}
                      className="text-rose-200 hover:text-white font-bold px-2 py-1 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Step 1 Footer CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-800">
                  <div className="text-xs text-stone-300 flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                        liveClimate?.source === 'live-open-meteo'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>
                      {liveClimate
                        ? `Live ${liveClimate.lga} weather (${liveClimate.metrics.tempC}°C · Heat Index ${liveClimate.metrics.heatIndexC}°C · ${liveClimate.metrics.humidityPct}% RH) ready to cross-reference with offline rules.`
                        : 'Next step pulls live Akwa Ibom climate telemetry and cross-references symptoms against offline rules.'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleGoToStep2}
                      className="min-h-[46px] px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      <span>Next: Climate Risk Flags</span>
                      {activeClimateRisks.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-stone-950/20 text-stone-950 text-[11px] font-extrabold tabular-nums">
                          {activeClimateRisks.length} Live
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LIVE CLIMATE RISK FLAGS & RULE CROSS-REFERENCE */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              {/* Auto Cross-Referenced Climate Rules Card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Live Climate Risk Flags &amp; Automatic Rule Cross-Reference</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Real-time Akwa Ibom meteorological hazards auto-flag local risks and cross-reference Step 1 symptoms against cached clinical rules.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Compact Locale Toggle (EN / IBB / IBN) for Localized Tooltips & Audio */}
                    <div
                      className="inline-flex rounded-lg bg-stone-950 p-0.5 border border-stone-800"
                      role="group"
                      aria-label="Climate guidance locale"
                    >
                      {(['en', 'ibb', 'ibn'] as const).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleSelectDialect(loc)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            fieldDialect === loc
                              ? 'bg-amber-500 text-stone-950'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border ${
                        liveClimate?.source === 'live-open-meteo'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <Radio className={`w-3.5 h-3.5 ${isLoadingClimate ? 'animate-spin' : ''}`} />
                      <span>
                        {isLoadingClimate
                          ? 'Syncing Live Weather...'
                          : liveClimate?.source === 'live-open-meteo'
                          ? 'LIVE Telemetry'
                          : liveClimate?.source === 'cached-live'
                          ? 'Cached Live Snapshot'
                          : 'Offline Rule Store'}
                      </span>
                    </span>
                    {cacheSource && (
                      <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1 whitespace-nowrap">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cache: {cacheSource}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Akwa Ibom Meteorological Telemetry Control & Metrics Strip */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3.5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>LGA:</span>
                      </span>
                      {AKWA_IBOM_CLIMATE_LGAS.map((lga) => {
                        const isSelected =
                          liveClimate?.lga?.toLowerCase() === lga.toLowerCase() ||
                          (!liveClimate && selectedClimateLga === lga);
                        return (
                          <button
                            key={lga}
                            type="button"
                            onClick={() => setSelectedClimateLga(lga)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 border-amber-400'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                            }`}
                          >
                            {lga}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleUseGpsClimate}
                        disabled={isLocatingGps || isLoadingClimate}
                        className="min-h-[34px] px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isLocatingGps ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Use GPS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          loadLiveClimate({
                            lga: selectedClimateLga,
                            forceRefresh: true,
                            applyFlags: true,
                          })
                        }
                        disabled={isLoadingClimate}
                        className="min-h-[34px] px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/35 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isLoadingClimate ? 'animate-spin' : ''}`}
                        />
                        <span>Refresh Live</span>
                      </button>
                    </div>
                  </div>

                  {liveClimate && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800">
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Temp / Heat Index</span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-white mt-1 tabular-nums">
                          {liveClimate.metrics.tempC}°C{' '}
                          <span className="text-xs font-semibold text-amber-300">
                            (Feels {liveClimate.metrics.heatIndexC}°C)
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Daily peak {liveClimate.metrics.todayMaxTempC}°C
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800">
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-sky-400" />
                          <span>Relative Humidity</span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-white mt-1 tabular-nums">
                          {liveClimate.metrics.humidityPct}%
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {liveClimate.coastal ? 'Coastal Akwa Ibom zone' : 'Inland LGA zone'}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800">
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                          <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Rainfall (24h / 72h)</span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-white mt-1 tabular-nums">
                          {liveClimate.metrics.rain24hMm} mm{' '}
                          <span className="text-xs font-normal text-stone-400">
                            / {liveClimate.metrics.rain72hMm} mm
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Now: {liveClimate.metrics.currentPrecipMm} mm/h
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800">
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-stone-300" />
                          <span>Conditions</span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-white mt-1 truncate">
                          {liveClimate.metrics.conditionLabel}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 tabular-nums">
                          Wind {liveClimate.metrics.windKmh} km/h · {liveClimate.observedAt.replace('T', ' ')} WAT
                        </div>
                      </div>
                    </div>
                  )}

                  {climateError && (
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                      {climateError}
                    </div>
                  )}

                  {climateManualOverride && liveClimate && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-sky-200 bg-sky-500/10 border border-sky-500/30 rounded-lg px-3 py-2">
                      <span>Manual CHW override active on hazard toggles.</span>
                      <button
                        type="button"
                        onClick={handleSyncToLiveClimate}
                        className="font-bold text-sky-300 hover:text-white underline cursor-pointer"
                      >
                        Reset to Live {liveClimate.lga} Telemetry
                      </button>
                    </div>
                  )}
                </div>

                {/* Environmental Hazard Toggles (Live Auto-Flagged + Manual CHW Override + Localized Tooltips) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CLIMATE_RISK_FACTORS.map((rf) => {
                    const isActive = activeClimateRisks.includes(rf.id);
                    const evidence = liveClimate?.flagEvidence?.[rf.id];
                    const isAutoFlagged = Boolean(evidence?.active);
                    const riskKey = climateRiskFactorToKey(rf.id);
                    const localizedTooltip = getClimateTooltip(riskKey, fieldDialect);
                    return (
                      <div
                        key={rf.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isActive}
                        onClick={() => handleToggleClimateRisk(rf.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleClimateRisk(rf.id);
                          }
                        }}
                        className={`min-h-[124px] p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500 text-amber-100'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 font-bold text-xs sm:text-sm">
                            <span className="inline-flex items-center flex-wrap leading-snug">
                              <span>
                                {rf.emoji} {localizedTooltip.title}
                              </span>
                              <ClimateTooltip
                                label={localizedTooltip.title}
                                detail={localizedTooltip.detail}
                                locale={fieldDialect}
                                onSpeak={(txt) => handleSpeakPhrase(txt, fieldDialect)}
                              />
                            </span>
                            <input
                              type="checkbox"
                              checked={isActive}
                              readOnly
                              tabIndex={-1}
                              aria-hidden="true"
                              className="accent-amber-500 rounded w-4 h-4 shrink-0 mt-0.5 pointer-events-none"
                            />
                          </div>
                          {fieldDialect !== 'en' && (
                            <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                              {rf.label}
                            </div>
                          )}
                          <p className="text-[11px] text-stone-300/90 mt-1.5 leading-snug">
                            {evidence ? evidence.reason : localizedTooltip.detail}
                          </p>
                        </div>
                        {evidence && (
                          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 text-[10px]">
                            <span className="font-mono text-sky-300 truncate">
                              {evidence.metricSummary}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                isAutoFlagged
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isActive
                                  ? 'bg-amber-500/20 text-amber-200'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {isAutoFlagged ? 'LIVE AUTO' : isActive ? 'MANUAL' : 'CLEAR'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick Symptom Selector if user opened Step 2 directly before picking Step 1 symptoms */}
                {selectedSymptoms.length === 0 && !customNote.trim() && !bpSystolic && !temperature && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/35 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-amber-200">
                        Tap a presenting symptom below to test live cross-referencing immediately (or return to Step 1 for full vitals):
                      </div>
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer"
                      >
                        Full Patient Intake
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Severe headache, blurry vision, or seeing spots',
                        'Sudden swelling of face or hands',
                        'Dizziness, excessive fatigue, or mild dehydration during extreme heat / high humidity',
                        'High fever (>38°C) with shaking chills or rigors',
                        'Fever with yellowing eyes (jaundice), dark urine, extreme lethargy, or unable to keep fluids down',
                        'Acute watery diarrhea or stomach cramps after flooding / borehole contamination',
                      ].map((chipLabel) => (
                        <button
                          key={chipLabel}
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            handleToggleSymptom(chipLabel);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-950/90 hover:bg-stone-800 text-stone-200 border border-stone-700 text-[11px] font-medium text-left cursor-pointer transition-colors"
                        >
                          + {chipLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3">
                    <span>{formError}</span>
                    <button
                      type="button"
                      onClick={() => setFormError(null)}
                      className="text-rose-200 hover:text-white font-bold px-2 py-1 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Live Cross-Referenced Matches Panel */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-200">
                      Automatic Rule Cross-Reference Results
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-stone-400 tabular-nums">
                      <span>
                        {selectedSymptoms.length} symptom{selectedSymptoms.length === 1 ? '' : 's'}
                      </span>
                      <span>·</span>
                      <span className="text-amber-300 font-semibold">
                        {crossReferencedRules.length} climate rule{crossReferencedRules.length === 1 ? '' : 's'} matched
                      </span>
                    </div>
                  </div>

                  {crossReferencedRules.length > 0 ? (
                    <div className="space-y-2.5">
                      {crossReferencedRules.map(({ rule, matchReason }) => {
                        const isLevel1 = rule.severity === 'EMERGENCY';
                        return (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border space-y-2 ${
                              isLevel1
                                ? 'bg-rose-950/40 border-rose-500/60'
                                : 'bg-orange-950/35 border-orange-500/50'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm font-bold text-white">
                                {rule.ruleSet}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                                  isLevel1
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-orange-500 text-stone-950'
                                }`}
                              >
                                {isLevel1 ? (
                                  <AlertOctagon className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                )}
                                <span>{isLevel1 ? 'Level 1 Emergency' : 'Level 2 Urgent'}</span>
                              </span>
                            </div>
                            <p className="text-xs text-amber-200 font-medium">
                              Match trigger: {matchReason}
                            </p>
                            <p className="text-xs text-stone-300 leading-relaxed">
                              Protocol preview: {rule.action}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 space-y-1">
                      <div className="font-semibold text-stone-200">
                        No specialized climate-escalation rule triggered from current symptoms
                      </div>
                      <p className="text-stone-400">
                        Proceeding will evaluate standard WHO obstetric danger signs and routine antenatal / postpartum protocols against your selected symptoms.
                      </p>
                    </div>
                  )}
                </div>

                {/* Ibibio / Ibeno Phrasebook Drawer */}
                <div className="pt-2 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowClimateLexicon((prev) => !prev)}
                    className="min-h-[40px] text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Languages className="w-4 h-4" />
                    <span>
                      {showClimateLexicon
                        ? 'Hide Ibibio / Ibeno Field Phrasebook & Offline Rule Matrix'
                        : 'Open Offline Ibibio [ibb] / Ibeno [ibn] Verification Phrasebook'}
                    </span>
                  </button>

                  {showClimateLexicon && (
                    <div className="mt-3 space-y-4">
                      {/* Clinical Climate-Health Triage Phrases */}
                      <div className="grid grid-cols-1 gap-2">
                        {IBIBIO_CLIMATE_LEXICON.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-amber-300">
                                {item.concept} · <span className="text-stone-300 font-normal">"{item.englishPrompt}"</span>
                              </div>
                              <div className="text-emerald-300 font-semibold">
                                {item.ibibioEquivalent}
                              </div>
                              {item.phoneticGuide && (
                                <div className="text-[11px] font-mono text-sky-300/90">
                                  Pronunciation: {item.phoneticGuide}
                                </div>
                              )}
                              <div className="text-[11px] text-stone-400">{item.gloss}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomNote((prev) =>
                                  prev ? `${prev}; ${item.concept}: ${item.ibibioEquivalent}` : `${item.concept}: ${item.ibibioEquivalent}`
                                );
                                handleSpeakPhrase(item.ibibioEquivalent, fieldDialect === 'en' ? 'ibb' : fieldDialect);
                              }}
                              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer border transition-colors ${
                                isPronunciationPlaying && activePronunciationTerm === item.ibibioEquivalent
                                  ? 'bg-emerald-600 text-white border-emerald-400'
                                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Speak &amp; Append</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Native Ibibio [ibb] & Coastal Ibeno [ibn / Ibọnọ] Pronunciation Reference */}
                      {(() => {
                        const isIbenoRef = pronunciationRefDialect === 'ibn';
                        const activeRef = isIbenoRef
                          ? IBENO_YOUTUBE_REFERENCE
                          : IBIBIO_YOUTUBE_REFERENCE;
                        const activeRules = isIbenoRef ? IBENO_SOUND_RULES : IBIBIO_SOUND_RULES;
                        const activePhrases = isIbenoRef
                          ? IBENO_LESSON_PHRASES
                          : IBIBIO_LESSON_PHRASES.filter((p) => p.category !== 'clinical');

                        return (
                          <div className="p-3.5 rounded-xl bg-stone-950/90 border border-amber-500/25 space-y-3">
                            {/* Dialect Reference Switcher */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800/80">
                              <div className="inline-flex rounded-lg bg-stone-900 p-1 border border-stone-800">
                                <button
                                  type="button"
                                  onClick={() => setPronunciationRefDialect('ibb')}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                    !isIbenoRef
                                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                                      : 'text-stone-400 hover:text-stone-200'
                                  }`}
                                >
                                  Ibibio [ibb] · Uyai Akwa Ibom
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPronunciationRefDialect('ibn')}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                    isIbenoRef
                                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                                      : 'text-stone-400 hover:text-stone-200'
                                  }`}
                                >
                                  Ibeno [ibn / Ibọnọ] · Feminine Voice
                                </button>
                              </div>
                              <span className="text-[11px] font-medium text-emerald-300/90">
                                {activeRef.voiceNote}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-bold text-amber-300">
                                  {isIbenoRef
                                    ? `Native Coastal Ibeno (Ibọnọ) Pronunciation Guide · ${activeRef.channel}`
                                    : `Native Ibibio Pronunciation Guide · ${activeRef.channel}`}
                                </div>
                                <p className="text-[11px] text-stone-400">
                                  {isIbenoRef
                                    ? `Calibrated to "${activeRef.title}" — modeled on coastal Ibeno speaker phonology and synthesized in a warm feminine voice.`
                                    : `Calibrated to "${activeRef.title}" — tap any sound key or phrase to hear Akwa Ibom pronunciation.`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setShowYoutubePronunciation((prev) => !prev)}
                                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/35 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>{showYoutubePronunciation ? 'Hide Reference Video' : 'Watch Reference Video'}</span>
                                </button>
                                <a
                                  href={activeRef.watchUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>YouTube</span>
                                </a>
                              </div>
                            </div>

                            {showYoutubePronunciation && (
                              <div className="rounded-lg overflow-hidden border border-stone-800 bg-black aspect-video">
                                <iframe
                                  key={activeRef.videoId}
                                  src={activeRef.embedUrl}
                                  title={activeRef.title}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              </div>
                            )}

                            {/* Vowel & Digraph Key */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                              {activeRules.map((rule) => (
                                <button
                                  key={`${pronunciationRefDialect}-${rule.grapheme}`}
                                  type="button"
                                  onClick={() =>
                                    handleSpeakPhrase(rule.exampleIbibio, pronunciationRefDialect)
                                  }
                                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                                    isPronunciationPlaying &&
                                    activePronunciationTerm === rule.exampleIbibio
                                      ? 'bg-emerald-950/70 border-emerald-500/60'
                                      : 'bg-stone-900/90 hover:bg-stone-800/90 border-stone-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-amber-300">
                                      {rule.grapheme}
                                    </span>
                                    <span className="text-[10px] font-mono text-stone-400">
                                      {rule.ipa}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-emerald-300 font-semibold mt-1">
                                    {rule.exampleIbibio}{' '}
                                    <span className="text-sky-300 font-mono font-normal">
                                      ({rule.examplePhonetic})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                                    {rule.soundCue}
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Everyday Patient Intake Greetings, Body Parts & Coastal Clinical Phrases */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {activePhrases.map((phrase) => {
                                const active =
                                  isPronunciationPlaying &&
                                  activePronunciationTerm === phrase.ibibio;
                                return (
                                  <button
                                    key={phrase.id}
                                    type="button"
                                    onClick={() =>
                                      handleSpeakPhrase(phrase.ibibio, pronunciationRefDialect)
                                    }
                                    className={`p-2.5 rounded-lg border text-left flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                                      active
                                        ? 'bg-emerald-950/70 border-emerald-500/60'
                                        : 'bg-stone-900/70 hover:bg-stone-800/80 border-stone-800'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-emerald-300 truncate">
                                        {phrase.ibibio}{' '}
                                        <span className="text-stone-300 font-normal">
                                          · {phrase.english}
                                        </span>
                                      </div>
                                      <div className="text-[11px] font-mono text-sky-300/90">
                                        {phrase.phonetic}
                                      </div>
                                    </div>
                                    <Volume2
                                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                        active ? 'text-emerald-300' : 'text-amber-300'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Step 2 Navigation Footer */}
                <div className="pt-3 border-t border-stone-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="min-h-[46px] px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Patient Intake</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunTriage}
                    disabled={isLoading}
                    className="min-h-[48px] px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Action Card...</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Generate Action Card &amp; Log Encounter</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CLEAR ACTION CARDS */}
          {wizardStep === 3 && result && (
            <div className="space-y-5">
              {/* Dominant Severity Banner Card */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${
                  result.severity === 'EMERGENCY'
                    ? 'bg-stone-900 border-rose-500'
                    : result.severity === 'URGENT'
                    ? 'bg-stone-900 border-orange-500'
                    : 'bg-stone-900 border-emerald-500'
                }`}
              >
                {/* Unmistakable Color-Coded Severity Badge + Spoken Audio Control */}
                <div
                  className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    result.severity === 'EMERGENCY'
                      ? 'bg-rose-600 text-white'
                      : result.severity === 'URGENT'
                      ? 'bg-orange-500 text-stone-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {result.severity === 'EMERGENCY' ? (
                      <AlertOctagon className="w-6 h-6 shrink-0" />
                    ) : result.severity === 'URGENT' ? (
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                        {result.severity === 'EMERGENCY'
                          ? 'Level 1 Emergency · Immediate Hospital Referral'
                          : result.severity === 'URGENT'
                          ? 'Level 2 Urgent · Same-Day Clinical Treatment'
                          : 'Level 3 Standard · Routine Antenatal Guidance'}
                      </div>
                      <div className="text-[11px] opacity-90">
                        {patientAgeBand.replace('_', '–').replace('under–', 'Under ').replace('–plus', '+')} yrs
                        {' · '}
                        {patientType === 'pregnant'
                          ? `Pregnant (Week ${gestationWeeks})`
                          : patientType === 'postpartum'
                          ? `Postpartum (Day ${postpartumDays})`
                          : 'Non-Pregnant'}
                        {bpSystolic && bpDiastolic ? ` · BP ${bpSystolic}/${bpDiastolic} mmHg` : ''}
                        {temperature ? ` · Temp ${temperature}°C` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeakPhrase(
                          `${result.headline}. ${result.immediateActions?.slice(0, 2).join('. ')}`
                        )
                      }
                      className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        result.severity === 'URGENT'
                          ? 'bg-stone-950 text-white hover:bg-stone-800'
                          : 'bg-black/25 text-white hover:bg-black/40'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>
                        {isPronunciationPlaying ? 'Stop Voice' : `Play Guidance (${fieldDialect.toUpperCase()})`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Headline & Explanation */}
                <div className="space-y-2.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {result.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {result.plainLanguageExplanation}
                  </p>

                  {activeClimateRisks.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Active Climate Risks ({fieldDialect.toUpperCase()}):
                      </span>
                      {activeClimateRisks.map((rfId) => (
                        <RiskBadge
                          key={rfId}
                          risk={climateRiskFactorToKey(rfId)}
                          locale={fieldDialect}
                          onSpeak={(txt) => handleSpeakPhrase(txt, fieldDialect)}
                        />
                      ))}
                      <div
                        className="inline-flex rounded-lg bg-stone-950 p-0.5 border border-stone-800 ml-auto"
                        role="group"
                        aria-label="Action card climate tooltip locale"
                      >
                        {(['en', 'ibb', 'ibn'] as const).map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => handleSelectDialect(loc)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              fieldDialect === loc
                                ? 'bg-amber-500 text-stone-950'
                                : 'text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Level 1 / Urgent Triage Escalation Card (Localized Tooltip + LGA Hub + Infobip Dispatch) */}
                {(result.severity === 'EMERGENCY' || result.severity === 'URGENT') && (
                  <TriageEscalationCard
                    encounterId={savedEncounterId || 'ENC-LOCAL-01'}
                    patientLabel={`${
                      patientType === 'pregnant'
                        ? `Pregnant Wk ${gestationWeeks}`
                        : patientType === 'postpartum'
                        ? `Postpartum Day ${postpartumDays}`
                        : 'Non-Pregnant'
                    } (${patientAgeBand.replace('_', '–').replace('under–', '<').replace('–plus', '+')} yrs)`}
                    defaultLga={
                      (['UYO', 'IBENO', 'MBO'].includes(selectedClimateLga.toUpperCase())
                        ? selectedClimateLga.toUpperCase()
                        : 'UYO') as SupportedLga
                    }
                    defaultLocale={fieldDialect}
                    defaultRisk={
                      activeClimateRisks.length > 0
                        ? climateRiskFactorToKey(activeClimateRisks[0])
                        : 'heat_stress'
                    }
                    onLocaleChange={handleSelectDialect}
                    onSpeak={(txt, loc) => handleSpeakPhrase(txt, loc)}
                  />
                )}

                {/* Two-Column Action & Referral Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: Immediate Actions & Clinical Protocols */}
                  <div className="lg:col-span-7 space-y-4">
                    {result.dangerSignsDetected && result.dangerSignsDetected.length > 0 && (
                      <div className="bg-rose-950/45 border border-rose-500/40 rounded-xl p-4 space-y-2">
                        <span className="text-xs font-bold text-rose-300 block">
                          Triggering Clinical &amp; Climate Danger Signs
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-stone-200">
                          {result.dangerSignsDetected.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                        Immediate Steps for CHW, Mother &amp; Family
                      </h4>
                      <div className="space-y-2">
                        {result.immediateActions?.map((act, i) => (
                          <div
                            key={i}
                            className="bg-stone-950/80 border border-stone-800 p-3.5 rounded-xl text-xs sm:text-sm text-stone-100 flex items-start gap-3"
                          >
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.chwClinicalNotes && result.chwClinicalNotes.length > 0 && (
                      <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-xl space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-amber-400" />
                          <span>Clinical Protocol Instructions</span>
                        </h4>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-300 leading-relaxed">
                          {result.chwClinicalNotes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right: Referral Steps, Offline Encounter Record & Attestation */}
                  <div className="lg:col-span-5 space-y-4">
                    <div
                      className={`p-4 rounded-xl border space-y-3 ${
                        result.severity === 'EMERGENCY'
                          ? 'bg-rose-950/35 border-rose-500/50'
                          : 'bg-stone-950/80 border-stone-800'
                      }`}
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Referral Threshold &amp; Next Steps</span>
                      </h4>
                      <p className="text-xs text-stone-200 leading-relaxed">
                        {result.whenToRushToHospital}
                      </p>
                      <div className="flex flex-col gap-2 pt-1">
                        {result.severity === 'EMERGENCY' && (
                          <button
                            type="button"
                            onClick={onOpenEmergency}
                            className="min-h-[44px] w-full px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <AlertOctagon className="w-4 h-4" />
                            <span>Open Emergency Referral Contacts</span>
                          </button>
                        )}
                        {(result.severity === 'EMERGENCY' || result.severity === 'URGENT') && (
                          dispatchedMidwifeAlert ? (
                            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs space-y-1">
                              <div className="flex items-center justify-between text-emerald-300 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>On-Call Midwife Notified ({dispatchedMidwifeAlert.lga})</span>
                                </span>
                                <span className="font-mono tabular-nums">{dispatchedMidwifeAlert.dispatchLatencyMs}ms</span>
                              </div>
                              <div className="text-[11px] text-stone-300 font-mono">
                                {dispatchedMidwifeAlert.alertId} · INFOBIP SMS ({dispatchedMidwifeAlert.languageCode.toUpperCase()}) ·{' '}
                                {dispatchedMidwifeAlert.mode === 'infobip_live'
                                  ? 'Infobip Live'
                                  : dispatchedMidwifeAlert.mode === 'dry_run'
                                  ? 'Infobip Dry-Run'
                                  : 'Hub SLA Sandbox'}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isDispatchingMidwife}
                              onClick={() => handleEscalateToMidwife()}
                              className="min-h-[44px] w-full px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <BellRing className="w-4 h-4 text-amber-400" />
                              <span>
                                {isDispatchingMidwife
                                  ? 'Dispatching Infobip SMS Alert...'
                                  : `Alert On-Call Regional Midwife (Infobip SMS · ${fieldDialect.toUpperCase()})`}
                              </span>
                            </button>
                          )
                        )}
                        {onOpenFacilities && (
                          <button
                            type="button"
                            onClick={onOpenFacilities}
                            className="min-h-[44px] w-full px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-amber-400" />
                            <span>Locate Nearest Accredited PHC / Hospital</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {savedEncounterId && (
                      <div className="bg-emerald-950/40 border border-emerald-500/35 rounded-xl p-3.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2 text-emerald-300 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Offline Encounter Logged</span>
                          </span>
                          <span className="font-mono text-[11px] text-amber-300">
                            status: pending
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-300 font-mono tabular-nums">
                          ID: {savedEncounterId}
                        </div>
                      </div>
                    )}

                    {/* Algorand Decentralized Health Attestation */}
                    <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Algorand Clinical Attestation</span>
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          Ed25519
                        </span>
                      </div>

                      {notarizedReceipt ? (
                        <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-emerald-300 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Anchored on Algorand Ledger</span>
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-stone-300 space-y-0.5 bg-black/40 p-1.5 rounded">
                            <div>TxID: <span className="text-amber-300 font-bold">{notarizedReceipt.txId}</span></div>
                            <div>Hash: <span className="text-stone-400">{notarizedReceipt.sha256Hash.slice(0, 24)}...</span></div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAnchorTriage}
                          disabled={isNotarizing}
                          className="min-h-[44px] w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 hover:border-amber-500/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isNotarizing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>Signing Record...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>Anchor Triage Record to Algorand</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {(result.headline.includes('FISTULA') || result.headline.includes('VVF')) && onOpenVvf && (
                      <button
                        type="button"
                        onClick={onOpenVvf}
                        className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>Open VVF Care &amp; Free Surgical Centers</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Step 3 Footer Controls */}
                <div className="pt-3 border-t border-stone-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="min-h-[44px] px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Adjust Climate Flags / Symptoms</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Start New Patient Triage</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Quick Explore Banner for Women's Ailments & Prevention */}
      <div className="bg-gradient-to-r from-stone-900 via-rose-950/40 to-stone-900 border border-rose-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            In-Depth Prevention & Clinical Guides
          </span>
          <h4 className="text-sm sm:text-base font-bold text-white">
            Explore Women's Ailments, Gynecological Health & Prevention Protocols
          </h4>
          <p className="text-xs text-stone-300 max-w-2xl">
            Evidence-based lifecourse profiles for Cervical Cancer, Breast Lumps, Fibroids, PID, PCOS, Prolapse, Obstetric Fistula, UTIs, and Osteoporosis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMainView('ailments')}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-sm"
        >
          View Ailments & Preventions
        </button>
      </div>
    </>
  )}
</div>
);
};
