-- Keep existing assignment rows and stored files in place. The practice-
-- attachment function checks assignment visibility before serving any bytes.
BEGIN;
SET LOCAL lock_timeout='4s';
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM storage.buckets WHERE id='assignment-attachments') THEN
    RAISE EXCEPTION 'Missing practice file bucket'; END IF;
END $$;
UPDATE storage.buckets SET public=false WHERE id='assignment-attachments' AND public;
DROP POLICY IF EXISTS "Teachers upload assignment attachments" ON storage.objects;
CREATE POLICY "Teachers upload assignment attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='assignment-attachments' AND hb_private.is_teacher()
    AND auth.uid()::text=(storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Teachers manage own assignment attachments" ON storage.objects;
CREATE POLICY "Teachers manage own assignment attachments" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='assignment-attachments' AND hb_private.is_teacher()
    AND auth.uid()::text=(storage.foldername(name))[1]);
COMMIT;
