/*
  # Add Review Status and Quality System

  ## Overview
  This migration adds the new review status system and quality scoring while maintaining
  backward compatibility with the existing `published` boolean field.

  ## Changes Made

  ### 1. New Columns Added to `models`
  - `review_status` - Replaces published boolean with four states: draft, needs_review, published, unpublished
  - `deleted_at` - Enables soft delete functionality
  - `quality_score` - Deterministic 0-100 score based on data completeness and confidence

  ### 2. Indexes
  - `idx_models_review_status` - For filtering by review status
  - `idx_models_deleted_at` - For excluding deleted models
  - `idx_models_public_query` - Composite index for public queries (review_status + deleted_at)

  ### 3. Data Migration
  - Syncs existing `published` values to `review_status`
  - `published = true` → `review_status = 'published'`
  - `published = false` → `review_status = 'draft'`

  ### 4. Backward Compatibility
  - **KEEPS** `published` column for now (will be removed in future migration)
  - Allows safe rollout without breaking existing code

  ## Important Notes
  - The `published` boolean will be deprecated but not removed yet
  - All new code should use `review_status` instead
  - Public queries should filter: `review_status = 'published' AND deleted_at IS NULL`
*/

-- Add review_status column with constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'models' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE models ADD COLUMN review_status text DEFAULT 'draft';
  END IF;
END $$;

-- Add constraint for review_status enum
DO $$
BEGIN
  ALTER TABLE models DROP CONSTRAINT IF EXISTS models_review_status_check;
  ALTER TABLE models ADD CONSTRAINT models_review_status_check
    CHECK (review_status IN ('draft', 'needs_review', 'published', 'unpublished'));
END $$;

-- Add deleted_at for soft delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'models' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE models ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Add quality_score
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'models' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE models ADD COLUMN quality_score integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_models_review_status ON models(review_status);
CREATE INDEX IF NOT EXISTS idx_models_deleted_at ON models(deleted_at);
CREATE INDEX IF NOT EXISTS idx_models_public_query ON models(review_status, deleted_at)
  WHERE deleted_at IS NULL AND review_status = 'published';

-- Migrate existing data: sync published → review_status
UPDATE models
SET review_status = CASE
  WHEN published = true THEN 'published'
  ELSE 'draft'
END
WHERE review_status IS NULL OR review_status = 'draft';

-- Create function to calculate quality score deterministically
CREATE OR REPLACE FUNCTION calculate_quality_score(model_record models)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  avg_confidence numeric := 0;
  confidence_values numeric[];
  has_image boolean := false;
BEGIN
  -- Part 1: Core completeness (50 points)
  IF model_record.range_wltp_km IS NOT NULL THEN score := score + 10; END IF;
  IF model_record.price_from_nok IS NOT NULL THEN score := score + 10; END IF;
  IF model_record.battery_kwh IS NOT NULL THEN score := score + 8; END IF;
  IF model_record.power_hp IS NOT NULL THEN score := score + 8; END IF;
  IF model_record.segment IS NOT NULL THEN score := score + 5; END IF;
  IF model_record.body_type IS NOT NULL THEN score := score + 5; END IF;
  IF model_record.seats_max IS NOT NULL THEN score := score + 2; END IF;
  IF model_record.cargo_liters IS NOT NULL THEN score := score + 2; END IF;

  -- Part 2: Data confidence (30 points)
  IF model_record.spec_confidence IS NOT NULL THEN
    SELECT AVG(value::numeric) INTO avg_confidence
    FROM jsonb_each_text(model_record.spec_confidence::jsonb);

    IF avg_confidence >= 0.9 THEN
      score := score + 30;
    ELSIF avg_confidence >= 0.8 THEN
      score := score + 25;
    ELSIF avg_confidence >= 0.7 THEN
      score := score + 20;
    ELSIF avg_confidence >= 0.6 THEN
      score := score + 15;
    ELSE
      score := score + 10;
    END IF;
  END IF;

  -- Part 3: Content richness (20 points)
  has_image := (model_record.image_primary_url IS NOT NULL OR model_record.image_url IS NOT NULL);

  IF has_image THEN score := score + 5; END IF;

  -- Check for multiple images, trims, SEO content, FAQs
  -- (These will be checked via joins in application code for now)

  -- Hard caps
  IF model_record.price_from_nok IS NULL OR model_record.range_wltp_km IS NULL THEN
    score := LEAST(score, 60);
  END IF;

  IF NOT has_image THEN
    score := LEAST(score, 70);
  END IF;

  IF avg_confidence > 0 AND avg_confidence < 0.6 THEN
    score := LEAST(score, 75);
  END IF;

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-update quality_score
CREATE OR REPLACE FUNCTION update_model_quality_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quality_score := calculate_quality_score(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quality_score ON models;
CREATE TRIGGER trigger_update_quality_score
  BEFORE INSERT OR UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_model_quality_score();

-- Update quality scores for existing models
UPDATE models SET quality_score = calculate_quality_score(models.*);

-- Create helper functions for state transitions
CREATE OR REPLACE FUNCTION can_publish_model(model_id uuid)
RETURNS boolean AS $$
DECLARE
  model_record models;
BEGIN
  SELECT * INTO model_record FROM models WHERE id = model_id;

  -- Publication requirements
  RETURN (
    model_record.quality_score >= 70 AND
    model_record.deleted_at IS NULL AND
    model_record.image_primary_url IS NOT NULL AND
    model_record.price_from_nok IS NOT NULL AND
    model_record.range_wltp_km IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_publish_model IS 'Checks if a model meets all requirements for publication';