
DROP POLICY IF EXISTS "proofs read" ON storage.objects;
CREATE POLICY "proofs read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'proofs');
DROP POLICY IF EXISTS "proofs upload" ON storage.objects;
CREATE POLICY "proofs upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'proofs');
