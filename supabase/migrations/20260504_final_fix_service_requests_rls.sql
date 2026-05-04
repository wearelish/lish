-- FINAL FIX: Service requests RLS policies
-- This migration is the single source of truth for service_requests INSERT policy.
-- Run this in Supabase SQL Editor if requests are still failing.

-- Step 1: Drop every possible INSERT policy variant (all names we've ever used)
DROP POLICY IF EXISTS "Client creates own request"              ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users create requests"     ON public.service_requests;
DROP POLICY IF EXISTS "authenticated_users_create_requests"    ON public.service_requests;
DROP POLICY IF EXISTS "client creates"                         ON public.service_requests;
DROP POLICY IF EXISTS "insert_service_requests"                ON public.service_requests;

-- Step 2: Create one clean, simple INSERT policy
-- Any authenticated user can insert a row where client_id = their own user ID.
-- No role check — role is enforced at the dashboard routing level.
CREATE POLICY "client_insert_own_request"
  ON public.service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Step 3: Verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'service_requests'
      AND cmd = 'INSERT'
      AND policyname = 'client_insert_own_request'
  ) THEN
    RAISE NOTICE '✅ SUCCESS: INSERT policy "client_insert_own_request" is active.';
  ELSE
    RAISE EXCEPTION '❌ FAILED: Policy was not created. Check for errors above.';
  END IF;
END $$;

-- Step 4: Show all current INSERT policies for confirmation
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'service_requests'
  AND cmd = 'INSERT';
