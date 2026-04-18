# Anadya AI Protocol Engine — Spec (v1)

> Source of truth for the `generate-protocol` Supabase Edge Function.
> Locked system prompt lives at `supabase/functions/generate-protocol/system_prompt.ts`.
> Output validation lives in the same edge function (Zod schema).
> Demo mode only: profiles must have `is_demo = true` to be processed.
> Model: `claude-sonnet-4-5` (latest GA Sonnet, equivalent of spec's "sonnet 4-6" naming).

See the original brief at the top of this document for the full spec, regulatory posture,
input/output schemas, worked example, safety audit checklist, iteration plan, and cost model.

## Implementation status (v1)

- [x] DB schema: profiles, cycles, daily_logs, bloods_uploads, hormone_markers, supplements, content_library, protocols
- [x] RLS: per-user own-row access; catalogue + content readable to all
- [x] Supplements catalogue seeded (Foundation, Balance, Rest, Glow, 4 cycle-sync packs)
- [x] Content library seeded (10 articles across modes)
- [x] Edge function `generate-protocol` with Anthropic Claude Sonnet
- [x] Zod validation of model output
- [x] 14-day cache with `force_regenerate` override
- [x] Demo mode hard gate (only `is_demo = true` profiles)
- [ ] Healthtech lawyer review (BLOCKING before live users)
- [ ] MHRA medical device classification opinion (BLOCKING)
- [ ] ASA/CAP language audit (BLOCKING)
- [ ] Red team adversarial prompt testing
- [ ] Professional indemnity insurance for AI-generated health guidance
- [ ] User consent flow on protocol view

## Voice rules (enforced in prompt)

- British English, never American
- No em dashes anywhere
- Direct, clinical, no fluff or hedging
- Never diagnose, never prescribe, never recommend HRT
- Every recommendation must reference the user's actual data
- Only supplements from the catalogue

## How to invoke

Call from the client (only against demo profiles):

\`\`\`ts
const { data, error } = await supabase.functions.invoke("generate-protocol", {
  body: { user_id: "<demo-profile-user-id>", force_regenerate: true },
});
\`\`\`

Returns `{ cached: boolean, protocol: { ... } }` or `{ error, details? }`.
