// Symptom catalogue — 34 menopause symptoms + common cycle symptoms.
// Used in onboarding step 4 (baseline) and daily logging.

export type SymptomCategory =
  | "Physical"
  | "Emotional"
  | "Cognitive"
  | "Sexual"
  | "Sleep"
  | "Metabolic";

export interface Symptom {
  id: string;
  name: string;
  category: SymptomCategory;
  // contexts the symptom is most relevant in
  contexts: ("cycle" | "transition")[];
}

export const SYMPTOMS: Symptom[] = [
  // Physical
  { id: "hot_flushes", name: "Hot flushes", category: "Physical", contexts: ["transition"] },
  { id: "night_sweats", name: "Night sweats", category: "Physical", contexts: ["transition"] },
  { id: "joint_pain", name: "Joint pain", category: "Physical", contexts: ["transition"] },
  { id: "muscle_aches", name: "Muscle aches", category: "Physical", contexts: ["transition", "cycle"] },
  { id: "headaches", name: "Headaches", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "migraines", name: "Migraines", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "breast_tenderness", name: "Breast tenderness", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "bloating", name: "Bloating", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "cramps", name: "Period cramps", category: "Physical", contexts: ["cycle"] },
  { id: "heavy_periods", name: "Heavy bleeding", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "irregular_periods", name: "Irregular periods", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "skin_changes", name: "Skin changes", category: "Physical", contexts: ["cycle", "transition"] },
  { id: "hair_thinning", name: "Hair thinning", category: "Physical", contexts: ["transition"] },
  { id: "dry_skin", name: "Dry skin", category: "Physical", contexts: ["transition"] },

  // Emotional
  { id: "mood_swings", name: "Mood swings", category: "Emotional", contexts: ["cycle", "transition"] },
  { id: "anxiety", name: "Anxiety", category: "Emotional", contexts: ["cycle", "transition"] },
  { id: "low_mood", name: "Low mood", category: "Emotional", contexts: ["cycle", "transition"] },
  { id: "irritability", name: "Irritability", category: "Emotional", contexts: ["cycle", "transition"] },
  { id: "tearfulness", name: "Tearfulness", category: "Emotional", contexts: ["cycle", "transition"] },
  { id: "rage", name: "Sudden rage", category: "Emotional", contexts: ["transition"] },

  // Cognitive
  { id: "brain_fog", name: "Brain fog", category: "Cognitive", contexts: ["cycle", "transition"] },
  { id: "memory_issues", name: "Memory lapses", category: "Cognitive", contexts: ["transition"] },
  { id: "poor_focus", name: "Poor concentration", category: "Cognitive", contexts: ["cycle", "transition"] },
  { id: "word_finding", name: "Word-finding difficulty", category: "Cognitive", contexts: ["transition"] },

  // Sexual
  { id: "low_libido", name: "Low libido", category: "Sexual", contexts: ["cycle", "transition"] },
  { id: "vaginal_dryness", name: "Vaginal dryness", category: "Sexual", contexts: ["transition"] },
  { id: "painful_sex", name: "Painful intercourse", category: "Sexual", contexts: ["transition"] },
  { id: "uti_recurrent", name: "Recurrent UTIs", category: "Sexual", contexts: ["transition"] },

  // Sleep
  { id: "insomnia", name: "Insomnia", category: "Sleep", contexts: ["cycle", "transition"] },
  { id: "early_waking", name: "Early waking", category: "Sleep", contexts: ["transition"] },
  { id: "non_restorative", name: "Non-restorative sleep", category: "Sleep", contexts: ["cycle", "transition"] },
  { id: "fatigue", name: "Daytime fatigue", category: "Sleep", contexts: ["cycle", "transition"] },

  // Metabolic
  { id: "weight_gain", name: "Weight gain", category: "Metabolic", contexts: ["transition"] },
  { id: "belly_fat", name: "Increased belly fat", category: "Metabolic", contexts: ["transition"] },
  { id: "sugar_cravings", name: "Sugar cravings", category: "Metabolic", contexts: ["cycle", "transition"] },
  { id: "blood_sugar_swings", name: "Blood sugar crashes", category: "Metabolic", contexts: ["cycle", "transition"] },
  { id: "cold_intolerance", name: "Cold intolerance", category: "Metabolic", contexts: ["transition"] },
];

export const CATEGORY_ORDER: SymptomCategory[] = [
  "Physical",
  "Emotional",
  "Cognitive",
  "Sleep",
  "Sexual",
  "Metabolic",
];

export const GOALS: { id: string; label: string }[] = [
  { id: "manage_symptoms", label: "Manage symptoms" },
  { id: "energy", label: "Optimise energy" },
  { id: "sleep", label: "Improve sleep" },
  { id: "libido", label: "Libido" },
  { id: "weight", label: "Weight & body composition" },
  { id: "skin_hair", label: "Skin & hair" },
  { id: "healthspan", label: "Long-term healthspan" },
  { id: "fertility", label: "Fertility tracking" },
  { id: "cycle_awareness", label: "Cycle awareness" },
];
