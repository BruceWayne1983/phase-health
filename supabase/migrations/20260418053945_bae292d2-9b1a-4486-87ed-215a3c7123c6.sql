-- Timestamp helper (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============== PROFILES ==============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  age INTEGER,
  mode TEXT CHECK (mode IN ('cycle','transition','post_meno')),
  mode_set_manually BOOLEAN NOT NULL DEFAULT false,
  on_hormonal_contraception BOOLEAN NOT NULL DEFAULT false,
  on_hrt BOOLEAN NOT NULL DEFAULT false,
  hrt_details JSONB,
  goals TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  freetext_concerns TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== CYCLES ==============
CREATE TABLE public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  length INTEGER,
  period_length INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cycles_user_date ON public.cycles(user_id, start_date DESC);
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cycles_select_own" ON public.cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cycles_insert_own" ON public.cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycles_update_own" ON public.cycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cycles_delete_own" ON public.cycles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cycles_updated BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== DAILY LOGS ==============
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  symptoms JSONB NOT NULL DEFAULT '[]'::JSONB,
  mood INTEGER CHECK (mood BETWEEN 0 AND 10),
  energy INTEGER CHECK (energy BETWEEN 0 AND 10),
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 0 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_logs_select_own" ON public.daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_logs_insert_own" ON public.daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_logs_update_own" ON public.daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "daily_logs_delete_own" ON public.daily_logs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_daily_logs_updated BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== BLOODS UPLOADS ==============
CREATE TABLE public.bloods_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  upload_date DATE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('medichecks','nhs','private_clinic','other')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bloods_uploads_user_date ON public.bloods_uploads(user_id, upload_date DESC);
ALTER TABLE public.bloods_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bloods_select_own" ON public.bloods_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloods_insert_own" ON public.bloods_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloods_update_own" ON public.bloods_uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloods_delete_own" ON public.bloods_uploads FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_bloods_updated BEFORE UPDATE ON public.bloods_uploads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== HORMONE MARKERS ==============
CREATE TABLE public.hormone_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bloods_upload_id UUID REFERENCES public.bloods_uploads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  reference_range_low NUMERIC,
  reference_range_high NUMERIC,
  status TEXT CHECK (status IN ('below','within','above')),
  measured_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_markers_user_name_date ON public.hormone_markers(user_id, name, measured_at DESC);
ALTER TABLE public.hormone_markers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "markers_select_own" ON public.hormone_markers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "markers_insert_own" ON public.hormone_markers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "markers_update_own" ON public.hormone_markers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "markers_delete_own" ON public.hormone_markers FOR DELETE USING (auth.uid() = user_id);

-- ============== SUPPLEMENTS CATALOGUE ==============
CREATE TABLE public.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  line TEXT NOT NULL CHECK (line IN ('cycle_sync','meno','foundation')),
  ingredients JSONB NOT NULL DEFAULT '[]'::JSONB,
  mechanism_of_action TEXT,
  indicated_for TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  contraindications TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  price_oneoff_pence INTEGER NOT NULL,
  price_subscription_pence INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplements_read_all" ON public.supplements FOR SELECT TO authenticated, anon USING (active = true);
CREATE TRIGGER trg_supplements_updated BEFORE UPDATE ON public.supplements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== CONTENT LIBRARY ==============
CREATE TABLE public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  modes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_read_published" ON public.content_library FOR SELECT TO authenticated, anon USING (published = true);
CREATE TRIGGER trg_content_updated BEFORE UPDATE ON public.content_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== PROTOCOLS ==============
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mode TEXT CHECK (mode IN ('cycle','transition','post_meno')),
  inputs JSONB NOT NULL,
  summary TEXT NOT NULL,
  supplement_stack JSONB NOT NULL,
  lifestyle_recommendations JSONB NOT NULL,
  escalation_flags JSONB NOT NULL,
  content_feed JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
  user_feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_protocols_user_active ON public.protocols(user_id, is_active, generated_at DESC);
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "protocols_select_own" ON public.protocols FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "protocols_insert_own" ON public.protocols FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "protocols_update_own" ON public.protocols FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "protocols_delete_own" ON public.protocols FOR DELETE USING (auth.uid() = user_id);