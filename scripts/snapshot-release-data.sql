-- Produce a privacy-preserving fingerprint of data that the release must not lose.
-- Run as the database owner immediately before and immediately after applying
-- migrations 016-021 in the SAME isolated, sanitized Supabase clone. Save both
-- psql outputs and compare every row count and digest. This prints no row values.

BEGIN TRANSACTION READ ONLY;

DO $$
DECLARE
  table_name TEXT;
  row_count BIGINT;
  row_digest TEXT;
  protected_tables CONSTANT TEXT[] := ARRAY[
    'users',
    'students',
    'families',
    'parent_students',
    'assignments',
    'practice_steps',
    'completions',
    'daily_practice_status',
    'repertoire',
    'student_badges',
    'pets',
    'pet_creatures',
    'reschedule_requests'
  ];
BEGIN
  FOREACH table_name IN ARRAY protected_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'Required protected table public.% is missing', table_name;
    END IF;

    EXECUTE format(
      'SELECT count(*)::bigint,
              md5(COALESCE(string_agg(row_hash, '''' ORDER BY row_hash), ''''))
         FROM (
           SELECT md5(to_jsonb(snapshot_row)::text) AS row_hash
             FROM public.%I AS snapshot_row
         ) AS protected_rows',
      table_name
    ) INTO row_count, row_digest;

    RAISE NOTICE 'RELEASE_FINGERPRINT table=% count=% digest=%',
      table_name,
      row_count,
      row_digest;
  END LOOP;
END;
$$;

COMMIT;
