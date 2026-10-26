import React, { useState } from 'react';
import {
  Baby,
  Heart,
  Apple,
  CalendarCheck,
  AlertOctagon,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { PREGNANCY_JOURNEY, MAMA_KIT_ESSENTIALS } from '../data/clinicalKnowledge';

interface PregnancyJourneyProps {
  onOpenKickCounter: () => void;
  onOpenEmergency: () => void;
}

export const PregnancyJourney: React.FC<PregnancyJourneyProps> = ({
  onOpenKickCounter,
  onOpenEmergency,
}) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const [packedItems, setPackedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mama_kit_packed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentStage = PREGNANCY_JOURNEY[selectedStageIdx];

  const toggleMamaKitItem = (item: string) => {
    const updated = packedItems.includes(item)
      ? packedItems.filter((i) => i !== item)
      : [...packedItems, item];
    setPackedItems(updated);
    try {
      localStorage.setItem('mama_kit_packed', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Hero Visual Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-800 bg-stone-900">
        <img
          src="/src/assets/images/maternal_health_hero_1792645423075.jpg"
          alt="Maternal Health Clinic Consultation"
          className="w-full h-48 sm:h-64 object-cover object-center filter brightness-90"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent flex flex-col justify-end p-5 sm:p-8">
          <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">
            WHO Guidelines · Prenatal & Postnatal Journey
          </span>
          <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Care for Mother & Child, Step-by-Step
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Track baby development, nourishing local foods rich in iron & folate, key antenatal clinic milestones, and postpartum recovery.
          </p>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {PREGNANCY_JOURNEY.map((stage, idx) => {
          const isSelected = selectedStageIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedStageIdx(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-stone-100 shadow-sm'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  {stage.rangeWeeks}
                </span>
                {isSelected && <ChevronRight className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-sm font-semibold text-stone-200 mt-1 truncate">
                {stage.stage}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Details (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Baby & Mother Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {currentStage.stage} ({currentStage.rangeWeeks})
                </h3>
                <span className="text-xs text-stone-400">
                  Physical Milestones & Changes
                </span>
              </div>
              {selectedStageIdx === 2 && (
                <button
                  onClick={onOpenKickCounter}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Baby className="w-3.5 h-3.5" />
                  <span>Start Kick Counter</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <Baby className="w-4 h-4" />
                  <span>Baby's Growth</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {currentStage.babyDevelopment}
                </p>
              </div>

              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                  <Heart className="w-4 h-4" />
                  <span>Mother's Body & Symptoms</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {currentStage.motherChanges}
                </p>
              </div>
            </div>
          </div>

          {/* Localized Nutrition Guidance */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
              <Apple className="w-4 h-4" />
              <span>Recommended Local African Foods for this Stage</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Accessible, Nutrient-Dense Food Sources
            </h4>
            <p className="text-xs text-stone-400">
              No need for expensive imported foods; these accessible indigenous market foods build strong blood and support bone development.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {currentStage.localNutrition.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-stone-800/70 border border-stone-700 p-3 rounded-xl text-xs text-stone-200"
                >
                  <span className="font-semibold text-emerald-300 block mb-1">
                    Group {idx + 1}
                  </span>
                  <span className="leading-snug block">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Clinical Actions (ANC Schedule) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <CalendarCheck className="w-4 h-4" />
              <span>Key Clinical Actions & Medications</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
              {currentStage.keyActions.map((action, idx) => (
                <li
                  key={idx}
                  className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Danger Signs & Mama Kit Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Danger Signs at this stage */}
          <div className="bg-rose-950/70 border border-rose-500/50 rounded-2xl p-5 text-stone-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Danger Signs to Watch</span>
            </div>
            <p className="text-xs text-rose-200">
              If you experience any of these at this stage, seek hospital care immediately:
            </p>
            <ul className="space-y-2 text-xs">
              {currentStage.dangerSignsToWatch.map((sign, idx) => (
                <li
                  key={idx}
                  className="bg-stone-900/80 p-2.5 rounded-lg border border-rose-500/30 text-stone-200 flex items-start gap-2"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onOpenEmergency}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors mt-2"
            >
              Emergency SOS Hotlines
            </button>
          </div>

          {/* Interactive Delivery Bag "Mama Kit" Checklist */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4" />
                <span>"Mama Kit" Delivery Bag</span>
              </div>
              <span className="text-xs font-bold text-stone-400">
                {packedItems.length} / {MAMA_KIT_ESSENTIALS.length}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-snug">
              Every mother should have these clean delivery supplies ready by Week 32. Tap to check off:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {MAMA_KIT_ESSENTIALS.map((kit, idx) => {
                const isPacked = packedItems.includes(kit.item);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleMamaKitItem(kit.item)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs ${
                      isPacked
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                        : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isPacked}
                      readOnly
                      className="mt-0.5 rounded accent-emerald-500 shrink-0"
                    />
                    <div>
                      <span className={`font-semibold block ${isPacked ? 'line-through opacity-70' : ''}`}>
                        {kit.item}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {kit.purpose}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
