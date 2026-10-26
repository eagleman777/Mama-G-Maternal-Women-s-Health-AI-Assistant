import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Apple,
  Sparkles,
  MessageSquare,
  Building2,
  Eye,
  Activity,
  Award,
  HeartPulse,
  Flame,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import {
  WOMEN_AILMENTS_REGISTRY,
  PREVENTION_PILLAR_GUIDES,
  AilmentCategory,
} from '../data/womenAilmentsData';
import { SupportedLanguage } from '../types';

interface WomenAilmentsSectionProps {
  language?: SupportedLanguage;
  onAskMamaG?: (prompt: string) => void;
  onOpenEmergency?: () => void;
  onOpenFacilities?: () => void;
  onOpenVvf?: () => void;
}

export const WomenAilmentsSection: React.FC<WomenAilmentsSectionProps> = ({
  language: _language,
  onAskMamaG,
  onOpenEmergency,
  onOpenFacilities,
  onOpenVvf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AilmentCategory | 'all'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'encyclopedia' | 'prevention_walkthroughs' | 'red_flags'>('encyclopedia');
  const [expandedAilmentId, setExpandedAilmentId] = useState<string | null>(null);
  const [activeGuideIndex, setActiveGuideIndex] = useState(0);

  const categories: { id: AilmentCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Conditions (11)' },
    { id: 'cancers', label: 'Cancers & Screenings' },
    { id: 'uterine_ovarian', label: 'Uterus, Ovaries & Cycles' },
    { id: 'infections', label: 'Infections & Hygiene' },
    { id: 'obstetric', label: 'Pregnancy & Childbirth' },
    { id: 'pelvic_midlife', label: 'Pelvic Floor & Midlife' },
  ];

  const filteredAilments = useMemo(() => {
    return WOMEN_AILMENTS_REGISTRY.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.localAliases.toLowerCase().includes(q) ||
        item.shortSummary.toLowerCase().includes(q) ||
        item.commonSymptoms.some((s) => s.toLowerCase().includes(q)) ||
        item.prevention.primary.some((p) => p.toLowerCase().includes(q)) ||
        item.prevention.screening.some((sc) => sc.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedAilmentId((prev) => (prev === id ? null : id));
  };

  const handleConsultMama = (topic: string) => {
    if (onAskMamaG) {
      onAskMamaG(topic);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-navigation inside Women's Ailments & Prevention */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>Women's Health Encyclopedia & Prevention Protocols</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Comprehensive Ailments Directory & Prevention Guidelines
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
            Clinically vetted guides for cervical/breast cancers, fibroids, PID, PCOS, preeclampsia, obstetric fistula, prolapse, UTIs, and osteoporosis.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('encyclopedia')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeSubTab === 'encyclopedia'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-stone-800/90 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ailments Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('prevention_walkthroughs')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeSubTab === 'prevention_walkthroughs'
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                : 'bg-stone-800/90 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3 Core Prevention Guides</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('red_flags')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeSubTab === 'red_flags'
                ? 'bg-red-700 text-white border-red-600 shadow-sm'
                : 'bg-stone-800/90 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Danger Red Flags</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ENCYCLOPEDIA & SEARCH */}
      {activeSubTab === 'encyclopedia' && (
        <div className="space-y-5">
          {/* Search Bar & Category Filters */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ailments, symptoms (e.g. 'heavy bleeding', 'discharge', 'lump', 'pelvic pain')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedCategory === cat.id
                      ? 'bg-rose-600 text-white border-rose-500 font-semibold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredAilments.length}</strong> clinical condition{filteredAilments.length === 1 ? '' : 's'}
            </span>
            <span>Tap card to expand full prevention, diet & CHW actions</span>
          </div>

          {/* Ailments Cards */}
          <div className="space-y-4">
            {filteredAilments.map((ailment) => {
              const isExpanded = expandedAilmentId === ailment.id;

              return (
                <div
                  key={ailment.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all shadow-sm"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => toggleExpand(ailment.id)}
                    className="p-4 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-stone-800/40 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          {ailment.categoryLabel}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Target: {ailment.recommendedAgeOrGroup}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {ailment.name}
                      </h4>

                      <p className="text-xs text-amber-300/90 font-medium">
                        Local / Common Names: {ailment.localAliases}
                      </p>

                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pt-1">
                        {ailment.shortSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {onAskMamaG && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConsultMama(`Mama-G, tell me about ${ailment.name}: how to prevent it, early signs, and what local foods or treatments can help.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/50 text-rose-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-rose-400" />
                          <span>Ask Mama-G</span>
                        </button>
                      )}

                      <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-white">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-800 space-y-6 bg-stone-950/50">
                      {/* Prevalence Callout */}
                      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
                        <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 block mb-1">Prevalence & African Context:</strong>
                          {ailment.prevalenceInsight}
                        </div>
                      </div>

                      {/* Symptoms & Emergency Red Flags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Symptoms */}
                        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                            <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                            <span>Common Warning Symptoms</span>
                          </h5>
                          <ul className="space-y-2">
                            {ailment.commonSymptoms.map((symp, i) => (
                              <li key={i} className="text-xs text-stone-300 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                <span>{symp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Red Flags */}
                        <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>🚨 Danger Signs (Rush to Hospital)</span>
                          </h5>
                          <ul className="space-y-2">
                            {ailment.redFlagEmergencySigns.map((rf, i) => (
                              <li key={i} className="text-xs text-rose-200/90 flex items-start gap-2 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <span>{rf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* PREVENTION & SCREENING BLUEPRINT */}
                      <div className="bg-emerald-950/15 border border-emerald-900/30 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <h5 className="text-sm font-bold uppercase tracking-wide text-white">
                            Prevention, Screening & Nutrition Protocols
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Primary Prevention */}
                          <div className="space-y-2">
                            <h6 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Primary Prevention (What Stops It)</span>
                            </h6>
                            <ul className="space-y-2">
                              {ailment.prevention.primary.map((step, idx) => (
                                <li key={idx} className="text-xs text-stone-200 flex items-start gap-2">
                                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Screening */}
                          <div className="space-y-2">
                            <h6 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Screening & Clinical Detection Tests</span>
                            </h6>
                            <ul className="space-y-2">
                              {ailment.prevention.screening.map((test, idx) => (
                                <li key={idx} className="text-xs text-stone-200 flex items-start gap-2">
                                  <span className="text-cyan-400 font-bold shrink-0">🔍</span>
                                  <span>{test}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Nutrition */}
                        <div className="border-t border-emerald-900/40 pt-4 space-y-2">
                          <h6 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                            <Apple className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Nutrition & African Superfood Allies</span>
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {ailment.prevention.lifestyleAndDiet.map((diet, idx) => (
                              <div key={idx} className="text-xs text-stone-300 flex items-start gap-2 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                                <span className="text-emerald-400 shrink-0">🌿</span>
                                <span>{diet}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Harmful Practices to Avoid */}
                        <div className="border-t border-emerald-900/40 pt-4 space-y-2">
                          <h6 className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Harmful Practices & Unsafe Concoctions to AVOID</span>
                          </h6>
                          <ul className="space-y-1.5">
                            {ailment.prevention.avoidRisks.map((risk, idx) => (
                              <li key={idx} className="text-xs text-rose-200/90 flex items-start gap-2">
                                <span className="text-rose-400 font-bold shrink-0">✗</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CHW Protocol */}
                      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Community Health Worker (CHW) Action Protocol</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {ailment.chwActionPlan.map((action, idx) => (
                            <li key={idx} className="text-xs text-stone-300 flex items-start gap-2">
                              <span className="text-amber-400 font-bold shrink-0">▸</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-2">
                          <strong>Recommended Specialist:</strong>
                          <span className="text-stone-200">{ailment.specialistToConsult}</span>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {onAskMamaG && (
                          <button
                            type="button"
                            onClick={() => handleConsultMama(`Mama-G, please explain ${ailment.name} in detail. What are the best foods, what should I avoid, and when should I see a doctor?`)}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Talk with Mama-G about {ailment.name}</span>
                          </button>
                        )}

                        {ailment.id === 'obstetric-fistula' && onOpenVvf && (
                          <button
                            type="button"
                            onClick={onOpenVvf}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                            <span>Open Dedicated VVF Care & Free Centres Hub ➔</span>
                          </button>
                        )}

                        {onOpenFacilities && (
                          <button
                            type="button"
                            onClick={onOpenFacilities}
                            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-2 border border-stone-700 transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Find Screening Clinic in My LGA</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredAilments.length === 0 && (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center space-y-3">
                <Search className="w-8 h-8 text-stone-500 mx-auto" />
                <h5 className="text-sm font-bold text-white">No conditions matched your search</h5>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Try searching for symptoms like "bleeding", "pain", "cervix", or clear your filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-200 hover:bg-stone-700 text-xs font-semibold"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 3 CORE PREVENTION GUIDES */}
      {activeSubTab === 'prevention_walkthroughs' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Primary Prevention & Early Detection Walkthroughs</span>
              </h4>
              <p className="text-xs text-stone-400">
                Actionable step-by-step guides for cervical cancer elimination, breast self-awareness, and pelvic floor toning.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {PREVENTION_PILLAR_GUIDES.map((guide, idx) => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setActiveGuideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    activeGuideIndex === idx
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  Guide {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Guide Card */}
          {(() => {
            const currentGuide = PREVENTION_PILLAR_GUIDES[activeGuideIndex];
            return (
              <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 sm:p-7 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold mb-2">
                      {currentGuide.badge}
                    </span>
                    <h5 className="text-lg sm:text-xl font-bold text-white">
                      {currentGuide.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-stone-400 mt-1">{currentGuide.subtitle}</p>
                  </div>
                  {onAskMamaG && (
                    <button
                      type="button"
                      onClick={() => handleConsultMama(`Please guide me step by step on: ${currentGuide.title}`)}
                      className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Mama-G for Voice Coach</span>
                    </button>
                  )}
                </div>

                {/* Steps List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentGuide.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                          {step.stepNumber}
                        </div>
                        <h6 className="text-xs sm:text-sm font-semibold text-stone-100">
                          {step.title}
                        </h6>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed pl-1">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-stone-950/50 rounded-xl p-3.5 border border-stone-800 flex items-center gap-2.5 text-xs text-stone-400">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Clinical Standard Citation: {currentGuide.clinicalCitation}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 3: DANGER RED FLAGS */}
      {activeSubTab === 'red_flags' && (
        <div className="space-y-5">
          <div className="bg-red-950/25 border border-red-900/50 rounded-2xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="text-base sm:text-lg font-bold text-white">
                Obstetric & Gynecological Emergency Red Flags
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              If a woman or pregnant mother presents with any of the signs below, DO NOT WAIT or attempt home remedies. These represent critical emergencies requiring immediate hospital referral and emergency transport.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="bg-stone-900/90 border border-red-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                  <Flame className="w-4 h-4" />
                  <span>Severe Vaginal Hemorrhage</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Soaking more than two large sanitary pads an hour for over 2 hours, passing large blood clots, or sudden blood gushing causing fainting or pale lips.
                </p>
              </div>

              <div className="bg-stone-900/90 border border-red-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                  <Activity className="w-4 h-4" />
                  <span>Severe Headache & Blurred Vision (Pregnancy)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Throbbing headache not responding to paracetamol, flashing lights/spots before eyes, or severe right upper belly pain (Preeclampsia/imminent eclampsia).
                </p>
              </div>

              <div className="bg-stone-900/90 border border-red-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Postmenopausal Bleeding</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  ANY spotting or blood in a woman who has not had a menstrual period for over 12 months. Requires urgent biopsy to rule out endometrial or cervical cancer.
                </p>
              </div>

              <div className="bg-stone-900/90 border border-red-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                  <HeartPulse className="w-4 h-4" />
                  <span>Prolonged Obstructed Labor</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Labor lasting more than 12 hours without baby delivering, maternal exhaustion, dehydration, or dark tea-colored urine (Risk of Obstetric Fistula & rupture).
                </p>
              </div>

              <div className="bg-stone-900/90 border border-red-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Postpartum High Fever & Foul Lochia</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Temperature ≥38°C with foul-smelling afterbirth discharge, severe uterine pain, and shivering within 42 days of childbirth (Puerperal Sepsis).
                </p>
              </div>

              <div className="bg-stone-900/90 border border-red-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                  <Eye className="w-4 h-4" />
                  <span>Sudden Severe Unilateral Pelvic Pain</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Sharp stabbing pain on one side of lower abdomen with dizziness, shoulder-tip pain, or faintness (Ruptured Ectopic Pregnancy or Ovarian Torsion).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-red-900/40">
              {onOpenEmergency && (
                <button
                  type="button"
                  onClick={onOpenEmergency}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Trigger Emergency SOS (112 / Ambulances)</span>
                </button>
              )}
              {onOpenFacilities && (
                <button
                  type="button"
                  onClick={onOpenFacilities}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-2 border border-stone-700 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Locate Nearest 774 LGA Health Center</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
