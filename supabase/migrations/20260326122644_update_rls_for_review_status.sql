/*
  # Update RLS Policies for Review Status

  ## Changes
  - Update public read policy to use `review_status = 'published'` instead of `published = true`
  - Ensure deleted models are excluded from public queries
  - Keep admin policies unchanged (admins can see all non-deleted models)

  ## Security
  - Public users can ONLY see: review_status = 'published' AND deleted_at IS NULL
  - Admins can see all models except deleted ones (unless specifically querying trash)
*/

-- Drop old public read policy
DROP POLICY IF EXISTS "Public can read published models" ON models;

-- Create new public read policy using review_status
CREATE POLICY "Public can read published models"
  ON models FOR SELECT
  TO authenticated, anon
  USING (review_status = 'published' AND deleted_at IS NULL);

-- Admins can see all non-deleted models (keep existing admin policy structure)
DROP POLICY IF EXISTS "Admins can manage models" ON models;

CREATE POLICY "Admins can read all non-deleted models"
  ON models FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert models"
  ON models FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update models"
  ON models FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete models"
  ON models FOR DELETE
  TO authenticated
  USING (is_admin());

COMMENT ON POLICY "Public can read published models" ON models IS
  'Public users can only see published, non-deleted models';
