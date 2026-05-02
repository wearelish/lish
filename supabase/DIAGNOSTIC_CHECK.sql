-- Diagnostic SQL to check service_requests policies and user roles
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check all policies on service_requests table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as "USING expression",
    with_check as "WITH CHECK expression"
FROM pg_policies 
WHERE tablename = 'service_requests'
ORDER BY cmd, policyname;

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'service_requests';

-- 3. Check current user's authentication
SELECT 
    auth.uid() as "Current User ID",
    auth.role() as "Current Role";

-- 4. Check user_roles for current user
SELECT 
    user_id,
    role,
    created_at
FROM public.user_roles 
WHERE user_id = auth.uid();

-- 5. Check if has_role function exists and works
SELECT public.has_role(auth.uid(), 'client') as "Has Client Role";
SELECT public.has_role(auth.uid(), 'admin') as "Has Admin Role";
SELECT public.has_role(auth.uid(), 'employee') as "Has Employee Role";

-- 6. Test INSERT permission (this will fail if policy is wrong, but shows the error)
-- UNCOMMENT TO TEST (will create a test record if successful):
-- INSERT INTO public.service_requests (client_id, title, description, status)
-- VALUES (auth.uid(), 'Test Request', 'Testing RLS policy', 'pending')
-- RETURNING *;

-- 7. Check service_requests table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'service_requests'
ORDER BY ordinal_position;

-- 8. Check for any existing service_requests
SELECT 
    id,
    client_id,
    title,
    status,
    created_at
FROM public.service_requests
ORDER BY created_at DESC
LIMIT 5;
