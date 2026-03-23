/*
  # Fix system_admins RLS policy for login
  
  1. Changes
    - Drop existing restrictive RLS policy that prevents login
    - Add new policy that allows authenticated users to check their own admin status
    - Keep the table secure while allowing login functionality
  
  2. Security
    - Users can only read their own record in system_admins
    - This allows the login flow to verify admin status
    - Prevents users from seeing who else is an admin
*/

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Admins can read system_admins" ON system_admins;

-- Allow users to check if they themselves are admins
CREATE POLICY "Users can check own admin status"
  ON system_admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
