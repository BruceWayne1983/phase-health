// Anadya Protocol Engine — generate-protocol edge function
// Demo mode: only synthetic profiles flagged is_demo=true are processed.
// Calls Anthropic Claude Sonnet directly with the locked SYSTEM_PROMPT.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { SYSTEM_PROMPT } from "./system_prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------- Output schema (Zod) ----------
const ProtocolOutputSchema = z.object({
  summary: z.string().min(200).max(1400),
  supplement_stack: z
    .array(
      z.object({
        sku_id: z.string(),
        name: z.string(),
        rationale: z.string().min(100).max(600),
        priority: z.enum(["high", "medium", "low"]),
        duration_weeks: z.number().int().min(4).max(24),
        price_monthly_pence: z.number().int().positive(),
        price_oneoff_pence: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(6),
  lifestyle_recommendations: z
    .array(
      z.object({
        category: z.enum([
          "sleep",
          "nutrition",
          "movement",
          "stress",
          "cycle_awareness",
          "recovery",
        ]),
        headline: z.string().min(3).max(80),
        detail: z.string().min(100).max(700),
        evidence_ref: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
  escalation_flags: z
    .array(
      z.object({
        type: z.enum(["bloods", "symptom_pattern", "cycle_pattern", "mental_health"]),
        marker_or_symptom: z.string(),
        value: z.string(),
        reason: z.string().min(20).max(400),
        urgency: z.enum(["urgent", "routine", "informational"]),
        draft_gp_question: z.string().min(20).max(400),
      }),
    )
    .max(8),
  content_feed: z
    .array(
      z.object({
        slug: z.string(),
        reason: z.string().min(10).max(200),
      }),
    )
    .min(2)
    .max(6),
});

// ---------- Helpers ----------
function thirtyDaysAgo(): string {
  return new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
}

function determineCurrentPhase(
  lastPeriodStart: string | null,
  avgCycleLength: number | null,
): { phase: string | null; day: number | null } {
  if (!lastPeriodStart || !avgCycleLength) return { phase: null, day: null };
  const day = Math.floor(
    (Date.now() - new Date(lastPeriodStart).getTime()) / 86400000,
  ) + 1;
  if (day > avgCycleLength + 7) return { phase: "transition", day };
  if (day <= 5) return { phase: "menstrual", day };
  if (day <= avgCycleLength - 14 - 2) return { phase: "follicular", day };
  if (day <= avgCycleLength - 14 + 2) return { phase: "ovulatory", day };
  return { phase: "luteal", day };
}

async function assembleProtocolInput(supabase: any, userId: string) {
  const [profileQ, cyclesQ, logsQ, bloodsQ, markersQ, suppsQ, contentQ] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase
        .from("cycles")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false })
        .limit(6),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("log_date", thirtyDaysAgo())
        .order("log_date"),
      supabase
        .from("bloods_uploads")
        .select("*")
        .eq("user_id", userId)
        .order("upload_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("hormone_markers")
        .select("*")
        .eq("user_id", userId)
        .order("measured_at", { ascending: false }),
      supabase.from("supplements").select("*").eq("active", true),
      supabase.from("content_library").select("slug,title,modes,tags").eq("published", true),
    ]);

  const profile = profileQ.data;
  if (!profile) throw new Error("Profile not found");
  if (!profile.is_demo) throw new Error("Demo mode only: profile must be flagged is_demo");

  const cycles = cyclesQ.data ?? [];
  const logs = logsQ.data ?? [];
  const bloods = bloodsQ.data ?? null;
  const markers = markersQ.data ?? [];
  const catalogue = suppsQ.data ?? [];
  const content = contentQ.data ?? [];

  // Aggregate symptoms across last 30 days
  const symptomMap = new Map<
    string,
    { name: string; category: string; severities: number[]; days: Set<string> }
  >();
  for (const log of logs) {
    const date = log.log_date;
    const symptoms = (log.symptoms as Array<any>) ?? [];
    for (const s of symptoms) {
      const key = s.symptom_id ?? s.id ?? s.name;
      if (!key) continue;
      if (!symptomMap.has(key)) {
        symptomMap.set(key, {
          name: s.name ?? key,
          category: s.category ?? "Other",
          severities: [],
          days: new Set(),
        });
      }
      const entry = symptomMap.get(key)!;
      if (typeof s.severity === "number") entry.severities.push(s.severity);
      entry.days.add(date);
    }
  }
  const recent_symptoms = Array.from(symptomMap.entries()).map(([id, e]) => ({
    symptom_id: id,
    name: e.name,
    category: e.category,
    meno_signature: false,
    avg_severity_last_30d:
      e.severities.length > 0
        ? Math.round(
            (e.severities.reduce((a, b) => a + b, 0) / e.severities.length) * 10,
          ) / 10
        : 0,
    days_logged_last_30d: e.days.size,
    trend_vs_prior_30d: "stable" as const,
  }));

  // Cycle aggregates
  let cycle_data: any = null;
  if (profile.mode !== "post_meno" && cycles.length > 0) {
    const lengths = cycles.map((c: any) => c.length).filter(Boolean);
    const periods = cycles.map((c: any) => c.period_length).filter(Boolean);
    const avg_cycle_length = lengths.length
      ? Math.round(lengths.reduce((a: number, b: number) => a + b, 0) / lengths.length)
      : null;
    const avg_period_length = periods.length
      ? Math.round(periods.reduce((a: number, b: number) => a + b, 0) / periods.length)
      : null;
    const last_period_start = cycles[0]?.start_date ?? null;
    const std =
      lengths.length > 1
        ? Math.sqrt(
            lengths.reduce(
              (a: number, b: number) =>
                a + Math.pow(b - (avg_cycle_length ?? 0), 2),
              0,
            ) / lengths.length,
          )
        : 0;
    const regularity =
      profile.on_hormonal_contraception
        ? "on_contraception"
        : std > 4
          ? "irregular"
          : "regular";
    const phase = determineCurrentPhase(last_period_start, avg_cycle_length);
    cycle_data = {
      avg_cycle_length,
      avg_period_length,
      cycle_regularity: regularity,
      last_period_start,
      current_phase: phase.phase,
      current_cycle_day: phase.day,
      last_3_cycles: cycles.slice(0, 3).map((c: any) => ({
        start: c.start_date,
        length: c.length,
      })),
    };
  }

  // Bloods
  let latest_bloods: any = null;
  if (bloods) {
    const bloodMarkers = markers.filter((m: any) => m.bloods_upload_id === bloods.id);
    latest_bloods = {
      upload_date: bloods.upload_date,
      source: bloods.source,
      markers: bloodMarkers.map((m: any) => ({
        name: m.name,
        value: Number(m.value),
        unit: m.unit,
        reference_range_low: Number(m.reference_range_low),
        reference_range_high: Number(m.reference_range_high),
        status: m.status,
      })),
    };
  }

  return {
    user_id: userId,
    generated_at: new Date().toISOString(),
    profile: {
      age: profile.age,
      mode: profile.mode,
      mode_set_manually: profile.mode_set_manually,
      on_hormonal_contraception: profile.on_hormonal_contraception,
      on_hrt: profile.on_hrt,
      hrt_details: profile.hrt_details ?? undefined,
      goals: profile.goals ?? [],
      freetext_concerns: profile.freetext_concerns ?? undefined,
    },
    cycle_data,
    recent_symptoms,
    latest_bloods,
    supplement_catalogue: catalogue.map((s: any) => ({
      sku_id: s.sku_id,
      name: s.name,
      line: s.line,
      ingredients: s.ingredients,
      mechanism_of_action: s.mechanism_of_action,
      indicated_for: s.indicated_for,
      contraindications: s.contraindications,
      price_oneoff_pence: s.price_oneoff_pence,
      price_subscription_pence: s.price_subscription_pence,
    })),
    content_slugs: content.map((c: any) => c.slug),
  };
}

// ---------- Anthropic call ----------
async function callClaude(input: unknown): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(input) }],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic API error [${resp.status}]: ${t}`);
  }
  const data = await resp.json();
  const block = data.content?.[0];
  if (!block || block.type !== "text") throw new Error("Unexpected Claude response shape");
  return block.text as string;
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

// ---------- Request schema ----------
const RequestSchema = z.object({
  user_id: z.string().uuid(),
  force_regenerate: z.boolean().optional().default(false),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { user_id, force_regenerate } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Cache check (14 days)
    const { data: existing } = await supabase
      .from("protocols")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && !force_regenerate) {
      const ageHours =
        (Date.now() - new Date(existing.generated_at).getTime()) / 3600000;
      if (ageHours < 336) {
        return new Response(
          JSON.stringify({ cached: true, protocol: existing }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const input = await assembleProtocolInput(supabase, user_id);
    const raw = await callClaude(input);
    const cleaned = stripFences(raw);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed. Raw:", raw.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Model returned invalid JSON", raw_preview: raw.slice(0, 800) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const validated = ProtocolOutputSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error("Schema validation failed:", validated.error.flatten());
      return new Response(
        JSON.stringify({
          error: "Model output failed schema validation",
          details: validated.error.flatten(),
          raw: parsedJson,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mark previous active inactive
    await supabase
      .from("protocols")
      .update({ is_active: false })
      .eq("user_id", user_id)
      .eq("is_active", true);

    const { data: saved, error: insertErr } = await supabase
      .from("protocols")
      .insert({
        user_id,
        generated_at: new Date().toISOString(),
        mode: input.profile.mode,
        inputs: input,
        summary: validated.data.summary,
        supplement_stack: validated.data.supplement_stack,
        lifestyle_recommendations: validated.data.lifestyle_recommendations,
        escalation_flags: validated.data.escalation_flags,
        content_feed: validated.data.content_feed,
        is_active: true,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: "Failed to persist protocol", details: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ cached: false, protocol: saved }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-protocol error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
