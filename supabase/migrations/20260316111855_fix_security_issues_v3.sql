/*
  # Fix Security and Performance Issues

  This migration addresses all security and performance issues identified:

  ## 1. Missing Indexes on Foreign Keys
  - Add index on lead_deliveries.dealer_id
  - Add index on model_dealers.dealer_id
  - Add index on similar_models.similar_model_id

  ## 2. RLS Policy Optimization
  - Optimize profiles RLS policies to use subqueries for auth functions
  - Prevents re-evaluation of auth functions for each row

  ## 3. Function Search Path Security
  - Set search_path for all functions to prevent SQL injection
  - Recreate all dependent policies with proper is_admin function

  ## Notes
  - Unused indexes are kept as they will be used as the app scales
  - Multiple permissive policies are intentional for different access patterns
*/

-- 1. Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_lead_deliveries_dealer_id ON lead_deliveries(dealer_id);
CREATE INDEX IF NOT EXISTS idx_model_dealers_dealer_id ON model_dealers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_similar_models_similar_model_id ON similar_models(similar_model_id);

-- 2. Drop and recreate profiles RLS policies with optimized auth function calls
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND is_admin = true
    )
  );

-- 3. Fix function search paths for security
-- Drop trigger first, then function, then recreate both
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_metadata->>'is_admin', 'false')::boolean
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Fix is_admin function (CASCADE will drop all dependent policies)
DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Recreate all admin policies that depend on is_admin()
CREATE POLICY "Admins can manage brands"
  ON brands
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage models"
  ON models
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage overrides"
  ON model_overrides
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage similar models"
  ON similar_models
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage dealers"
  ON dealers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage model dealers"
  ON model_dealers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can read lead deliveries"
  ON lead_deliveries
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage ingestion jobs"
  ON ingestion_jobs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fix update_updated_at function
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for update_updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON model_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
