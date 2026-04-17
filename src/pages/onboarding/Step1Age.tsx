import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { loadOnboarding, saveOnboarding, LifeStageAnswer } from "@/lib/onboarding";

const STAGES: { id: LifeStageAnswer; title: string; detail: string }[] = [
  { id: "cycling_regular", title: "Cycling regularly", detail: "Periods every 25–35 days." },
  { id: "cycling_irregular", title: "Cycles getting irregular", detail: "Skipped, late, or unpredictable." },
  { id: "no_period_12mo", title: "No period in 12+ months", detail: "Post-menopause." },
  { id: "on_contraception", title: "On hormonal contraception", detail: "Pill, coil, implant, injection." },
  { id: "on_hrt", title: "On HRT", detail: "Hormone replacement therapy." },
  { id: "unsure", title: "Not sure", detail: "We'll help work it out." },
];

const Step1Age = () => {
  const navigate = useNavigate();
  const initial = loadOnboarding();
  const [dob, setDob] = useState(initial.dob ?? "");
  const [stage, setStage] = useState<LifeStageAnswer | undefined>(initial.lifeStage);

  const canContinue = !!dob && !!stage;

  const handleNext = () => {
    if (!canContinue) return;
    saveOnboarding({ ...initial, dob, lifeStage: stage });
    if (stage === "cycling_regular" || stage === "cycling_irregular" || stage === "on_contraception") {
      navigate("/onboarding/cycle");
    } else {
      navigate("/onboarding/symptoms");
    }
  };

  return (
    <StepShell
      step={1}
      totalSteps={5}
      eyebrow="Tell us about you"
      title="Where are you right now?"
      subtitle="Your age and life stage shape everything we recommend. We'll fine-tune as we learn more."
      footer={
        <>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[14px]"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            disabled={!canContinue}
            onClick={handleNext}
            className="btn-primary text-[14px]"
          >
            Continue <ChevronRight size={16} />
          </button>
        </>
      }
    >
      {/* DOB */}
      <div className="mb-10">
        <label className="eyebrow block mb-3">Date of birth</label>
        <input
          type="date"
          value={dob}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDob(e.target.value)}
          className="input-clinical max-w-xs"
        />
      </div>

      {/* Life stage */}
      <label className="eyebrow block mb-4">Your current stage</label>
      <div className="space-y-2">
        {STAGES.map((s) => {
          const selected = stage === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStage(s.id)}
              className={`w-full text-left rounded-sm border px-5 py-4 transition-all ${
                selected
                  ? "border-gold bg-gold-soft"
                  : "border-border bg-surface/50 hover:bg-surface hover:border-border/80"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 w-3 h-3 rounded-full border flex-shrink-0 transition-colors ${
                    selected ? "border-gold bg-gold" : "border-border"
                  }`}
                />
                <div>
                  <div className={`font-medium text-[15px] ${selected ? "text-foreground" : "text-foreground/90"}`}>
                    {s.title}
                  </div>
                  <div className="text-text-dim text-[13px] mt-0.5">{s.detail}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
};

export default Step1Age;
