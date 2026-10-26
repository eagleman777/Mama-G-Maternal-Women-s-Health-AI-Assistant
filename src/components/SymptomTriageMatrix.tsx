import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  Stethoscope,
  Info,
  ArrowRight,
  ShieldAlert,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { StructuredTriageResult, SupportedLanguage, TriageSeverity } from '../types';
import { EMERGENCY_RED_FLAGS } from '../data/clinicalKnowledge';
import { WomenAilmentsSection } from './WomenAilmentsSection';

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
  const [patientType, setPatientType] = useState<'pregnant' | 'postpartum' | 'non_pregnant'>('pregnant');
  const [gestationWeeks, setGestationWeeks] = useState<number>(28);
  const [postpartumDays, setPostpartumDays] = useState<number>(3);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [bpSystolic, setBpSystolic] = useState<string>('');
  const [bpDiastolic, setBpDiastolic] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StructuredTriageResult | null>(null);

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
  };

  const runLocalOfflineTriage = (): StructuredTriageResult => {
    const isBpHigh = Number(bpSystolic) >= 140 || Number(bpDiastolic) >= 90;
    const isBpSevere = Number(bpSystolic) >= 160 || Number(bpDiastolic) >= 110;
    const isFever = Number(temperature) >= 38.0;

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
        s.includes('green')
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
      alert('Please select at least one symptom or enter your vitals to evaluate.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          pregnancyStatus: patientType,
          gestationWeeks: patientType === 'pregnant' ? gestationWeeks : undefined,
          postpartumDays: patientType === 'postpartum' ? postpartumDays : undefined,
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

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.warn('Falling back to local WHO triage rule engine:', err);
      const fallbackResult = runLocalOfflineTriage();
      setResult(fallbackResult);
    } finally {
      setIsLoading(false);
    }
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
        <div className="shrink-0 flex items-center gap-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Symptom Checklist */}
            <div className="lg:col-span-7 space-y-5">
              {/* Step 1: Patient Context */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                  Patient Condition
                </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPatientType('pregnant')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  patientType === 'pregnant'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                Pregnant Mother
              </button>
              <button
                type="button"
                onClick={() => setPatientType('postpartum')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  patientType === 'postpartum'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                Postpartum (Delivered)
              </button>
              <button
                type="button"
                onClick={() => setPatientType('non_pregnant')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  patientType === 'non_pregnant'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                Non-Pregnant / Girl
              </button>
            </div>

            {patientType === 'pregnant' && (
              <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700 flex items-center justify-between text-xs">
                <span className="text-stone-300">Gestational Age:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={4}
                    max={42}
                    value={gestationWeeks}
                    onChange={(e) => setGestationWeeks(Number(e.target.value))}
                    className="w-32 accent-amber-500"
                  />
                  <span className="font-bold text-amber-300 w-16 text-right">
                    Week {gestationWeeks}
                  </span>
                </div>
              </div>
            )}

            {patientType === 'postpartum' && (
              <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700 flex items-center justify-between text-xs">
                <span className="text-stone-300">Days Since Delivery:</span>
                <select
                  value={postpartumDays}
                  onChange={(e) => setPostpartumDays(Number(e.target.value))}
                  className="bg-stone-800 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 focus:outline-none"
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

          {/* Step 2: Symptom Checklist */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                Select Observed Symptoms
              </h3>
              <span className="text-xs text-stone-400">
                {selectedSymptoms.length} selected
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {symptomChecklist.map((item) => {
                const isSelected = selectedSymptoms.includes(item.label);
                const isDanger = item.category === 'danger';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleSymptom(item.label)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? isDanger
                          ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-sm'
                          : 'bg-amber-950/80 border-amber-500 text-amber-100 shadow-sm'
                        : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="mt-1 rounded accent-amber-500 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    {isDanger && (
                      <span className="text-[10px] uppercase font-bold text-rose-400 px-2 py-0.5 bg-rose-500/20 rounded shrink-0">
                        Danger Sign
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Optional Vitals (For CHWs & Clinics) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
              Clinical Vitals (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300">Blood Pressure (mmHg):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Sys (120)"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-stone-400">/</span>
                  <input
                    type="number"
                    placeholder="Dia (80)"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300">Temperature (°C):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 37.2"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-stone-300 text-xs">Additional Notes / Observation:</label>
              <textarea
                rows={2}
                placeholder="e.g. Pale inner eyelids (conjunctiva), rapid breathing, pain started 4 hours ago..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-stone-800 text-stone-100 px-3 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleRunTriage}
              disabled={isLoading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>{isLoading ? 'Evaluating Clinical Triage...' : 'Evaluate Triage Level'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Triage Result Card */}
        <div className="lg:col-span-5">
          {result ? (
            <div
              className={`rounded-2xl border p-5 sm:p-6 shadow-xl space-y-5 sticky top-20 ${
                result.severity === 'EMERGENCY'
                  ? 'bg-stone-900 border-rose-600 text-stone-100'
                  : result.severity === 'URGENT'
                  ? 'bg-stone-900 border-amber-500 text-stone-100'
                  : 'bg-stone-900 border-emerald-600 text-stone-100'
              }`}
            >
              {/* Severity Pill / Header */}
              <div
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                  result.severity === 'EMERGENCY'
                    ? 'bg-rose-600 text-white'
                    : result.severity === 'URGENT'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  {result.severity === 'EMERGENCY' ? (
                    <AlertOctagon className="w-4 h-4" />
                  ) : result.severity === 'URGENT' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Triage Status: {result.severity}
                </span>

                {result.severity === 'EMERGENCY' && (
                  <button
                    onClick={onOpenEmergency}
                    className="underline hover:text-rose-100 text-[11px]"
                  >
                    View Emergency Contacts
                  </button>
                )}
              </div>

              {/* Headline */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {result.headline}
                </h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  {result.plainLanguageExplanation}
                </p>
              </div>

              {/* Danger Signs Found */}
              {result.dangerSignsDetected && result.dangerSignsDetected.length > 0 && (
                <div className="bg-rose-950/60 border border-rose-500/30 rounded-xl p-3 text-xs">
                  <span className="font-bold text-rose-300 block mb-1">
                    Danger Signs Identified:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-stone-300">
                    {result.dangerSignsDetected.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate Actions Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Immediate Actions for the Mother / Family:
                </span>
                <div className="space-y-1.5">
                  {result.immediateActions?.map((act, i) => (
                    <div
                      key={i}
                      className="bg-stone-800/80 border border-stone-700/80 p-2.5 rounded-lg text-xs text-stone-200 flex items-start gap-2"
                    >
                      <span className="font-bold text-amber-400 shrink-0">{i + 1}.</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHW Clinical Notes */}
              {result.chwClinicalNotes && result.chwClinicalNotes.length > 0 && (
                <div className="bg-stone-800/50 border border-stone-700 p-3 rounded-xl space-y-1.5 text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                    Community Health Worker (CHW) Guide:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 text-[11px]">
                    {result.chwClinicalNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* When to Rush */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-xs">
                <span className="font-semibold text-rose-300 block">
                  Hospital Referral Threshold:
                </span>
                <span className="text-stone-300 text-[11px] mt-0.5 block">
                  {result.whenToRushToHospital}
                </span>
              </div>

              {/* Direct Link to VVF Hub if Fistula Detected */}
              {(result.headline.includes('FISTULA') || result.headline.includes('VVF')) && onOpenVvf && (
                <button
                  type="button"
                  onClick={onOpenVvf}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Open VVF Care, Recovery Progress & Free Centers ➔</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-stone-900 border border-dashed border-stone-800 rounded-2xl p-8 text-center text-stone-400 space-y-3">
              <HeartPulse className="w-10 h-10 text-stone-600 mx-auto" />
              <h4 className="font-semibold text-stone-300 text-sm">
                No Triage Evaluated Yet
              </h4>
              <p className="text-xs max-w-xs mx-auto text-stone-500">
                Select your symptoms and tap 'Evaluate Triage Level' to view the color-coded severity assessment, mother action steps, and CHW clinical guidance.
              </p>
            </div>
          )}
        </div>
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
