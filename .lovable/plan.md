
## Plan: Persist red-team runs + history dashboard

### 1. Migration — new `redteam_runs` table

Columns:
- `id` uuid PK
- `user_id` uuid (the dev/admin who ran it — for RLS)
- `run_at` timestamptz default now()
- `prompt_version` text — manual label the user types in (e.g. "v1.2-hrt-refusal"), defaults to "unlabelled"
- `attack_id` text — e.g. `diagnosis`, `hrt`, `jailbreak`
- `attack_name` text
- `severity` text
- `status` text — `pass | fail | error`
- `reason` text nullable — the detector explanation when fail/error
- `raw_snippet` text nullable — first 280 chars of the protocol JSON for spot-checking
- `target_user_id` uuid — which demo profile was attacked (Mara by default)

RLS:
- Insert: any authenticated user can insert their own (`auth.uid() = user_id`).
- Select: own rows OR admin role (matches existing `protocols` pattern).

Index on `(prompt_version, run_at desc)` for the history view.

### 2. Update `src/pages/ProtocolRedTeam.tsx`

- Add a small **prompt version label** input above the "Run all attacks" button (text field, persists in localStorage so the user doesn't retype).
- After each attack finishes (pass/fail/error), insert a row into `redteam_runs` with the user's auth id, the label, and the result. Insert is fire-and-forget but toast on error.
- "Run all" continues to iterate; persistence is per-attack so partial runs are still captured.
- Add a "View history →" link in the page header that routes to `/dev/protocol/redteam/history`.

### 3. New page `src/pages/ProtocolRedTeamHistory.tsx`

Layout in keeping with existing dev pages (Wordmark header, ivory/rose tokens, `card-elevated`, gold rules):
- **Top: pass-rate-over-time** — group rows by `prompt_version`, show: version label, total runs, pass/fail/error counts, pass rate %, last-run timestamp. Sorted by latest run desc. Acts as the regression tracker.
- **Below: recent runs table** — last 50 rows, columns: timestamp, prompt version, attack, status badge, reason (truncated, expandable on click).
- Filter chips: All / Pass / Fail / Error, plus a prompt-version dropdown (populated from distinct values).
- Empty state with copy explaining the user needs to run the battery first.

Data fetched once on mount via `supabase.from('redteam_runs').select(...)` ordered by `run_at desc`, capped at 500 rows for the in-memory aggregation. No realtime — refresh button instead.

### 4. Wire route in `src/App.tsx`

Add `<Route path="/dev/protocol/redteam/history" element={<ProtocolRedTeamHistory />} />`.

### Files touched
- New migration (creates table + RLS + index)
- `src/pages/ProtocolRedTeam.tsx` — add label input + insert call + history link
- `src/pages/ProtocolRedTeamHistory.tsx` — new
- `src/App.tsx` — add route

### Out of scope
- No automatic capture of the system prompt text — the `prompt_version` label is manual. Cheap, reliable, no extra storage.
- No charts/graphs library — just a numeric pass-rate column. Can add Recharts later if asked.
- No edits to the edge function or to existing red-team detectors.
