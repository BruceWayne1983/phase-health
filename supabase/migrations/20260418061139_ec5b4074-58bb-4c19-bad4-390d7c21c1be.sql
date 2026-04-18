-- Add dev user flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_dev_user boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_dev_user_idx
  ON public.profiles (is_dev_user)
  WHERE is_dev_user = true;

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, is_demo, is_dev_user)
  VALUES (NEW.id, false, false)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers for tables we'll be writing to from the client
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS cycles_set_updated_at ON public.cycles;
CREATE TRIGGER cycles_set_updated_at
  BEFORE UPDATE ON public.cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS daily_logs_set_updated_at ON public.daily_logs;
CREATE TRIGGER daily_logs_set_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();