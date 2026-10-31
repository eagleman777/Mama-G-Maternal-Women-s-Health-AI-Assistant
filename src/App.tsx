/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PersonaSelection, PersonaType } from './components/PersonaSelection';
import { RoleWorkspaceNav } from './components/RoleWorkspaceNav';
import { ChatAssistant } from './components/ChatAssistant';
import { SymptomTriageMatrix } from './components/SymptomTriageMatrix';
import { PregnancyJourney } from './components/PregnancyJourney';
import { ChwToolkit } from './components/ChwToolkit';
import { PpdPhenotypingSuite } from './components/PpdPhenotypingSuite';
import { SrhrHub } from './components/SrhrHub';
import { EmergencyModal } from './components/EmergencyModal';
import { KickCounterModal } from './components/KickCounterModal';
import { MenstrualCycleTracker } from './components/MenstrualCycleTracker';
import { GCorner } from './components/GCorner';
import { NutritionAdvisor } from './components/NutritionAdvisor';
import { MenopauseHub } from './components/MenopauseHub';
import { NigeriaFacilityDirectory } from './components/NigeriaFacilityDirectory';
import { VvfCareHub } from './components/VvfCareHub';
import { MidwifeHeroGame } from './components/MidwifeHeroGame';
import { SocialShareModal } from './components/SocialShareModal';
import { AuthModal } from './components/AuthModal';
import { BlockchainIdentityModal } from './components/BlockchainIdentityModal';
import { InstallPhoneModal } from './components/InstallPhoneModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PwaProvider, usePwa } from './context/PwaContext';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { SupportedLanguage, UserContext } from './types';
import { Eye, ShieldCheck, CheckCircle2, Share2 } from 'lucide-react';

