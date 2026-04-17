// Onboarding state, persisted in localStorage. No backend yet.

export type LifeStageAnswer =
  | "cycling_regular"
  | "cycling_irregular"
  | "no_period_12mo"
  | "on_contraception"
  | "on_hrt"
  | "unsure";

export type AppMode = "cycle" | "transition" | "post_meno";

export interface SymptomEntry {
  id: string;
  severity: number; // 1-10
}

export interface OnboardingState {
  dob?: string;                       // ISO date
  lifeStage?: LifeStageAnswer;
  lastPeriodStart?: string;
  cycleLength?: number;
  periodLength?: number;
  monthsSinceLastPeriod?: number;
  symptoms: SymptomEntry[];
  goals: string[];
  notes?: string;
  detectedMode?: AppMode;
  completedAt?: string;
}

const STORAGE_KEY = "anadya.onboarding.v1";

export function loadOnboarding(): OnboardingState {
  if (typeof window === "undefined") return { symptoms: [], goals: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { symptoms: [], goals: [] };
    const parsed = JSON.parse(raw) as OnboardingState;
    return { symptoms: [], goals: [], ...parsed };
  } catch {
    return { symptoms: [], goals: [] };
  }
}

export function saveOnboarding(state: OnboardingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function calculateAge(dob?: string): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Mode detection.
 * Inputs: age, life stage answer, symptom set.
 * Logic:
 *  - 12+ months no period -> post_meno
 *  - cycling irregular OR age 40+ with transition symptoms -> transition
 *  - On HRT -> transition
 *  - Cycling regular -> cycle
 *  - Default by age: <40 cycle, 40-55 transition, 55+ post_meno
 */
export function detectMode(state: OnboardingState): AppMode {
  const age = calculateAge(state.dob);
  const stage = state.lifeStage;

  if (stage === "no_period_12mo") return "post_meno";
  if (stage === "on_hrt") return "transition";
  if (stage === "cycling_irregular") return "transition";
  if (stage === "cycling_regular" || stage === "on_contraception") {
    if (age && age >= 45) return "transition";
    return "cycle";
  }

  // Symptom-based hint
  const transitionSymptomIds = new Set([
    "hot_flushes",
    "night_sweats",
    "vaginal_dryness",
    "rage",
    "memory_issues",
    "word_finding",
    "early_waking",
  ]);
  const hasTransitionSignal = state.symptoms.some((s) =>
    transitionSymptomIds.has(s.id) && s.severity >= 4,
  );
  if (hasTransitionSignal) return "transition";

  if (!age) return "cycle";
  if (age < 40) return "cycle";
  if (age < 55) return "transition";
  return "post_meno";
}
