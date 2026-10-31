export type TriageSeverity = 'EMERGENCY' | 'URGENT' | 'ROUTINE';

export type UserRole = 'mother' | 'postpartum' | 'adolescent' | 'chw' | 'menopause';

export type SupportedLanguage = 'English' | 'Nigerian Pidgin' | 'Swahili' | 'French' | 'Hausa' | 'Yoruba';

export interface UserContext {
  role: UserRole;
  isPregnant: boolean;
  trimester?: 1 | 2 | 3;
  weeks?: number;
  isPostpartum?: boolean;
  postpartumDays?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  severity?: TriageSeverity;
  audioBase64?: string;
  isAudioLoading?: boolean;
  groundingChunks?: any[];
  modelUsed?: string;
}

export interface StructuredTriageResult {
  severity: TriageSeverity;
  headline: string;
  dangerSignsDetected: string[];
  plainLanguageExplanation: string;
  immediateActions: string[];
  chwClinicalNotes: string[];
  whenToRushToHospital: string;
}

export interface PpdLanguageAnalysis {
  analyzedText: string;
  absoluteNegativeWordsFound: string[];
  firstPersonPronounCount: number;
  totalWordCount: number;
  pronounRatio: number; // 1st person singular vs total words
  updateCadenceDays: number;
  cadenceDropAlert: boolean;
  linguisticRiskScore: number; // 0 - 100
  linguisticTier: 'Low' | 'Moderate' | 'Elevated' | 'Severe';
  sentimentObservations: string[];
}

export interface PpdCircadianMetrics {
  totalSleepHours: number;
  wakeupsCount: number; // sleep fragmentation
  nighttimeHyperVigilance: 'None' | 'Mild' | 'Moderate' | 'Severe';
  longestUninterruptedBlockHours: number; // Target >= 4h
  restQualityRating: number; // 1 - 5
  circadianDisruptionScore: number; // 0 - 100
}

export interface PpdBondingMetrics {
  attachmentSpectrum: 'Secure & Balanced' | 'Hyper-Fixated & Vigilant' | 'Detached / Numbed';
  attachmentScore: number; // 0 (detached) to 50 (balanced) to 100 (hyper-fixated)
  executiveParalysisScore: number; // 1 - 10 (decision making difficulty)
  intrusiveThoughtsFrequency: 'Never' | 'Occasional' | 'Daily' | 'Continuous';
  partnerFamilyAssistanceAcceptance: boolean;
  bondingRiskFlags: string[];
}

export interface NutritionalRepletionItem {
  id: string;
  nutrient: string;
  targetMechanism: string;
  clinicalDosing: string;
  biochemicalPathway: string;
  localFoodSources: string[];
  lactationSafety: string;
  contraindications: string;
}

export type CyclePhaseName = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleLogEntry {
  id: string;
  date: string;
  flow?: 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood?: string;
  notes?: string;
}

export interface MenstrualCycleData {
  lastPeriodDate: string; // YYYY-MM-DD
  cycleLength: number; // e.g. 28 days (21-40)
  periodDuration: number; // e.g. 5 days (2-10)
  notificationsEnabled: boolean;
  notes?: string;
  logs?: CycleLogEntry[];
}

export interface CycleAlertStatus {
  status:
    | 'period_due_soon'
    | 'period_active'
    | 'ovulation_approaching'
    | 'fertile_window'
    | 'pms_luteal'
    | 'routine';
  daysUntilPeriod: number;
  currentCycleDay: number;
  expectedDateString: string;
  urgencyLevel: 'alert' | 'caution' | 'info';
  headline: string;
  preparationChecklist: string[];
}

export type PregnancyStage = 'trimester1' | 'trimester2' | 'trimester3' | 'postpartum';
export type AfricanRegion = 'all' | 'west' | 'east' | 'central' | 'northern';
export type BudgetTier = 'low_cost' | 'moderate' | 'any';

export interface LocalFoodItem {
  id: string;
  name: string;
  localNames: {
    english: string;
    pidgin?: string;
    swahili?: string;
    french?: string;
    hausa?: string;
    yoruba?: string;
  };
  region: AfricanRegion;
  category: 'leafy_greens' | 'legumes_proteins' | 'fish_meat_dairy' | 'roots_tubers_grains' | 'fruits_seeds';
  trimestersRecommended: (1 | 2 | 3 | 4)[]; // 4 = postpartum
  keyNutrients: string[];
  whyItMatters: string;
  howToPrepareSafely: string;
  budgetTier: 'low_cost' | 'moderate';
  culturalNote?: string;
  caution?: string;
}

export interface TrimesterNutritionGuide {
  stage: PregnancyStage;
  title: string;
  weeksRange: string;
  fetalDevelopmentHighlight: string;
  maternalBodyNeed: string;
  coreNutrients: {
    name: string;
    dailyGoal: string;
    localSources: string;
    physiologicalImpact: string;
  }[];
  sampleMealPlan: {
    breakfast: string;
    midMorningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
    bedtimeDrink: string;
  };
  commonSymptomRemedies: {
    symptom: string;
    culinarySolution: string;
    foodsToAvoid: string;
  }[];
  criticalSafetyCautions: string[];
}

export interface CulturalNutritionMyth {
  id: string;
  myth: string;
  verdict: 'FALSE' | 'PARTIALLY TRUE' | 'DANGEROUS TABOO';
  scientificTruth: string;
  mamaGAdvice: string;
}

export interface DailyHydrationPlateChecklist {
  date: string;
  waterGlasses: number;
  ironRichEaten: boolean;
  leafyGreensEaten: boolean;
  cleanProteinEaten: boolean;
  citrusOrFruitEaten: boolean;
  prenatalSupplementTaken: boolean;
  notes?: string;
}

export type VvfRecoveryStage =
  | 'awaiting_surgery'
  | 'catheter_in_place'
  | 'catheter_removed'
  | 'pelvic_rest_phase'
  | 'discharged_healed';

export interface VvfDailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  waterCups: number; // Goal: 8-10 glasses (3-4 Liters)
  leakageStatus: 'completely_dry' | 'slight_dampness' | 'moderate_leak' | 'heavy_leak';
  catheterCareDone?: boolean;
  skinBarrierApplied: boolean;
  cleanPadsUsed: number;
  painLevel: number; // 0 to 10
  pelvicRestObserved: boolean;
  heavyLiftingAvoided: boolean;
  notes?: string;
}

export interface VvfAppointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  facilityName: string;
  doctorOrNurse?: string;
  purpose:
    | 'pre_op_evaluation'
    | 'surgery_admission'
    | 'catheter_removal'
    | 'two_week_check'
    | 'six_week_check'
    | 'three_month_discharge'
    | 'general_review';
  completed: boolean;
  notes?: string;
}

export interface VvfCenter {
  id: string;
  name: string;
  state: string;
  zone: 'North West' | 'North East' | 'North Central' | 'South West' | 'South East' | 'South South';
  city: string;
  address: string;
  phone: string;
  altPhone?: string;
  services: string[];
  partner: string;
  isFree: boolean;
  transportSupport?: string;
  description: string;
  specialistHead?: string;
}




