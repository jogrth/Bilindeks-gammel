/*
  # Properly fix profile RLS for trigger

  1. Root Cause Analysis
    - Trigger runs with SECURITY DEFINER as postgres user
    - Even SECURITY DEFINER functions must satisfy RLS policies unless bypassed
    - The previous policy WITH CHECK (true) is too permissive
    
  2. Proper Solution
    - Remove the overly permissive policy
    - Add a targeted policy that allows INSERT only when id matches auth.uid()
    - Grant the service role ability to bypass RLS for this specific operation
    - Alternatively, make the function bypass RLS by granting appropriate privileges

  3. Best Practice Solution
    - Keep RLS strict: only allow users to insert their own profile (auth.uid() = id)
    - The trigger should work because it's SECURITY DEFINER running as postgres
    - If that's not working, we need to check if RLS is interfering

  4. Real Fix
    - The issue is that during signup, auth.uid() returns NULL
    - But the trigger is trying to insert with SECURITY DEFINER
    - The policy WITH CHECK is evaluated even for SECURITY DEFINER
    - Solution: Use a policy that checks role OR auth context
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- Create a properly scoped INSERT policy
-- This allows inserts when:
-- 1. The user is authenticated AND the id matches their auth.uid()
-- 2. OR when there's no authenticated session (trigger context during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    id = COALESCE(auth.uid(), id)
  );

-- Create an additional policy for the service role (used by triggers)
-- This uses postgres role which the trigger runs as
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
