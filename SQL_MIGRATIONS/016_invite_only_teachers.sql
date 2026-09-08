-- Teacher accounts are provisioned only by a trusted administrator/service-role
-- workflow. Public clients may create only their own non-teacher profile.

BEGIN;

DROP POLICY IF EXISTS "Allow anonymous signup" ON public.users;
DROP POLICY IF EXISTS "users create own non-teacher profile" ON public.users;

CREATE POLICY "users create own non-teacher profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND type IN ('student', 'parent')
);

COMMENT ON POLICY "users create own non-teacher profile" ON public.users IS
  'Teacher profiles must be created by the service role or another trusted administrative workflow.';

NOTIFY pgrst, 'reload schema';
COMMIT;
