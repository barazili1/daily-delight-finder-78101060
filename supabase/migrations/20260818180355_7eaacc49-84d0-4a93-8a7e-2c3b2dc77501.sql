CREATE OR REPLACE FUNCTION public.verify_activation_code(_code text)
RETURNS TABLE(status text, user_id text, expires_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.activation_codes%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.activation_codes c
   WHERE c.code = upper(btrim(_code)) LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::text, ''::text, NULL::timestamptz;
  ELSIF r.expires_at <= now() THEN
    RETURN QUERY SELECT 'expired'::text, coalesce(r.user_id,''), r.expires_at;
  ELSE
    RETURN QUERY SELECT 'ok'::text, coalesce(r.user_id,''), r.expires_at;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_activation_code(text) TO anon, authenticated;