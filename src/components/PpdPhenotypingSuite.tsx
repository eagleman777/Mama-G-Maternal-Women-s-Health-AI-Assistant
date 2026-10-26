import React, { useState } from 'react';
import {
  Brain,
  Moon,
  Heart,
  Pill,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  MessageSquare,
  ShieldAlert,
  Info,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Activity,
  X,
  Volume2,
} from 'lucide-react';
import {
  NUTRITIONAL_REPLETION_PROTOCOLS,
  MAMA_G_SYSTEM_PROMPT_TEMPLATE,
  ABSOLUTE_NEGATIVE_LEXICON,
  FIRST_PERSON_PRONOUNS,
} from '../data/ppdData';
import {
  PpdLanguageAnalysis,
  PpdCircadianMetrics,
  PpdBondingMetrics,
  NutritionalRepletionItem,
} from '../types';

interface PpdPhenotypingSuiteProps {
  onOpenEmergency: () => void;
}

export const PpdPhenotypingSuite: React.FC<PpdPhenotypingSuiteProps> = ({
  onOpenEmergency,
}) => {
  // Navigation sub-tabs within the Suite
  const [activeSubTab, setActiveSubTab] = useState<'language' | 'circadian' | 'bonding' | 'nutrition' | 'prompt'>('language');

  // --- 1. Language & Communication Analyzer State ---
  const [inputText, setInputText] = useState<string>(
    'I feel like I am completely failing my baby. I never do anything right and nobody understands. My husband tries to help but I am just broken. I feel empty and worthless as a mother.'
  );
  const [cadenceDays, setCadenceDays] = useState<number>(4);

  // --- 2. Circadian & Rest Tracker State ---
  const [circadianMetrics, setCircadianMetrics] = useState<PpdCircadianMetrics>({
    totalSleepHours: 4.5,
    wakeupsCount: 6,
    nighttimeHyperVigilance: 'Severe',
    longestUninterruptedBlockHours: 2.0,
    restQualityRating: 2,
    circadianDisruptionScore: 78,
  });

  // --- 3. Bonding & Executive Function Monitor State ---
  const [bondingMetrics, setBondingMetrics] = useState<PpdBondingMetrics>({
    attachmentSpectrum: 'Hyper-Fixated & Vigilant',
    attachmentScore: 82, // > 70 is hyper-fixated, < 30 is detached
    executiveParalysisScore: 8, // 1-10
    intrusiveThoughtsFrequency: 'Daily',
    partnerFamilyAssistanceAcceptance: false,
    bondingRiskFlags: [
      'Refusal to allow partner to hold baby due to contamination fears',
      'Intrusive images of accidental harm during stairs/bathing',
      'Severe decision-making paralysis regarding simple feeding choices',
    ],
  });

  // --- 4. Nutritional Protocol Modal State ---
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState<boolean>(false);
  const [selectedNutrient, setSelectedNutrient] = useState<NutritionalRepletionItem>(
    NUTRITIONAL_REPLETION_PROTOCOLS[0]
  );

  // --- 5. AI Studio Prompt Generator State ---
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [promptPatientContext, setPromptPatientContext] = useState({
    weeksPostpartum: 4,
    epdsScore: 16,
    predominantPhenotype: 'Hyper-Vigilant Insomnia & Decision Paralysis',
    lactationStatus: 'Exclusive Breastfeeding',
    anemiaStatus: 'Mild (Hb 10.2 g/dL, Ferritin 18 ng/mL)',
  });

  // Compute Language Analysis dynamically
  const analyzeLinguisticIndicators = (text: string, cadence: number): PpdLanguageAnalysis => {
    const words: string[] = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const totalWordCount = words.length;

    const foundNegatives = ABSOLUTE_NEGATIVE_LEXICON.filter((term) => {
      if (term.includes(' ')) {
        return text.toLowerCase().includes(term);
      }
      return words.includes(term);
    });

    const firstPersonCount = words.filter((w) => FIRST_PERSON_PRONOUNS.includes(w)).length;
    const pronounRatio = totalWordCount > 0 ? (firstPersonCount / totalWordCount) * 100 : 0;

    // Cadence drop alert (silence or spacing > 3 days)
    const cadenceDropAlert = cadence >= 3;

    // Linguistic risk calculation
    let riskScore = 0;
    riskScore += foundNegatives.length * 15;
    if (pronounRatio > 12) riskScore += 25; // High self-referential rumination
    if (cadenceDropAlert) riskScore += 20;

    riskScore = Math.min(100, Math.max(0, riskScore));

    let tier: 'Low' | 'Moderate' | 'Elevated' | 'Severe' = 'Low';
    if (riskScore >= 75) tier = 'Severe';
    else if (riskScore >= 50) tier = 'Elevated';
    else if (riskScore >= 25) tier = 'Moderate';

    const observations: string[] = [];
    if (foundNegatives.length > 0) {
      observations.push(`Detected ${foundNegatives.length} absolute negative or self-disparaging terms ("${foundNegatives.slice(0, 3).join('", "')}")`);
    }
    if (pronounRatio > 10) {
      observations.push(`High first-person pronoun density (${pronounRatio.toFixed(1)}%), indicative of insular depressive self-rumination`);
    }
    if (cadenceDropAlert) {
      observations.push(`Communication frequency drop (${cadence} days between updates), signaling social withdrawal and behavioral shutdown`);
    }

    return {
      analyzedText: text,
      absoluteNegativeWordsFound: foundNegatives,
      firstPersonPronounCount: firstPersonCount,
      totalWordCount,
      pronounRatio,
      updateCadenceDays: cadence,
      cadenceDropAlert,
      linguisticRiskScore: riskScore,
      linguisticTier: tier,
      sentimentObservations: observations,
    };
  };

  const languageAnalysis = analyzeLinguisticIndicators(inputText, cadenceDays);

  const calculateCircadianDisruption = (
    sleepHrs: number,
    wakeups: number,
    blockHrs: number,
    vigilance: string
  ) => {
    let score = 0;
    if (sleepHrs < 5) score += 35;
    else if (sleepHrs < 6.5) score += 20;

    if (wakeups >= 5) score += 25;
    else if (wakeups >= 3) score += 15;

    if (blockHrs < 3) score += 30; // Missing the crucial 4-hour consolidated block
    else if (blockHrs < 4) score += 15;

    if (vigilance === 'Severe') score += 25;
    else if (vigilance === 'Moderate') score += 15;

    return Math.min(100, score);
  };

  const handleCircadianUpdate = (updates: Partial<PpdCircadianMetrics>) => {
    const updated = { ...circadianMetrics, ...updates };
    const score = calculateCircadianDisruption(
      updated.totalSleepHours,
      updated.wakeupsCount,
      updated.longestUninterruptedBlockHours,
      updated.nighttimeHyperVigilance
    );
    setCircadianMetrics({ ...updated, circadianDisruptionScore: score });
  };

  const handleCopyPrompt = () => {
    const promptText = `${MAMA_G_SYSTEM_PROMPT_TEMPLATE}

--- REAL-TIME PATIENT CASE METADATA ---
- Postpartum Duration: ${promptPatientContext.weeksPostpartum} weeks
- Clinical EPDS Score: ${promptPatientContext.epdsScore} / 30
- Primary Phenotype: ${promptPatientContext.predominantPhenotype}
- Lactation Status: ${promptPatientContext.lactationStatus}
- Anemia & Biochemical Status: ${promptPatientContext.anemiaStatus}

INSTRUCTIONS FOR GEMINI MODEL:
Perform a multi-dimensional perinatal assessment. Address the language indicators, prescribe a structured nighttime sleep-shift plan, and recommend accessible local food sources for micronutrient repletion (Omega-3 EPA/DHA, Ferritin, Magnesium, and Vitamin D3).`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 text-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Mama-G Perinatal & Postpartum Phenotyping Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            PPD Risk Assessment & Behavioral Phenotyping Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Objective multidimensional tracking for Perinatal Mood and Anxiety Disorders (PMAD) across linguistic markers, circadian fragmentation, caregiving attachment extremes, and biochemical repletion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNutritionModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Pill className="w-4 h-4" />
            <span>Biochemical Protocol</span>
          </button>
          <button
            onClick={() => setActiveSubTab('prompt')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Studio Prompt Generator</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-stone-900 border border-stone-800 rounded-xl no-scrollbar">
        <button
          onClick={() => setActiveSubTab('language')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'language'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Language & Communication</span>
        </button>
        <button
          onClick={() => setActiveSubTab('circadian')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'circadian'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Circadian & Rest Tracker</span>
        </button>
        <button
          onClick={() => setActiveSubTab('bonding')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'bonding'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Bonding & Executive Function</span>
        </button>
        <button
          onClick={() => setActiveSubTab('prompt')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'prompt'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Direct Prompt</span>
        </button>
      </div>

      {/* ================= SECTION 1: LANGUAGE & COMMUNICATION ANALYZER ================= */}
      {activeSubTab === 'language' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input & Parameters (7 cols) */}
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Linguistic Stream & Dialogue Analyzer
              </h3>
              <span className="text-xs text-stone-400">
                {languageAnalysis.totalWordCount} words parsed
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Input patient messages, voice-transcribed confessions, or field clinic interview notes to automatically detect linguistic markers of depression (absolute thinking, pronoun isolation, and communication drops).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                Patient Message / Self-Reported Text:
              </label>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type patient statements..."
                className="w-full bg-stone-800 text-stone-100 text-xs sm:text-sm p-3.5 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Communication Cadence Input */}
            <div className="bg-stone-800/60 p-3.5 rounded-xl border border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-stone-200 block">
                  Communication Cadence & Response Latency:
                </span>
                <span className="text-[11px] text-stone-400">
                  Days elapsed since mother's previous contact or clinic check-in
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={14}
                  value={cadenceDays}
                  onChange={(e) => setCadenceDays(Number(e.target.value))}
                  className="w-28 accent-amber-500"
                />
                <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                  cadenceDays >= 3 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-stone-700 text-stone-200'
                }`}>
                  {cadenceDays} Days
                </span>
              </div>
            </div>

            {/* Quick Preset Samples */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
                Test with Real Clinical Dialogue Phenotypes:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setInputText(
                      'I feel like a total failure. I can never soothe my baby and I feel empty inside. I am completely broken and useless.'
                    );
                    setCadenceDays(4);
                  }}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 transition-colors"
                >
                  Severe Self-Rumination
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText(
                      'I am terrified every second. I can not let anyone else hold him because they will drop him. I have not slept because I constantly watch his chest rise and fall.'
                    );
                    setCadenceDays(1);
                  }}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 transition-colors"
                >
                  Hyper-Vigilant Anxiety
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText(
                      'We had a calm morning today. The baby fed well and my sister helped me wash clothes. I am tired but feeling grateful.'
                    );
                    setCadenceDays(1);
                  }}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 transition-colors"
                >
                  Secure / Resilient
                </button>
              </div>
            </div>
          </div>

          {/* Linguistic Risk Score & Insights (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4 ${
              languageAnalysis.linguisticTier === 'Severe'
                ? 'bg-rose-950/40 border-rose-500 text-stone-100'
                : languageAnalysis.linguisticTier === 'Elevated'
                ? 'bg-amber-950/40 border-amber-500 text-stone-100'
                : 'bg-stone-900 border-stone-800 text-stone-100'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-stone-400">
                  Linguistic Risk Phenotype
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  languageAnalysis.linguisticTier === 'Severe'
                    ? 'bg-rose-600 text-white'
                    : languageAnalysis.linguisticTier === 'Elevated'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {languageAnalysis.linguisticTier} Risk ({languageAnalysis.linguisticRiskScore}/100)
                </span>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <span className="text-[11px] text-stone-400 block">Absolute Negatives</span>
                  <span className="text-xl font-bold text-rose-400 font-mono mt-0.5 block">
                    {languageAnalysis.absoluteNegativeWordsFound.length} terms
                  </span>
                  <span className="text-[10px] text-stone-500">Words like "never", "ruined"</span>
                </div>

                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <span className="text-[11px] text-stone-400 block">1st Person Pronouns</span>
                  <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
                    {languageAnalysis.pronounRatio.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-stone-500">I / me / my density</span>
                </div>
              </div>

              {/* Identified Words Pill Cloud */}
              {languageAnalysis.absoluteNegativeWordsFound.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold text-rose-300 block">
                    Flagged Negative Constructs:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {languageAnalysis.absoluteNegativeWordsFound.map((word, idx) => (
                      <span
                        key={idx}
                        className="bg-rose-500/20 text-rose-200 border border-rose-500/30 px-2 py-0.5 rounded text-xs font-mono"
                      >
                        "{word}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Observations */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-stone-300 block">
                  Clinical Synthesis:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-300">
                  {languageAnalysis.sentimentObservations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action trigger if severe */}
              {languageAnalysis.linguisticTier === 'Severe' && (
                <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-xl text-xs text-rose-200 flex items-start gap-2 mt-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">PPD / Perinatal Crisis Alert</span>
                    Linguistic score indicates profound despair and self-blame. Dispatch Community Health Extension Worker (CHEW) for immediate in-person assessment.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: CIRCADIAN & REST TRACKER ================= */}
      {activeSubTab === 'circadian' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                Nocturnal Sleep Architecture & Hyper-Vigilance Monitor
              </h3>
              <span className="text-xs bg-stone-800 border border-stone-700 px-2.5 py-0.5 rounded-full text-stone-300">
                Target: ≥ 4h Block
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Perinatal sleep fragmentation triggers microglial activation and cortisol overdrive. Maternal depression risk quadruples when longest uninterrupted sleep drops below 3 hours.
            </p>

            <div className="space-y-4 text-xs">
              {/* Total Sleep */}
              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-200 block">Total 24-Hour Sleep Duration:</span>
                  <span className="text-[11px] text-stone-400">Accumulated naps and nighttime hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={0.5}
                    value={circadianMetrics.totalSleepHours}
                    onChange={(e) => handleCircadianUpdate({ totalSleepHours: Number(e.target.value) })}
                    className="w-28 accent-amber-500"
                  />
                  <span className="font-bold text-amber-400 w-16 text-right font-mono">
                    {circadianMetrics.totalSleepHours} hrs
                  </span>
                </div>
              </div>

              {/* Nocturnal Wake-ups (Fragmentation) */}
              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-200 block">Nighttime Awakenings (Fragmentation):</span>
                  <span className="text-[11px] text-stone-400">Number of sleep interruptions per night</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={circadianMetrics.wakeupsCount}
                    onChange={(e) => handleCircadianUpdate({ wakeupsCount: Number(e.target.value) })}
                    className="w-28 accent-amber-500"
                  />
                  <span className="font-bold text-amber-400 w-16 text-right font-mono">
                    {circadianMetrics.wakeupsCount} times
                  </span>
                </div>
              </div>

              {/* Longest Uninterrupted Block */}
              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-200 block">
                      Longest Uninterrupted Sleep Block:
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Essential for slow-wave restorative neurogenesis
                    </span>
                  </div>
                  <span className="font-bold text-amber-400 font-mono text-sm">
                    {circadianMetrics.longestUninterruptedBlockHours} / 4.0 hrs target
                  </span>
                </div>

                {/* Progress bar to 4h target */}
                <div className="w-full bg-stone-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      circadianMetrics.longestUninterruptedBlockHours >= 4
                        ? 'bg-emerald-500'
                        : circadianMetrics.longestUninterruptedBlockHours >= 3
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (circadianMetrics.longestUninterruptedBlockHours / 4) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={0.5}
                    value={circadianMetrics.longestUninterruptedBlockHours}
                    onChange={(e) => handleCircadianUpdate({ longestUninterruptedBlockHours: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Nocturnal Hyper-Vigilance Level */}
              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-2">
                <span className="font-semibold text-stone-200 block">
                  Nighttime Hyper-Vigilance (Inability to Sleep When Baby Sleeps):
                </span>
                <p className="text-[11px] text-stone-400">
                  Lying awake listening obsessively for breathing, racing heartbeat, or sudden somatic panic.
                </p>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {(['None', 'Mild', 'Moderate', 'Severe'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleCircadianUpdate({ nighttimeHyperVigilance: lvl })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        circadianMetrics.nighttimeHyperVigilance === lvl
                          ? lvl === 'Severe'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Circadian Risk Score & Night Shift Action Plan (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4 ${
              circadianMetrics.circadianDisruptionScore >= 70
                ? 'bg-rose-950/40 border-rose-500 text-stone-100'
                : circadianMetrics.circadianDisruptionScore >= 40
                ? 'bg-amber-950/40 border-amber-500 text-stone-100'
                : 'bg-stone-900 border-stone-800 text-stone-100'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-stone-400">
                  Circadian Disruption Index
                </span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {circadianMetrics.circadianDisruptionScore} / 100
                </span>
              </div>

              {/* Status summary */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {circadianMetrics.longestUninterruptedBlockHours < 4
                    ? '⚠️ Critical Sleep Consolidation Deficit'
                    : '✅ Healthy Sleep Block Preserved'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {circadianMetrics.longestUninterruptedBlockHours < 4
                    ? 'The brain is deprived of restorative deep slow-wave REM cycles, leading to acute dopamine and serotonin receptor desensitization.'
                    : 'The mother is securing the necessary 4-hour consolidated block, dramatically buffering against PMAD escalation.'}
                </p>
              </div>

              {/* Prescribed Clinical Sleep Shift Plan */}
              <div className="bg-stone-900/80 border border-stone-700/80 p-3.5 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Prescribed 4-Hour Shift Protection Protocol:
                </span>
                <ul className="space-y-1.5 text-stone-300 text-[11px] list-disc pl-4">
                  <li><strong>Partner / Family Shift:</strong> Designated secondary caregiver takes baby from 8:00 PM – 12:00 AM or 4:00 AM – 8:00 AM in a separate room.</li>
                  <li><strong>Earplugs & Eye Mask:</strong> Reduces hyper-vigilant acoustic micro-awakenings to phantom baby cries.</li>
                  <li><strong>Targeted Evening Magnesium Glycinate (300-400mg):</strong> Suppresses nighttime NMDA hyperactivity and promotes muscle relaxation.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: BONDING & EXECUTIVE FUNCTION ================= */}
      {activeSubTab === 'bonding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-400" />
                Attachment Extremes & Decision-Making Paralysis
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                Attachment Index: {bondingMetrics.attachmentScore}/100
              </span>
            </div>
            <p className="text-xs text-stone-400">
              PPD does not present as simple sadness; it manifests across two toxic extremes: <strong>Hyper-Fixated Vigilance</strong> (compulsive control, fear of contamination) versus <strong>Detached Numbness</strong> (anhedonia, feeling baby is a stranger).
            </p>

            {/* Visual Attachment Slider Spectrum */}
            <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200">
                  Caregiving Behavioral Spectrum:
                </span>
                <span className="font-bold text-amber-300">
                  {bondingMetrics.attachmentScore < 35
                    ? 'Detached / Numbed'
                    : bondingMetrics.attachmentScore > 65
                    ? 'Hyper-Fixated & Vigilant'
                    : 'Secure & Responsive'}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={bondingMetrics.attachmentScore}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const spec =
                    val < 35
                      ? 'Detached / Numbed'
                      : val > 65
                      ? 'Hyper-Fixated & Vigilant'
                      : 'Secure & Balanced';
                  setBondingMetrics((prev) => ({
                    ...prev,
                    attachmentScore: val,
                    attachmentSpectrum: spec,
                  }));
                }}
                className="w-full accent-amber-500"
              />

              <div className="flex justify-between text-[11px] text-stone-400 pt-1">
                <span className="text-rose-300">0: Detached (Numb)</span>
                <span className="text-emerald-300 font-medium">50: Secure & Balanced</span>
                <span className="text-amber-300">100: Hyper-Fixated (Anxious)</span>
              </div>
            </div>

            {/* Executive Paralysis Scale (1-10) */}
            <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-200 block">
                    Decision-Making Paralysis (Executive Function):
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Difficulty making simple choices (e.g. what to wear, when to bathe baby, preparing food)
                  </span>
                </div>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {bondingMetrics.executiveParalysisScore} / 10
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                value={bondingMetrics.executiveParalysisScore}
                onChange={(e) =>
                  setBondingMetrics((prev) => ({
                    ...prev,
                    executiveParalysisScore: Number(e.target.value),
                  }))
                }
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-stone-400 block">
                {bondingMetrics.executiveParalysisScore >= 7
                  ? 'Severe mental fog and decision paralysis present. Mother requires simplified single-choice routines.'
                  : 'Normal cognitive bandwidth.'}
              </span>
            </div>

            {/* Intrusive Thoughts Frequency */}
            <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-2 text-xs">
              <span className="font-semibold text-stone-200 block">
                Frequency of Anxious Intrusive Thoughts:
              </span>
              <p className="text-[11px] text-stone-400">
                Sudden flashes of terrible harm coming to the baby (e.g., dropping baby, baby choking).
              </p>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {(['Never', 'Occasional', 'Daily', 'Continuous'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setBondingMetrics((prev) => ({ ...prev, intrusiveThoughtsFrequency: freq }))}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      bondingMetrics.intrusiveThoughtsFrequency === freq
                        ? freq === 'Continuous'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Synthesis & Guidance Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 text-xs">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block">
                Attachment Profile Synthesis
              </span>

              <div className="p-3.5 rounded-xl bg-stone-800 border border-stone-700 space-y-1">
                <span className="font-bold text-white block text-sm">
                  {bondingMetrics.attachmentSpectrum}
                </span>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  {bondingMetrics.attachmentSpectrum === 'Hyper-Fixated & Vigilant'
                    ? 'The mother is suffering from high autonomic arousal. She fears that relinquishing baby for even 10 minutes will lead to catastrophe. This drives exhaustion and postpartum OCD loops.'
                    : bondingMetrics.attachmentSpectrum === 'Detached / Numbed'
                    ? 'The mother is experiencing emotional blunting and anhedonia. She feels guilty for not feeling instant love. Reassurance that bond builds progressively through skin-to-skin contact is required.'
                    : 'Attachment is balanced and receptive to family support.'}
                </p>
              </div>

              {/* Actionable Behavioral Interventions */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-stone-200 block">
                  Prescribed Behavioral Prescriptions:
                </span>
                <div className="space-y-2 text-stone-300">
                  <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                    <span className="font-semibold text-amber-300 block mb-0.5">
                      1. "Low-Stakes" Decision Delegation:
                    </span>
                    Have family members handle all peripheral choices (food, laundry, diapers) without consulting the mother.
                  </div>
                  <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                    <span className="font-semibold text-amber-300 block mb-0.5">
                      2. Kangaroo Mother Care (Skin-to-Skin):
                    </span>
                    20 minutes of silent chest-to-chest contact releases oxytocin and calms the maternal amygdala without requiring cognitive exertion.
                  </div>
                  <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                    <span className="font-semibold text-amber-300 block mb-0.5">
                      3. Normalizing Intrusive Thoughts:
                    </span>
                    Educate mother that 90%+ of new mothers have intrusive scary thoughts; having them does not mean she will act on them or is a "bad mother."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: AI STUDIO PROMPT GENERATOR ================= */}
      {activeSubTab === 'prompt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Prompt Parameter Configuration</span>
            </div>
            <p className="text-stone-400 text-xs">
              Customize the patient case parameters below to generate an optimized system prompt for Gemini models in Google AI Studio.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-stone-300 font-medium block mb-1">
                  Weeks Postpartum:
                </label>
                <input
                  type="number"
                  value={promptPatientContext.weeksPostpartum}
                  onChange={(e) =>
                    setPromptPatientContext((prev) => ({
                      ...prev,
                      weeksPostpartum: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">
                  EPDS Depression Score (0–30):
                </label>
                <input
                  type="number"
                  value={promptPatientContext.epdsScore}
                  onChange={(e) =>
                    setPromptPatientContext((prev) => ({
                      ...prev,
                      epdsScore: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">
                  Primary Behavioral Phenotype:
                </label>
                <select
                  value={promptPatientContext.predominantPhenotype}
                  onChange={(e) =>
                    setPromptPatientContext((prev) => ({
                      ...prev,
                      predominantPhenotype: e.target.value,
                    }))
                  }
                  className="w-full bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:outline-none"
                >
                  <option value="Hyper-Vigilant Insomnia & Decision Paralysis">
                    Hyper-Vigilant Insomnia & Decision Paralysis
                  </option>
                  <option value="Detached Anhedonia & Severe Exhaustion">
                    Detached Anhedonia & Severe Exhaustion
                  </option>
                  <option value="Acute Panic & Intrusive Harm Phobias">
                    Acute Panic & Intrusive Harm Phobias
                  </option>
                  <option value="Postpartum Anemia & Extreme Lethargy">
                    Postpartum Anemia & Extreme Lethargy
                  </option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">
                  Lactation & Feeding Status:
                </label>
                <input
                  type="text"
                  value={promptPatientContext.lactationStatus}
                  onChange={(e) =>
                    setPromptPatientContext((prev) => ({
                      ...prev,
                      lactationStatus: e.target.value,
                    }))
                  }
                  className="w-full bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Generated Gemini AI Studio System Prompt
                </h3>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Full Prompt'}</span>
              </button>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-xs text-stone-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed selection:bg-amber-500 selection:text-stone-950">
{`${MAMA_G_SYSTEM_PROMPT_TEMPLATE}

--- REAL-TIME PATIENT CASE METADATA ---
- Postpartum Duration: ${promptPatientContext.weeksPostpartum} weeks
- Clinical EPDS Score: ${promptPatientContext.epdsScore} / 30
- Primary Phenotype: ${promptPatientContext.predominantPhenotype}
- Lactation Status: ${promptPatientContext.lactationStatus}
- Anemia & Biochemical Status: ${promptPatientContext.anemiaStatus}

INSTRUCTIONS FOR GEMINI MODEL:
Analyze the patient stream with maternal empathy and clinical precision. Deliver practical steps, an uninterrupted sleep shift schedule, and targeted micronutrient guidance using accessible local foods.`}
            </div>
            <p className="text-[11px] text-stone-400">
              Paste this prompt directly into Google AI Studio system instructions to run live multi-turn phenotyping with Gemini 3.8 Flash.
            </p>
          </div>
        </div>
      )}

      {/* ================= BIOCHEMICAL & NUTRITIONAL PROTOCOL MODAL ================= */}
      {isNutritionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 border border-emerald-600/60 text-stone-100 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Pill className="w-6 h-6 text-emerald-200" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    Targeted Biochemical & Nutritional Repletion Protocols
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Evidence-based micronutrient interventions for maternal neurological recovery
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNutritionModalOpen(false)}
                className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Nutrient Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NUTRITIONAL_REPLETION_PROTOCOLS.map((proto) => {
                  const isSelected = selectedNutrient.id === proto.id;
                  return (
                    <button
                      key={proto.id}
                      onClick={() => setSelectedNutrient(proto)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold'
                          : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750'
                      }`}
                    >
                      {proto.nutrient.split('(')[0]}
                    </button>
                  );
                })}
              </div>

              {/* Selected Nutrient Details */}
              <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {selectedNutrient.nutrient}
                  </h4>
                  <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
                    Target Mechanism: {selectedNutrient.targetMechanism}
                  </span>
                </div>

                {/* Dosing & Pathway */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-900/90 p-3.5 rounded-xl border border-stone-700">
                    <span className="font-bold text-amber-400 block mb-1">
                      Clinical Therapeutic Dosing:
                    </span>
                    <span className="text-stone-200 leading-relaxed block">
                      {selectedNutrient.clinicalDosing}
                    </span>
                  </div>

                  <div className="bg-stone-900/90 p-3.5 rounded-xl border border-stone-700">
                    <span className="font-bold text-emerald-400 block mb-1">
                      Lactation & Breastfeeding Safety:
                    </span>
                    <span className="text-stone-200 leading-relaxed block">
                      {selectedNutrient.lactationSafety}
                    </span>
                  </div>
                </div>

                {/* Biochemical Pathway Explanation */}
                <div className="bg-stone-900/90 p-3.5 rounded-xl border border-stone-700 text-xs space-y-1">
                  <span className="font-bold text-stone-300 block">
                    Underlying Neurohormonal Pathway:
                  </span>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    {selectedNutrient.biochemicalPathway}
                  </p>
                </div>

                {/* Accessible Local African & Indigenous Food Sources */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-200 text-xs block">
                    Rich, Accessible Local Food Sources:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedNutrient.localFoodSources.map((food, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-200 flex items-start gap-2"
                      >
                        <span className="font-bold text-emerald-400">•</span>
                        <span>{food}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contraindications */}
                <div className="bg-rose-950/50 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Clinical Caution / Contraindications: </span>
                    <span>{selectedNutrient.contraindications}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-950 px-6 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>Mama-G Perinatal Phenotyping · WHO & Micronutrient Guidelines</span>
              <button
                onClick={() => setIsNutritionModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium transition-colors"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
