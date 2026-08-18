CREATE TABLE IF NOT EXISTS public.pending_starts (
  telegram_id text PRIMARY KEY,
  user_id text,
  first_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pending_starts TO service_role;
ALTER TABLE public.pending_starts ENABLE ROW LEVEL SECURITY;