-- Fix: Allow clients to create service requests (Version 2 - Comprehensive Fix)
-- Issue: The policy was too restrictive, requiring explicit 'client' role check
-- Solution: Drop ALL existing INSERT policies and create a simple one

-- Step 1: Drop ALL existing INSERT policies on service_requests
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'service_requests' 
        AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.service_requests', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Create a new, simple INSERT policy
-- Any authenticated user can create a request as long as they set themselves as the client
CREATE POLICY "authenticated_users_create_requests" ON public.service_requests
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Step 3: Verify the policy was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_requests' 
        AND policyname = 'authenticated_users_create_requests'
    ) THEN
        RAISE NOTICE 'SUCCESS: Policy "authenticated_users_create_requests" created successfully';
    ELSE
        RAISE EXCEPTION 'FAILED: Policy was not created';
    END IF;
END $$;

-- Step 4: Add comment for documentation
COMMENT ON POLICY "authenticated_users_create_requests" ON public.service_requests IS 
  'Allows any authenticated user to create a service request with themselves as the client. No role check required.';

-- Step 5: List all current policies for verification
DO $$
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE '=== Current INSERT policies on service_requests ===';
    FOR pol IN 
        SELECT policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'service_requests' 
        AND cmd = 'INSERT'
    LOOP
        RAISE NOTICE 'Policy: % | Command: % | With Check: %', pol.policyname, pol.cmd, pol.with_check;
    END LOOP;
END $$;
