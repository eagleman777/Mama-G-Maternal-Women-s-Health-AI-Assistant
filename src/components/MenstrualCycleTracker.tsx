import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  Droplet,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Volume2,
  VolumeX,
  Plus,
  RefreshCw,
  Clock,
  PackageCheck,
  AlertTriangle,
  Smile,
  Frown,
  Activity,
  Flame,
} from 'lucide-react';
import {
  SupportedLanguage,
  MenstrualCycleData,
  CycleLogEntry,
  CycleAlertStatus,
  CyclePhaseName,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { UI_TRANSLATIONS } from '../data/translations';

interface MenstrualCycleTrackerProps {
  language: SupportedLanguage;
  onOpenEmergency: () => void;
  onAskMamaG?: (prompt: string) => void;
}

export const MenstrualCycleTracker: React.FC<MenstrualCycleTrackerProps> = ({
  language,
  onOpenEmergency,
  onAskMamaG,
}) => {
  const { user, userProfile, updateProfile } = useAuth();
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  // Defaults
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const defaultLmp = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 21); // Default to day 21 of cycle
    return d.toISOString().split('T')[0];
  }, []);

  const [cycleData, setCycleData] = useState<MenstrualCycleData>(() => {
    try {
      const saved = localStorage.getItem('mama_g_cycle_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      lastPeriodDate: userProfile?.lastPeriodDate || defaultLmp,
      cycleLength: userProfile?.cycleLength || 28,
      periodDuration: userProfile?.periodDuration || 5,
      notificationsEnabled: userProfile?.cycleAlertEnabled ?? false,
      notes: userProfile?.cycleNotes || '',
      logs: [],
    };
  });

  // Sync from userProfile when logged in
  useEffect(() => {
    if (userProfile?.lastPeriodDate) {
      setCycleData((prev) => ({
        ...prev,
        lastPeriodDate: userProfile.lastPeriodDate || prev.lastPeriodDate,
        cycleLength: userProfile.cycleLength || prev.cycleLength,
        periodDuration: userProfile.periodDuration || prev.periodDuration,
        notificationsEnabled: userProfile.cycleAlertEnabled ?? prev.notificationsEnabled,
      }));
    }
  }, [userProfile]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('mama_g_cycle_data', JSON.stringify(cycleData));
    } catch {}
  }, [cycleData]);

  // Calendar View State
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayString());
  const [isDayLogModalOpen, setIsDayLogModalOpen] = useState<boolean>(false);

  // Preparation checklist check items
  const [prepChecklist, setPrepChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mama_g_prep_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleChecklistItem = (key: string) => {
    setPrepChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('mama_g_prep_checklist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Audio playing state
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Request browser notification permission
  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        const updated = { ...cycleData, notificationsEnabled: true };
        setCycleData(updated);
        if (user) {
          await updateProfile({ cycleAlertEnabled: true });
        }
        // Send immediate confirmation notification
        new Notification('Mama-G Period & Cycle Alert', {
          body: 'Period alerts are now active! You will be notified 48h and 24h before your period starts to prepare on time.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  };

  // ================= CALCULATIONS =================
  const cycleCalculations = useMemo(() => {
    const lmp = new Date(cycleData.lastPeriodDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lmpTime = new Date(lmp).setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lmpTime) / (1000 * 60 * 60 * 24));

    const cycleLength = cycleData.cycleLength || 28;
    const periodDuration = cycleData.periodDuration || 5;

    // Current day in cycle (1-indexed, loop if cycle length passed)
    const currentCycleDay = diffDays >= 0 ? (diffDays % cycleLength) + 1 : 1;

    // Next period date
    const cyclesElapsed = Math.floor(diffDays / cycleLength);
    const nextPeriod = new Date(lmp);
    nextPeriod.setDate(nextPeriod.getDate() + (cyclesElapsed + 1) * cycleLength);
    nextPeriod.setHours(0, 0, 0, 0);

    const daysUntilNextPeriod = Math.round((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Estimated Ovulation (14 days before next period)
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    // Fertile Window: 5 days before ovulation to 1 day after
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 4);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    // Current Phase identification
    let currentPhase: CyclePhaseName = 'follicular';
    if (currentCycleDay <= periodDuration) {
      currentPhase = 'menstruation';
    } else if (currentCycleDay < cycleLength - 16) {
      currentPhase = 'follicular';
    } else if (currentCycleDay >= cycleLength - 16 && currentCycleDay <= cycleLength - 12) {
      currentPhase = 'ovulation';
    } else {
      currentPhase = 'luteal';
    }

    // Alert Status
    let alertStatus: CycleAlertStatus;

    if (currentPhase === 'menstruation') {
      alertStatus = {
        status: 'period_active',
        daysUntilPeriod: 0,
        currentCycleDay,
        expectedDateString: nextPeriod.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        urgencyLevel: 'info',
        headline: `🩸 Period Active (Day ${currentCycleDay} of ${periodDuration})`,
        preparationChecklist: [
          'Change pad/cloth every 4 to 6 hours to prevent infection and odor',
          'Wash reusable cloth pads with clean water, soap and dry under direct sunlight',
          'Drink warm clean water and ginger tea to soothe uterine cramps',
          'Eat iron-rich foods: Ugu/fluted pumpkin leaves, spinach, beans, and eggs to replenish lost blood',
        ],
      };
    } else if (daysUntilNextPeriod <= 2 && daysUntilNextPeriod >= 0) {
      alertStatus = {
        status: 'period_due_soon',
        daysUntilPeriod: daysUntilNextPeriod,
        currentCycleDay,
        expectedDateString: nextPeriod.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        urgencyLevel: 'alert',
        headline:
          daysUntilNextPeriod === 0
            ? '🚨 Period Expected Today! Get Prepared Now'
            : daysUntilNextPeriod === 1
            ? '⏰ Alert: Period Starts Tomorrow! Pack Your Supplies'
            : `⏰ Alert: Period Expected in ${daysUntilNextPeriod} Days! Get Prepared on Time`,
        preparationChecklist: [
          '🎒 Pack 2-3 clean sanitary pads or reusable cotton pads in your handbag/school bag',
          '👖 Wear darker, comfortable cotton clothing if traveling, in school, or at the market',
          '💧 Drink 2.5L clean water daily to reduce premenstrual water retention and cramps',
          '🌿 Prepare a warm water bottle or hot compress for lower back and belly cramps',
          '🥦 Stock accessible iron foods: Ugu, beans, moringa, fish, and citrus fruits',
        ],
      };
    } else if (currentPhase === 'ovulation') {
      alertStatus = {
        status: 'fertile_window',
        daysUntilPeriod: daysUntilNextPeriod,
        currentCycleDay,
        expectedDateString: nextPeriod.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        urgencyLevel: 'caution',
        headline: '🌸 Peak Fertile Window (Ovulation Phase)',
        preparationChecklist: [
          'Highest chance of conception during this 5-day fertile window',
          'If avoiding pregnancy, use protection (condoms) or avoid intercourse',
          'Cervical mucus is clear, stretchy, and slippery (like egg white)',
          'Stay hydrated and track any mild mid-cycle pelvic twinges (Mittelschmerz)',
        ],
      };
    } else if (daysUntilNextPeriod < 0) {
      alertStatus = {
        status: 'period_due_soon',
        daysUntilPeriod: daysUntilNextPeriod,
        currentCycleDay,
        expectedDateString: nextPeriod.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        urgencyLevel: 'caution',
        headline: `⚠️ Period is ${Math.abs(daysUntilNextPeriod)} Days Overdue`,
        preparationChecklist: [
          'If sexually active, consider taking an affordable urine pregnancy test',
          'Emotional stress, illness, malaria, or sudden weight changes can delay ovulation',
          'Keep a sanitary pad in your bag in case flow begins unexpectedly',
          'Consult Mama-G or visit a primary healthcare center if delayed over 14 days',
        ],
      };
    } else {
      alertStatus = {
        status: 'routine',
        daysUntilPeriod: daysUntilNextPeriod,
        currentCycleDay,
        expectedDateString: nextPeriod.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        urgencyLevel: 'info',
        headline: `🌿 ${currentPhase === 'follicular' ? 'Follicular Phase (Energy Building)' : 'Luteal Phase (PMS Preparation)'} · ${daysUntilNextPeriod} Days until Period`,
        preparationChecklist: [
          'Energy levels are steady; maintain a balanced diet with protein and greens',
          'Track mood, skin changes, or bloating to understand your cycle rhythm',
          'Avoid excess sugary drinks or high salt to minimize premenstrual bloating',
        ],
      };
    }

    // Next 3 cycles forecast
    const upcomingCycles = [1, 2, 3].map((cycleMultiplier) => {
      const pDate = new Date(lmp);
      pDate.setDate(pDate.getDate() + (cyclesElapsed + cycleMultiplier) * cycleLength);
      const oDate = new Date(pDate);
      oDate.setDate(oDate.getDate() - 14);

      return {
        periodDate: pDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        ovulationDate: oDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      };
    });

    return {
      currentCycleDay,
      daysUntilNextPeriod,
      nextPeriod,
      ovulationDate,
      fertileStart,
      fertileEnd,
      currentPhase,
      alertStatus,
      upcomingCycles,
    };
  }, [cycleData]);

  // Update Last Period Date
  const handleUpdateLmp = async (newDate: string) => {
    const updated = { ...cycleData, lastPeriodDate: newDate };
    setCycleData(updated);
    if (user) {
      await updateProfile({ lastPeriodDate: newDate });
    }
  };

  // Update Cycle Length
  const handleUpdateCycleLength = async (newLength: number) => {
    const updated = { ...cycleData, cycleLength: newLength };
    setCycleData(updated);
    if (user) {
      await updateProfile({ cycleLength: newLength });
    }
  };

  // Update Period Duration
  const handleUpdatePeriodDuration = async (newDuration: number) => {
    const updated = { ...cycleData, periodDuration: newDuration };
    setCycleData(updated);
    if (user) {
      await updateProfile({ periodDuration: newDuration });
    }
  };

  // TTS Read-Aloud for Low-Literacy Mothers
  const handlePlayCycleAudio = async () => {
    if (isAudioPlaying) {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsAudioPlaying(false);
      return;
    }

    const textToSpeak = `Mama-G Cycle Alert. ${cycleCalculations.alertStatus.headline}. You are on day ${cycleCalculations.currentCycleDay} of your ${cycleData.cycleLength}-day cycle. Preparation tip: ${cycleCalculations.alertStatus.preparationChecklist[0]}. Stay hydrated, keep your sanitary kit ready, and rest well.`;

    setIsAudioPlaying(true);
    try {
      const res = await fetch('/api/audio-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.onended = () => setIsAudioPlaying(false);
          audio.onerror = () => setIsAudioPlaying(false);
          setCurrentAudio(audio);
          await audio.play();
          return;
        }
      }
    } catch {}

    // Fallback to browser synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsAudioPlaying(false);
    }
  };

  // ================= CALENDAR MONTH GENERATOR =================
  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Blank padding for days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ isPadding: true, dayNumber: null, dateString: '' });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(year, month, d);
      dayDate.setHours(0, 0, 0, 0);

      // Determine phase classification for this date based on cycle
      const lmp = new Date(cycleData.lastPeriodDate);
      lmp.setHours(0, 0, 0, 0);

      const diffFromLmp = Math.floor((dayDate.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
      const cycleLength = cycleData.cycleLength || 28;
      const periodDuration = cycleData.periodDuration || 5;

      const dayInCycle = ((diffFromLmp % cycleLength) + cycleLength) % cycleLength + 1;

      const isPeriodDay = dayInCycle <= periodDuration;
      const isOvulationDay = dayInCycle === cycleLength - 13;
      const isFertileDay = dayInCycle >= cycleLength - 17 && dayInCycle <= cycleLength - 12;
      const isAlertDay = dayInCycle === cycleLength - 1 || dayInCycle === cycleLength;

      const isToday = dateStr === getTodayString();
      const isSelected = dateStr === selectedCalendarDate;

      days.push({
        isPadding: false,
        dayNumber: d,
        dateString: dateStr,
        dayInCycle,
        isPeriodDay,
        isOvulationDay,
        isFertileDay,
        isAlertDay,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [currentCalendarDate, cycleData, selectedCalendarDate]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Quick Setup */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Mama-G Menstrual Health & Cycle Preparation Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Menstrual Calendar & Timely Period Alerts</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Never be caught unprepared. Track your cycle rhythm, fertile window, and get automatic reminders to pack hygiene kits and prepare cramp relief on time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio voice read-aloud button */}
          <button
            onClick={handlePlayCycleAudio}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isAudioPlaying
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title="Listen to Mama-G spoken guidance"
          >
            {isAudioPlaying ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Listen to Advice</span>
              </>
            )}
          </button>

          {/* Browser Notification Button */}
          <button
            onClick={handleRequestNotification}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              cycleData.notificationsEnabled && notificationPermission === 'granted'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-amber-400'
            }`}
          >
            {cycleData.notificationsEnabled && notificationPermission === 'granted' ? (
              <>
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Alerts Active</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Enable Alerts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= HIGH-VISIBILITY PERIOD PREPARATION ALERT CARD ================= */}
      <div
        className={`rounded-2xl p-5 border shadow-lg transition-all ${
          cycleCalculations.alertStatus.urgencyLevel === 'alert'
            ? 'bg-gradient-to-r from-rose-950/90 to-amber-950/80 border-rose-500/60 text-rose-100 ring-2 ring-rose-500/40'
            : cycleCalculations.alertStatus.urgencyLevel === 'caution'
            ? 'bg-gradient-to-r from-purple-950/80 to-stone-900 border-purple-500/50 text-purple-100'
            : 'bg-stone-900/90 border-stone-800 text-stone-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10">
                Cycle Day {cycleCalculations.currentCycleDay} of {cycleData.cycleLength}
              </span>
              <span className="text-xs text-stone-300">
                Next Period: <strong>{cycleCalculations.alertStatus.expectedDateString}</strong>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{cycleCalculations.alertStatus.headline}</span>
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {cycleCalculations.daysUntilNextPeriod <= 2 && cycleCalculations.daysUntilNextPeriod >= 0
                ? 'Your body is approaching the end of the luteal phase. Hormonal shifts can cause mild cramping, water retention, and fatigue. Complete your preparation checklist below to stay comfortable and confident.'
                : cycleCalculations.currentPhase === 'menstruation'
                ? 'Your period is active. Focus on regular pad changes, thorough hand hygiene with clean water, adequate rest, and iron-dense local foods.'
                : cycleCalculations.currentPhase === 'ovulation'
                ? 'You are currently in your high-fertility window. If you wish to conceive, this is the prime time. If avoiding pregnancy, practice strict barrier contraception.'
                : 'Your cycle is progressing normally. Stay active, hydrate well, and maintain balanced nutrition.'}
            </p>
          </div>

          {/* Quick Countdown Gauge */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-center shrink-0 min-w-[140px]">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Countdown
            </span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono my-0.5">
              {cycleCalculations.daysUntilNextPeriod >= 0
                ? cycleCalculations.daysUntilNextPeriod
                : Math.abs(cycleCalculations.daysUntilNextPeriod)}
            </div>
            <span className="text-xs font-bold text-stone-200">
              {cycleCalculations.daysUntilNextPeriod === 0
                ? 'Due Today'
                : cycleCalculations.daysUntilNextPeriod > 0
                ? 'Days to Period'
                : 'Days Overdue'}
            </span>
          </div>
        </div>

        {/* Timely Preparation Checklist */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>Timely Preparation Checklist (Get Ready Before Flow Starts):</span>
            </span>
            <span className="text-[11px] text-stone-400">
              Tap items to check off
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {cycleCalculations.alertStatus.preparationChecklist.map((item, idx) => {
              const isChecked = !!prepChecklist[`${cycleData.lastPeriodDate}-${idx}`];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleChecklistItem(`${cycleData.lastPeriodDate}-${idx}`)}
                  className={`p-2.5 rounded-xl text-left border flex items-start gap-2.5 transition-all ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 line-through opacity-80'
                      : 'bg-black/30 border-white/10 hover:border-amber-400/40 text-stone-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-500 text-stone-950' : 'border border-stone-500'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="leading-snug">{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MAIN INTERFACE: CALENDAR + CYCLE CONTROLS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / CENTER (2 Columns): Visual Interactive Menstrual Calendar */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          {/* Calendar Header with Month Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                {currentCalendarDate.toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setCurrentCalendarDate(
                    new Date(
                      currentCalendarDate.getFullYear(),
                      currentCalendarDate.getMonth() - 1,
                      1
                    )
                  )
                }
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentCalendarDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentCalendarDate(
                    new Date(
                      currentCalendarDate.getFullYear(),
                      currentCalendarDate.getMonth() + 1,
                      1
                    )
                  )
                }
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-stone-400 py-1 border-b border-stone-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((cell, idx) => {
              if (cell.isPadding) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="h-14 sm:h-16 rounded-xl bg-stone-950/30 border border-transparent"
                  />
                );
              }

              return (
                <button
                  key={cell.dateString}
                  type="button"
                  onClick={() => {
                    setSelectedCalendarDate(cell.dateString);
                    setIsDayLogModalOpen(true);
                  }}
                  className={`h-14 sm:h-16 rounded-xl p-1 sm:p-1.5 text-left flex flex-col justify-between transition-all relative border ${
                    cell.isPeriodDay
                      ? 'bg-rose-950/70 border-rose-500/70 text-rose-100 hover:border-rose-400'
                      : cell.isOvulationDay
                      ? 'bg-amber-950/70 border-amber-500/70 text-amber-100 hover:border-amber-400'
                      : cell.isFertileDay
                      ? 'bg-purple-950/60 border-purple-500/60 text-purple-100 hover:border-purple-400'
                      : 'bg-stone-800/40 border-stone-800 text-stone-300 hover:border-stone-600'
                  } ${cell.isToday ? 'ring-2 ring-amber-400 font-bold' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold ${
                        cell.isToday ? 'text-amber-400' : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Alert Dot for impending period */}
                    {cell.isAlertDay && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>

                  {/* Visual Marker Badges */}
                  <div className="w-full truncate text-[10px]">
                    {cell.isPeriodDay && (
                      <span className="bg-rose-600 text-white px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 w-fit">
                        <Droplet className="w-2.5 h-2.5 fill-white" />
                        <span className="hidden sm:inline">Flow</span>
                      </span>
                    )}
                    {cell.isOvulationDay && (
                      <span className="bg-amber-500 text-stone-950 px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 w-fit">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Ovulate</span>
                      </span>
                    )}
                    {!cell.isOvulationDay && cell.isFertileDay && (
                      <span className="bg-purple-600/60 text-purple-200 px-1 py-0.5 rounded text-[9px] font-medium w-fit hidden sm:block">
                        Fertile
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-800 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-600" />
              <span>Menstruation Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-600" />
              <span>Fertile Window</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              <span>Peak Ovulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-amber-400" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* RIGHT (1 Column): Seamless Cycle Parameters & 3-Month Forecast */}
        <div className="space-y-4">
          {/* Cycle Parameters Control Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Your Cycle Settings</span>
            </h3>

            {/* Last Menstrual Period Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                Last Period Start Date (LMP):
              </label>
              <input
                type="date"
                value={cycleData.lastPeriodDate}
                onChange={(e) => handleUpdateLmp(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Cycle Length Adjuster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-300">Cycle Length:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {cycleData.cycleLength} Days
                </span>
              </div>
              <input
                type="range"
                min="21"
                max="40"
                value={cycleData.cycleLength}
                onChange={(e) => handleUpdateCycleLength(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Short (21d)</span>
                <span>Standard (28d)</span>
                <span>Long (40d)</span>
              </div>
            </div>

            {/* Period Flow Duration Adjuster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-300">Flow Duration:</span>
                <span className="font-bold text-rose-400 font-mono">
                  {cycleData.periodDuration} Days
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={cycleData.periodDuration}
                onChange={(e) => handleUpdatePeriodDuration(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Light (2d)</span>
                <span>Average (5d)</span>
                <span>Long (8d)</span>
              </div>
            </div>

            {/* Quick button to mark period started today */}
            <button
              type="button"
              onClick={() => handleUpdateLmp(getTodayString())}
              className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Droplet className="w-3.5 h-3.5 fill-white" />
              <span>My Period Started Today</span>
            </button>
          </div>

          {/* 3-Month Future Forecast Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Upcoming 3-Month Forecast</span>
            </h4>

            <div className="space-y-2 text-xs">
              {cycleCalculations.upcomingCycles.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/70 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-rose-300 block">
                      🩸 {c.periodDate}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Expected Period Flow
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-300 block">
                      🌸 {c.ovulationDate}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Peak Ovulation
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CLINICAL DANGER SIGNS & HYGIENE ADVICE ================= */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Clinical Menstrual Red Flags & Danger Signs (When to Rush to Clinic)</span>
          </div>

          <button
            onClick={onOpenEmergency}
            className="text-xs text-rose-300 hover:text-white bg-rose-950 border border-rose-700/60 px-3 py-1 rounded-lg font-bold transition-colors"
          >
            Emergency SOS Directory
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-stone-800/70 border border-rose-500/30 p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-rose-300 block text-sm">
              🚨 Abnormally Heavy Bleeding (Menorrhagia)
            </span>
            <p className="text-stone-300 leading-relaxed">
              Soaking through 2 or more large sanitary pads in one hour for more than 2 consecutive hours, or passing blood clots larger than a coin/50-kobo piece.
            </p>
          </div>

          <div className="bg-stone-800/70 border border-rose-500/30 p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-rose-300 block text-sm">
              🚨 Severe Incapacitating Pelvic Pain
            </span>
            <p className="text-stone-300 leading-relaxed">
              Intense cramping accompanied by high fever, vomiting, fainting, or pain that prevents standing or walking. Can indicate pelvic infection (PID) or ectopic pregnancy.
            </p>
          </div>

          <div className="bg-stone-800/70 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-amber-300 block text-sm">
              ⚠️ Prolonged or Foul Bleeding
            </span>
            <p className="text-stone-300 leading-relaxed">
              Bleeding continuously for more than 8 days, or vaginal discharge with a foul rotten smell. Requires clinical antibiotic evaluation at a primary healthcare center.
            </p>
          </div>
        </div>

        {/* Quick Ask Mama-G about Period */}
        {onAskMamaG && (
          <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-stone-400">
              Have specific questions about your cramps, hygiene, or flow?
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  onAskMamaG(
                    'What natural and accessible African remedies can relieve severe menstrual cramps without expensive medications?'
                  )
                }
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 transition-colors"
              >
                Cramp Relief Tips
              </button>
              <button
                onClick={() =>
                  onAskMamaG(
                    'Which local foods like ugu, beans, and eggs should I eat during my period to replenish lost blood and prevent anemia?'
                  )
                }
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 transition-colors"
              >
                Iron-Rich Foods
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: CALENDAR DAY DETAIL & SYMPTOM LOG ================= */}
      {isDayLogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  Date: {new Date(selectedCalendarDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <span className="text-xs text-stone-400">
                  Daily Symptom & Flow Check
                </span>
              </div>
              <button
                onClick={() => setIsDayLogModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Quick LMP Setter */}
              <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700 space-y-2">
                <span className="font-bold text-white block">
                  Did your period start on this day?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateLmp(selectedCalendarDate);
                    setIsDayLogModalOpen(false);
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Droplet className="w-3.5 h-3.5 fill-white" />
                  <span>Set this as Last Period Start Date</span>
                </button>
              </div>

              {/* Educational info for this day */}
              <div className="bg-stone-800/40 p-3 rounded-xl border border-stone-700/60 space-y-1.5 text-stone-300">
                <span className="font-bold text-amber-300 block">
                  Self-Care & Hygiene Advice:
                </span>
                <p className="leading-relaxed">
                  Drink clean boiled water, eat green leafy vegetables (Ugu, spinach), and maintain gentle daily movement. If using cloth pads, ensure they dry thoroughly in direct sunlight.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDayLogModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
