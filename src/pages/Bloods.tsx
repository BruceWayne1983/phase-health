// Manual bloods panel entry. Writes to bloods_uploads + hormone_markers
// for the authenticated user, then triggers a fresh protocol generation.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { GoldRule } from "@/components/Ornaments";
import { toast } from "sonner";

// ---------- Catalogue of common UK hormone / metabolic panel markers ----------
type MarkerDef = {
  key: string;
  name: string;
  unit: string;
  ref_low: number | null;
  ref_high: number | null;
  group: "Sex hormones" | "Thyroid" | "Iron & vitamins" | "Metabolic";
  hint?: string;
};

const MARKERS: MarkerDef[] = [
  // Sex hormones
  { key: "FSH", name: "FSH", unit: "IU/L", ref_low: 1.5, ref_high: 33, group: "Sex hormones", hint: "Rises in peri/post-meno." },
  { key: "LH", name: "LH", unit: "IU/L", ref_low: 1, ref_high: 95, group: "Sex hormones" },
  { key: "Oestradiol", name: "Oestradiol (E2)", unit: "pmol/L", ref_low: 100, ref_high: 1500, group: "Sex hormones", hint: "Cycle-phase dependent." },
  { key: "Progesterone", name: "Progesterone", unit: "nmol/L", ref_low: 0, ref_high: 80, group: "Sex hormones", hint: "Peaks luteal phase." },
  { key: "Testosterone", name: "Testosterone (total)", unit: "nmol/L", ref_low: 0.4, ref_high: 2.0, group: "Sex hormones" },
  { key: "SHBG", name: "SHBG", unit: "nmol/L", ref_low: 18, ref_high: 144, group: "Sex hormones" },
  { key: "Prolactin", name: "Prolactin", unit: "mIU/L", ref_low: 102, ref_high: 496, group: "Sex hormones" },
  { key: "AMH", name: "AMH", unit: "ng/mL", ref_low: 0.7, ref_high: 4.0, group: "Sex hormones", hint: "Ovarian reserve." },
  // Thyroid
  { key: "TSH", name: "TSH", unit: "mIU/L", ref_low: 0.4, ref_high: 4.0, group: "Thyroid" },
  { key: "FreeT4", name: "Free T4", unit: "pmol/L", ref_low: 9, ref_high: 22, group: "Thyroid" },
  { key: "FreeT3", name: "Free T3", unit: "pmol/L", ref_low: 3.1, ref_high: 6.8, group: "Thyroid" },
  // Iron & vitamins
  { key: "Ferritin", name: "Ferritin", unit: "μg/L", ref_low: 30, ref_high: 200, group: "Iron & vitamins", hint: "Below 30 = depleted." },
  { key: "VitaminD", name: "Vitamin D", unit: "nmol/L", ref_low: 50, ref_high: 150, group: "Iron & vitamins", hint: "Below 50 = insufficient." },
  { key: "B12", name: "Vitamin B12", unit: "pg/mL", ref_low: 200, ref_high: 900, group: "Iron & vitamins" },
  { key: "Folate", name: "Folate", unit: "nmol/L", ref_low: 7, ref_high: 40, group: "Iron & vitamins" },
  // Metabolic
  { key: "HbA1c", name: "HbA1c", unit: "mmol/mol", ref_low: 20, ref_high: 41, group: "Metabolic", hint: "≥42 = pre-diabetic." },
  { key: "FastingGlucose", name: "Fasting glucose", unit: "mmol/L", ref_low: 3.9, ref_high: 5.5, group: "Metabolic" },
  { key: "FastingInsulin", name: "Fasting insulin", unit: "mU/L", ref_low: 2, ref_high: 25, group: "Metabolic" },
];

const GROUP_ORDER: MarkerDef["group"][] = [
  "Sex hormones",
  "Thyroid",
  "Iron & vitamins",
  "Metabolic",
];

// ---------- Validation ----------
const submitSchema = z.object({
  upload_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  source: z
    .string()
    .trim()
    .min(2, "Where was this drawn?")
    .max(120, "Keep it short"),
  notes: z.string().trim().max(1000).optional(),
});

