GRANT EXECUTE ON FUNCTION public.submit_proof(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_submissions(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_submission_status(text, uuid, text) TO anon, authenticated;