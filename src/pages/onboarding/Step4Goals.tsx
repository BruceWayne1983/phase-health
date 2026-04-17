import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { loadOnboarding, saveOnboarding } from "@/lib/onboarding";
import { GOALS } from "@/data/symptoms";

const Step4Goals = () => {
  const navigate = useNavigate();
  const initial = loadOnboarding();
  const [selected, setSelected] = useState<string[]>(initial.goals ?? []);
  const [notes, setNotes] = useState<string>(initial.notes ?? "");

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const handleNext = () => {
    saveOnboarding({ ...initial, goals: selected, notes: notes.trim() || undefined });
    navigate("/onboarding/summary");
  };

  return (
    <StepShell
      step={4}
      totalSteps={5}
      eyebrow="Goals"
      title="What matters most to you?"
      subtitle="Pick what you want to work on. We'll prioritise these in your protocol."
      footer={
        <>
          <button
            onClick={() => navigate("/onboarding/symptoms")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[14px]"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            disabled={selected.length === 0}
            onClick={handleNext}
            className="btn-primary text-[14px]"
          >
            Continue <ChevronRight size={16} />
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
        {GOALS.map((g) => {
          const isOn = selected.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              className={`text-left rounded-sm border px-4 py-3.5 transition-all flex items-center justify-between ${
                isOn ? "border-gold bg-gold-soft" : "border-border bg-surface/50 hover:bg-surface"
              }`}
            >
              <span className="text-foreground text-[14px]">{g.label}</span>
              <span
                aria-hidden
                className={`w-3.5 h-3.5 rounded-full border transition-colors ${
                  isOn ? "border-gold bg-gold" : "border-border"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div>
        <label className="eyebrow block mb-3">Anything else we should know?</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional. Conditions, medications, history, anything relevant."
          rows={4}
          className="input-clinical resize-none"
        />
      </div>
    </StepShell>
  );
};

export default Step4Goals;
