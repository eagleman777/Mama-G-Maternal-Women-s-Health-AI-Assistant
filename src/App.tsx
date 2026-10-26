/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
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
import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PwaProvider } from './context/PwaContext';
import { SupportedLanguage, UserContext } from './types';
import { ShieldCheck, Eye } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isKickCounterOpen, setIsKickCounterOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isDiscreetMode, setIsDiscreetMode] = useState<boolean>(false);

  const { userProfile } = useAuth();

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
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors"
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

      {/* Accessible Header adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onDiscreetExit={handleDiscreetExit}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-6">
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
            onAskMamaG={(prompt) => {
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
      </main>

      {/* Universal Footer */}
      <footer className="no-print bg-stone-950 border-t border-stone-900 py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Mama-G Maternal & Women's Health AI Assistant · Low-Resource & Offline-First Design</span>
          </div>
          <span className="text-[11px] text-stone-500">
            Strictly educational triage. Not a substitute for in-person clinical diagnosis or emergency obstetric care.
          </span>
        </div>
      </footer>

      {/* Modals */}
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
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
      />
    </div>
  );
}

export default function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PwaProvider>
  );
}

