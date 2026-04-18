import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { GoldRule } from "@/components/Ornaments";
import { FeedbackWidget } from "@/components/protocol/FeedbackWidget";
import { toast } from "sonner";

type Status =
  | { kind: "checking" }
  | { kind: "needs_auth" }
  | { kind: "needs_dev_access"; email: string | null }
  | { kind: "needs_onboarding" }
  | { kind: "ready" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "show"; protocol: any; cached: boolean };

export default function Protocol() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>({ kind: "checking" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatus({ kind: "needs_auth" });
      return;
    }
    (async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_dev_user, is_demo, mode, age")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        setStatus({ kind: "error", message: error.message });
        return;
      }
      if (!profile) {
        setStatus({ kind: "needs_onboarding" });
        return;
      }
      if (!profile.is_dev_user && !profile.is_demo) {
        setStatus({ kind: "needs_dev_access", email: user.email ?? null });
        return;
      }
      if (!profile.mode || !profile.age) {
        setStatus({ kind: "needs_onboarding" });
        return;
      }
      setStatus({ kind: "ready" });
    })();
  }, [user, authLoading]);

  async function generate(force: boolean) {
    if (!user) return;
    setStatus({ kind: "loading" });
    try {
      const { data, error } = await supabase.functions.invoke("generate-protocol", {
        body: { user_id: user.id, force_regenerate: force },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStatus({
        kind: "show",
        protocol: (data as any).protocol,
        cached: !!(data as any).cached,
      });
      toast.success(
        (data as any).cached ? "Loaded your protocol" : "Fresh protocol generated",
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed";
      setStatus({ kind: "error", message });
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border-soft">
        <Link to="/" aria-label="Home">
          <Wordmark size="sm" variant="text-only" />
        </Link>
        {user && (
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-16">
        {status.kind === "checking" && (
          <p className="text-muted-foreground">Loading...</p>
        )}

        {status.kind === "needs_auth" && (
          <Gate
            eyebrow="Sign in"
            title="Sign in to view your protocol."
            body="Your protocol is generated from your data. We need to know who you are first."
            cta={
              <Link to="/auth?next=/protocol" className="btn-primary text-[14px]">
                Sign in or create account
              </Link>
            }
          />
        )}

        {status.kind === "needs_onboarding" && (
          <Gate
            eyebrow="One step left"
            title="Complete your onboarding."
            body="We need your age, life stage and symptom baseline before we can write a protocol."
            cta={
              <Link to="/onboarding/age" className="btn-primary text-[14px]">
                Start onboarding
              </Link>
            }
          />
        )}

        {status.kind === "needs_dev_access" && (
          <Gate
            eyebrow="Restricted preview"
            title="Protocols are in private beta."
            body={
              <>
                The protocol engine is gated to dev users while we complete legal review.
                Your account ({status.email}) is signed in but not on the allow-list.
                <br />
                <br />
                Synthetic demo profiles are available at{" "}
                <Link to="/dev/protocol" className="text-gold-deep underline underline-offset-4">
                  /dev/protocol
                </Link>
                .
              </>
            }
            cta={null}
          />
        )}

        {status.kind === "ready" && (
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-4">
              Your protocol
            </p>
            <h1 className="font-display text-4xl md:text-6xl mb-4">Ready when you are.</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We'll read your profile, cycle data, symptom baseline and any bloods on file,
              then generate a supplement stack, lifestyle plan and GP escalation flags in
              Marc's voice.
            </p>
            <GoldRule className="text-gold mb-8 max-w-[120px]" />
            <Button className="btn-primary" onClick={() => generate(false)}>
              Generate my protocol
            </Button>
          </div>
        )}

        {status.kind === "loading" && (
          <p className="text-muted-foreground">Reading your data and generating...</p>
        )}

        {status.kind === "error" && (
          <Gate
            eyebrow="Something broke"
            title="We couldn't generate your protocol."
            body={status.message}
            cta={
              <Button className="btn-primary" onClick={() => generate(false)}>
                Try again
              </Button>
            }
          />
        )}

        {status.kind === "show" && (
          <ProtocolView
            protocol={status.protocol}
            cached={status.cached}
            onRegenerate={() => generate(true)}
          />
        )}
      </main>
    </div>
  );
}

function Gate({
  eyebrow,
  title,
  body,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  cta: React.ReactNode;
}) {
  return (
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-4">{eyebrow}</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">{title}</h1>
      <p className="text-muted-foreground leading-relaxed mb-8">{body}</p>
      <GoldRule className="text-gold mb-8 max-w-[80px]" />
      {cta}
    </div>
  );
}

function ProtocolView({
  protocol,
  cached,
  onRegenerate,
}: {
  protocol: any;
  cached: boolean;
  onRegenerate: () => void;
}) {
  return (
    <article className="card-elevated p-8 md:p-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">
          {cached ? "Your active protocol" : "Fresh protocol"} · {protocol.mode}
        </p>
        <Button
          variant="outline"
          className="border-gold text-gold-deep hover:bg-gold-soft"
          onClick={onRegenerate}
        >
          Regenerate
        </Button>
      </div>

      <h2 className="font-display text-3xl md:text-4xl mb-6">Summary</h2>
      <p className="text-foreground leading-relaxed mb-10 whitespace-pre-line">
        {protocol.summary}
      </p>

      <GoldRule className="text-gold mb-10" />

      <h3 className="font-display text-2xl mb-4">Supplement stack</h3>
      <div className="space-y-4 mb-10">
        {protocol.supplement_stack?.map((s: any) => (
          <div key={s.sku_id} className="border border-border-soft rounded-sm p-5 bg-cream">
            <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
              <h4 className="font-display text-xl">{s.name}</h4>
              <span className="text-xs uppercase tracking-[0.2em] text-gold-deep">
                {s.priority} priority · {s.duration_weeks} wk
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {s.rationale}
            </p>
            <p className="text-sm text-foreground">
              £{(s.price_monthly_pence / 100).toFixed(2)}/mo · £
              {(s.price_oneoff_pence / 100).toFixed(2)} one-off
            </p>
          </div>
        ))}
      </div>

      <h3 className="font-display text-2xl mb-4">Lifestyle</h3>
      <div className="space-y-4 mb-10">
        {protocol.lifestyle_recommendations?.map((l: any, i: number) => (
          <div key={i} className="border-l-2 border-gold pl-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-deep mb-1">
              {l.category.replace("_", " ")}
            </p>
            <h4 className="font-display text-xl mb-2">{l.headline}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{l.detail}</p>
          </div>
        ))}
      </div>

      {protocol.escalation_flags?.length > 0 && (
        <>
          <h3 className="font-display text-2xl mb-4">GP escalation</h3>
          <div className="space-y-4">
            {protocol.escalation_flags.map((f: any, i: number) => (
              <div
                key={i}
                className={`border rounded-sm p-5 ${
                  f.urgency === "urgent"
                    ? "border-rose-deep bg-rose-soft"
                    : "border-gold bg-gold-soft"
                }`}
              >
                <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
                  <h4 className="font-display text-lg">
                    {f.marker_or_symptom}: {f.value}
                  </h4>
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-deep">
                    {f.urgency} · {f.type}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-3">{f.reason}</p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  Ask your GP: {f.draft_gp_question}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {protocol.id && (
        <FeedbackWidget
          protocolId={protocol.id}
          initialRating={protocol.user_feedback ?? null}
          initialText={protocol.user_feedback_text ?? null}
        />
      )}
    </article>
  );
}
