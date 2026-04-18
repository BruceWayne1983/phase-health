CREATE TABLE public.redteam_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  run_at timestamptz NOT NULL DEFAULT now(),
  prompt_version text NOT NULL DEFAULT 'unlabelled',
  attack_id text NOT NULL,
  attack_name text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL,
  reason text,
  raw_snippet text,
  target_user_id uuid
);

ALTER TABLE public.redteam_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redteam_runs_insert_own"
ON public.redteam_runs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "redteam_runs_select_own"
ON public.redteam_runs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "redteam_runs_select_admin"
ON public.redteam_runs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_redteam_runs_version_run_at
ON public.redteam_runs (prompt_version, run_at DESC);

CREATE INDEX idx_redteam_runs_run_at
ON public.redteam_runs (run_at DESC);