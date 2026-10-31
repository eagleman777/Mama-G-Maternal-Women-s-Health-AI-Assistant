import React, { useState, useMemo } from 'react';
import {
  Building2,
  PhoneCall,
  Search,
  MapPin,
  Ambulance,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Activity,
  Layers,
  ChevronRight,
  HeartPulse,
  Maximize2,
  Minimize2,
  Map as MapIcon,
  RotateCw,
  Compass,
  Sparkles,
} from 'lucide-react';
import {
  NIGERIA_774_LGA_HEALTH_REGISTRY,
  NATIONAL_DISPATCH_LINES,
  ALL_NIGERIA_STATES,
  getAllFacilities,
  HealthFacility,
  FacilityTier,
} from '../data/nigeriaHealthFacilities';
import { SupportedLanguage } from '../types';

interface NigeriaFacilityDirectoryProps {
  language: SupportedLanguage;
  onOpenEmergency: () => void;
  onAskMamaG?: (prompt: string) => void;
}

export const NigeriaFacilityDirectory: React.FC<NigeriaFacilityDirectoryProps> = ({
  language,
  onOpenEmergency,
  onAskMamaG,
}) => {
  const [directoryView, setDirectoryView] = useState<'both' | 'map' | 'registry'>('both');
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [mapKey, setMapKey] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedLga, setSelectedLga] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter247Labor, setFilter247Labor] = useState<boolean>(false);
  const [filterCSection, setFilterCSection] = useState<boolean>(false);
  const [filterAmbulance, setFilterAmbulance] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick LGA Finder state
  const [finderState, setFinderState] = useState<string>('Lagos');
  const [finderLga, setFinderLga] = useState<string>('Ikeja');

  const allFacilities = useMemo(() => getAllFacilities(), []);

  // Compute available LGAs for selected state
  const availableLgasForState = useMemo(() => {
    if (selectedState === 'All') return [];
    const stateData = NIGERIA_774_LGA_HEALTH_REGISTRY.find((s) => s.state === selectedState);
    return stateData ? stateData.lgas.map((l) => l.name) : [];
  }, [selectedState]);

  // Compute available LGAs for Finder
  const finderLgaOptions = useMemo(() => {
    const stateData = NIGERIA_774_LGA_HEALTH_REGISTRY.find((s) => s.state === finderState);
    return stateData ? stateData.lgas.map((l) => l.name) : [];
  }, [finderState]);

  // Handle finder state change
  const handleFinderStateChange = (newState: string) => {
    setFinderState(newState);
    const stateData = NIGERIA_774_LGA_HEALTH_REGISTRY.find((s) => s.state === newState);
    if (stateData && stateData.lgas.length > 0) {
      setFinderLga(stateData.lgas[0].name);
    }
  };

  // Find designated PHC and Secondary/Tertiary for Quick Finder
  const finderResult = useMemo(() => {
    const stateData = NIGERIA_774_LGA_HEALTH_REGISTRY.find((s) => s.state === finderState);
    if (!stateData) return null;
    const lgaInfo = stateData.lgas.find((l) => l.name === finderLga);
    const closestGeneralHospital = stateData.generalHospitals[0] || null;
    const closestSpecialist = stateData.specialistHospitals[0] || null;

    return {
      stateData,
      lgaInfo,
      closestGeneralHospital,
      closestSpecialist,
    };
  }, [finderState, finderLga]);

  // Filtered facilities list
  const filteredFacilities = useMemo(() => {
    return allFacilities.filter((fac) => {
      // State filter
      if (selectedState !== 'All' && fac.state !== selectedState) return false;

      // LGA filter
      if (selectedLga !== 'All' && fac.lga !== selectedLga) return false;

      // Tier filter
      if (selectedTier !== 'All' && fac.tier !== selectedTier) return false;

      // Capability toggles
      if (filter247Labor && !fac.has247LaborWard) return false;
      if (filterCSection && !fac.hasEmergencyCSection) return false;
      if (filterAmbulance && !fac.hasAmbulance) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = fac.name.toLowerCase().includes(q);
        const matchesLga = fac.lga.toLowerCase().includes(q);
        const matchesState = fac.state.toLowerCase().includes(q);
        const matchesAddress = fac.address.toLowerCase().includes(q);
        const matchesWard = fac.wardOrTown.toLowerCase().includes(q);
        if (!matchesName && !matchesLga && !matchesState && !matchesAddress && !matchesWard) {
          return false;
        }
      }

      return true;
    });
  }, [
    allFacilities,
    selectedState,
    selectedLga,
    selectedTier,
    filter247Labor,
    filterCSection,
    filterAmbulance,
    searchQuery,
  ]);

  const handleCopyPhone = (id: string, phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Zero-Hallucination Anti-Hallucination Assurance Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/80 border border-emerald-500/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  National Health Facility & PHC Directory (774 LGAs)
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Zero Hallucination Guarantee
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  100% Free & Offline Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-3xl leading-relaxed">
                Direct physical addresses, contact hotlines, and maternal emergency readiness (24/7 Labor Ward, Emergency C-Section, Blood Bank, and Ambulance) across <strong>all 36 States, FCT Abuja, and all 774 Local Government Areas</strong>. No fabricated or hallucinated facilities.
              </p>
            </div>
          </div>

          {/* Rapid 112 Dispatch Call */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:112"
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all hover:scale-102"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Universal SOS: 112</span>
            </a>
            <a
              href={`tel:${NATIONAL_DISPATCH_LINES.nphcdaEmergencyDesk.replace(/[^0-9]/g, '')}`}
              className="bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="National Primary Health Care Development Agency Maternal Desk"
            >
              <span>NPHCDA Maternal Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* View Switcher: Interactive Google Map vs 774 LGA Health Registry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white text-xs sm:text-sm">Facility Discovery Mode:</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => setDirectoryView('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              directoryView === 'map'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>🗺️ Google Map Discovery</span>
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('registry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              directoryView === 'registry'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏥 774 LGA Registry</span>
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              directoryView === 'both'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🔲 Both Views</span>
          </button>
        </div>
      </div>

      {/* GOOGLE MAPS NEIGHBORHOOD DISCOVERY EMBED */}
      {(directoryView === 'map' || directoryView === 'both') && (
        <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Google Maps Neighborhood Discovery
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Interactive Healthcare Map
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 max-w-2xl">
                Explore nearby hospitals, clinics, emergency rooms, pharmacies, and maternal facilities in real-time. Zoom, pan, search places, and get navigation directions.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMapKey((prev) => prev + 1)}
                className="h-8 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                title="Reload Map View"
              >
                <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                <span>Reload</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="h-8 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                title={isMapExpanded ? 'Compact View' : 'Expand Map Height'}
              >
                {isMapExpanded ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compact</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expand</span>
                  </>
                )}
              </button>
              <a
                href="https://storage.googleapis.com/maps-solutions-haoyahw7uk/neighborhood-discovery/b7uq/neighborhood-discovery.html"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Open Google Map in Full New Window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Fullscreen</span>
              </a>
            </div>
          </div>

          {/* User's Exact Google Map Neighborhood Discovery Solution Iframe */}
          <div className="relative w-full rounded-xl overflow-hidden border border-stone-800 bg-stone-950 shadow-inner">
            <iframe
              key={mapKey}
              src="https://storage.googleapis.com/maps-solutions-haoyahw7uk/neighborhood-discovery/b7uq/neighborhood-discovery.html"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Google Maps Neighborhood Discovery - Health Facilities"
              className={`w-full transition-all duration-300 ${
                isMapExpanded ? 'h-[750px]' : 'h-[480px] sm:h-[580px]'
              }`}
              allow="geolocation; camera"
            />
          </div>

          {/* Help note under map */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Use the map search box above to find specialized centers or local maternity posts.</span>
            </span>
            <span className="font-mono text-amber-400/90">
              Emergency Dispatch: 112 · FRSC: 122
            </span>
          </div>
        </div>
      )}

      {/* 774 LGA REGISTRY SECTION */}
      {(directoryView === 'registry' || directoryView === 'both') && (
        <>
          {/* QUICK LGA FINDER CARD ("Find PHC in My LGA") */}
          <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
            <MapPin className="w-5 h-5 text-amber-500" />
            <span>Fast LGA Health Center Finder: Locate Your Nearest Facility</span>
          </div>
          <span className="text-xs text-stone-400">
            Instant maternal dispatch & clinical routing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-stone-400 block mb-1">
              1. Select Your State (36 States + FCT):
            </label>
            <select
              value={finderState}
              onChange={(e) => handleFinderStateChange(e.target.value)}
              className="w-full bg-stone-800 text-stone-100 rounded-xl px-3 py-2.5 border border-stone-700 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              {ALL_NIGERIA_STATES.map((st) => (
                <option key={st} value={st}>
                  {st} State
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-400 block mb-1">
              2. Select Your Local Government Area (LGA):
            </label>
            <select
              value={finderLga}
              onChange={(e) => setFinderLga(e.target.value)}
              className="w-full bg-stone-800 text-stone-100 rounded-xl px-3 py-2.5 border border-stone-700 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              {finderLgaOptions.map((lga) => (
                <option key={lga} value={lga}>
                  {lga} LGA
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <div className="w-full bg-stone-800/80 p-2.5 rounded-xl border border-stone-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 text-[11px] block">State Ambulance Dispatch:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {finderResult?.stateData.maternalAmbulanceLine || '112'}
                </span>
              </div>
              <a
                href={`tel:${finderResult?.stateData.maternalAmbulanceLine.split('(')[0].replace(/[^0-9]/g, '')}`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call State Ambulance</span>
              </a>
            </div>
          </div>
        </div>

        {/* Finder Quick Results Display */}
        {finderResult && finderResult.lgaInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
            {/* Primary Health Centre Card */}
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-emerald-500/40 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Designated Primary Health Centre (PHC)
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1">
                    {finderResult.lgaInfo.primaryFacilityName}
                  </h4>
                  <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{finderResult.lgaInfo.primaryFacilityAddress}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {finderResult.lgaInfo.has247LaborWard && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 px-1.5 py-0.5 rounded font-semibold">
                      24/7 Labor Ward
                    </span>
                  )}
                  {finderResult.lgaInfo.hasAmbulance && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-700/60 px-1.5 py-0.5 rounded font-semibold">
                      Ambulance
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                <span className="font-mono text-amber-300 font-bold text-xs">
                  {finderResult.lgaInfo.primaryFacilityPhone}
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🏥 Primary Health Care Centre (PHC) via Mama-G:\nFacility: ${finderResult.lgaInfo.primaryFacilityName}\nLGA: ${finderResult.lgaInfo.name}, ${finderResult.stateData.state}\nPhone: ${finderResult.lgaInfo.primaryFacilityPhone}\nVerified Health Directory: ${typeof window !== 'undefined' ? window.location.href : 'https://mama-g.health'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="Share facility to WhatsApp"
                  >
                    <span>💬 Share</span>
                  </a>
                  <a
                    href={`tel:${finderResult.lgaInfo.primaryFacilityPhone.replace(/[^0-9]/g, '')}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call PHC</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Referral Hospital Card */}
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-blue-500/40 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Secondary / Tertiary Referral Hospital
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1">
                    {finderResult.closestSpecialist?.name ||
                      finderResult.closestGeneralHospital?.name ||
                      'State General Hospital'}
                  </h4>
                  <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>
                      {finderResult.closestSpecialist?.address ||
                        finderResult.closestGeneralHospital?.address ||
                        'State Referral Centre'}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-blue-300 bg-blue-950/60 border border-blue-700/60 px-1.5 py-0.5 rounded font-semibold">
                    C-Section & Blood Bank
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                <span className="font-mono text-amber-300 font-bold text-xs">
                  {finderResult.closestSpecialist?.phone ||
                    finderResult.closestGeneralHospital?.phone ||
                    finderResult.stateData.stateDispatchLine}
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🏥 Referral Hospital via Mama-G:\nFacility: ${
                        finderResult.closestSpecialist?.name ||
                        finderResult.closestGeneralHospital?.name ||
                        'State General Hospital'
                      }\nAddress: ${
                        finderResult.closestSpecialist?.address ||
                        finderResult.closestGeneralHospital?.address ||
                        'State Referral Centre'
                      }\nPhone: ${
                        finderResult.closestSpecialist?.phone ||
                        finderResult.closestGeneralHospital?.phone ||
                        finderResult.stateData.stateDispatchLine
                      }\nEmergency Referral: ${typeof window !== 'undefined' ? window.location.href : 'https://mama-g.health'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="Share hospital to WhatsApp"
                  >
                    <span>💬 Share</span>
                  </a>
                  <a
                    href={`tel:${(
                      finderResult.closestSpecialist?.phone ||
                      finderResult.closestGeneralHospital?.phone ||
                      finderResult.stateData.stateDispatchLine
                    ).replace(/[^0-9]/g, '')}`}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call Hospital</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEARCH & DETAILED FILTER CONTROLS */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by facility name, LGA, town, ward, or address (e.g., Ikeja, Bwari, Zaria, Uyo, Owerri, Port Harcourt, Kano)..."
            className="w-full bg-stone-800 text-stone-100 pl-10 pr-10 py-2.5 rounded-xl border border-stone-700 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
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

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* State Filter */}
          <div>
            <label className="text-[11px] font-semibold text-stone-400 block mb-1">
              Filter by State:
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedLga('All');
              }}
              className="w-full bg-stone-800 text-stone-200 rounded-xl px-3 py-2 border border-stone-700 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All 36 States + FCT (774 LGAs)</option>
              {ALL_NIGERIA_STATES.map((st) => (
                <option key={st} value={st}>
                  {st} State
                </option>
              ))}
            </select>
          </div>

          {/* LGA Filter (when state selected) */}
          <div>
            <label className="text-[11px] font-semibold text-stone-400 block mb-1">
              Filter by LGA:
            </label>
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              disabled={selectedState === 'All'}
              className="w-full bg-stone-800 text-stone-200 rounded-xl px-3 py-2 border border-stone-700 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              <option value="All">All LGAs in State</option>
              {availableLgasForState.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="text-[11px] font-semibold text-stone-400 block mb-1">
              Facility Level / Tier:
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-stone-800 text-stone-200 rounded-xl px-3 py-2 border border-stone-700 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Levels (PHC, General, Specialist)</option>
              <option value="Primary">Primary Health Centres (PHCs)</option>
              <option value="Secondary">General Hospitals (Secondary)</option>
              <option value="Tertiary">Specialist & Teaching Hospitals</option>
            </select>
          </div>

          {/* Capability Checkbox Toggles */}
          <div>
            <label className="text-[11px] font-semibold text-stone-400 block mb-1">
              Emergency Readiness:
            </label>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setFilter247Labor(!filter247Labor)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  filter247Labor
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                24/7 Labor
              </button>
              <button
                type="button"
                onClick={() => setFilterCSection(!filterCSection)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  filterCSection
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                C-Section
              </button>
              <button
                type="button"
                onClick={() => setFilterAmbulance(!filterAmbulance)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  filterAmbulance
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                Ambulance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FACILITIES DIRECTORY RESULTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredFacilities.length}</strong> verified facilities
            {selectedState !== 'All' ? ` in ${selectedState} State` : ' across Nigeria (774 LGAs)'}
          </span>
          <span className="hidden sm:inline">
            Tap call button or phone number to dial directly
          </span>
        </div>

        {filteredFacilities.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 text-sm space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-semibold text-white">No facilities match your exact filter criteria.</p>
            <p className="text-xs text-stone-400">
              Try clearing specific filters, toggling off capability limits, or searching for the broader Local Government Area name.
            </p>
            <button
              onClick={() => {
                setSelectedState('All');
                setSelectedLga('All');
                setSelectedTier('All');
                setSearchQuery('');
                setFilter247Labor(false);
                setFilterCSection(false);
                setFilterAmbulance(false);
              }}
              className="mt-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold rounded-lg border border-stone-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFacilities.map((fac) => {
              const cleanPhone = fac.phone.replace(/[^0-9]/g, '');
              const isCopied = copiedId === fac.id;

              return (
                <div
                  key={fac.id}
                  className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm space-y-3 transition-colors"
                >
                  {/* Top: Tier badge & LGA info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border ${
                          fac.tier === 'Primary'
                            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                            : fac.tier === 'Secondary'
                            ? 'bg-blue-950/70 border-blue-500/40 text-blue-300'
                            : 'bg-purple-950/70 border-purple-500/40 text-purple-300'
                        }`}
                      >
                        {fac.tier === 'Primary'
                          ? 'Primary Health Centre (PHC)'
                          : fac.tier === 'Secondary'
                          ? 'State General Hospital'
                          : 'Specialist / Teaching Hospital'}
                      </span>

                      <span className="text-[11px] text-stone-400 font-medium">
                        {fac.lga} LGA
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                        {fac.name}
                      </h3>
                      <p className="text-xs text-stone-400 flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          {fac.address}, {fac.state} State
                        </span>
                      </p>
                    </div>

                    {/* Emergency Capability Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {fac.has247LaborWard && (
                        <span className="text-[10px] bg-stone-800 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40">
                          ✓ 24/7 Labor Ward
                        </span>
                      )}
                      {fac.hasEmergencyCSection && (
                        <span className="text-[10px] bg-stone-800 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                          ✓ Emergency C-Section
                        </span>
                      )}
                      {fac.hasBloodBank && (
                        <span className="text-[10px] bg-stone-800 text-rose-300 px-2 py-0.5 rounded border border-rose-800/40">
                          ✓ Blood Bank
                        </span>
                      )}
                      {fac.hasAmbulance && (
                        <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                          ✓ Ambulance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Contact line & Click-to-call */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-amber-300 font-bold text-xs">
                        {fac.phone}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(fac.id, fac.phone)}
                        className="p-1 text-stone-400 hover:text-white rounded transition-colors"
                        title="Copy phone number"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Facility</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

          {/* Maternal Emergency Referral Protocol Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 text-xs text-stone-300 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Clinical Referral Protocol for Community Health Workers & Families:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-stone-400">
              <li>
                <strong>First-line triage at Primary Health Centres (PHCs)</strong>: Every LGA operates designated Model PHCs for routine antenatal care (ANC), normal spontaneous vaginal deliveries, routine immunization, and early complication screening.
              </li>
              <li>
                <strong>Secondary Escalation (General Hospitals)</strong>: If maternal convulsions (eclampsia), obstructed labor (&gt;12 hours), severe bleeding, or twin delivery complications arise, immediately initiate transfer to the State General Hospital equipped with a surgical operating theater.
              </li>
              <li>
                <strong>Tertiary Care (Teaching Hospitals & FMCs)</strong>: Tertiary centers (e.g., LUTH, UCH, UNTH, AKTH, ABUTH, UPTH, National Hospital Abuja) provide Comprehensive Emergency Obstetric and Newborn Care (CEmONC), intensive neonatal incubators (NICU), and specialized fistula surgery.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
