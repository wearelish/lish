-- COMPLETE FIX: Run this in Supabase SQL Editor
-- Fixes enum values, RLS policies, and missing columns in one shot

-- 1. Add missing enum values (safe - IF NOT EXISTS)
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'price_sent';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'delivered';

-- 2. Add missing columns (safe - IF NOT EXISTS)
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS scope_of_work       TEXT,
  ADD COLUMN IF NOT EXISTS proposal_note       TEXT,
  ADD COLUMN IF NOT EXISTS proposal_deadline   DATE,
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
  ADD COLUMN IF NOT EXISTS delivery_file_url   TEXT,
  ADD COLUMN IF NOT EXISTS delivery_note       TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at        TIMESTAMPTZ;

-- 3. Drop ALL INSERT policies on service_requests (every name ever used)
DROP POLICY IF EXISTS "Client creates own request"              ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users create requests"     ON public.service_requests;
DROP POLICY IF EXISTS "authenticated_users_create_requests"    ON public.service_requests;
DROP POLICY IF EXISTS "client creates"                         ON public.service_requests;
DROP POLICY IF EXISTS "insert_service_requests"                ON public.service_requests;
DROP POLICY IF EXISTS "client_insert_own_request"              ON public.service_requests;

-- 4. Create one clean INSERT policy (no role check)
CREATE POLICY "client_insert_own_request"
  ON public.service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- 5. Verify
SELECT
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'service_requests'
ORDER BY cmd, policyname;
