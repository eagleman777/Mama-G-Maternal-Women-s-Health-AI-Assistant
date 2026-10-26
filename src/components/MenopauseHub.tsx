import React, { useState } from 'react';
import {
  Flame,
  Heart,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Utensils,
  Leaf,
  Activity,
  Calendar,
  Pill,
  ChevronRight,
  Shield,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  MENOPAUSE_STAGE_GUIDES,
  MENOPAUSE_LOCAL_FOOD_ALLIES,
  MENOPAUSE_SELF_ASSESSMENT_QUESTIONS,
  MenopauseStage,
} from '../data/menopauseData';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface MenopauseHubProps {
  language: SupportedLanguage;
  onAskMamaG?: (promptText: string) => void;
  onOpenEmergency?: () => void;
}

export const MenopauseHub: React.FC<MenopauseHubProps> = ({
  language,
  onAskMamaG,
  onOpenEmergency,
}) => {
  const [selectedStage, setSelectedStage] = useState<MenopauseStage>('perimenopause');
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'foods' | 'treatments' | 'assessment'>('guide');
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState<boolean>(false);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
  const currentGuide = MENOPAUSE_STAGE_GUIDES[selectedStage];

  const stages: { id: MenopauseStage; label: string; ageBadge: string; icon: string }[] = [
    {
      id: 'perimenopause',
      label: '1. Perimenopause (Early Transition)',
      ageBadge: 'Ages 40 – 49',
      icon: '🌊',
    },
    {
      id: 'menopause',
      label: '2. Menopause (The Milestone)',
      ageBadge: '12 Months No Period',
      icon: '🌺',
    },
    {
      id: 'postmenopause',
      label: '3. Postmenopause (Golden Health)',
      ageBadge: 'Ages 52+',
      icon: '🛡️',
    },
  ];

  const handleSelectAnswer = (questionId: string, score: number) => {
    setAssessmentAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateAssessmentResult = () => {
    const totalScore = Object.values(assessmentAnswers).reduce((a, b) => a + b, 0);
    const hasRedFlag = assessmentAnswers['q2_cycle_pattern'] === 10;

    let tier: 'Mild' | 'Moderate' | 'Severe' | 'EMERGENCY_RED_FLAG' = 'Mild';
    if (hasRedFlag) {
      tier = 'EMERGENCY_RED_FLAG';
    } else if (totalScore >= 12) {
      tier = 'Severe';
    } else if (totalScore >= 6) {
      tier = 'Moderate';
    }

    return { totalScore, tier, hasRedFlag };
  };

  const assessmentResult = calculateAssessmentResult();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-rose-950 border border-amber-900/50 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Midlife & Menopause Wellness
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t.freeModeBadge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-tight">
              {t.menopauseTitle}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.menopauseSubtitle}
            </p>
          </div>

          {/* Quick Action: Ask Mama-G */}
          {onAskMamaG && (
            <button
              onClick={() => onAskMamaG('Mama-G, I have questions about perimenopause, hot flushes, and what to eat to balance my hormones.')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-colors self-start md:self-auto shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Mama-G About Menopause</span>
            </button>
          )}
        </div>

        {/* Ambient Warm Hearth Glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Critical Life-Saving Safety Notice */}
      <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 flex items-start gap-3.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-rose-300 text-sm">
            Critical Clinical Rule: Postmenopausal Bleeding is NEVER Normal
          </span>
          <p className="text-stone-300 leading-relaxed">
            If you have gone 12 full months without a period and experience <strong>ANY vaginal bleeding, spotting, or brownish discharge</strong>, do not assume your periods are "returning". You must report to a health clinic immediately for an ultrasound and endometrial check to rule out uterine hyperplasia or cancer.
          </p>
        </div>
      </div>

      {/* Primary Stage Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stages.map((st) => {
          const isSelected = selectedStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-600/20 border-amber-500 text-white shadow-md'
                  : 'bg-stone-900/80 hover:bg-stone-850 border-stone-800 text-stone-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{st.icon}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-stone-700">
                    {st.ageBadge}
                  </span>
                </div>
                <div className="font-bold text-sm text-stone-100 pt-2">{st.label}</div>
              </div>
              <div className="mt-3 flex items-center text-xs text-amber-400 font-medium">
                <span>View Full Clinical Protocol</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-stone-800 pb-2 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('guide')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'guide'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Stage Overview & Symptoms</span>
        </button>

        <button
          onClick={() => setActiveSubTab('foods')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'foods'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>What to Eat (African Superfoods)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('treatments')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'treatments'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Treatments & HRT Guide</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assessment')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'assessment'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Symptom Self-Assessment</span>
        </button>
      </div>

      {/* Tab 1: Stage Overview & Symptoms */}
      {activeSubTab === 'guide' && currentGuide && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {currentGuide.ageRange}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {currentGuide.title}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">{currentGuide.stageSubtitle}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 text-xs sm:text-sm text-stone-300 leading-relaxed">
              <strong className="text-amber-300">Biological Reality: </strong>
              {currentGuide.biologicalReality}
            </div>

            {/* Primary Symptoms Grid */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Primary Symptoms & Hormonal Effects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentGuide.primarySymptoms.map((symptom, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 flex items-start gap-2.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="text-stone-300 leading-relaxed">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical & Emotional Effects */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                Physical & Emotional Impact on Life
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentGuide.physicalAndEmotionalEffects.map((effect, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-stone-850/80 border border-stone-800 flex items-start gap-2.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span className="text-stone-300 leading-relaxed">{effect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Lifestyle Habits: What to Do */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Daily Coping Strategies & What to Do
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentGuide.dailyLifestyleHabits.map((habit, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-stone-850 border border-emerald-900/30 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-stone-300 leading-relaxed">{habit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What to Avoid */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Triggers & Foods to Avoid
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentGuide.whatToAvoid.map((avoid, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-stone-850 border border-rose-900/30 flex items-start gap-2.5"
                  >
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span className="text-stone-300 leading-relaxed">{avoid}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Red Flags Card */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-2">
              <div className="font-bold text-rose-300 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>When to Rush to a Health Center (Emergency Red Flags)</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-stone-300">
                {currentGuide.criticalRedFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: What to Eat (African Indigenous Superfoods) */}
      {activeSubTab === 'foods' && (
        <div className="space-y-6">
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              African Indigenous Superfoods for Hormonal Balance & Bone Density
            </h2>
            <p className="text-xs text-stone-400 max-w-3xl leading-relaxed">
              In low-resource African settings, expensive foreign supplements are unnecessary. Local markets are filled with powerful, bioavailable phytoestrogens, natural calcium, and vessel-protective foods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MENOPAUSE_LOCAL_FOOD_ALLIES.map((food, i) => (
              <div
                key={i}
                className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{food.name}</h3>
                      <p className="text-xs text-amber-400 font-medium">{food.localNames}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {food.affordability}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-850 text-xs text-stone-300">
                    <span className="font-bold text-amber-300">Target Symptom: </span>
                    {food.targetSymptom}
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed">
                    <strong className="text-stone-300">Nutrient Power: </strong>
                    {food.nutrientPower}
                  </p>

                  <div className="p-2.5 rounded-lg bg-stone-850/80 border border-stone-800 text-[11px] text-stone-300">
                    <strong className="text-emerald-400">How to Prepare: </strong>
                    {food.howToPrepare}
                  </div>
                </div>

                {onAskMamaG && (
                  <button
                    onClick={() => onAskMamaG(`Mama-G, how do I use ${food.name} to help my menopause symptoms?`)}
                    className="w-full mt-2 py-1.5 bg-stone-800 hover:bg-stone-750 text-amber-300 text-xs font-semibold rounded-lg border border-stone-700 transition-colors text-center"
                  >
                    Ask Mama-G About This Food
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Medical Treatments & HRT */}
      {activeSubTab === 'treatments' && currentGuide && (
        <div className="space-y-6">
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-400" />
              Medical Treatments, HRT & Non-Hormonal Options
            </h2>
            <p className="text-xs text-stone-400 max-w-3xl leading-relaxed">
              Evidence-based hormonal replacement therapy (HRT), safe local vaginal therapies, non-hormonal medications, and essential bone supplements. Always consult a licensed physician, midwife, or gynecologist before starting prescription medications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGuide.medicalTreatments.map((treatment, i) => (
              <div
                key={i}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-base">{treatment.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                      {treatment.category}
                    </span>
                  </div>

                  <div className="text-xs text-stone-300">
                    <strong className="text-amber-400">Clinical Indication: </strong>
                    {treatment.indications}
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    <strong className="text-emerald-400">Key Benefits: </strong>
                    {treatment.benefits}
                  </p>

                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    <strong>Mechanism: </strong>
                    {treatment.mechanism}
                  </p>

                  <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-[11px] text-rose-300 space-y-1">
                    <strong className="text-rose-400">Cautions & Screening: </strong>
                    <span>{treatment.contraindicationsAndCautions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Symptom Self-Assessment */}
      {activeSubTab === 'assessment' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div className="border-b border-stone-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Menopause Symptom Self-Assessment (Green Climacteric Matrix)
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Select how often you experience each symptom. This generates an instant, confidential clinical triage verdict to guide your next health decision.
            </p>
          </div>

          <div className="space-y-6">
            {MENOPAUSE_SELF_ASSESSMENT_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-2.5 bg-stone-850/60 p-4 rounded-xl border border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {q.category}
                  </span>
                </div>
                <p className="text-sm font-bold text-stone-100">{q.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = assessmentAnswers[q.id] === opt.score;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(q.id, opt.score)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-600/20 border-amber-500 text-white font-semibold shadow-sm'
                            : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Assessment Result Summary */}
          {Object.keys(assessmentAnswers).length >= 4 && (
            <div className="mt-6 p-5 rounded-2xl bg-stone-850 border border-amber-900/40 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">Your Assessment Verdict</h3>
                  <p className="text-xs text-stone-400">Total Symptom Score: {assessmentResult.totalScore}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    assessmentResult.hasRedFlag
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : assessmentResult.tier === 'Severe'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : assessmentResult.tier === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {assessmentResult.hasRedFlag
                    ? '🚨 EMERGENCY: POSTMENOPAUSAL BLEEDING RED FLAG'
                    : `Symptom Burden: ${assessmentResult.tier}`}
                </span>
              </div>

              {assessmentResult.hasRedFlag ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-200 space-y-2">
                  <p className="font-bold">Immediate Clinical Action Required:</p>
                  <p>
                    You reported vaginal bleeding occurring after 12 months without a period. This is an urgent red flag that requires immediate evaluation at a hospital or gynecological clinic to rule out endometrial cancer. Please do not wait.
                  </p>
                  {onOpenEmergency && (
                    <button
                      onClick={onOpenEmergency}
                      className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                    >
                      Open Emergency SOS Directory
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                  <p>
                    {assessmentResult.tier === 'Severe'
                      ? 'You are experiencing significant vasomotor or urogenital symptoms that impact your daily well-being. Evidence-based treatments like local vaginal estrogen, low-dose non-hormonals, or HRT combined with African phytoestrogens can provide rapid relief.'
                      : assessmentResult.tier === 'Moderate'
                      ? 'You are in an active menopausal transition. Prioritizing boiled soybeans (Awara), whole small fish for calcium, layered dressing, and daily weight-bearing walks will help manage these symptoms naturally.'
                      : 'Your symptoms appear mild and manageable. Maintain a nutrient-dense diet rich in greens, ground fish, and clean hydration to protect your bones and heart for the years ahead.'}
                  </p>

                  {onAskMamaG && (
                    <button
                      onClick={() =>
                        onAskMamaG(
                          `Mama-G, I completed the menopause assessment with a ${assessmentResult.tier} score (${assessmentResult.totalScore} points). What practical advice and diet plan do you recommend for me today?`
                        )
                      }
                      className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <span>Discuss Assessment with Mama-G</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
