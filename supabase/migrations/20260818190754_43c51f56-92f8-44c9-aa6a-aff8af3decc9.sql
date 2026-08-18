DROP FUNCTION IF EXISTS public.telegram_fulfill_request(text, text, text, integer);
DROP FUNCTION IF EXISTS public.telegram_save_pending(text, text, text);
DROP FUNCTION IF EXISTS public.telegram_take_pending(text);
DROP FUNCTION IF EXISTS public.admin_notification_payload(text, uuid, text);

DROP FUNCTION IF EXISTS public.admin_list_submissions(text);
CREATE FUNCTION public.admin_list_submissions(_pass text)
RETURNS TABLE(id uuid, user_id text, telegram_id text, image1_url text, image2_url text, status text, created_at timestamptz, activation_code text, duration_minutes integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF upper(btrim(_pass)) <> 'HACKSD' THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT s.id, s.user_id, coalesce(s.telegram_id, c.telegram_id), s.image1_url, s.image2_url, s.status, s.created_at, c.code, c.duration_minutes
  FROM public.submissions s
  LEFT JOIN LATERAL (
    SELECT a.telegram_id, a.code, a.duration_minutes
    FROM public.activation_codes a
    WHERE a.user_id = s.user_id
    ORDER BY a.created_at DESC
    LIMIT 1
  ) c ON true
  ORDER BY s.created_at DESC
  LIMIT 200;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_submissions(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_submissions(text) TO anon, authenticated, service_role;