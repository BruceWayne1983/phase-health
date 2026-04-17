import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { loadOnboarding, saveOnboarding } from "@/lib/onboarding";

const Step2Cycle = () => {
  const navigate = useNavigate();
  const initial = loadOnboarding();
  const isIrregular = initial.lifeStage === "cycling_irregular";
  const onContraception = initial.lifeStage === "on_contraception";

  const [lastPeriod, setLastPeriod] = useState(initial.lastPeriodStart ?? "");
  const [cycleLength, setCycleLength] = useState<number | "">(initial.cycleLength ?? 28);
  const [periodLength, setPeriodLength] = useState<number | "">(initial.periodLength ?? 5);
  const [monthsSince, setMonthsSince] = useState<number | "">(initial.monthsSinceLastPeriod ?? "");

  const canContinue = onContraception
    ? true
    : isIrregular
    ? !!monthsSince || !!lastPeriod
    : !!lastPeriod && !!cycleLength && !!periodLength;

  const handleNext = () => {
    saveOnboarding({
      ...initial,
      lastPeriodStart: lastPeriod || undefined,
      cycleLength: typeof cycleLength === "number" ? cycleLength : undefined,
      periodLength: typeof periodLength === "number" ? periodLength : undefined,
      monthsSinceLastPeriod: typeof monthsSince === "number" ? monthsSince : undefined,
    });
    navigate("/onboarding/symptoms");
  };

  return (
    <StepShell
      step={2}
      totalSteps={5}
      eyebrow="Your cycle"
      title="Tell us about your cycle"
      subtitle={
        onContraception
          ? "Hormonal contraception masks your natural cycle. We'll skip the details — share what you know."
          : "Even rough numbers are useful. You can refine these later."
      }
      footer={
        <>
          <button
            onClick={() => navigate("/onboarding/age")}
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
      <div className="space-y-8">
        <div>
          <label className="eyebrow block mb-3">
            {isIrregular ? "Last period (if you remember)" : "Last period start date"}
          </label>
          <input
            type="date"
            value={lastPeriod}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setLastPeriod(e.target.value)}
            className="input-clinical max-w-xs"
          />
        </div>

        {!onContraception && !isIrregular && (
          <>
            <NumberField
              label="Typical cycle length"
              value={cycleLength}
              onChange={setCycleLength}
              suffix="days"
              min={20}
              max={45}
            />
            <NumberField
              label="Typical period length"
              value={periodLength}
              onChange={setPeriodLength}
              suffix="days"
              min={1}
              max={10}
            />
          </>
        )}

        {isIrregular && (
          <NumberField
            label="Months since your last period"
            value={monthsSince}
            onChange={setMonthsSince}
            suffix="months"
            min={0}
            max={24}
          />
        )}
      </div>
    </StepShell>
  );
};

interface NumberFieldProps {
  label: string;
  value: number | "";
  onChange: (n: number | "") => void;
  suffix: string;
  min: number;
  max: number;
}

const NumberField = ({ label, value, onChange, suffix, min, max }: NumberFieldProps) => (
  <div>
    <label className="eyebrow block mb-3">{label}</label>
    <div className="flex items-center gap-3">
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? "" : Number(v));
        }}
        className="input-clinical max-w-[120px] text-center font-serif text-xl"
      />
      <span className="text-text-dim text-[13px]">{suffix}</span>
    </div>
  </div>
);

export default Step2Cycle;
