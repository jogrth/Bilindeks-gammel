/*
  # Update RLS policies for review_status system

  ## Purpose
  Update Row Level Security policies to use the new review_status system
  instead of the legacy published boolean.

  ## Changes
  1. **Public read access** - Only published, non-deleted models
     - WHERE review_status = 'published' AND deleted_at IS NULL
  
  2. **Admin access** - Full access to all models including deleted ones
     - Admin policies remain unchanged
  
  3. **Similar models** - Only show relationships between published models
     - Both source and target must be published and non-deleted
  
  ## Security
  - Public users can ONLY see published, active models
  - Deleted models are completely hidden from public
  - Draft and unpublished models are admin-only
  - Admin access remains unrestricted for management purposes
  
  ## Notes
  - This migration is safe to run multiple times (uses DROP POLICY IF EXISTS)
  - Maintains backward compatibility by keeping admin policies intact
  - Follows principle of least privilege for public access
*/

-- Drop existing public read policy for models
DROP POLICY IF EXISTS "Public can read published models" ON models;

-- Create new policy with review_status check
CREATE POLICY "Public can read published models"
  ON models FOR SELECT
  TO authenticated, anon
  USING (review_status = 'published' AND deleted_at IS NULL);

-- Admin policies remain unchanged (admins can see everything)
-- "Admins can manage models" policy already exists

-- Update similar_models RLS to filter by review_status
DROP POLICY IF EXISTS "Public can read similar models" ON similar_models;

CREATE POLICY "Public can read similar models"
  ON similar_models FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = similar_models.model_id
      AND models.review_status = 'published'
      AND models.deleted_at IS NULL
    )
    AND
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = similar_models.similar_model_id
      AND models.review_status = 'published'
      AND models.deleted_at IS NULL
    )
  );

-- Add comment explaining the policy
COMMENT ON POLICY "Public can read published models" ON models IS 
  'Public users can only see models that are published and not deleted';

COMMENT ON POLICY "Public can read similar models" ON similar_models IS 
  'Public users can only see similar model relationships where both models are published and not deleted';
