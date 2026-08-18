CREATE OR REPLACE FUNCTION public.admin_delete_submission(_pass text, _id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF upper(btrim(_pass)) <> 'HACKSD' THEN RAISE EXCEPTION 'forbidden'; END IF;
  DELETE FROM public.submissions s WHERE s.id = _id;
END; $function$;

GRANT EXECUTE ON FUNCTION public.admin_delete_submission(text, uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.request_status(_user_id text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE st text;
BEGIN
  SELECT s.status INTO st FROM public.submissions s
   WHERE s.user_id = btrim(_user_id) ORDER BY s.created_at DESC LIMIT 1;
  RETURN coalesce(st, 'none');
END; $function$;

GRANT EXECUTE ON FUNCTION public.request_status(text) TO anon, authenticated, service_role;