function AppContent() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(() => {
    try {
      const saved = localStorage.getItem('mama_g_selected_persona');
      if (
        saved === 'expectant' ||
        saved === 'postpartum' ||
        saved === 'chw' ||
        saved === 'midlife'
      ) {
        return saved as PersonaType;
      }
    } catch {}
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('journey');
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isKickCounterOpen, setIsKickCounterOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState<boolean>(false);
  const [isDiscreetMode, setIsDiscreetMode] = useState<boolean>(false);
  const [isSocialOpen, setIsSocialOpen] = useState<boolean>(false);
  const [socialShareText, setSocialShareText] = useState<string | undefined>(undefined);

  const { userProfile } = useAuth();
  const {
    isOffline,
    isSimulatedOffline,
    isInstallModalOpen,
    openInstallModal,
    closeInstallModal,
    isInstalled,
    isDesktop,
    installApp,
  } = usePwa();
  const { receipts } = useCrypto();

  const [userContext, setUserContext] = useState<UserContext>({
    role: 'mother',
    isPregnant: true,
    weeks: 24,
    trimester: 2,
  });

  // Sync profile when loaded from cloud
  useEffect(() => {
    if (userProfile) {
      const userRole = userProfile.role || 'mother';
      setUserContext((prev) => ({
        ...prev,
        role: userRole,
        isPregnant: userRole === 'mother',
        isPostpartum: userRole === 'postpartum',
        weeks: userProfile.gestationWeeks || prev.weeks,
        trimester: (userProfile.gestationWeeks
          ? userProfile.gestationWeeks <= 12
            ? 1
            : userProfile.gestationWeeks <= 26
            ? 2
            : 3
          : prev.trimester) as any,
      }));
      if (userProfile.preferredLanguage) {
        setLanguage(userProfile.preferredLanguage);
      }
    }
  }, [userProfile]);


  const handleSelectPersona = (persona: PersonaType) => {
    setSelectedPersona(persona);
    try {
      localStorage.setItem('mama_g_selected_persona', persona);
    } catch {}

    // Adjust user context and set recommended start tab
    if (persona === 'expectant') {
      setUserContext((prev) => ({
        ...prev,
        role: 'mother',
        isPregnant: true,
        isPostpartum: false,
        weeks: prev.weeks || 24,
        trimester: 2,
      }));
      setActiveTab('journey');
    } else if (persona === 'postpartum') {
      setUserContext((prev) => ({
        ...prev,
        role: 'postpartum',
        isPregnant: false,
        isPostpartum: true,
      }));
      setActiveTab('ppd');
    } else if (persona === 'chw') {
      setUserContext((prev) => ({
        ...prev,
        role: 'chw',
        isPregnant: false,
        isPostpartum: false,
      }));
      setActiveTab('triage');
    } else if (persona === 'midlife') {
      setUserContext((prev) => ({
        ...prev,
        role: 'menopause',
        isPregnant: false,
        isPostpartum: false,
      }));
      setActiveTab('cycle');
    }
  };

  const handleResetPersona = () => {
    setSelectedPersona(null);
    try {
      localStorage.removeItem('mama_g_selected_persona');
    } catch {}
  };

  const handleDiscreetExit = () => {
    setIsDiscreetMode(true);
  };

  if (isDiscreetMode) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-300 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-400">
          <Eye className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">General Health & Nutrition Portal</h1>
        <p className="text-sm text-stone-400 max-w-md">
          Healthy daily hydration: Adults should drink 2.5 to 3 liters of clean boiled or filtered water daily. A balanced diet consists of vegetables, beans, grains, and clean water.
        </p>
        <button
          onClick={() => setIsDiscreetMode(false)}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
        >
          Return to Mama-G Assistant
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Offline Status & PWA Install Banner */}
      <OfflineIndicator language={language} />

      {/* Top Navigation Bar adhering to Refactoring Guidelines */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onDiscreetExit={handleDiscreetExit}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCrypto={() => setIsCryptoModalOpen(true)}
        onOpenSocial={() => {
          setSocialShareText(undefined);
          setIsSocialOpen(true);
        }}
        selectedPersona={selectedPersona}
        onResetPersona={handleResetPersona}
      />

      {/* When a persona is active, render dynamic workspace controls with "← Back to Persona Selection" */}
      {selectedPersona && (
        <RoleWorkspaceNav
          selectedPersona={selectedPersona}
          onBackToPersonas={handleResetPersona}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-6">
        {/* Step 1: Initial View - Progressive Disclosure Persona Selection */}
        {!selectedPersona ? (
          <PersonaSelection
            language={language}
            onSelectPersona={handleSelectPersona}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenGame={() => {
              setSelectedPersona('chw');
              setActiveTab('game');
            }}
            onOpenSocial={() => {
              setSocialShareText(undefined);
              setIsSocialOpen(true);
            }}
          />
        ) : (
          /* Step 2: Dynamic View Switching - Curated Clinical Modules */
          <>
            {activeTab === 'assistant' && (
              <ChatAssistant
                language={language}
                userContext={userContext}
                setUserContext={setUserContext}
                onOpenKickCounter={() => setIsKickCounterOpen(true)}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenFacilities={() => setActiveTab('facilities')}
              />
            )}

            {activeTab === 'facilities' && (
              <NigeriaFacilityDirectory
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onAskMamaG={(_prompt) => setActiveTab('assistant')}
              />
            )}

            {activeTab === 'gcorner' && (
              <GCorner
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {activeTab === 'menopause' && (
              <MenopauseHub
                language={language}
                onAskMamaG={(_prompt) => setActiveTab('assistant')}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {activeTab === 'nutrition' && (
              <NutritionAdvisor
                language={language}
                onAskMamaG={(_prompt) => setActiveTab('assistant')}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {activeTab === 'cycle' && (
              <MenstrualCycleTracker
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onAskMamaG={() => setActiveTab('assistant')}
              />
            )}

            {activeTab === 'triage' && (
              <SymptomTriageMatrix
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onAskMamaG={(_prompt) => setActiveTab('assistant')}
                onOpenFacilities={() => setActiveTab('facilities')}
              />
            )}

            {activeTab === 'vvf' && (
              <VvfCareHub
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onAskMamaG={(_prompt) => {
                  setActiveTab('assistant');
                }}
              />
            )}

            {activeTab === 'ppd' && (
              <PpdPhenotypingSuite
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {activeTab === 'journey' && (
              <PregnancyJourney
                onOpenKickCounter={() => setIsKickCounterOpen(true)}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {activeTab === 'chw' && <ChwToolkit />}

            {activeTab === 'srhr' && (
              <SrhrHub
                onDiscreetExit={handleDiscreetExit}
                onOpenCycleTracker={() => setActiveTab('cycle')}
              />
            )}

            {activeTab === 'game' && (
              <MidwifeHeroGame
                onClose={() => setActiveTab('assistant')}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Footer with Clean Status Bar adhering to DPG Guidelines */}
      <footer className="no-print bg-stone-900 border-t border-stone-800 py-3 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Status Bar: "🟢 Offline Ready (Synced) · 🔒 Anonymous & Confidential" */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-stone-200">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span>
                  {isOffline
                    ? isSimulatedOffline
                      ? '🟡 Offline Ready (Simulated)'
                      : '🟡 Offline Ready (Cached)'
                    : '🟢 Offline Ready (Synced)'}
                </span>
              </span>
              <span className="text-stone-600">·</span>
              <button
                type="button"
                onClick={() => setIsCryptoModalOpen(true)}
                className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer font-medium focus:outline-none focus-visible:underline"
                title="Open Algorand Anonymous Keystore & Health Notarization Ledger"
              >
                <span>🔒 Anonymous & Confidential</span>
                {receipts.length > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    {receipts.length} notarized
                  </span>
                )}
              </button>
              {!isInstalled && (
                <>
                  <span className="text-stone-600">·</span>
                  <button
                    type="button"
                    onClick={installApp}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer underline focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
                    title={isDesktop ? "Install Mama-G on laptop or PC" : "Install Mama-G on phone"}
                  >
                    <span>{isDesktop ? '💻 Install on Laptop / PC' : '📲 Install on Phone'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Clinical Educational Disclaimer */}
            <div className="text-[11px] text-stone-400 text-center sm:text-right max-w-xl">
              Strictly educational triage. Not a substitute for in-person clinical diagnosis or emergency obstetric care.
            </div>
          </div>

          {/* Official Social Media Community Handles Bar */}
          <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5 text-stone-400 text-[11px]">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-amber-300/90 font-bold flex items-center gap-1">
                <span>🌺 Follow @MamaGHealth:</span>
              </span>
              <div className="flex items-center gap-2 text-stone-300">
                <a
                  href="https://chat.whatsapp.com/invite/MamaGMaternalCare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors p-1"
                  title="WhatsApp Maternal Circle (+234 800 MAMAG CARE)"
                  aria-label="WhatsApp Community"
                >
                  💬 WhatsApp
                </a>
                <span className="text-stone-700">·</span>
                <a
                  href="https://x.com/MamaGHealth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-1 font-bold"
                  title="X (formerly Twitter) @MamaGHealth"
                  aria-label="X Twitter"
                >
                  𝕏 @MamaGHealth
                </a>
                <span className="text-stone-700">·</span>
                <a
                  href="https://instagram.com/mamag.health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-400 transition-colors p-1"
                  title="Instagram @mamag.health"
                  aria-label="Instagram"
                >
                  📷 Instagram
                </a>
                <span className="text-stone-700 hidden md:inline">·</span>
                <a
                  href="https://t.me/mamaghealth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors p-1 hidden md:inline"
                  title="Telegram Channel @MamaGHealthBot"
                  aria-label="Telegram"
                >
                  ✈️ Telegram
                </a>
                <span className="text-stone-700 hidden lg:inline">·</span>
                <a
                  href="https://tiktok.com/@mamaghealth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors p-1 hidden lg:inline font-bold"
                  title="TikTok @mamaghealth"
                  aria-label="TikTok"
                >
                  🎵 TikTok
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setSocialShareText(undefined);
                setIsSocialOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700/80 shadow-sm"
              title="Open Social Handles & Share App"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Connect & Share</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals - Preserved exactly as required */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <KickCounterModal
        isOpen={isKickCounterOpen}
        onClose={() => setIsKickCounterOpen(false)}
        onEmergencyTrigger={() => {
          setIsKickCounterOpen(false);
          setIsEmergencyOpen(true);
        }}
        onOpenSocial={(text) => {
          setSocialShareText(text);
          setIsSocialOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
      />

      <BlockchainIdentityModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
      />

      <InstallPhoneModal
        isOpen={isInstallModalOpen}
        onClose={closeInstallModal}
        language={language}
      />

      <SocialShareModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        language={language}
        customText={socialShareText}
      />
    </div>
  );
}

export default function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <CryptoProvider>
          <AppContent />
        </CryptoProvider>
      </AuthProvider>
    </PwaProvider>
  );
}
