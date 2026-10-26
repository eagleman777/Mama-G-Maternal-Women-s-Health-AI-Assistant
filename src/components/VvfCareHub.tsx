import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Droplet,
  MapPin,
  Phone,
  AlertCircle,
  Sparkles,
  Clock,
  Activity,
  FileText,
  Users,
  Check,
  Plus,
  Trash2,
  Info,
  HelpCircle,
  Download,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  Smile
} from 'lucide-react';
import {
  SupportedLanguage,
  VvfRecoveryStage,
  VvfDailyLog,
  VvfAppointment,
  VvfCenter
} from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { NIGERIA_VVF_CENTERS, NATIONAL_FISTULA_HOTLINES } from '../data/vvfCentersData';

interface VvfCareHubProps {
  language: SupportedLanguage;
  onOpenEmergency: () => void;
  onAskMamaG?: (prompt: string) => void;
}

const LOCAL_STORAGE_LOGS_KEY = 'mama_g_vvf_daily_logs_v1';
const LOCAL_STORAGE_APPTS_KEY = 'mama_g_vvf_appointments_v1';
const LOCAL_STORAGE_STAGE_KEY = 'mama_g_vvf_recovery_stage_v1';

export const VvfCareHub: React.FC<VvfCareHubProps> = ({
  language,
  onOpenEmergency,
  onAskMamaG
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'hygiene' | 'postop' | 'tracker' | 'directory'
  >('overview');

  // Recovery Tracker state
  const [stage, setStage] = useState<VvfRecoveryStage>('awaiting_surgery');
  const [dailyLogs, setDailyLogs] = useState<VvfDailyLog[]>([]);
  const [appointments, setAppointments] = useState<VvfAppointment[]>([]);

  // Form state for today's log
  const todayStr = new Date().toISOString().split('T')[0];
  const [logDate, setLogDate] = useState<string>(todayStr);
  const [waterCups, setWaterCups] = useState<number>(8); // 8 glasses ~ 2-2.5L
  const [leakageStatus, setLeakageStatus] = useState<
    'completely_dry' | 'slight_dampness' | 'moderate_leak' | 'heavy_leak'
  >('slight_dampness');
  const [catheterCareDone, setCatheterCareDone] = useState<boolean>(true);
  const [skinBarrierApplied, setSkinBarrierApplied] = useState<boolean>(true);
  const [cleanPadsUsed, setCleanPadsUsed] = useState<number>(3);
  const [painLevel, setPainLevel] = useState<number>(1);
  const [pelvicRestObserved, setPelvicRestObserved] = useState<boolean>(true);
  const [heavyLiftingAvoided, setHeavyLiftingAvoided] = useState<boolean>(true);
  const [logNotes, setLogNotes] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Form state for new appointment
  const [isAddingAppt, setIsAddingAppt] = useState<boolean>(false);
  const [apptTitle, setApptTitle] = useState<string>('Hospital Check-up & Review');
  const [apptDate, setApptDate] = useState<string>('');
  const [apptFacility, setApptFacility] = useState<string>('');
  const [apptDoctor, setApptDoctor] = useState<string>('');
  const [apptPurpose, setApptPurpose] = useState<VvfAppointment['purpose']>('six_week_check');
  const [apptNotes, setApptNotes] = useState<string>('');

  // Center Directory filters
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedStage = localStorage.getItem(LOCAL_STORAGE_STAGE_KEY);
      if (savedStage) {
        setStage(savedStage as VvfRecoveryStage);
      }

      const savedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (savedLogs) {
        setDailyLogs(JSON.parse(savedLogs));
      } else {
        // Pre-populate with realistic starter log so the screen has context
        const sampleLogs: VvfDailyLog[] = [
          {
            id: 'sample-1',
            date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            waterCups: 8,
            leakageStatus: 'slight_dampness',
            catheterCareDone: true,
            skinBarrierApplied: true,
            cleanPadsUsed: 3,
            painLevel: 2,
            pelvicRestObserved: true,
            heavyLiftingAvoided: true,
            notes: 'Felt much better today, drank plenty boiled water.'
          },
          {
            id: 'sample-2',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            waterCups: 9,
            leakageStatus: 'completely_dry',
            catheterCareDone: true,
            skinBarrierApplied: true,
            cleanPadsUsed: 2,
            painLevel: 1,
            pelvicRestObserved: true,
            heavyLiftingAvoided: true,
            notes: 'Completely dry all afternoon! Continued shea butter barrier.'
          }
        ];
        setDailyLogs(sampleLogs);
        localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(sampleLogs));
      }

      const savedAppts = localStorage.getItem(LOCAL_STORAGE_APPTS_KEY);
      if (savedAppts) {
        setAppointments(JSON.parse(savedAppts));
      } else {
        const defaultAppts: VvfAppointment[] = [
          {
            id: 'appt-default-1',
            title: 'Post-Op Catheter & Wound Review',
            date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
            facilityName: 'National Obstetric Fistula Centre (NOFIC)',
            doctorOrNurse: 'Dr. Fatima / Matron Zainab',
            purpose: 'catheter_removal',
            completed: false,
            notes: 'Remember to bring hospital card and drink 1 liter before dye test.'
          }
        ];
        setAppointments(defaultAppts);
        localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(defaultAppts));
      }
    } catch (e) {
      console.warn('Unable to read VVF logs from localStorage', e);
    }
  }, []);

  // Save stage changes
  const handleStageChange = (newStage: VvfRecoveryStage) => {
    setStage(newStage);
    try {
      localStorage.setItem(LOCAL_STORAGE_STAGE_KEY, newStage);
    } catch (e) {
      console.warn('Error saving stage', e);
    }
  };

  // Save new or updated daily log
  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: VvfDailyLog = {
      id: 'log-' + Date.now(),
      date: logDate,
      waterCups,
      leakageStatus,
      catheterCareDone: stage === 'catheter_in_place' ? catheterCareDone : undefined,
      skinBarrierApplied,
      cleanPadsUsed,
      painLevel,
      pelvicRestObserved,
      heavyLiftingAvoided,
      notes: logNotes.trim() || undefined
    };

    const updated = [newLog, ...dailyLogs.filter((l) => l.date !== logDate)];
    setDailyLogs(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving logs', err);
    }

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  // Add new appointment
  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDate) return;

    const newAppt: VvfAppointment = {
      id: 'appt-' + Date.now(),
      title: apptTitle.trim() || 'Hospital Follow-Up',
      date: apptDate,
      facilityName: apptFacility.trim() || 'Fistula Clinic',
      doctorOrNurse: apptDoctor.trim() || undefined,
      purpose: apptPurpose,
      completed: false,
      notes: apptNotes.trim() || undefined
    };

    const updated = [...appointments, newAppt].sort((a, b) => a.date.localeCompare(b.date));
    setAppointments(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving appointments', err);
    }

    setIsAddingAppt(false);
    setApptTitle('Hospital Check-up & Review');
    setApptDate('');
    setApptFacility('');
    setApptDoctor('');
    setApptNotes('');
  };

  const handleToggleAppointment = (id: string) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a));
    setAppointments(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error toggling appt', err);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error deleting appt', err);
    }
  };

  const handleDeleteLog = (id: string) => {
    const updated = dailyLogs.filter((l) => l.id !== id);
    setDailyLogs(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error deleting log', err);
    }
  };

  // Filter VVF Centers
  const filteredCenters = NIGERIA_VVF_CENTERS.filter((c) => {
    const matchesZone = selectedZone === 'all' || c.zone === selectedZone;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.state.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query);
    return matchesZone && matchesQuery;
  });

  // Calculate recovery stats
  const dryDaysCount = dailyLogs.filter((l) => l.leakageStatus === 'completely_dry').length;
  const recentLogs = dailyLogs.slice(0, 7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero & Dignity Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-amber-600/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                100% Free Mode · Zero Stigma
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Curable by Surgery
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Offline Local Tracking
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.vvfCareTitle}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {t.vvfCareSubtitle}
            </p>

            {/* Dignity & Compassion Pledge */}
            <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                <strong className="text-amber-100 font-semibold block mb-0.5">
                  Words of Truth & Dignity from Mama-G:
                </strong>
                Fistula is <em>never</em> a spiritual curse, <em>never</em> witchcraft, and <em>never</em> your fault.
                It is a physical injury caused by prolonged labor that was not relieved in time.
                You are precious, loved, and fully dignified. With skilled medical surgery and proper healing care,
                you can be <strong>100% dry, healthy, and restored</strong>.
              </div>
            </div>
          </div>

          {/* Quick Helpline Card */}
          <div className="shrink-0 bg-stone-950/80 rounded-xl p-4 sm:p-5 border border-stone-800 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-emerald-400" />
              National Fistula Toll-Free Desk
            </div>
            <div>
              <div className="text-lg font-bold text-white">0800-FISTULA</div>
              <div className="text-xs text-stone-400">(0800 347 8852) · 24/7 Free</div>
            </div>
            <a
              href="tel:08003478852"
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Free Helpline
            </a>
            {onAskMamaG && (
              <button
                type="button"
                onClick={() =>
                  onAskMamaG(
                    'Please explain how obstetric fistula (VVF) occurs during prolonged labor, how it is repaired for free in Nigeria, and what daily hygiene practices prevent skin burning.'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Ask Mama-G about VVF
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex overflow-x-auto no-scrollbar gap-2 border-b border-stone-800/80 pb-2">
          {[
            {
              id: 'overview',
              label: 'Understanding & Prevention',
              icon: BookOpen,
              badge: 'Essential'
            },
            {
              id: 'hygiene',
              label: 'Hygiene & Skin Barrier Mastery',
              icon: Droplet,
              badge: 'Daily Comfort'
            },
            {
              id: 'postop',
              label: 'Post-Op Rules & Golden Laws',
              icon: ShieldCheck,
              badge: 'Healing'
            },
            {
              id: 'tracker',
              label: 'VVF Recovery Progress Diary',
              icon: Activity,
              badge: 'Interactive'
            },
            {
              id: 'directory',
              label: 'Free Repair Centers (Nigeria)',
              icon: MapPin,
              badge: '100% Free'
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: Understanding & Prevention */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* What is Obstetric Fistula */}
            <div className="md:col-span-2 bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">What is Obstetric Fistula (VVF / RVF)?</h2>
                  <p className="text-xs text-stone-400">
                    Understanding the medical biology without shame or myth
                  </p>
                </div>
              </div>

              <p className="text-sm text-stone-300 leading-relaxed">
                An <strong>obstetric fistula</strong> is an abnormal opening between a woman's birth canal (vagina) and her urinary bladder (<strong>Vesicovaginal Fistula - VVF</strong>) or rectum (<strong>Rectovaginal Fistula - RVF</strong>).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Vesicovaginal Fistula (VVF)
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Opening between bladder and vagina. Results in constant, uncontrollable leakage of urine day and night. Known locally in Hausa as <em>Yoyon Fitsari</em>.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    Rectovaginal Fistula (RVF)
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Opening between rectum and vagina. Results in involuntary leakage of stool (feces) and flatus through the vagina. Often occurs alongside severe tears.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed space-y-1.5">
                <strong className="text-amber-100 font-semibold block">
                  The Root Medical Cause: Prolonged Obstructed Labor
                </strong>
                When a woman is in labor for days without medical assistance, the baby's hard head is wedged tightly against her pelvis. The soft tissues of the bladder and bowel are squashed between bone and bone.
                The blood supply is completely cut off, causing the tissue to die (pressure necrosis). After delivery, the dead tissue sloughs away, leaving an open hole.
              </div>

              {/* The 14-Day Catheter Golden Window */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                <strong className="text-emerald-100 font-semibold flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Crucial Early Opportunity: The Immediate Post-Delivery Catheter Window
                </strong>
                If a mother experienced prolonged labor lasting over 12–24 hours, placing a silicone Foley catheter on continuous free drainage for <strong>14 to 21 days immediately after birth</strong> keeps the bladder decompressed.
                In fresh cases, this allows small necrotic tears to heal completely on their own <strong>without ever needing surgery</strong>! Always advise CHEWs/midwives to catheterize prolonged labor cases immediately.
              </div>
            </div>

            {/* Quick Facts Card */}
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Three Core Truths
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-xs font-bold text-emerald-400 mb-1">1. Surgery is 100% Free</div>
                  <p className="text-xs text-stone-300">
                    The Federal Ministry of Health, UNFPA, and MSF sponsor all repair surgeries, hospital stays, and feeding in Nigeria.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-xs font-bold text-amber-400 mb-1">2. 90%+ Success Rate</div>
                  <p className="text-xs text-stone-300">
                    Accredited fistula surgeons close the leak completely on the first attempt in over 9 out of 10 women.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-xs font-bold text-sky-400 mb-1">3. You Can Have Babies Again</div>
                  <p className="text-xs text-stone-300">
                    After full healing and 1-2 years of recovery, a woman can bear healthy children again — delivered safely by elective Caesarean Section.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                Find Free Repair Centers in Nigeria
              </button>
            </div>
          </div>

          {/* Prevention Protocols */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              The 4 Pillars to Prevent Obstetric Fistula
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Delay Teenage Childbirth</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  A girl's pelvic bones do not fully widen until age 18 to 20. Delaying marriage and pregnancy until pelvic maturity prevents cephalopelvic disproportion.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Skilled Hospital Birth</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Deliver in a health facility where midwives use the <strong>WHO Partograph</strong>. If labor crosses the alert line, immediate transfer for C-section saves both mother and baby.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">The 12-Hour Emergency Rule</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Never allow labor to drag on at home, prayer houses, or traditional shrines beyond 8–12 hours. Prolonged pushing without progress is an absolute emergency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h4 className="text-sm font-bold text-white">Eradicate FGM/Cutting</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Female genital mutilation creates inelastic, fibrous scar tissue that obstructs the fetal head during birth, leading to disastrous pelvic tears and fistula.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Hygiene & Skin Barrier Mastery */}
      {activeSubTab === 'hygiene' && (
        <div className="space-y-6">
          {/* The Hydration Paradox Highlight */}
          <div className="bg-gradient-to-r from-sky-950/50 via-stone-900 to-stone-900 rounded-2xl p-6 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Droplet className="w-4 h-4" />
                The Hydration Paradox (Vital Rule)
              </div>
              <h2 className="text-xl font-bold text-white">
                "Should I stop drinking water so I leak less?" — NO! Drink MORE Water.
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Many women mistakenly stop drinking fluids hoping it will reduce leakage. This is dangerous!
                When you drink little water, urine becomes concentrated, dark, and filled with harsh ammonia acids.
                Concentrated urine <strong>burns raw skin</strong>, causes intense ammonia stench, breeds severe bladder infections, and forms bladder stones.
              </p>
              <div className="text-xs font-semibold text-sky-300 bg-sky-900/30 px-3 py-2 rounded-lg border border-sky-500/30">
                💧 Mama-G Target: Drink 3 to 4 Liters (10 to 12 cups) of clean boiled water every day.
                Dilute urine smells very little, does not burn raw skin, and flushes bacteria away!
              </div>
            </div>
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center shrink-0 w-full md:w-auto">
              <span className="text-3xl font-extrabold text-sky-400 block">3 - 4 L</span>
              <span className="text-xs text-stone-400">Daily Water Target</span>
            </div>
          </div>

          {/* Skin Barrier Step-by-Step Guide */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Complete Skin Barrier & Comfort Routine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Gentle Lukewarm Wash</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Wash the vulva, perineum, and inner thighs 2 to 3 times daily using lukewarm clean water that was previously boiled.
                </p>
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300">
                  <strong>AVOID:</strong> Dettol, Izal, bleach, scented bathing soaps, or carbolic detergents. These strip skin oils and cause agonizing chemical burns!
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Pat Dry (Never Scrub)</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Use a soft, dedicated 100% cotton towel or cloth. Gently pat the skin dry without rubbing or scraping the sensitive tissues.
                </p>
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
                  Keep drying cloths strictly for your personal use. Wash them daily in hot soapy water, sun-dry in open sunlight, and iron them with a hot iron.
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Generous Barrier Cream</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Apply a generous protective layer over the labia, buttocks, and inner thighs before putting on undergarments.
                </p>
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200">
                  <strong>Recommended Barriers:</strong> Pure Petroleum Jelly (Vaseline), raw unrefined Shea Butter (<em>Ori / Man Kadanya</em>), or pure cold-pressed Coconut oil. This creates a waterproof seal so urine slides off!
                </div>
              </div>
            </div>
          </div>

          {/* Underwear & Clothing Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Healthy Pad & Underwear Discipline
              </h4>
              <ul className="text-xs text-stone-300 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Change sanitary pads or cotton cloths every 2 to 3 hours. Never sit in cold, soaked pads for half a day.</li>
                <li>Wear loose, breathable 100% cotton underwear. Avoid tight synthetic nylon pants which trap heat and worsen odor.</li>
                <li>Wear loose African wrappers (ankara or wax print) or airy dresses rather than tight trousers to allow air ventilation.</li>
                <li>If using washable cloth pads, rinse out urine in cold water first, then wash thoroughly with soap, sun-bleach in direct sunlight, and iron.</li>
              </ul>
            </div>

            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Managing Urine Odor with Respect
              </h4>
              <ul className="text-xs text-stone-300 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Dilute urine is virtually odorless. High water intake is 80% of odor prevention.</li>
                <li>Add a cup of natural white vinegar to laundry water when washing pads/underwear to neutralize ammonia salts.</li>
                <li>Do not apply strong perfume or body sprays directly to the vulva; they will cause severe stinging and allergic swelling.</li>
                <li>Wash beddings and waterproof mattress covers regularly. A plastic macintosh sheet placed under cotton sheets keeps the bed clean.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Post-Op Rules & Golden Laws */}
      {activeSubTab === 'postop' && (
        <div className="space-y-6">
          {/* The 2 Lifelong Laws */}
          <div className="bg-gradient-to-br from-rose-950/60 via-stone-900 to-stone-900 rounded-2xl p-6 border border-rose-500/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              The Two Golden Laws for Fistula Survivors (FIGO Guidelines)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Rules That Must Never Be Broken
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  LAW 1: Strict Pelvic Rest for 3 to 6 Months
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong>ZERO sexual intercourse for a minimum of 3 to 6 months post-surgery.</strong>
                  The surgical stitches inside the bladder and vaginal wall are delicate. Premature sexual activity will tear open the healing incision and cause the fistula to recur permanently.
                  Involve your husband or family in this counseling so they protect your recovery.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  LAW 2: Mandatory Elective C-Section for All Future Births
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong>Never attempt vaginal childbirth again after a fistula repair!</strong>
                  Any future pregnancy must be booked early at a hospital and delivered by planned Caesarean Section before labor pains ever start (at 37–38 weeks).
                  Pushing during labor will completely rip open the repaired scar.
                </p>
              </div>
            </div>
          </div>

          {/* Recovery Phases */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Phased Healing Protocol: Days to Months
            </h3>

            <div className="space-y-4">
              {/* Phase 1 */}
              <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Phase 1: In Hospital with Catheter (Days 1 to 14)
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Hospital Inpatient
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Catheter Care & Hydration</h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>Keep the urine collection bag below hip level</strong> at all times. Never lift the bag higher than your bladder or urine will flow backwards causing infection.</li>
                  <li><strong>Drink 4 to 5 liters of clean water daily.</strong> High flow prevents blood clots from blocking the narrow catheter tube.</li>
                  <li>Inspect tubing: Ensure it is never kinked, twisted, or pulled tight.</li>
                  <li>Notify nurses immediately if urine stops draining into the bag, or if you feel sudden lower belly swelling or pain.</li>
                  <li>Before the catheter is removed on Day 14, the surgical team conducts a <strong>Methylene Blue Dye Test</strong> to confirm the repair is watertight.</li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Phase 2: Catheter Removal & Bladder Retraining (Weeks 2 to 12)
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Home Recovery
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Timed Voiding & Pelvic Protection</h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>Empty bladder on a timer every 2 to 3 hours</strong> during daytime. Do not wait for a full bladder sensation; newly repaired bladders take months to regain normal stretching.</li>
                  <li>Set an alarm to wake up at least once at night to urinate.</li>
                  <li><strong>STRICT NO HEAVY LIFTING:</strong> Do not carry water buckets, firewood, heavy sacks of grain, or babies on back. Downward intra-abdominal pressure destroys the surgical graft!</li>
                  <li>Avoid deep squatting: Do not squat flat on the floor to wash clothes or use deep pit latrines. Sit on a raised bench or chair.</li>
                  <li>Eat high-fiber foods (beans, vegetables, pawpaw) to prevent constipation. Never strain while passing stool.</li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Phase 3: Long-Term Rehabilitation & Family Planning (Months 3 to 12+)
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Restoration
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Physical Strength, Livelihood, and Future Plans</h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Attend your final 3-month and 6-month clinical reviews at the fistula centre.</li>
                  <li>Practice gentle pelvic floor exercises (Kegels) once your surgeon clears you to strengthen supportive muscle tone.</li>
                  <li>Use effective contraception (implants, injectables, or oral pills) to postpone pregnancy for at least 1 to 2 full years to ensure maximum scar strength.</li>
                  <li>Join local survivor cooperatives and skills centers to rebuild your economic independence with pride!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Interactive 'VVF Recovery Progress' Tool */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-6">
          {/* Recovery Stage Selector */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Your Current Healing Stage
                </h2>
                <p className="text-xs text-stone-400">
                  Select your current stage to tailor your daily hygiene checklist and clinical milestones
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Offline Safe · Saved on Device
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {[
                {
                  id: 'awaiting_surgery',
                  title: 'Awaiting Surgery',
                  desc: 'Managing leaks & skin'
                },
                {
                  id: 'catheter_in_place',
                  title: 'Catheter Phase',
                  desc: 'Days 1–14 in hospital'
                },
                {
                  id: 'catheter_removed',
                  title: 'Catheter Removed',
                  desc: 'Weeks 2–12 home care'
                },
                {
                  id: 'pelvic_rest_phase',
                  title: 'Pelvic Rest Phase',
                  desc: 'Months 3–6 recovery'
                },
                {
                  id: 'discharged_healed',
                  title: 'Fully Restored',
                  desc: 'Healed & strong'
                }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStageChange(s.id as VvfRecoveryStage)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    stage === s.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight mb-1 text-white flex items-center justify-between">
                    <span>{s.title}</span>
                    {stage === s.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="text-[11px] text-stone-400 leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
              <span className="text-xs text-stone-400 block mb-1">Total Logs</span>
              <span className="text-2xl font-extrabold text-white">{dailyLogs.length}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">entries recorded</span>
            </div>

            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
              <span className="text-xs text-stone-400 block mb-1">Dry Days Logged</span>
              <span className="text-2xl font-extrabold text-emerald-400">{dryDaysCount}</span>
              <span className="text-[10px] text-emerald-400/80 block mt-0.5">healing milestone</span>
            </div>

            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
              <span className="text-xs text-stone-400 block mb-1">Follow-up Visits</span>
              <span className="text-2xl font-extrabold text-sky-400">
                {appointments.filter((a) => !a.completed).length}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">upcoming clinic check</span>
            </div>

            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
              <span className="text-xs text-stone-400 block mb-1">Pelvic Rest Days</span>
              <span className="text-2xl font-extrabold text-amber-400">
                {dailyLogs.filter((l) => l.pelvicRestObserved).length}
              </span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">safe protection</span>
            </div>
          </div>

          {/* Interactive Daily Log Form */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Log Today's Recovery & Routine
                </h3>
                <p className="text-xs text-stone-400">
                  Record your hydration, leakage status, and protective care
                </p>
              </div>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="bg-stone-950 text-stone-200 text-xs px-3 py-1.5 rounded-lg border border-stone-700 font-medium"
              />
            </div>

            {saveSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Today's healing progress has been safely saved to your phone!</span>
              </div>
            )}

            <form onSubmit={handleSaveDailyLog} className="space-y-5">
              {/* Row 1: Water Cups Counter & Leakage Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Water Counter */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-sky-400" />
                      Clean Water Intake (Target: 8–10 cups / ~2.5–3L)
                    </span>
                    <span className="text-sky-400 text-sm font-extrabold">{waterCups} cups</span>
                  </label>
                  <p className="text-[11px] text-stone-400">
                    High water intake dilutes urine, stops ammonia burns, and prevents catheter blockage.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setWaterCups((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-bold border border-stone-700"
                    >
                      -
                    </button>
                    <div className="flex-1 bg-stone-900 rounded-lg h-2.5 overflow-hidden">
                      <div
                        className="bg-sky-500 h-full transition-all"
                        style={{ width: `${Math.min(100, (waterCups / 10) * 100)}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setWaterCups((prev) => Math.min(16, prev + 1))}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-bold border border-stone-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Leakage Status */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Today's Leakage / Dryness Status
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { id: 'completely_dry', label: 'Completely Dry 🌟', color: 'emerald' },
                      { id: 'slight_dampness', label: 'Slight Dampness', color: 'sky' },
                      { id: 'moderate_leak', label: 'Moderate Leak', color: 'amber' },
                      { id: 'heavy_leak', label: 'Heavy Leak', color: 'rose' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLeakageStatus(item.id as any)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${
                          leakageStatus === item.id
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Checkboxes for Daily Routines */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Today's Care & Protection Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-900/70 border border-stone-800 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skinBarrierApplied}
                      onChange={(e) => setSkinBarrierApplied(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Applied Shea Butter / Vaseline</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-900/70 border border-stone-800 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pelvicRestObserved}
                      onChange={(e) => setPelvicRestObserved(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Pelvic Rest Kept (No Intercourse)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-900/70 border border-stone-800 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heavyLiftingAvoided}
                      onChange={(e) => setHeavyLiftingAvoided(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>No Heavy Water/Wood Lifting</span>
                  </label>

                  {stage === 'catheter_in_place' ? (
                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catheterCareDone}
                        onChange={(e) => setCatheterCareDone(e.target.checked)}
                        className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Catheter Bag Below Hips & Flowing</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-900/70 border border-stone-800 text-xs text-stone-200">
                      <span className="text-stone-400">Pads Used:</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={cleanPadsUsed}
                        onChange={(e) => setCleanPadsUsed(parseInt(e.target.value) || 0)}
                        className="w-12 bg-stone-950 text-white text-xs px-2 py-1 rounded border border-stone-700 text-center"
                      />
                      <span className="text-stone-400">clean pads</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Pain Slider & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Pelvic / Wound Pain Level (0 to 10)</span>
                    <span className="text-amber-400 font-bold">{painLevel} / 10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>0: No Pain</span>
                    <span>5: Moderate</span>
                    <span>10: Severe Rush</span>
                  </div>
                  {painLevel >= 7 && (
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300">
                      Severe pain after surgery may signify infection or catheter blockage. Contact your hospital nurse.
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Personal Healing Notes & Observations
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Skin rash clearing up with shea butter, feeling much stronger today..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full bg-stone-900 text-stone-200 text-xs px-3 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Today's Recovery Log
                </button>
              </div>
            </form>
          </div>

          {/* Follow-Up Appointments Tracker */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  Hospital Follow-Up Appointments & Catheter Milestones
                </h3>
                <p className="text-xs text-stone-400">
                  Track your catheter removal, 2-week, 6-week, and 3-month clinic reviews
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingAppt(!isAddingAppt)}
                className="py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                {isAddingAppt ? 'Cancel' : 'Add Follow-Up Date'}
              </button>
            </div>

            {/* Add Appointment Form */}
            {isAddingAppt && (
              <form
                onSubmit={handleAddAppointment}
                className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                      Appointment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={apptTitle}
                      onChange={(e) => setApptTitle(e.target.value)}
                      className="w-full bg-stone-900 text-xs text-white p-2 rounded-lg border border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      required
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="w-full bg-stone-900 text-xs text-white p-2 rounded-lg border border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                      Hospital / VVF Center
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Babbar Ruga NOFIC"
                      value={apptFacility}
                      onChange={(e) => setApptFacility(e.target.value)}
                      className="w-full bg-stone-900 text-xs text-white p-2 rounded-lg border border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                      Purpose
                    </label>
                    <select
                      value={apptPurpose}
                      onChange={(e) => setApptPurpose(e.target.value as any)}
                      className="w-full bg-stone-900 text-xs text-white p-2 rounded-lg border border-stone-700"
                    >
                      <option value="catheter_removal">Catheter Removal & Dye Test (Day 14)</option>
                      <option value="two_week_check">2-Week Wound Review</option>
                      <option value="six_week_check">6-Week Progress Check</option>
                      <option value="three_month_discharge">3-Month Final Clearance</option>
                      <option value="pre_op_evaluation">Pre-Op Evaluation</option>
                      <option value="surgery_admission">Surgery Admission Day</option>
                      <option value="general_review">General Check-up</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                    Doctor / Nurse or Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Aminu, bring original clinic card and clean clothing"
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    className="w-full bg-stone-900 text-xs text-white p-2 rounded-lg border border-stone-700"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAppt(false)}
                    className="py-1.5 px-3 text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                  >
                    Save Appointment
                  </button>
                </div>
              </form>
            )}

            {/* List of Appointments */}
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  No appointments logged yet. Add your catheter removal or clinic follow-up date above.
                </div>
              ) : (
                appointments.map((a) => {
                  const daysDiff = Math.ceil(
                    (new Date(a.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                  );
                  return (
                    <div
                      key={a.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        a.completed
                          ? 'bg-stone-950/60 border-stone-800 text-stone-500'
                          : 'bg-stone-950 border-stone-800 text-stone-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAppointment(a.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            a.completed
                              ? 'bg-emerald-500 border-emerald-500 text-stone-950'
                              : 'border-stone-600 hover:border-amber-400 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className={a.completed ? 'line-through text-stone-500' : ''}>
                              {a.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                              {a.date}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                            <span>{a.facilityName}</span>
                            {a.doctorOrNurse && <span>· {a.doctorOrNurse}</span>}
                            {a.notes && <span>· Note: {a.notes}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {!a.completed && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              daysDiff <= 3
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : daysDiff <= 7
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/15 text-sky-300'
                            }`}
                          >
                            {daysDiff === 0
                              ? 'Today!'
                              : daysDiff < 0
                              ? `${Math.abs(daysDiff)}d ago`
                              : `in ${daysDiff} days`}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(a.id)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                          title="Delete appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Daily Logs Table / Cards */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Recent Healing Logs History
            </h3>

            {dailyLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                No logs recorded yet. Use the form above to record your first day!
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.date}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            log.leakageStatus === 'completely_dry'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : log.leakageStatus === 'slight_dampness'
                              ? 'bg-sky-500/20 text-sky-300'
                              : log.leakageStatus === 'moderate_leak'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {log.leakageStatus.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-sky-400">💧 {log.waterCups} cups</span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex flex-wrap gap-2">
                        <span>Barrier: {log.skinBarrierApplied ? '✅ Applied' : '❌ Missed'}</span>
                        <span>Pelvic Rest: {log.pelvicRestObserved ? '✅ Observed' : '⚠️ Need Rest'}</span>
                        <span>Pain: {log.painLevel}/10</span>
                        {log.notes && <span className="text-stone-300 italic">"{log.notes}"</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 text-stone-500 hover:text-rose-400 self-end sm:self-auto transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Free Repair Centers (Nigeria) */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Header & National Free Guarantee */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Federal Ministry of Health & Partner Network
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Accredited Obstetric Fistula Centres in Nigeria
                </h2>
                <p className="text-xs sm:text-sm text-stone-300">
                  Every center listed below provides <strong>100% Free Surgeries, Free Bed Stay, Free Medication, and Free Dignity Kits</strong>.
                </p>
              </div>

              {/* National Helpline Badge */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 shrink-0 text-center">
                <span className="text-[11px] text-stone-400 block">Toll-Free Helpline</span>
                <span className="text-sm font-bold text-emerald-400">0800-FISTULA</span>
                <span className="text-[10px] text-stone-500 block">24/7 Nationwide Help</span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by state, city, or hospital name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                {[
                  { id: 'all', label: 'All Zones' },
                  { id: 'North West', label: 'North West' },
                  { id: 'North East', label: 'North East' },
                  { id: 'North Central', label: 'North Central' },
                  { id: 'South West', label: 'South West' },
                  { id: 'South East', label: 'South East' },
                  { id: 'South South', label: 'South South' }
                ].map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-colors cursor-pointer ${
                      selectedZone === z.id
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-950 text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Centers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4 flex flex-col justify-between hover:border-stone-700 transition-colors shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          100% Free Care
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                          {center.zone}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {center.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {center.description}
                  </p>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5 text-xs">
                    <div className="flex items-start gap-2 text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{center.address} ({center.state} State)</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{center.phone}</span>
                      {center.altPhone && <span className="text-stone-500">/ {center.altPhone}</span>}
                    </div>
                    {center.transportSupport && (
                      <div className="text-[11px] text-amber-300/90 pt-1">
                        🚌 <strong>Transport:</strong> {center.transportSupport}
                      </div>
                    )}
                  </div>

                  {/* Services List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      Free Services Provided:
                    </span>
                    <ul className="text-xs text-stone-300 space-y-1">
                      {center.services.map((srv, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-stone-500">
                    Partner: {center.partner}
                  </span>
                  <a
                    href={`tel:${center.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Center
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredCenters.length === 0 && (
            <div className="bg-stone-900 rounded-2xl p-8 border border-stone-800 text-center space-y-2">
              <Info className="w-8 h-8 text-stone-500 mx-auto" />
              <div className="text-sm font-bold text-white">No fistula centers match your search</div>
              <p className="text-xs text-stone-400">
                Try selecting "All Zones" or clear your search keyword.
              </p>
            </div>
          )}

          {/* How to Access Guide for Women and CHWs */}
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              Step-by-Step: How to Register for Free Surgery in Nigeria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  Step 1
                </div>
                <h4 className="font-bold text-white">Visit Your Local PHC</h4>
                <p className="text-stone-400 leading-relaxed">
                  Go to your nearest Primary Health Centre or ask a Community Health Extension Worker (CHEW) for the <strong>Fistula Focal Person</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  Step 2
                </div>
                <h4 className="font-bold text-white">Call 0800-FISTULA</h4>
                <p className="text-stone-400 leading-relaxed">
                  Call the toll-free number from any phone (free of airtime). They will register you on the national list and give you dates for upcoming surgical pools.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  Step 3
                </div>
                <h4 className="font-bold text-white">Free Transport & Admission</h4>
                <p className="text-stone-400 leading-relaxed">
                  Community partner vehicles transfer patients to the center. You will receive a clean bed, dignity pack, high-protein food, and world-class surgical care at zero cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
