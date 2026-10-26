import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  AlertOctagon,
  Heart,
  MapPin,
  CheckSquare,
  ShieldAlert,
  Search,
  Building2,
  Ambulance,
  Globe2,
  ChevronDown,
  ChevronUp,
  Brain,
  Shield,
  EyeOff,
  UserCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  NIGERIA_STATES_EMERGENCY_DATA,
  NIGERIA_EMERGENCY_OVERVIEW,
  MENTAL_HEALTH_CRISIS_DATA,
  DOMESTIC_VIOLENCE_GBV_DATA,
  NigeriaStateEmergency,
} from '../data/nigeriaEmergencyHotlines';
import { EMERGENCY_HOTLINES } from '../data/clinicalKnowledge';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRedFlag?: (flag: any) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'nigeria' | 'mental_health' | 'domestic_violence' | 'firstaid' | 'regional'
  >('nigeria');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [expandedState, setExpandedState] = useState<string | null>('Lagos');

  if (!isOpen) return null;

  const zones = [
    'All',
    'South West',
    'South South',
    'South East',
    'North Central',
    'North West',
    'North East',
  ];

  const filteredNigeriaStates = NIGERIA_STATES_EMERGENCY_DATA.filter((item) => {
    const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesZone;
    const matchesQuery =
      item.state.toLowerCase().includes(q) ||
      item.capital.toLowerCase().includes(q) ||
      item.zone.toLowerCase().includes(q) ||
      item.referralHospitals.some((h) => h.toLowerCase().includes(q)) ||
      item.maternalAmbulanceHelpline.toLowerCase().includes(q);
    return matchesZone && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-900 border border-rose-700/60 text-stone-100 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-600 px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Emergency Obstetric, Mental Health & Crisis SOS
              </h2>
              <p className="text-xs text-rose-100">
                24/7 Maternal Ambulance, Crisis Helplines, SARC & Domestic Violence Protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick discreet close button for safety */}
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-rose-800 hover:bg-rose-900 text-rose-100 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-rose-700"
              title="Quickly hide this screen if someone enters the room"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discreet Hide</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-rose-100 hover:text-white hover:bg-rose-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-950 px-4 sm:px-5 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('nigeria')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'nigeria'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>36 Nigeria States + FCT ({NIGERIA_STATES_EMERGENCY_DATA.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mental_health')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'mental_health'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-rose-400" />
              <span>Mental Health & Suicide SOS</span>
            </button>

            <button
              onClick={() => setActiveTab('domestic_violence')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'domestic_violence'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-200" />
              <span>Domestic Violence & GBV</span>
            </button>

            <button
              onClick={() => setActiveTab('firstaid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'firstaid'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Red Flags & First Aid</span>
            </button>

            <button
              onClick={() => setActiveTab('regional')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'regional'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Other African Countries</span>
            </button>
          </div>

          {/* Rapid National Toll-Free One-Tap */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-stone-400">Universal SOS:</span>
            <a
              href="tel:112"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md flex items-center gap-1 font-mono font-bold"
            >
              <PhoneCall className="w-3 h-3" />
              <span>112 (Toll-Free)</span>
            </a>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* ================= VIEW 1: NIGERIA 36 STATES + FCT ================= */}
          {activeTab === 'nigeria' && (
            <div className="space-y-4">
              {/* National Overview Alert */}
              <div className="bg-rose-950/70 border border-rose-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-rose-300 block text-sm">
                    Federal Republic of Nigeria Emergency Triage Response
                  </span>
                  <p className="text-stone-300 mt-0.5">
                    For life-threatening maternal convulsions, heavy bleeding, or obstructed labor, dial <strong>112</strong> immediately from any GSM network (MTN, Airtel, Glo, 9mobile) or call your specific State Maternal Emergency Desk below.
                  </p>
                  <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-600/30 flex items-center gap-1.5">
                    <span>🏥 <strong>Need the exact Primary Health Center in your local ward?</strong> Switch to the <strong>"774 LGA Health Centers"</strong> tab in the main menu to browse addresses and phone numbers for all 774 LGAs.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="tel:112"
                    className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 112</span>
                  </a>
                  <a
                    href="tel:122"
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-lg font-bold"
                  >
                    FRSC 122
                  </a>
                </div>
              </div>

              {/* Search & Zone Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by state (e.g. Lagos, Kano, Rivers, Akwa Ibom, Oyo, Borno)..."
                    className="w-full bg-stone-800 text-stone-100 pl-10 pr-4 py-2.5 rounded-xl border border-stone-700 text-xs focus:outline-none focus:border-rose-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  {zones.map((z) => (
                    <button
                      key={z}
                      onClick={() => setSelectedZone(z)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                        selectedZone === z
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* States Directory List */}
              <div className="space-y-3">
                <div className="text-xs text-stone-400 font-medium flex items-center justify-between">
                  <span>
                    Showing {filteredNigeriaStates.length} of {NIGERIA_STATES_EMERGENCY_DATA.length} States
                  </span>
                  <span>Tap on state card to expand referral hospital details</span>
                </div>

                {filteredNigeriaStates.length === 0 ? (
                  <div className="bg-stone-800/40 border border-stone-800 p-8 rounded-xl text-center text-stone-400 text-xs">
                    No matching state or referral hospital found for "{searchQuery}". Try searching another Nigerian state or clear search filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredNigeriaStates.map((st) => {
                      const isExpanded = expandedState === st.state;
                      const primaryPhone = st.maternalAmbulanceHelpline.split('(')[0].trim();
                      const cleanDialNumber = primaryPhone.replace(/[^0-9]/g, '');

                      return (
                        <div
                          key={st.state}
                          className="bg-stone-800/70 border border-stone-700/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-rose-500/50 transition-colors"
                        >
                          {/* State Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-base">
                                  {st.state} State
                                </h3>
                                <span className="text-[10px] bg-stone-700 text-stone-300 px-2 py-0.5 rounded font-medium">
                                  {st.zone}
                                </span>
                              </div>
                              <span className="text-xs text-stone-400">
                                Capital: {st.capital}
                              </span>
                            </div>

                            {/* Toll Free Badge */}
                            <div className="flex items-center gap-1.5">
                              {st.tollFree.map((tf) => (
                                <a
                                  key={tf}
                                  href={`tel:${tf}`}
                                  className="bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 px-2 py-1 rounded text-xs font-mono font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                                  title={`Call Toll Free ${tf}`}
                                >
                                  📞 {tf}
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Maternal Ambulance / Emergency Desk */}
                          <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-700 space-y-1">
                            <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1.5">
                              <Ambulance className="w-3.5 h-3.5 text-rose-400" />
                              Maternal Ambulance & EMS Hotline:
                            </span>
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="font-bold text-amber-300 text-xs sm:text-sm font-mono truncate">
                                {st.maternalAmbulanceHelpline}
                              </span>
                              <a
                                href={`tel:${cleanDialNumber}`}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded-md text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Call Desk</span>
                              </a>
                            </div>
                          </div>

                          {/* State EOC */}
                          <div className="text-xs text-stone-300 flex items-center justify-between">
                            <span className="text-stone-400 text-[11px]">Emergency Ops Center:</span>
                            <span className="font-mono text-stone-200 text-[11px]">
                              {st.stateEmergencyOpsCenter}
                            </span>
                          </div>

                          {/* Toggle Referral Hospitals */}
                          <div className="border-t border-stone-700/60 pt-2">
                            <button
                              type="button"
                              onClick={() => setExpandedState(isExpanded ? null : st.state)}
                              className="text-xs text-stone-400 hover:text-stone-200 flex items-center justify-between w-full font-medium"
                            >
                              <span>
                                {st.referralHospitals.length} Tertiary / CEmONC Referral Centers
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-1 text-xs text-stone-300 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                                <span className="font-bold text-amber-400 text-[11px] block mb-1">
                                  Accredited Emergency Maternity Facilities:
                                </span>
                                <ul className="space-y-1 text-[11px] list-disc pl-4 text-stone-300">
                                  {st.referralHospitals.map((hosp, hIdx) => (
                                    <li key={hIdx}>{hosp}</li>
                                  ))}
                                </ul>
                                {st.emergencyNotes && (
                                  <p className="text-[10px] text-amber-300/80 italic mt-1.5 pt-1 border-t border-stone-800">
                                    Note: {st.emergencyNotes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: MENTAL HEALTH & SUICIDE CRISIS ================= */}
          {activeTab === 'mental_health' && (
            <div className="space-y-5">
              {/* Crisis Header Alert */}
              <div className="bg-amber-950/70 border border-amber-500/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
                  <Brain className="w-5 h-5 text-amber-400" />
                  <span>Immediate Perinatal Mental Health & Suicide Crisis Support</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {MENTAL_HEALTH_CRISIS_DATA.overview}
                </p>
              </div>

              {/* Immediate De-escalation Protocol */}
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl space-y-2.5 text-xs">
                <span className="font-bold text-rose-400 text-xs sm:text-sm uppercase tracking-wider block">
                  Critical Safety Protocol for Family & Health Workers:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-stone-300">
                  {MENTAL_HEALTH_CRISIS_DATA.emergencyActions.map((act, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-800/80 p-3 rounded-lg border border-stone-700 flex items-start gap-2.5"
                    >
                      <span className="font-bold text-amber-400 shrink-0">{idx + 1}.</span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* National & State Mental Health Contacts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>24/7 Mental Health Hotlines & Neuropsychiatric Emergency Desks</span>
                  </h3>
                  <span className="text-xs text-stone-400">Nigeria Toll-Free & State Units</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MENTAL_HEALTH_CRISIS_DATA.contacts.map((contact, idx) => {
                    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={idx}
                        className="bg-stone-800/70 border border-stone-700/80 rounded-xl p-4 shadow-sm space-y-2.5 hover:border-amber-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wide">
                              {contact.category}
                            </span>
                            <h4 className="font-bold text-white text-sm mt-0.5">
                              {contact.name}
                            </h4>
                            <span className="text-xs text-stone-400">
                              {contact.location} · {contact.hours}
                            </span>
                          </div>

                          {contact.tollFree && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              Toll-Free
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-300 leading-snug">
                          {contact.description}
                        </p>

                        <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between">
                          <span className="font-bold text-amber-300 text-sm font-mono">
                            {contact.phone}
                          </span>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call Lifeline</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 3: DOMESTIC VIOLENCE & GBV ================= */}
          {activeTab === 'domestic_violence' && (
            <div className="space-y-5">
              {/* GBV Header Alert with Confidentiality Notice */}
              <div className="bg-purple-950/70 border border-purple-500/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Confidential Domestic Violence & Sexual Assault (GBV) Protection</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-purple-200 bg-purple-900/60 px-2.5 py-1 rounded-md border border-purple-700">
                    <Lock className="w-3 h-3 text-purple-300" />
                    <span>Strictly Confidential</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {DOMESTIC_VIOLENCE_GBV_DATA.overview}
                </p>
              </div>

              {/* Actionable Survival & 72-Hour SARC Guidelines */}
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl space-y-3 text-xs">
                <span className="font-bold text-purple-300 text-xs sm:text-sm uppercase tracking-wider block">
                  Actionable Emergency Safety & Post-Assault Protocol:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-stone-300">
                  {DOMESTIC_VIOLENCE_GBV_DATA.emergencyActions.map((act, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-800/80 p-3 rounded-lg border border-stone-700 flex items-start gap-2.5"
                    >
                      <span className="font-bold text-purple-400 shrink-0">{idx + 1}.</span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotlines and SARCs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-purple-400" />
                    <span>Free GBV Helplines, Police Rescue & Sexual Assault Referral Centres (SARCs)</span>
                  </h3>
                  <span className="text-xs text-stone-400">Emergency Shelter & Legal Aid</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DOMESTIC_VIOLENCE_GBV_DATA.contacts.map((contact, idx) => {
                    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={idx}
                        className="bg-stone-800/70 border border-stone-700/80 rounded-xl p-4 shadow-sm space-y-2.5 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wide">
                              {contact.category}
                            </span>
                            <h4 className="font-bold text-white text-sm mt-0.5">
                              {contact.name}
                            </h4>
                            <span className="text-xs text-stone-400">
                              {contact.location} · {contact.hours}
                            </span>
                          </div>

                          {contact.tollFree && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              Toll-Free
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-300 leading-snug">
                          {contact.description}
                        </p>

                        <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between">
                          <span className="font-bold text-purple-300 text-sm font-mono">
                            {contact.phone}
                          </span>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call Helpline</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: RED FLAGS & IMMEDIATE FIRST AID ================= */}
          {activeTab === 'firstaid' && (
            <div className="space-y-5">
              <div className="bg-rose-950/70 border border-rose-500/50 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Maternal & Neonatal Danger Signs Requiring Immediate Emergency Transfer
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  If any of the following danger signs occur, do not wait for clinic hours. Arrange transport to the nearest CEmONC hospital immediately:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <span className="font-bold text-rose-400 block text-sm">
                    1. Heavy Vaginal Bleeding (Antepartum / Postpartum)
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Soaking &gt;2 sanitary pads in an hour or passing large clots. If post-delivery: vigorously rub the fundus (lower belly) until firm.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <span className="font-bold text-rose-400 block text-sm">
                    2. Severe Headache, Blurry Vision, or Fits (Eclampsia)
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Indicates severe pre-eclampsia. Keep patient in quiet, darkened room on left side. Administer Magnesium Sulfate per protocol.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <span className="font-bold text-rose-400 block text-sm">
                    3. Absent or Drastically Decreased Baby Kicks
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Fewer than 4 kicks in 1 hour while resting on the left side after 28 weeks. Requires immediate fetal heart rate auscultation.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <span className="font-bold text-rose-400 block text-sm">
                    4. High Fever (&gt;38°C) or Foul Lochia Discharge
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Sign of puerperal sepsis or severe malaria in pregnancy. Demands urgent IV antibiotics and antimalarial therapy.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <span className="font-bold text-rose-400 block text-sm">
                    5. Cord Prolapse or Ruptured Water with Green Fluid
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Knee-chest position with hips elevated in the air immediately to prevent cord compression. Rush to operating theatre.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <span className="font-bold text-rose-400 block text-sm">
                    6. Newborn: Fast Breathing, Grunting, Hypothermia
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Breaths &gt; 60/min, chest indrawing, or refusal to suck breast milk. Keep baby warm skin-to-skin (KMC) during transfer.
                  </p>
                </div>
              </div>

              {/* What to do while waiting for ambulance */}
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-amber-400 block">
                  Critical Steps While Transport / Ambulance is En Route:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-stone-300">
                  <li>Place mother in the <strong>Left Lateral Position</strong> to relieve pressure on the inferior vena cava and preserve placental perfusion.</li>
                  <li><strong>DO NOT</strong> administer local herbal infusions, potash, native chalk, or aspirin.</li>
                  <li>Keep patient warm with clean cotton blankets and ensure airways are clear if convulsion occurred.</li>
                  <li>Grab the ANC clinic card, baby wraps, and emergency delivery kit ("Mama Kit").</li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= VIEW 5: OTHER AFRICAN COUNTRIES ================= */}
          {activeTab === 'regional' && (
            <div className="space-y-4">
              <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700 text-xs text-stone-300">
                <span className="font-bold text-white block mb-1">
                  Regional African National Emergency Desks & Red Cross
                </span>
                <p>
                  Toll-free emergency lines for expectant mothers and community healthcare workers across Eastern and Southern Africa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {EMERGENCY_HOTLINES.map((hotline, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-800 p-3.5 rounded-xl border border-stone-700 text-xs flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[11px] block">
                        {hotline.country}
                      </span>
                      <span className="text-white font-medium text-xs mt-0.5 block">
                        {hotline.label}
                      </span>
                    </div>

                    <a
                      href={`tel:${hotline.number.split('/')[0].trim()}`}
                      className="font-bold text-amber-400 hover:text-amber-300 text-base font-mono bg-stone-900/80 p-2 rounded-lg text-center border border-stone-700/80"
                    >
                      📞 {hotline.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="bg-stone-950 px-5 sm:px-6 py-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>Emergency SOS Hotline Network</span>
            <span>·</span>
            <span className="text-emerald-400">112 Universal</span>
            <span>·</span>
            <span className="text-amber-400">0800 800 2000 Mental Health</span>
            <span>·</span>
            <span className="text-purple-400">0800 111 2222 GBV Toll-Free</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium transition-colors"
            >
              Close SOS Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
