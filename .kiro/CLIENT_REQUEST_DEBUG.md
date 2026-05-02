# 🔍 Client Request Issue - Debug & Fix Guide

**Date:** May 2, 2026  
**Status:** 🔴 DEBUGGING IN PROGRESS  
**Issue:** Requests still not sending to admin after migration

---

## 🚨 Current Situation

You ran the migration, but requests are still not working. Let's diagnose and fix this properly.

---

## 📋 Step 1: Run Diagnostic Check

### Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/yevdyhdifwwkbiulrzmk/sql/new

### Copy and paste this diagnostic SQL:

```sql
-- Check all policies on service_requests table
SELECT 
    policyname,
    cmd,
    with_check as "WITH CHECK expression"
FROM pg_policies 
WHERE tablename = 'service_requests'
AND cmd = 'INSERT'
ORDER BY policyname;
```

### Click "Run"

**What to look for:**
- ✅ Should see: `authenticated_users_create_requests` with `WITH CHECK: (auth.uid() = client_id)`
- ❌ Should NOT see: `Client creates own request` with role check

---

## 📋 Step 2: Apply the Comprehensive Fix

### In the same SQL Editor, run this:

```sql
-- Fix: Allow clients to create service requests (Version 2 - Comprehensive Fix)

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
        RAISE NOTICE 'SUCCESS: Policy created successfully';
    ELSE
        RAISE EXCEPTION 'FAILED: Policy was not created';
    END IF;
END $$;
```

### Expected Output:
```
NOTICE: Dropped policy: Client creates own request
NOTICE: SUCCESS: Policy created successfully
Success. No rows returned
```

---

## 📋 Step 3: Verify the Fix

### Run this verification query:

```sql
-- Verify the new policy exists
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'service_requests'
AND cmd = 'INSERT';
```

### Expected Result:
| policyname | cmd | with_check |
|------------|-----|------------|
| authenticated_users_create_requests | INSERT | (auth.uid() = client_id) |

---

## 📋 Step 4: Check Your User Role

### Run this to check if you have a role assigned:

```sql
-- Check your current user and role
SELECT 
    auth.uid() as "Your User ID",
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) as "Your Role";
```

### Expected Result:
- Should show your user ID
- Should show 'client', 'admin', or 'employee'

**If role is NULL:**
```sql
-- Assign yourself the client role
INSERT INTO public.user_roles (user_id, role)
VALUES (auth.uid(), 'client')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 📋 Step 5: Test the Request Submission

### Option A: Test in SQL Editor

```sql
-- Test creating a request directly
INSERT INTO public.service_requests (client_id, title, description, status)
VALUES (auth.uid(), 'Test Request from SQL', 'Testing the policy fix', 'pending')
RETURNING *;
```

**Expected Result:**
- ✅ Should return the created request with an ID
- ❌ If error, copy the full error message

### Option B: Test in Your App

1. Open your LISH platform
2. Log in as a client
3. Open browser console (F12 → Console)
4. Go to "New Request"
5. Fill out the form
6. Click "Submit Request"
7. **Check the console for detailed error logs**

**Look for these console messages:**
```
[CDNewRequest] Submitting request: {...}
[CDNewRequest] User ID: ...
[CDNewRequest] User object: {...}
```

**If error, you'll see:**
```
[CDNewRequest] Full Error Object: {...}
[CDNewRequest] Error Code: ...
[CDNewRequest] Error Message: ...
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "new row violates row-level security policy"

**Cause:** The old restrictive policy is still active

**Solution:**
```sql
-- Force drop the old policy
DROP POLICY IF EXISTS "Client creates own request" ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users create requests" ON public.service_requests;

-- Create the new one
CREATE POLICY "authenticated_users_create_requests" ON public.service_requests
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = client_id);
```

---

### Issue 2: "permission denied for table service_requests"

**Cause:** RLS is enabled but no INSERT policy exists

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'service_requests';

