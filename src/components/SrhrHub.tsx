import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  EyeOff,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { CONTRACEPTIVE_METHODS } from '../data/clinicalKnowledge';

interface SrhrHubProps {
  onDiscreetExit: () => void;
  onOpenCycleTracker?: () => void;
}

export const SrhrHub: React.FC<SrhrHubProps> = ({ onDiscreetExit, onOpenCycleTracker }) => {
  const [filter, setFilter] = useState<'all' | 'breastfeeding' | 'larc' | 'hormone_free'>('all');
  const [selectedMethodName, setSelectedMethodName] = useState<string>(CONTRACEPTIVE_METHODS[0].name);

  const filteredMethods = CONTRACEPTIVE_METHODS.filter((m) => {
    if (filter === 'breastfeeding') return m.breastfeedingSafe;
    if (filter === 'larc') return m.category === 'LARC';
    if (filter === 'hormone_free') return m.category === 'Barrier' || m.category === 'Natural' || m.name.includes('Copper');
    return true;
  });

  const activeMethod =
    CONTRACEPTIVE_METHODS.find((m) => m.name === selectedMethodName) || CONTRACEPTIVE_METHODS[0];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Confidential & Judgment-Free SRHR Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Sexual & Reproductive Health, Rights & Family Planning
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Accurate, evidence-based knowledge on modern contraception, menstrual health, and reproductive dignity. Completely private and anonymous.
          </p>
        </div>

        <button
          onClick={onDiscreetExit}
          className="self-start md:self-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          title="Quickly clear this confidential screen"
        >
          <EyeOff className="w-4 h-4 text-amber-400" />
          <span>Quick Discreet Exit</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-stone-900 border border-stone-800 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          All Methods
        </button>
        <button
          onClick={() => setFilter('breastfeeding')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'breastfeeding'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          🍼 Safe While Breastfeeding
        </button>
        <button
          onClick={() => setFilter('larc')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'larc'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          ⏳ Long-Acting Reversible (3–12 Years)
        </button>
        <button
          onClick={() => setFilter('hormone_free')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'hormone_free'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          🌿 100% Non-Hormonal
        </button>
      </div>

      {/* Main Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Method List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredMethods.map((method) => {
            const isSelected = activeMethod.name === method.name;
            return (
              <button
                key={method.name}
                onClick={() => setSelectedMethodName(method.name)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-stone-100 shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400 uppercase">
                    {method.category}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {method.effectiveness}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">
                  {method.name}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                  <span>Duration: {method.duration}</span>
                  {method.breastfeedingSafe && (
                    <span className="text-emerald-400 font-medium">· Nursing Safe</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Method Insight Card (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-white">
                  {activeMethod.name}
                </h3>
                <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-3 py-1 rounded-full">
                  {activeMethod.effectiveness}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Category: {activeMethod.category} · Duration: {activeMethod.duration}
              </p>
            </div>

            {/* How it works */}
            <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                How It Works & How It Is Administered:
              </span>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {activeMethod.howItWorks}
              </p>
            </div>

            {/* Breastfeeding Compatibility */}
            <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Breastfeeding & Postpartum Safety:
              </span>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {activeMethod.breastfeedingNote}
              </p>
            </div>

            {/* Myth vs Clinical Fact */}
            <div className="bg-stone-950/80 p-4 sm:p-5 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wide">
                <HelpCircle className="w-4 h-4" />
                <span>Common Community Myth vs Clinical Truth</span>
              </div>
              <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-lg text-xs text-rose-200 font-medium">
                {activeMethod.commonMyths}
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg text-xs text-emerald-200 leading-relaxed">
                {activeMethod.clinicalReality}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menstrual Health & Hygiene Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Menstrual Health & Safe Hygiene Guidance</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Practical Tips for Girls & Mothers in Low-Resource Settings
            </h3>
          </div>

          {onOpenCycleTracker && (
            <button
              onClick={onOpenCycleTracker}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Open Period Calendar & Alerts</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-stone-800/60 border border-stone-700 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-300 block text-sm">
              Safe Reusable Cloth Pads
            </span>
            <p className="text-stone-300 leading-relaxed">
              If using cloth pads, wash thoroughly with clean water and soap. Dry completely under direct sunlight (UV light acts as a natural disinfectant). Never store damp cloths in dark plastic bags.
            </p>
          </div>

          <div className="bg-stone-800/60 border border-stone-700 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-300 block text-sm">
              Managing Menstrual Cramps Naturally
            </span>
            <p className="text-stone-300 leading-relaxed">
              Place a clean bottle of warm water wrapped in cloth on the lower abdomen. Drink warm ginger tea or clean boiled water. Light walking and stretching relaxes uterine muscles without medication.
            </p>
          </div>

          <div className="bg-stone-800/60 border border-stone-700 p-4 rounded-xl space-y-2">
            <span className="font-bold text-rose-300 block text-sm">
              When to Seek Clinical Care
            </span>
            <p className="text-stone-300 leading-relaxed">
              Bleeding for more than 7 days, passing clots larger than 50 kobo/a coin, severe pelvic pain with fever, or foul-smelling yellow/green discharge can indicate pelvic inflammatory disease (PID) or an STI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
