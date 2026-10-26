import React, { useState, useEffect } from 'react';
import {
  Apple,
  Droplet,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Utensils,
  Leaf,
  Fish,
  Wheat,
  Clock,
  Heart,
  Calendar,
} from 'lucide-react';
import {
  TRIMESTER_NUTRITION_GUIDES,
  LOCAL_FOOD_ITEMS,
  CULTURAL_NUTRITION_MYTHS,
} from '../data/nutritionData';
import {
  PregnancyStage,
  AfricanRegion,
  LocalFoodItem,
  SupportedLanguage,
} from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface NutritionAdvisorProps {
  language: SupportedLanguage;
  onAskMamaG?: (promptText: string) => void;
  onOpenEmergency?: () => void;
}

export const NutritionAdvisor: React.FC<NutritionAdvisorProps> = ({
  language,
  onAskMamaG,
  onOpenEmergency,
}) => {
  const [selectedStage, setSelectedStage] = useState<PregnancyStage>('trimester1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<AfricanRegion>('all');
  const [expandedMythId, setExpandedMythId] = useState<string | null>(null);
  const [waterCount, setWaterCount] = useState<number>(4);
  const [plateChecklist, setPlateChecklist] = useState({
    iron: false,
    greens: false,
    calcium: false,
    vitC: false,
  });

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
  const currentGuide = TRIMESTER_NUTRITION_GUIDES[selectedStage];

  // Load hydration checklist from localStorage
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`mama_g_nutrition_plate_${today}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWaterCount(parsed.waterCount || 4);
        setPlateChecklist(parsed.plateChecklist || { iron: false, greens: false, calcium: false, vitC: false });
      }
    } catch (e) {
      console.warn('Could not read saved plate', e);
    }
  }, []);

  const saveDailyPlate = (newWater: number, newChecklist: typeof plateChecklist) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(
        `mama_g_nutrition_plate_${today}`,
        JSON.stringify({ waterCount: newWater, plateChecklist: newChecklist })
      );
    } catch (e) {
      console.warn('Could not save plate', e);
    }
  };

  const handleWaterIncrement = () => {
    if (waterCount < 12) {
      const next = waterCount + 1;
      setWaterCount(next);
      saveDailyPlate(next, plateChecklist);
    }
  };

  const handleWaterDecrement = () => {
    if (waterCount > 0) {
      const next = waterCount - 1;
      setWaterCount(next);
      saveDailyPlate(next, plateChecklist);
    }
  };

  const toggleChecklistItem = (key: keyof typeof plateChecklist) => {
    const updated = { ...plateChecklist, [key]: !plateChecklist[key] };
    setPlateChecklist(updated);
    saveDailyPlate(waterCount, updated);
  };

  // Filter local food items
  const filteredFoods = LOCAL_FOOD_ITEMS.filter((food) => {
    const stageNum = selectedStage === 'trimester1' ? 1 : selectedStage === 'trimester2' ? 2 : selectedStage === 'trimester3' ? 3 : 4;
    const matchesStage = food.trimestersRecommended.includes(stageNum as any);

    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(food.localNames).some((val) =>
        val?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      food.keyNutrients.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || food.category === categoryFilter;

    const matchesRegion =
      regionFilter === 'all' || food.region === 'all' || food.region === regionFilter;

    return matchesStage && matchesSearch && matchesCategory && matchesRegion;
  });

  const stages: { id: PregnancyStage; label: string; sub: string }[] = [
    { id: 'trimester1', label: '1st Trimester', sub: 'Weeks 1–12' },
    { id: 'trimester2', label: '2nd Trimester', sub: 'Weeks 13–26' },
    { id: 'trimester3', label: '3rd Trimester', sub: 'Weeks 27–40+' },
    { id: 'postpartum', label: 'Postpartum & Lactation', sub: 'Healing & Milk' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 border border-emerald-900/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                African Indigenous Nutrition
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                100% Free Offline Guide
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              {t.nutritionTitle}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.nutritionSubtitle}
            </p>
          </div>

          {/* Quick Stats: Daily Hydration Tracker */}
          <div className="bg-stone-900/90 border border-emerald-900/50 rounded-xl p-3.5 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-400">Daily Water Goal (Clean/Boiled)</div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleWaterDecrement}
                  className="w-6 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-blue-300">
                  {waterCount} / 10 glasses
                </span>
                <button
                  onClick={handleWaterIncrement}
                  className="w-6 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {stages.map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStage(st.id)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedStage === st.id
                ? 'bg-emerald-600/20 border-emerald-500/60 text-white shadow-md'
                : 'bg-stone-900/70 hover:bg-stone-900 border-stone-800 text-stone-400'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-400">{st.sub}</div>
            <div className="text-sm font-bold text-stone-100 mt-0.5">{st.label}</div>
          </button>
        ))}
      </div>

      {/* Selected Stage Overview: Fetal Growth & Body Needs */}
      {currentGuide && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div className="border-b border-stone-800 pb-4">
            <h2 className="text-xl font-bold text-white">{currentGuide.title}</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-stone-850/80 border border-stone-800 space-y-1">
                <span className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">
                  👶 Fetal Growth Milestone
                </span>
                <p className="text-stone-300 leading-relaxed">
                  {currentGuide.fetalDevelopmentHighlight}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-850/80 border border-stone-800 space-y-1">
                <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider">
                  🌺 Mother's Physiological Need
                </span>
                <p className="text-stone-300 leading-relaxed">
                  {currentGuide.maternalBodyNeed}
                </p>
              </div>
            </div>
          </div>

          {/* Core Nutrients for this stage */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Essential Nutrients & Indigenous Sources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentGuide.coreNutrients.map((nutrient, idx) => (
                <div
                  key={idx}
                  className="bg-stone-850 border border-stone-800 rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="font-bold text-emerald-300 text-sm">{nutrient.name}</div>
                  <div className="text-amber-400 font-semibold">{nutrient.dailyGoal}</div>
                  <div className="text-stone-300">
                    <span className="text-stone-400 font-medium">Local Foods: </span>
                    {nutrient.localSources}
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed pt-1 border-t border-stone-800">
                    {nutrient.physiologicalImpact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 24-Hour Sample Meal Plan */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              Sample Affordable 24-Hour African Meal Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-300">🌅 Breakfast:</span>
                <p className="text-stone-300 mt-1">{currentGuide.sampleMealPlan.breakfast}</p>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-300">☀️ Mid-Morning Snack:</span>
                <p className="text-stone-300 mt-1">{currentGuide.sampleMealPlan.midMorningSnack}</p>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-300">🍲 Lunch:</span>
                <p className="text-stone-300 mt-1">{currentGuide.sampleMealPlan.lunch}</p>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-300">🍵 Afternoon Snack:</span>
                <p className="text-stone-300 mt-1">{currentGuide.sampleMealPlan.afternoonSnack}</p>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-300">🌙 Dinner:</span>
                <p className="text-stone-300 mt-1">{currentGuide.sampleMealPlan.dinner}</p>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-300">🛏️ Bedtime Warm Cup:</span>
                <p className="text-stone-300 mt-1">{currentGuide.sampleMealPlan.bedtimeDrink}</p>
              </div>
            </div>
          </div>

          {/* Culinary Remedies for Common Pregnancy Symptoms */}
          {currentGuide.commonSymptomRemedies && currentGuide.commonSymptomRemedies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                Kitchen Remedies for Discomfort
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentGuide.commonSymptomRemedies.map((remedy, i) => (
                  <div key={i} className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                    <div className="font-bold text-stone-100 text-sm">{remedy.symptom}</div>
                    <div className="text-emerald-300">
                      <strong>Kitchen Solution: </strong>
                      {remedy.culinarySolution}
                    </div>
                    {remedy.foodsToAvoid && (
                      <div className="text-rose-300 text-[11px]">
                        <strong>Avoid: </strong>
                        {remedy.foodsToAvoid}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Cautions */}
          {currentGuide.criticalSafetyCautions && currentGuide.criticalSafetyCautions.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-rose-400 flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Critical Safety & Antenatal Cautions</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-300">
                {currentGuide.criticalSafetyCautions.map((caution, i) => (
                  <li key={i}>{caution}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Daily Balanced Plate & Micro-habit Checklist */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Today's Rainbow Plate Checklist (Local Food Tracker)
        </h3>
        <p className="text-xs text-stone-400">
          Mark each nutrient group you enjoy today. Even on a low budget, mixing small amounts of these indigenous foods gives complete nourishment.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => toggleChecklistItem('greens')}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
              plateChecklist.greens
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                : 'bg-stone-850 border-stone-800 text-stone-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                plateChecklist.greens ? 'text-emerald-400' : 'text-stone-600'
              }`}
            />
            <div>
              <div className="font-bold text-white">Dark Leafy Green</div>
              <div className="text-[10px] text-stone-400">Ugu, Zogale, Sukuma</div>
            </div>
          </button>

          <button
            onClick={() => toggleChecklistItem('iron')}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
              plateChecklist.iron
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                : 'bg-stone-850 border-stone-800 text-stone-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                plateChecklist.iron ? 'text-emerald-400' : 'text-stone-600'
              }`}
            />
            <div>
              <div className="font-bold text-white">Iron & Protein</div>
              <div className="text-[10px] text-stone-400">Cowpeas, Egg, Dagaa</div>
            </div>
          </button>

          <button
            onClick={() => toggleChecklistItem('calcium')}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
              plateChecklist.calcium
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                : 'bg-stone-850 border-stone-800 text-stone-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                plateChecklist.calcium ? 'text-emerald-400' : 'text-stone-600'
              }`}
            />
            <div>
              <div className="font-bold text-white">Calcium Bone Builder</div>
              <div className="text-[10px] text-stone-400">Baobab, Crayfish, Sesame</div>
            </div>
          </button>

          <button
            onClick={() => toggleChecklistItem('vitC')}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
              plateChecklist.vitC
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                : 'bg-stone-850 border-stone-800 text-stone-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                plateChecklist.vitC ? 'text-emerald-400' : 'text-stone-600'
              }`}
            />
            <div>
              <div className="font-bold text-white">Vitamin C Absorber</div>
              <div className="text-[10px] text-stone-400">Orange, Baobab, Pawpaw</div>
            </div>
          </button>
        </div>
      </div>

      {/* Local Indigenous African Food Item Directory */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              African Indigenous Superfoods Directory
            </h3>
            <p className="text-xs text-stone-400">
              Low-cost, nutrient-packed foods available in local markets across African regions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name (e.g. Ugu, Zogale, Dagaa)..."
              className="w-full bg-stone-800 text-xs text-stone-200 pl-9 pr-3 py-2 rounded-xl border border-stone-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium">Category:</span>
          {['all', 'leafy_greens', 'legumes_proteins', 'fish_meat_dairy', 'roots_tubers_grains', 'fruits_seeds'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Food Items Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredFoods.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className="bg-stone-850 border border-stone-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-[11px] text-amber-400">
                      {item.localNames.pidgin || item.localNames.hausa || item.localNames.swahili || item.localNames.yoruba || ''}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {item.budgetTier === 'low_cost' ? 'Very Cheap' : 'Moderate'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {item.keyNutrients.map((n, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-stone-800 text-stone-300 rounded border border-stone-700/60"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {item.whyItMatters}
                </p>

                <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400">
                  <span className="text-stone-300 font-semibold">Safe Prep: </span>
                  {item.howToPrepareSafely}
                </div>
              </div>

              {onAskMamaG && (
                <button
                  type="button"
                  onClick={() => onAskMamaG(`Mama-G, how should I best eat ${item.name} during my pregnancy?`)}
                  className="w-full mt-2 py-1.5 bg-stone-800 hover:bg-stone-750 text-emerald-300 text-xs font-semibold rounded-lg border border-stone-700 transition-colors text-center"
                >
                  Ask Mama-G About This Food
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Food Myths & Taboos Debunking */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Debunking Cultural Food Myths & Taboos
            </h3>
            <p className="text-xs text-stone-400">
              Clear scientific truths and compassionate Mama-G guidance to protect maternal health from harmful food restrictions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {CULTURAL_NUTRITION_MYTHS.map((myth) => {
            const isExpanded = expandedMythId === myth.id;
            return (
              <div
                key={myth.id}
                className="bg-stone-850 border border-stone-800 rounded-xl p-4 space-y-2.5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-100 leading-snug">
                    "{myth.myth}"
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${
                      myth.verdict === 'DANGEROUS TABOO'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : myth.verdict === 'FALSE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {myth.verdict}
                  </span>
                </div>

                <div className="text-xs text-stone-300 leading-relaxed">
                  <strong className="text-emerald-400">Scientific Truth: </strong>
                  {myth.scientificTruth}
                </div>

                <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30 text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-400">Mama-G's Advice: </strong>
                  {myth.mamaGAdvice}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
