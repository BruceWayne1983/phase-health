import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import {
  AppMode,
  calculateAge,
  detectMode,
  loadOnboarding,
  saveOnboarding,
} from "@/lib/onboarding";
import { persistOnboarding } from "@/lib/persistOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { SYMPTOMS } from "@/data/symptoms";
import { toast } from "sonner";

const MODE_COPY: Record<AppMode, { label: string; title: string; description: string; accentVar: string }> = {
  cycle: {
    label: "Cycle Mode",
    title: "We'll track every phase of your cycle",
    description:
      "Daily logging, phase-specific supplements, and education that actually understands your hormones. We'll watch for any signs of perimenopause and let you know if your stage shifts.",
    accentVar: "var(--gold-bright)",
  },
  transition: {
    label: "Transition Mode",
    title: "We'll guide you through perimenopause",
    description:
      "Symptom tracking across 34 menopause symptoms, bloods upload with AI interpretation, and a supplement protocol built for this stage of life. No guesswork.",
    accentVar: "var(--gold)",
  },
  post_meno: {
    label: "Post-Menopause Mode",
    title: "Long-term healthspan, optimised",
    description:
      "The transition is behind you. We focus on bone, brain, metabolic, and skin health for the decades ahead. Bloods-led, evidence-based.",
    accentVar: "var(--gold-deep)",
  },
};

const Summary = () => {
  const navigate = useNavigate();
  const state = loadOnboarding();
  const { user, loading: authLoading } = useAuth();
  const mode = useMemo(() => detectMode(state), [state]);
  const age = calculateAge(state.dob);
  const [submitting, setSubmitting] = useState(false);

  const topSymptoms = useMemo(
    () =>
      [...state.symptoms]
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 3)
        .map((e) => SYMPTOMS.find((s) => s.id === e.id)?.name)
        .filter(Boolean) as string[],
    [state.symptoms],
  );

  // Persist detected mode + completion timestamp
  useEffect(() => {
    saveOnboarding({
      ...state,
      detectedMode: mode,
      completedAt: state.completedAt ?? new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = MODE_COPY[mode];

  async function handleContinue() {
    if (authLoading) return;
    if (!user) {
      // Save state, send to auth, come back here
      saveOnboarding({ ...state, detectedMode: mode });
      navigate("/auth?next=/onboarding/summary");
      return;
    }
    setSubmitting(true);
    try {
      await persistOnboarding(user.id, { ...state, detectedMode: mode });
      toast.success("Profile saved.");
      navigate("/protocol");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StepShell
      step={5}
      totalSteps={5}
      eyebrow="Your starting point"
      title="Here's what we found"
      subtitle="Based on what you've shared, this is where you are. You can change your mode any time in your profile."
      footer={
        <>
          <span className="text-text-dim text-[12px] hidden sm:inline">
            Your data, your decisions.
          </span>
          <button
            onClick={handleContinue}
            disabled={submitting}
            className="btn-primary text-[14px] ml-auto"
          >
            {submitting ? "Saving..." : "Continue to my protocol"} <ChevronRight size={16} />
          </button>
        </>
      }
    >
      {/* Mode card */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <span
            aria-hidden
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: `hsl(${copy.accentVar})` }}
          />
          <span className="eyebrow text-gold-deep">{copy.label}</span>
        </div>
        <h2 className="font-serif text-2xl text-foreground leading-tight mb-3">{copy.title}</h2>
        <p className="text-muted-foreground text-[14px] leading-relaxed">{copy.description}</p>
      </div>

      {/* Snapshot facts */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {age !== undefined && <Fact label="Age" value={`${age}`} />}
        {state.cycleLength && <Fact label="Cycle" value={`${state.cycleLength} days`} />}
        <Fact label="Symptoms tracked" value={`${state.symptoms.length}`} />
        <Fact label="Goals" value={`${state.goals.length}`} />
      </div>

      {/* Top symptoms */}
      {topSymptoms.length > 0 && (
        <div className="card-elevated p-5 mb-6">
          <p className="eyebrow mb-3">Top concerns</p>
          <ul className="space-y-2">
            {topSymptoms.map((name) => (
              <li key={name} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-gold" />
                <span className="text-foreground text-[14px]">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Privacy commitment */}
      <div className="rounded-sm border border-border bg-surface/50 p-5 flex items-start gap-3">
        <Lock size={16} className="text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground text-[13px] font-medium mb-1">
            Your data stays yours
          </p>
          <p className="text-text-dim text-[12px] leading-relaxed">
            Encrypted at rest. Never sold. Never shared with adtech. Export or delete it any time.
          </p>
        </div>
      </div>
    </StepShell>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-surface/50 border border-border rounded-sm p-4">
    <p className="eyebrow mb-1.5">{label}</p>
    <p className="font-serif text-2xl text-foreground tabular-nums">{value}</p>
  </div>
);

export default Summary;
