/*
  # Sync published column with review_status during transition

  ## Purpose
  During the transition period where both `published` and `review_status` exist,
  this ensures they stay synchronized to prevent inconsistencies.

  ## Changes
  - Creates a trigger to auto-sync `published` boolean based on `review_status`
  - `review_status = 'published'` → `published = true`
  - Any other review_status → `published = false`

  ## Notes
  - This trigger will be removed once `published` column is dropped
  - Ensures backward compatibility during rollout
*/

CREATE OR REPLACE FUNCTION sync_published_with_review_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-sync published boolean based on review_status
  NEW.published := (NEW.review_status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_published ON models;
CREATE TRIGGER trigger_sync_published
  BEFORE INSERT OR UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION sync_published_with_review_status();

COMMENT ON FUNCTION sync_published_with_review_status IS 
  'Temporary sync function - maintains published boolean during transition to review_status system';