function statusFor(value: number, low: number | null, high: number | null): string | null {
  if (low === null && high === null) return null;
  if (low !== null && value < low) return "low";
  if (high !== null && value > high) return "high";
  return "normal";
}

// ---------- Page ----------
export default function Bloods() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [allowed, setAllowed] = useState<"checking" | "ok" | "needs_auth" | "needs_dev_access">(
    "checking",
  );
  const [today] = useState(() => new Date().toISOString().split("T")[0]);
  const [uploadDate, setUploadDate] = useState(today);
  const [source, setSource] = useState("Self-reported");
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAllowed("needs_auth");
      return;
    }
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_dev_user, is_demo")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile || (!profile.is_dev_user && !profile.is_demo)) {
        setAllowed("needs_dev_access");
      } else {
        setAllowed("ok");
      }
    })();
  }, [user, authLoading]);

  const grouped = useMemo(() => {
    const map = new Map<MarkerDef["group"], MarkerDef[]>();
    for (const g of GROUP_ORDER) map.set(g, []);
    for (const m of MARKERS) map.get(m.group)?.push(m);
    return map;
  }, []);

  const enteredCount = useMemo(
    () => Object.values(values).filter((v) => v !== "" && !Number.isNaN(Number(v))).length,
    [values],
  );

  function setValue(key: string, raw: string) {
    setValues((prev) => ({ ...prev, [key]: raw }));
  }

  async function saveAndRegenerate() {
    if (!user) return;
    const meta = submitSchema.safeParse({ upload_date: uploadDate, source, notes });
    if (!meta.success) {
      toast.error(meta.error.errors[0].message);
      return;
    }
    if (enteredCount === 0) {
      toast.error("Enter at least one marker.");
      return;
    }

    const numeric: { def: MarkerDef; value: number }[] = [];
    for (const def of MARKERS) {
      const raw = values[def.key];
      if (raw === undefined || raw === "") continue;
      const n = Number(raw);
      if (Number.isNaN(n)) {
        toast.error(`${def.name} is not a number.`);
        return;
      }
      if (n < 0) {
        toast.error(`${def.name} cannot be negative.`);
        return;
      }
      numeric.push({ def, value: n });
    }

    setSubmitting(true);
    try {
      // 1. Insert bloods_uploads
      const { data: upload, error: uploadErr } = await supabase
        .from("bloods_uploads")
        .insert({
          user_id: user.id,
          upload_date: meta.data.upload_date,
          source: meta.data.source,
          notes: meta.data.notes ?? null,
        })
        .select()
        .single();
      if (uploadErr || !upload) {
        throw new Error(uploadErr?.message ?? "Failed to create upload");
      }

      // 2. Insert markers
      const rows = numeric.map(({ def, value }) => ({
        user_id: user.id,
        bloods_upload_id: upload.id,
        name: def.key,
        value,
        unit: def.unit,
        reference_range_low: def.ref_low,
        reference_range_high: def.ref_high,
        status: statusFor(value, def.ref_low, def.ref_high),
        measured_at: meta.data.upload_date,
      }));
      const { error: markerErr } = await supabase.from("hormone_markers").insert(rows);
      if (markerErr) {
        // Clean up the orphan upload
        await supabase.from("bloods_uploads").delete().eq("id", upload.id);
        throw new Error(`Marker insert failed: ${markerErr.message}`);
      }

      toast.success(`Saved ${rows.length} marker(s). Regenerating protocol...`);
      setSubmitting(false);
      setRegenerating(true);

      // 3. Trigger fresh protocol
      const { data: gen, error: genErr } = await supabase.functions.invoke(
        "generate-protocol",
        {
          body: { user_id: user.id, force_regenerate: true },
        },
      );
      if (genErr) throw new Error(genErr.message);
      if ((gen as any)?.error) throw new Error((gen as any).error);

      toast.success("Fresh protocol ready.");
      navigate("/protocol");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
      setRegenerating(false);
    }
  }

  // --- Gate states ---
  if (allowed === "checking") {
    return <PageShell><p className="text-muted-foreground">Loading...</p></PageShell>;
  }
  if (allowed === "needs_auth") {
    return (
      <PageShell>
        <Gate
          eyebrow="Sign in"
          title="Sign in to log your bloods."
          body="We attach every panel to your account so you and the protocol engine can read trends."
          cta={
            <Link to="/auth?next=/bloods" className="btn-primary text-[14px]">
              Sign in or create account
            </Link>
          }
        />
      </PageShell>
    );
  }
  if (allowed === "needs_dev_access") {
    return (
      <PageShell>
        <Gate
          eyebrow="Restricted preview"
          title="Bloods is in private beta."
          body={
            <>
              Bloods entry runs the protocol engine, which is gated to dev users while we
              complete legal review. Synthetic demo profiles are at{" "}
              <Link to="/dev/protocol" className="text-gold-deep underline underline-offset-4">
                /dev/protocol
              </Link>
              .
            </>
          }
          cta={null}
        />
      </PageShell>
    );
  }

  const busy = submitting || regenerating;

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-4">
          Bloods
        </p>
        <h1 className="font-display text-4xl md:text-6xl text-foreground mb-4">
          Add a panel.
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
          Enter every value you have. Leave the rest blank. We store the panel, attach a
          status flag against UK reference ranges, then regenerate your protocol so the
          new bloods are reflected in your stack and escalation flags.
        </p>
        <GoldRule className="text-gold mb-10 max-w-[120px]" />

        {/* Meta */}
        <section className="grid md:grid-cols-3 gap-5 mb-10">
          <div>
            <label className="eyebrow block mb-2" htmlFor="upload_date">
              Date drawn
            </label>
            <input
              id="upload_date"
              type="date"
              value={uploadDate}
              max={today}
              onChange={(e) => setUploadDate(e.target.value)}
              className="input-clinical w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="eyebrow block mb-2" htmlFor="source">
              Source
            </label>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="GP, Medichecks, Thriva, NHS..."
              className="input-clinical w-full"
              maxLength={120}
            />
          </div>
        </section>

        {/* Marker groups */}
        {GROUP_ORDER.map((group) => (
          <section key={group} className="mb-10">
            <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
              <h2 className="font-display text-2xl">{group}</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-text-dim">
                Optional
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {(grouped.get(group) ?? []).map((m) => {
                const raw = values[m.key] ?? "";
                const numeric = raw === "" ? null : Number(raw);
                const status =
                  numeric !== null && !Number.isNaN(numeric)
                    ? statusFor(numeric, m.ref_low, m.ref_high)
                    : null;

                return (
                  <div
                    key={m.key}
                    className="border border-border-soft rounded-sm p-4 bg-cream"
                  >
                    <label
                      htmlFor={`marker-${m.key}`}
                      className="font-display text-lg block mb-1"
                    >
                      {m.name}
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Range: {m.ref_low ?? "—"} – {m.ref_high ?? "—"} {m.unit}
                      {m.hint && <span className="block italic mt-1">{m.hint}</span>}
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        id={`marker-${m.key}`}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={raw}
                        onChange={(e) => setValue(m.key, e.target.value)}
                        className="input-clinical flex-1 font-serif text-lg"
                        placeholder="—"
                      />
                      <span className="text-text-dim text-xs w-20">{m.unit}</span>
                    </div>
                    {status && (
                      <p
                        className={`text-xs mt-2 uppercase tracking-[0.2em] ${
                          status === "normal"
                            ? "text-gold-deep"
                            : "text-rose-deep"
                        }`}
                      >
                        {status}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Notes */}
        <section className="mb-10">
          <label className="eyebrow block mb-2" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Cycle day, fasting status, time of day, anything relevant."
            className="input-clinical w-full resize-none"
          />
        </section>

        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-border-soft pt-6">
          <p className="text-sm text-muted-foreground">
            {enteredCount} marker(s) entered.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-gold text-gold-deep hover:bg-gold-soft"
              onClick={() => navigate("/protocol")}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              className="btn-primary"
              onClick={saveAndRegenerate}
              disabled={busy || enteredCount === 0}
            >
              {submitting
                ? "Saving..."
                : regenerating
                  ? "Regenerating..."
                  : "Save & regenerate protocol"}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ---------- Layout helpers ----------
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border-soft">
        <Link to="/" aria-label="Home">
          <Wordmark size="sm" variant="text-only" />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/protocol" className="text-muted-foreground hover:text-foreground">
            My protocol
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-16">{children}</main>
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
