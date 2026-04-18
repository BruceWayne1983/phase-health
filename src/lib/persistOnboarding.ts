// Persist the local onboarding state into Supabase for the authenticated user.
// Writes profiles, cycles (if cycling), and a single seed daily_logs row carrying
// the symptom baseline so the protocol engine has something to read on first run.

import { supabase } from "@/integrations/supabase/client";
import { SYMPTOMS } from "@/data/symptoms";
import {
  AppMode,
  OnboardingState,
  calculateAge,
  detectMode,
} from "@/lib/onboarding";

function symptomCategory(id: string): string {
  return SYMPTOMS.find((s) => s.id === id)?.category ?? "Other";
}
function symptomName(id: string): string {
  return SYMPTOMS.find((s) => s.id === id)?.name ?? id;
}

export async function persistOnboarding(
  userId: string,
  state: OnboardingState,
): Promise<{ mode: AppMode }> {
  const age = calculateAge(state.dob);
  const mode = state.detectedMode ?? detectMode(state);

  // 1. Upsert profile
  // Profile row is auto-created on signup by handle_new_user trigger,
  // so we update by user_id.
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      age: age ?? null,
      mode,
      mode_set_manually: false,
      on_hrt: state.lifeStage === "on_hrt",
      on_hormonal_contraception: state.lifeStage === "on_contraception",
      goals: state.goals ?? [],
      freetext_concerns: state.notes ?? null,
    })
    .eq("user_id", userId);
  if (profileErr) throw new Error(`Profile update failed: ${profileErr.message}`);

  // 2. Cycle row (only if user gave us a last period date)
  if (state.lastPeriodStart) {
    // Replace existing cycle starting on the same date instead of duplicating
    await supabase
      .from("cycles")
      .delete()
      .eq("user_id", userId)
      .eq("start_date", state.lastPeriodStart);

    const { error: cycleErr } = await supabase.from("cycles").insert({
      user_id: userId,
      start_date: state.lastPeriodStart,
      length: state.cycleLength ?? null,
      period_length: state.periodLength ?? null,
      notes: "Onboarding seed",
    });
    if (cycleErr) throw new Error(`Cycle insert failed: ${cycleErr.message}`);
  }

  // 3. Seed daily_logs row carrying the symptom baseline
  if ((state.symptoms ?? []).length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const symptomPayload = state.symptoms.map((s) => ({
      symptom_id: s.id,
      name: symptomName(s.id),
      category: symptomCategory(s.id),
      severity: s.severity,
    }));

    // Upsert by (user_id, log_date) — delete existing for today first since
    // there's no unique constraint and we want a clean baseline row.
    await supabase
      .from("daily_logs")
      .delete()
      .eq("user_id", userId)
      .eq("log_date", today);

    const { error: logErr } = await supabase.from("daily_logs").insert({
      user_id: userId,
      log_date: today,
      symptoms: symptomPayload,
      notes: "Onboarding baseline",
    });
    if (logErr) throw new Error(`Daily log insert failed: ${logErr.message}`);
  }

  return { mode };
}
