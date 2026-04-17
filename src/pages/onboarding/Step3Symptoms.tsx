import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { loadOnboarding, saveOnboarding, SymptomEntry } from "@/lib/onboarding";
import { CATEGORY_ORDER, SYMPTOMS, SymptomCategory } from "@/data/symptoms";

const Step3Symptoms = () => {
  const navigate = useNavigate();
  const initial = loadOnboarding();
  const [entries, setEntries] = useState<SymptomEntry[]>(initial.symptoms ?? []);
  const [activeCategory, setActiveCategory] = useState<SymptomCategory>(CATEGORY_ORDER[0]);

  const grouped = useMemo(() => {
    const map = new Map<SymptomCategory, typeof SYMPTOMS>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const s of SYMPTOMS) map.get(s.category)?.push(s);
    return map;
  }, []);

  const isSelected = (id: string) => entries.some((e) => e.id === id);
  const severityOf = (id: string) => entries.find((e) => e.id === id)?.severity ?? 5;

  const toggle = (id: string) => {
    setEntries((prev) =>
      prev.some((e) => e.id === id)
        ? prev.filter((e) => e.id !== id)
        : [...prev, { id, severity: 5 }],
    );
  };

  const setSeverity = (id: string, severity: number) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, severity } : e)));
  };

  const handleNext = () => {
    saveOnboarding({ ...initial, symptoms: entries });
    navigate("/onboarding/goals");
  };

  const previousRoute = initial.lifeStage === "no_period_12mo" || initial.lifeStage === "on_hrt" || initial.lifeStage === "unsure"
    ? "/onboarding/age"
    : "/onboarding/cycle";

  return (
    <StepShell
      step={3}
      totalSteps={5}
      eyebrow="Symptom baseline"
      title="What have you felt in the last 3 months?"
      subtitle="Select anything you've experienced — even mildly. Severity helps us prioritise."
      footer={
        <>
          <button
            onClick={() => navigate(previousRoute)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[14px]"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-text-dim text-[12px]">{entries.length} selected</span>
            <button
              onClick={handleNext}
              className="btn-primary text-[14px]"
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </>
      }
    >
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-3 mb-6 border-b border-border">
        {CATEGORY_ORDER.map((c) => {
          const count = (grouped.get(c) ?? []).filter((s) => isSelected(s.id)).length;
          const active = activeCategory === c;
          return (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 rounded-sm px-3 py-1.5 text-[13px] font-medium transition-all ${
                active
                  ? "bg-gold text-cream"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
              {count > 0 && (
                <span className={`ml-2 ${active ? "text-cream/80" : "text-gold-deep"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 animate-fade-in">
        {(grouped.get(activeCategory) ?? []).map((s) => {
          const selected = isSelected(s.id);
          return (
            <div
              key={s.id}
              className={`rounded-sm border transition-all ${
                selected ? "border-gold bg-gold-soft" : "border-border bg-surface/50"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="w-full text-left px-5 py-3.5 flex items-center justify-between"
              >
                <span className="text-foreground text-[15px]">{s.name}</span>
                <span
                  aria-hidden
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                    selected ? "border-gold bg-gold" : "border-border"
                  }`}
                >
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5l3 3 5-7" stroke="hsl(var(--cream))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>
              {selected && (
                <div className="px-5 pb-4 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow">Severity</span>
                    <span className="font-serif text-gold-deep text-base tabular-nums">
                      {severityOf(s.id)}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severityOf(s.id)}
                    onChange={(e) => setSeverity(s.id, Number(e.target.value))}
                    className="w-full accent-[hsl(var(--gold))]"
                  />
                  <div className="flex justify-between text-text-dim text-[10px] mt-1 uppercase tracking-wider">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StepShell>
  );
};

export default Step3Symptoms;
