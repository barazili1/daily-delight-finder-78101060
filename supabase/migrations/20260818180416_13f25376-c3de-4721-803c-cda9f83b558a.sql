
ALTER TABLE public.activation_codes ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 30;

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  telegram_id text,
  image1_url text NOT NULL,
  image2_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS submissions_user_idx ON public.submissions(user_id);

CREATE OR REPLACE FUNCTION public.submit_proof(_user_id text, _img1 text, _img2 text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO public.submissions(user_id, image1_url, image2_url)
  VALUES (btrim(_user_id), _img1, _img2)
  RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.verify_activation_code(_code text)
RETURNS TABLE(status text, user_id text, expires_at timestamptz)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.activation_codes%ROWTYPE; s public.submissions%ROWTYPE; new_exp timestamptz;
BEGIN
  SELECT * INTO r FROM public.activation_codes c WHERE c.code = upper(btrim(_code)) LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::text, ''::text, NULL::timestamptz; RETURN;
  END IF;

  SELECT * INTO s FROM public.submissions x
   WHERE x.user_id = coalesce(r.user_id,'') ORDER BY x.created_at DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'pending'::text, coalesce(r.user_id,''), NULL::timestamptz; RETURN;
  ELSIF s.status = 'rejected' THEN
    RETURN QUERY SELECT 'rejected'::text, coalesce(r.user_id,''), NULL::timestamptz; RETURN;
  ELSIF s.status <> 'approved' THEN
    RETURN QUERY SELECT 'pending'::text, coalesce(r.user_id,''), NULL::timestamptz; RETURN;
  END IF;

  IF r.used_at IS NULL THEN
    new_exp := now() + make_interval(mins => r.duration_minutes);
    UPDATE public.activation_codes SET used_at = now(), expires_at = new_exp WHERE id = r.id;
    RETURN QUERY SELECT 'ok'::text, coalesce(r.user_id,''), new_exp; RETURN;
  ELSIF r.expires_at <= now() THEN
    RETURN QUERY SELECT 'expired'::text, coalesce(r.user_id,''), r.expires_at; RETURN;
  END IF;

  RETURN QUERY SELECT 'ok'::text, coalesce(r.user_id,''), r.expires_at;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_submissions(_pass text)
RETURNS TABLE(id uuid, user_id text, telegram_id text, image1_url text, image2_url text, status text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF upper(btrim(_pass)) <> 'HACKSD' THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT s.id, s.user_id, s.telegram_id, s.image1_url, s.image2_url, s.status, s.created_at
    FROM public.submissions s ORDER BY s.created_at DESC LIMIT 200;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_submission_status(_pass text, _id uuid, _status text)
RETURNS TABLE(telegram_id text) LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF upper(btrim(_pass)) <> 'HACKSD' THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('approved','rejected','pending') THEN RAISE EXCEPTION 'bad status'; END IF;
  RETURN QUERY UPDATE public.submissions s SET status = _status WHERE s.id = _id RETURNING s.telegram_id;
END; $$;