-- If rowsecurity is true, create the policy
CREATE POLICY "authenticated_users_create_requests" ON public.service_requests
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = client_id);
```

---

### Issue 3: "null value in column 'client_id' violates not-null constraint"

**Cause:** User is not authenticated or auth.uid() is null

**Solution:**
1. Log out and log back in
2. Clear browser cache
3. Check if session is valid:
```sql
SELECT auth.uid(), auth.role();
```

---

### Issue 4: User has no role assigned

**Cause:** The signup trigger didn't assign a role

**Solution:**
```sql
-- Check if user has a role
SELECT * FROM public.user_roles WHERE user_id = auth.uid();

-- If no role, assign client role
INSERT INTO public.user_roles (user_id, role)
VALUES (auth.uid(), 'client')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 📊 Complete Diagnostic Script

Run this complete diagnostic to get all information:

```sql
-- === COMPLETE DIAGNOSTIC ===

-- 1. Current user info
SELECT 
    auth.uid() as "User ID",
    auth.role() as "Auth Role";

-- 2. User's assigned roles
SELECT role, created_at 
FROM public.user_roles 
WHERE user_id = auth.uid();

-- 3. All INSERT policies on service_requests
SELECT 
    policyname,
    permissive,
    roles,
    with_check
FROM pg_policies 
WHERE tablename = 'service_requests'
AND cmd = 'INSERT';

-- 4. RLS status
SELECT tablename, rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'service_requests';

-- 5. Test has_role function
SELECT 
    public.has_role(auth.uid(), 'client') as "Has Client Role",
    public.has_role(auth.uid(), 'admin') as "Has Admin Role";

-- 6. Recent service requests (to see if any exist)
SELECT id, client_id, title, status, created_at
FROM public.service_requests
ORDER BY created_at DESC
LIMIT 3;
```

---

## 🎯 Expected Working State

After the fix, this should be the state:

### Policies:
```sql
-- Only ONE INSERT policy should exist:
authenticated_users_create_requests | INSERT | (auth.uid() = client_id)
```

### User State:
```sql
-- User should have:
User ID: <some-uuid>
Auth Role: authenticated
Assigned Role: client (or admin/employee)
```

### Test Insert:
```sql
-- This should work:
INSERT INTO public.service_requests (client_id, title, description, status)
VALUES (auth.uid(), 'Test', 'Test description', 'pending')
RETURNING *;
```

---

## 📞 Next Steps

1. **Run Step 1** - Diagnostic check to see current state
2. **Run Step 2** - Apply the comprehensive fix
3. **Run Step 3** - Verify the policy exists
4. **Run Step 4** - Check your user role
5. **Run Step 5** - Test the request submission

**After running these steps, share the results:**
- What did the diagnostic show?
- Did the fix script run successfully?
- What error (if any) do you see in the browser console?

---

## 🔧 Alternative: Nuclear Option

If nothing works, here's the nuclear option (recreates all policies):

```sql
-- WARNING: This drops ALL policies on service_requests and recreates them

-- Drop all policies
DROP POLICY IF EXISTS "Client sees own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Client creates own request" ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users create requests" ON public.service_requests;
DROP POLICY IF EXISTS "authenticated_users_create_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admin updates any request" ON public.service_requests;
DROP POLICY IF EXISTS "Client updates own pending request" ON public.service_requests;
DROP POLICY IF EXISTS "Admin deletes request" ON public.service_requests;

-- Recreate policies (simple and permissive)
-- SELECT: Client sees own, admin sees all, employee sees assigned
CREATE POLICY "select_service_requests" ON public.service_requests
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = client_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR auth.uid() = assigned_employee_id
  );

-- INSERT: Any authenticated user can create (no role check)
CREATE POLICY "insert_service_requests" ON public.service_requests
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- UPDATE: Admin can update any, client can update own
CREATE POLICY "update_service_requests" ON public.service_requests
  FOR UPDATE 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') 
    OR auth.uid() = client_id
  );

-- DELETE: Only admin can delete
CREATE POLICY "delete_service_requests" ON public.service_requests
  FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

---

**Status:** 🔴 AWAITING DIAGNOSTIC RESULTS  
**Priority:** CRITICAL  
**Next Action:** Run diagnostic SQL and share results

---

**Created:** May 2, 2026  
**By:** Kiro AI Assistant
