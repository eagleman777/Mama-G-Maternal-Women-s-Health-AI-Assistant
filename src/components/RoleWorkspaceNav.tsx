import React, { useState } from 'react';
import { PersonaType, PERSONAS } from './PersonaSelection';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import {
  ArrowLeft,
  ChevronDown,
  Layers,
  Sparkles,
  Baby,
  Stethoscope,
  Heart,
  Calendar,
  Apple,
  MapPin,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  EyeOff,
  Smartphone,
  Laptop,
  Gamepad2,
} from 'lucide-react';
import { usePwa } from '../context/PwaContext';

interface RoleWorkspaceNavProps {
  selectedPersona: PersonaType;
  onBackToPersonas: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: SupportedLanguage;
}

interface CuratedModule {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const RoleWorkspaceNav: React.FC<RoleWorkspaceNavProps> = ({
  selectedPersona,
  onBackToPersonas,
  activeTab,
  setActiveTab,
  language,
}) => {
  const [isAllModulesOpen, setIsAllModulesOpen] = useState(false);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
  const { isInstalled, isDesktop, installApp, openInstallModal } = usePwa();

  const currentPersona =
    PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  // Define curated modules per persona
  const curatedMap: Record<PersonaType, CuratedModule[]> = {
    expectant: [
      {
        id: 'journey',
        label: t.navJourney || 'Pregnancy Journey',
        icon: <span className="text-sm">🤰</span>,
        badge: '42 Weeks',
      },
      {
        id: 'assistant',
        label: t.navAssistant || 'Consult Mama-G',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      },
      {
        id: 'triage',
        label: t.navTriage || 'Symptom Triage',
        icon: <Stethoscope className="w-3.5 h-3.5" />,
      },
      {
        id: 'nutrition',
        label: t.navNutrition || 'Maternal Nutrition',
        icon: <Apple className="w-3.5 h-3.5" />,
      },
      {
        id: 'facilities',
        label: t.navFacilities || 'Map & 774 Clinics',
        icon: <MapPin className="w-3.5 h-3.5" />,
        badge: 'Google Map',
      },
      {
        id: 'game',
        label: '🎮 3D Game',
        icon: <Gamepad2 className="w-3.5 h-3.5" />,
        badge: 'Rescue Run',
      },
    ],
    postpartum: [
      {
        id: 'ppd',
        label: t.navPpd || 'PPD Phenotyping',
        icon: <span className="text-sm">👶</span>,
        badge: 'Mental Health',
      },
      {
        id: 'vvf',
        label: t.navVvf || 'VVF Fistula Care',
        icon: <Heart className="w-3.5 h-3.5" />,
        badge: 'Free Repair',
      },
      {
        id: 'assistant',
        label: t.navAssistant || 'Consult Mama-G',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      },
      {
        id: 'nutrition',
        label: t.navNutrition || 'Lactation Nutrition',
        icon: <Apple className="w-3.5 h-3.5" />,
      },
      {
        id: 'facilities',
        label: t.navFacilities || 'Map & 774 Clinics',
        icon: <MapPin className="w-3.5 h-3.5" />,
        badge: 'Google Map',
      },
    ],
    chw: [
      {
        id: 'triage',
        label: t.navTriage || 'Symptom Triage Matrix',
        icon: <Stethoscope className="w-3.5 h-3.5" />,
        badge: 'Algo Notarized',
      },
      {
        id: 'chw',
        label: t.navChw || 'CHW Co-Pilot',
        icon: <Layers className="w-3.5 h-3.5" />,
        badge: 'Field Protocols',
      },
      {
        id: 'facilities',
        label: t.navFacilities || 'Map & 774 LGA Clinics',
        icon: <MapPin className="w-3.5 h-3.5" />,
        badge: 'Google Map',
      },
      {
        id: 'vvf',
        label: t.navVvf || 'VVF Referral Centers',
        icon: <Heart className="w-3.5 h-3.5" />,
      },
      {
        id: 'assistant',
        label: t.navAssistant || 'Mama-G Midwife',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      },
    ],
    midlife: [
      {
        id: 'cycle',
        label: t.navCycle || 'Period & Cycle Tracker',
        icon: <Calendar className="w-3.5 h-3.5" />,
        badge: 'Ovulation',
      },
      {
        id: 'menopause',
        label: t.navMenopause || 'Menopause & Midlife',
        icon: <span className="text-sm">🌿</span>,
      },
      {
        id: 'srhr',
        label: t.navSrhr || 'SRHR & Planning',
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
      },
      {
        id: 'gcorner',
        label: t.navGCorner || 'G-Corner Sanctuary',
        icon: <Heart className="w-3.5 h-3.5" />,
      },
      {
        id: 'assistant',
        label: t.navAssistant || 'Consult Mama-G',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      },
    ],
  };

  const curatedModules = curatedMap[selectedPersona] || curatedMap.expectant;

  // Complete list of all 12 modules for full accessibility
  const allModules = [
    { id: 'assistant', label: t.navAssistant || 'Consult Mama-G', icon: '💬', desc: 'AI Digital Midwife with voice input' },
    { id: 'journey', label: t.navJourney || 'Pregnancy Journey', icon: '🤰', desc: '42-Week milestones & kick counter' },
    { id: 'triage', label: t.navTriage || 'Symptom Triage', icon: '⚖️', desc: 'Algorand-notarized clinical triage' },
    { id: 'facilities', label: t.navFacilities || 'Map & 774 LGA Clinics', icon: '🗺️', desc: 'Google Map discovery & 774 LGA clinics' },
    { id: 'ppd', label: t.navPpd || 'PPD Phenotyping Suite', icon: '👶', desc: 'Maternal mental health screening' },
    { id: 'vvf', label: t.navVvf || 'VVF Fistula Care', icon: '💧', desc: '100% free surgical repair centers' },
    { id: 'chw', label: t.navChw || 'CHW Co-Pilot', icon: '🧰', desc: 'Frontline WHO/FMOH clinical protocols' },
    { id: 'cycle', label: t.navCycle || 'Period & Cycle', icon: '🌸', desc: 'Menstrual calendar & ovulation tracker' },
    { id: 'menopause', label: t.navMenopause || 'Menopause Hub', icon: '🌿', desc: 'Hot flush relief & midlife wellness' },
    { id: 'nutrition', label: t.navNutrition || 'Nutrition Advisor', icon: '🥑', desc: 'Trimester diet & African superfoods' },
    { id: 'srhr', label: t.navSrhr || 'SRHR & Planning', icon: '🛡️', desc: 'Confidential reproductive choices' },
    { id: 'gcorner', label: t.navGCorner || 'G-Corner Sanctuary', icon: '👵', desc: 'Old Mama faith-honoring wisdom' },
    { id: 'game', label: '🎮 Midwife Odyssey 3D Game', icon: '🎮', desc: 'Three.js 3D savanna maternal rescue run' },
  ];

  return (
    <div className="bg-stone-900 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Left: Back to Persona Selection Button and Current Persona Tag */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBackToPersonas}
              className="h-9 px-3 text-xs sm:text-sm font-semibold rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 hover:border-stone-600 flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Back to Persona Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>← Back to Personas</span>
            </button>

            {/* Current Persona Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700/80 text-xs">
              <span className="text-base select-none" role="img" aria-label={currentPersona.title}>
                {currentPersona.emoji}
              </span>
              <span className="font-bold text-white hidden xs:inline">
                {currentPersona.title}
              </span>
            </div>
          </div>

          {/* Right / Center: Role-Curated Module Tabs + All Modules Toggle */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {curatedModules.map((mod) => {
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveTab(mod.id)}
                  className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                      : 'bg-stone-800/70 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60'
                  }`}
                  aria-pressed={isActive}
                >
                  {mod.icon}
                  <span>{mod.label}</span>
                  {mod.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-stone-950/20 text-stone-900 font-bold'
                          : 'bg-stone-700/50 text-stone-400'
                      }`}
                    >
                      {mod.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* All Modules Dropdown Toggle for 100% Feature Preservation */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsAllModulesOpen(!isAllModulesOpen)}
                className={`h-9 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
                  isAllModulesOpen
                    ? 'bg-stone-750 text-white border-amber-500/50'
                    : 'bg-stone-800/50 text-stone-400 hover:text-stone-200 border-stone-700/60'
                }`}
                title="Explore all 14 clinical and educational modules"
                aria-expanded={isAllModulesOpen}
                aria-haspopup="true"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">All Modules</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isAllModulesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* All Modules Floating Popover Menu */}
              {isAllModulesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50 bg-black/40"
                    onClick={() => setIsAllModulesOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-72 sm:w-80 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2 max-h-[80vh] overflow-y-auto">
                    <div className="px-2 py-1.5 border-b border-stone-800 text-xs font-bold text-stone-300 flex items-center justify-between">
                      <span>All Clinical Modules ({allModules.length})</span>
                      <span className="text-[10px] text-stone-400">Tap to switch</span>
                    </div>
                    <div className="py-1 space-y-0.5">
                      {allModules.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsAllModulesOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 text-xs transition-colors cursor-pointer ${
                            activeTab === item.id
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'hover:bg-stone-800 text-stone-200'
                          }`}
                        >
                          <span className="text-base select-none mt-0.5">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white">{item.label}</div>
                            <div className="text-[11px] text-stone-400 truncate">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {!isInstalled && (
                      <div className="pt-2 mt-1 border-t border-stone-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAllModulesOpen(false);
                            installApp();
                          }}
                          className="w-full py-2 px-3 bg-gradient-to-r from-amber-600/25 to-rose-600/25 hover:from-amber-600/35 hover:to-rose-600/35 text-amber-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 border border-amber-500/30 transition-colors cursor-pointer"
                        >
                          {isDesktop ? (
                            <Laptop className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{isDesktop ? '💻 Install on Laptop / PC' : '📲 Install App on Phone'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
