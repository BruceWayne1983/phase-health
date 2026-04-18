// Admin-only feedback dashboard.
// Aggregates protocols.user_feedback ratings, surfaces low-rated outputs
// (≤2) so prompt iteration has a tight loop.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { GoldRule } from "@/components/Ornaments";

type Row = {
  id: string;
  user_id: string;
  mode: string | null;
  generated_at: string;
  is_active: boolean;
  user_feedback: number | null;
  user_feedback_text: string | null;
  summary: string;
  inputs: any;
};

type Gate =
  | { kind: "checking" }
  | { kind: "needs_auth" }
  | { kind: "needs_admin" }
  | { kind: "ok" };

export default function DevFeedback() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [gate, setGate] = useState<Gate>({ kind: "checking" });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "rated" | "low">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Gate: must be admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setGate({ kind: "needs_auth" });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error || !data) {
        setGate({ kind: "needs_admin" });
        return;
      }
      setGate({ kind: "ok" });
    })();
  }, [user, authLoading]);

  // Load all protocols once admin
  useEffect(() => {
    if (gate.kind !== "ok") return;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("protocols")
        .select(
          "id, user_id, mode, generated_at, is_active, user_feedback, user_feedback_text, summary, inputs",
        )
        .order("generated_at", { ascending: false })
        .limit(500);
      setLoading(false);
      if (error) return;
      setRows((data ?? []) as Row[]);
    })();
  }, [gate.kind]);

  const stats = useMemo(() => {
    const rated = rows.filter((r) => r.user_feedback != null);
    const total = rows.length;
    const ratedCount = rated.length;
    const avg =
      ratedCount === 0
        ? 0
        : rated.reduce((sum, r) => sum + (r.user_feedback ?? 0), 0) / ratedCount;

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: rated.filter((r) => r.user_feedback === star).length,
    }));

    const byMode = new Map<string, { rated: number; sum: number }>();
    for (const r of rated) {
      const m = r.mode ?? "unknown";
      const cur = byMode.get(m) ?? { rated: 0, sum: 0 };
      cur.rated += 1;
      cur.sum += r.user_feedback ?? 0;
      byMode.set(m, cur);
    }
    const modeStats = Array.from(byMode.entries())
      .map(([mode, { rated, sum }]) => ({
        mode,
        count: rated,
        avg: rated === 0 ? 0 : sum / rated,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      ratedCount,
      responseRate: total === 0 ? 0 : (ratedCount / total) * 100,
      avg,
      distribution,
      modeStats,
      lowCount: rated.filter((r) => (r.user_feedback ?? 0) <= 2).length,
    };
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "rated") return rows.filter((r) => r.user_feedback != null);
    return rows
      .filter((r) => r.user_feedback != null && r.user_feedback <= 2)
      .sort((a, b) => (a.user_feedback ?? 0) - (b.user_feedback ?? 0));
  }, [rows, filter]);

  // --- Gate screens ---
  if (gate.kind === "checking") {
    return <PageShell><p className="text-muted-foreground">Loading...</p></PageShell>;
  }
  if (gate.kind === "needs_auth") {
    return (
      <PageShell>
        <Gate
          eyebrow="Sign in"
          title="Sign in required."
          body="The feedback dashboard is restricted to admins."
          cta={
            <Link to="/auth?next=/dev/feedback" className="btn-primary text-[14px]">
              Sign in
            </Link>
          }
        />
      </PageShell>
    );
  }
  if (gate.kind === "needs_admin") {
    return (
      <PageShell>
        <Gate
          eyebrow="403"
          title="Admins only."
          body="Your account is signed in but does not hold the admin role. Ask an existing admin to grant access."
          cta={null}
        />
      </PageShell>
    );
  }

  return (
    <PageShell onSignOut={async () => { await signOut(); navigate("/"); }}>
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-4">
          Engine telemetry
        </p>
        <h1 className="font-display text-4xl md:text-6xl mb-4">Feedback dashboard.</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Every protocol is rated 1-5 with optional notes. Use the low-rated filter
          to read failure modes verbatim and feed them back into the system prompt.
        </p>
        <GoldRule className="text-gold mt-6 max-w-[120px]" />
      </header>

      {loading && <p className="text-muted-foreground">Loading protocols...</p>}

      {!loading && (
        <>
          {/* Top-line stats */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Stat label="Protocols" value={String(stats.total)} />
            <Stat
              label="Response rate"
              value={`${stats.responseRate.toFixed(0)}%`}
              hint={`${stats.ratedCount} of ${stats.total} rated`}
            />
            <Stat
              label="Average rating"
              value={stats.avg === 0 ? "—" : stats.avg.toFixed(2)}
              hint="Out of 5"
            />
            <Stat
              label="Low (≤2)"
              value={String(stats.lowCount)}
              hint="Need prompt review"
              tone={stats.lowCount > 0 ? "warn" : "ok"}
            />
          </section>

          {/* Distribution */}
          <section className="mb-12">
            <h2 className="font-display text-2xl mb-4">Rating distribution</h2>
            <div className="space-y-2 max-w-xl">
              {stats.distribution
                .slice()
                .reverse()
                .map(({ star, count }) => {
                  const max = Math.max(...stats.distribution.map((d) => d.count), 1);
                  const pct = (count / max) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-6 text-sm text-gold-deep font-display">
                        {star}★
                      </span>
                      <div className="flex-1 h-3 bg-cream border border-border-soft rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-soft to-gold-soft"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* By mode */}
          <section className="mb-12">
            <h2 className="font-display text-2xl mb-4">By mode</h2>
            {stats.modeStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rated protocols yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stats.modeStats.map((m) => (
                  <div
                    key={m.mode}
                    className="border border-border-soft rounded-sm p-4 bg-cream"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-gold-deep mb-1">
                      {m.mode}
                    </p>
                    <p className="font-display text-2xl">{m.avg.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{m.count} ratings</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Filter + table */}
          <section>
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-display text-2xl">Feedback feed</h2>
              <div className="flex gap-2 text-sm">
                {(["all", "rated", "low"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`px-3 py-1 rounded-sm border transition ${
                      filter === k
                        ? "border-gold bg-gold-soft text-gold-deep"
                        : "border-border-soft text-muted-foreground hover:border-gold"
                    }`}
                  >
                    {k === "all"
                      ? "All"
                      : k === "rated"
                        ? "Rated only"
                        : "Low (≤2)"}
                  </button>
                ))}
              </div>
            </div>

            {visibleRows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center border border-border-soft rounded-sm">
                No protocols match this filter.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleRows.map((r) => {
                  const isOpen = expanded === r.id;
                  const rating = r.user_feedback;
                  const tone =
                    rating == null
                      ? "neutral"
                      : rating <= 2
                        ? "low"
                        : rating >= 4
                          ? "high"
                          : "mid";
                  return (
                    <div
                      key={r.id}
                      className={`border rounded-sm bg-cream ${
                        tone === "low"
                          ? "border-rose-deep"
                          : "border-border-soft"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <span
                            className={`font-display text-2xl w-10 text-center ${
                              tone === "low"
                                ? "text-rose-deep"
                                : tone === "high"
                                  ? "text-gold-deep"
                                  : "text-foreground"
                            }`}
                          >
                            {rating ?? "—"}
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">
                              {r.mode ?? "no mode"} ·{" "}
                              {new Date(r.generated_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                              {r.is_active && " · active"}
                            </p>
                            <p className="text-sm text-foreground line-clamp-1 max-w-xl">
                              {r.user_feedback_text || r.summary.slice(0, 120)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-text-dim">
                          {isOpen ? "Hide" : "Open"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-border-soft p-4 space-y-4">
                          <DetailBlock label="User ID">
                            <code className="text-xs">{r.user_id}</code>
                          </DetailBlock>
                          <DetailBlock label="User feedback text">
                            {r.user_feedback_text ? (
                              <p className="whitespace-pre-line text-sm">
                                {r.user_feedback_text}
                              </p>
                            ) : (
                              <p className="text-sm text-text-dim italic">
                                No notes provided.
                              </p>
                            )}
                          </DetailBlock>
                          <DetailBlock label="Protocol summary">
                            <p className="whitespace-pre-line text-sm">{r.summary}</p>
                          </DetailBlock>
                          <DetailBlock label="Inputs (debug)">
                            <pre className="text-[11px] bg-background border border-border-soft p-3 rounded-sm overflow-auto max-h-64">
                              {JSON.stringify(r.inputs, null, 2)}
                            </pre>
                          </DetailBlock>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}

// ---------- Layout ----------
function PageShell({
  children,
  onSignOut,
}: {
  children: React.ReactNode;
  onSignOut?: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border-soft">
        <Link to="/" aria-label="Home">
          <Wordmark size="sm" variant="text-only" />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/dev/protocol" className="text-muted-foreground hover:text-foreground">
            /dev/protocol
          </Link>
          <Link
            to="/dev/protocol/redteam"
            className="text-muted-foreground hover:text-foreground"
          >
            /dev/protocol/redteam
          </Link>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16">{children}</main>
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

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div
      className={`border rounded-sm p-5 bg-cream ${
        tone === "warn" ? "border-rose-deep" : "border-border-soft"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-gold-deep mb-2">{label}</p>
      <p className="font-display text-3xl mb-1">{value}</p>
      {hint && <p className="text-xs text-text-dim">{hint}</p>}
    </div>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      {children}
    </div>
  );
}
