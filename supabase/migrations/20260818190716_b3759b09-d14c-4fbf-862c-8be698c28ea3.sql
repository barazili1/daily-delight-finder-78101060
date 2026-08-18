CREATE OR REPLACE FUNCTION public.telegram_fulfill_request(_user_id text, _telegram_id text, _code text, _duration_minutes integer)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF btrim(coalesce(_user_id, '')) = '' OR btrim(coalesce(_telegram_id, '')) = '' OR btrim(coalesce(_code, '')) = '' THEN
    RAISE EXCEPTION 'missing required value';
  END IF;

  INSERT INTO public.activation_codes(code, telegram_id, user_id, duration_minutes, expires_at)
  VALUES (upper(btrim(_code)), btrim(_telegram_id), btrim(_user_id), greatest(1, least(_duration_minutes, 1440)), now() + interval '365 days');

  UPDATE public.submissions
  SET telegram_id = btrim(_telegram_id)
  WHERE user_id = btrim(_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.telegram_save_pending(_telegram_id text, _user_id text, _first_name text)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pending_starts(telegram_id, user_id, first_name)
  VALUES (btrim(_telegram_id), nullif(btrim(coalesce(_user_id, '')), ''), nullif(btrim(coalesce(_first_name, '')), ''))
  ON CONFLICT (telegram_id) DO UPDATE
  SET user_id = excluded.user_id, first_name = excluded.first_name, created_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.telegram_take_pending(_telegram_id text)
RETURNS TABLE(user_id text, first_name text)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH taken AS (
    DELETE FROM public.pending_starts p
    WHERE p.telegram_id = btrim(_telegram_id)
    RETURNING p.user_id, p.first_name
  )
  SELECT taken.user_id, taken.first_name FROM taken LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_notification_payload(_pass text, _submission_id uuid, _user_id text)
RETURNS TABLE(telegram_id text, code text, duration_minutes integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF upper(btrim(_pass)) <> 'HACKSD' THEN RAISE EXCEPTION 'forbidden'; END IF;

  RETURN QUERY
  SELECT coalesce(s.telegram_id, c.telegram_id), c.code, c.duration_minutes
  FROM public.submissions s
  LEFT JOIN LATERAL (
    SELECT a.telegram_id, a.code, a.duration_minutes
    FROM public.activation_codes a
    WHERE a.user_id = s.user_id
    ORDER BY a.created_at DESC
    LIMIT 1
  ) c ON true
  WHERE s.id = _submission_id AND s.user_id = btrim(_user_id)
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.telegram_fulfill_request(text, text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.telegram_save_pending(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.telegram_take_pending(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_notification_payload(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.telegram_fulfill_request(text, text, text, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.telegram_save_pending(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.telegram_take_pending(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_notification_payload(text, uuid, text) TO anon, authenticated, service_role;