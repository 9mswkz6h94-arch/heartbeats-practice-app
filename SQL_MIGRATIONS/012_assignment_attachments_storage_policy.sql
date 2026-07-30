-- Fixes "new row violates row-level security policy" on every assignment
-- attachment upload (PDF or image, same error either way): the
-- assignment-attachments bucket exists and is public, but RLS is enabled on
-- storage.objects by default and no policy was ever added for this bucket,
-- so every INSERT was denied outright. AssignmentForm.js uploads to
-- `${teacherId}/<filename>`, matching the folder-scoped pattern already used
-- for study-docs and kodaly-files.

DROP POLICY IF EXISTS "Teachers upload assignment attachments" ON storage.objects;
CREATE POLICY "Teachers upload assignment attachments" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Teachers manage own assignment attachments" ON storage.objects;
CREATE POLICY "Teachers manage own assignment attachments" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'assignment-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Bucket is public, so anonymous downloads via getPublicUrl already bypass
-- RLS — no SELECT policy needed for the read path AssignmentForm.js/students
-- actually use.
