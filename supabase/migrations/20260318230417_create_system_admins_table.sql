/*
  # Create system_admins table

  1. New Tables
    - `system_admins`
      - `user_id` (uuid, primary key, references auth.users)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `system_admins` table
    - Only admins can read this table (bootstrapping handled manually)
  
  3. Notes
    - This table explicitly defines who has admin access
    - More secure than boolean flag approach
    - Easier to audit admin access
*/

CREATE TABLE IF NOT EXISTS system_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE system_admins ENABLE ROW LEVEL SECURITY;

-- Only users in system_admins can read the table
CREATE POLICY "Admins can read system_admins"
  ON system_admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE user_id = auth.uid()
    )
  );

-- Create helper function to check admin status
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM system_admins
    WHERE user_id = check_user_id
  );
$$;
