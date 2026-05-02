-- Fix: Allow clients to create service requests
-- Issue: The policy was too restrictive, requiring explicit 'client' role check
-- Solution: Simplify to just check if user is authenticated and owns the request

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Client creates own request" ON public.service_requests;

-- Create a new, more permissive policy
-- Any authenticated user can create a request as long as they set themselves as the client
CREATE POLICY "Authenticated users create requests" ON public.service_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

-- Also ensure the policy name is unique and clear
COMMENT ON POLICY "Authenticated users create requests" ON public.service_requests IS 
  'Allows any authenticated user to create a service request with themselves as the client';
