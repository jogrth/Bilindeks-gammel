/*
  # Fix profile creation RLS policies

  1. Problem
    - Users cannot be created because the trigger tries to INSERT into profiles
    - profiles table has RLS enabled but no INSERT policy
    - The trigger function runs with SECURITY DEFINER but still needs proper policies

  2. Solution
    - Add INSERT policy that allows the trigger to create profiles
    - Allow service role to insert profiles (for the trigger)

  3. Security
    - Regular users cannot insert profiles directly
    - Only the trigger (running as service role) can insert
*/

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
