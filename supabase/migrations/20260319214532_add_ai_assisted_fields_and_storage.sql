/*
  # Add AI-Assisted Fields and Image Storage Support

  ## Changes Made
  
  ### 1. AI-Generated Content Fields
  Added fields to track AI-generated suggestions alongside human overrides:
  - `ai_intro_text` - AI-generated intro text (suggestion)
  - `ai_specs` - AI-generated specifications (JSONB for flexibility)
  - `human_overrides` - JSONB tracking which fields have been manually overridden
  - `data_quality_score` - Calculated score for missing/incomplete fields (0-100)
  
  ### 2. Model Years Support
  - `model_year_start` - Starting year for model availability
  - `model_year_end` - Ending year (null = current/ongoing)
  
  ### 3. Enhanced Image Support
  - Keep existing `image_url` field
  - Add `image_storage_path` for Supabase Storage reference
  - Images can come from external URLs or local storage
  
  ### 4. Additional Metadata
  - `last_ai_enrichment_at` - Track when AI last updated suggestions
  - `review_notes` - Admin notes for review process
  
  ## Data Quality Score
  Automatically calculated based on presence of key fields
  
  ## Storage Bucket
  Storage bucket 'model-images' will be created separately via Storage API
*/

-- Add AI-assisted and enhanced fields to models table
DO $$
BEGIN
  -- AI-generated suggestions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'ai_intro_text'
  ) THEN
    ALTER TABLE models ADD COLUMN ai_intro_text text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'ai_specs'
  ) THEN
    ALTER TABLE models ADD COLUMN ai_specs jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Human overrides tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'human_overrides'
  ) THEN
    ALTER TABLE models ADD COLUMN human_overrides jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Data quality
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'data_quality_score'
  ) THEN
    ALTER TABLE models ADD COLUMN data_quality_score integer DEFAULT 0 
      CHECK (data_quality_score >= 0 AND data_quality_score <= 100);
  END IF;
  
  -- Model years
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'model_year_start'
  ) THEN
    ALTER TABLE models ADD COLUMN model_year_start integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'model_year_end'
  ) THEN
    ALTER TABLE models ADD COLUMN model_year_end integer;
  END IF;
  
  -- Storage reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'image_storage_path'
  ) THEN
    ALTER TABLE models ADD COLUMN image_storage_path text;
  END IF;
  
  -- Metadata
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'last_ai_enrichment_at'
  ) THEN
    ALTER TABLE models ADD COLUMN last_ai_enrichment_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE models ADD COLUMN review_notes text;
  END IF;
END $$;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_models_data_quality 
  ON models(data_quality_score DESC);
  
CREATE INDEX IF NOT EXISTS idx_models_model_years 
  ON models(model_year_start, model_year_end);

-- Function to calculate data quality score
CREATE OR REPLACE FUNCTION calculate_data_quality_score(model_row models)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  total_fields integer := 14;
BEGIN
  -- Essential fields (10 points each)
  IF model_row.name IS NOT NULL AND model_row.name != '' THEN score := score + 10; END IF;
  IF model_row.brand_id IS NOT NULL THEN score := score + 10; END IF;
  IF model_row.body_type IS NOT NULL AND model_row.body_type != '' THEN score := score + 10; END IF;
  IF model_row.drivetrain IS NOT NULL AND model_row.drivetrain != '' THEN score := score + 10; END IF;
  
  -- Important fields (5 points each)
  IF model_row.price_from_nok IS NOT NULL THEN score := score + 5; END IF;
  IF model_row.range_wltp_km IS NOT NULL THEN score := score + 5; END IF;
  IF model_row.charge_speed_kw IS NOT NULL THEN score := score + 5; END IF;
  IF model_row.seats_max IS NOT NULL THEN score := score + 5; END IF;
  IF model_row.cargo_liters IS NOT NULL THEN score := score + 5; END IF;
  IF model_row.towing_kg IS NOT NULL THEN score := score + 5; END IF;
  
  -- Nice-to-have fields (5 points each)
  IF model_row.intro_text IS NOT NULL AND model_row.intro_text != '' THEN score := score + 5; END IF;
  IF model_row.image_url IS NOT NULL OR model_row.image_storage_path IS NOT NULL THEN score := score + 5; END IF;
  IF model_row.drive_type IS NOT NULL AND model_row.drive_type != '' THEN score := score + 5; END IF;
  IF model_row.model_year_start IS NOT NULL THEN score := score + 5; END IF;
  
  -- Cap at 100
  IF score > 100 THEN score := 100; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update data quality score
CREATE OR REPLACE FUNCTION update_data_quality_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_quality_score := calculate_data_quality_score(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_data_quality_score ON models;
CREATE TRIGGER trigger_update_data_quality_score
  BEFORE INSERT OR UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_data_quality_score();

-- Update existing models with data quality scores
UPDATE models SET updated_at = updated_at;