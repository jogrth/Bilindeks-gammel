/*
  # Add Comprehensive Product Features
  
  ## Overview
  This migration adds critical features to Bilindeks:
  - Dealer postcode range routing (replaces free-text postcode_area)
  - Trim levels / utstyrsnivåer for models
  - Rich SEO content fields for model pages
  - FAQ content storage
  - Improved ingestion job tracking
  - Brand preference for dealers
  
  ## Changes Made
  
  ### 1. Dealers Table Enhancements
  - Added `postcode_from` and `postcode_to` for numeric range routing
  - Added `brand_preference` to replace free-text brand field
  - Added `updated_at` timestamp with trigger
  - Kept existing `postcode_area` for backward compatibility during transition
  
  ### 2. New Table: trim_levels
  - Stores utstyrsnivåer (trim levels) for each model
  - Fields: name, price, range, drivetrain, equipment_highlights
  - Ordered by display_order
  - Published flag for visibility control
  
  ### 3. Models Table SEO Enhancements
  - Added `seo_content` JSONB field for rich landing page content
  - Added `faq_content` JSONB field for FAQ sections
  - Added `content_generated_at` timestamp to track when AI content was created
  - Structure allows flexible content sections with proper keywords
  
  ### 4. Ingestion Jobs Enhancements
  - Added `job_type` field (manual, scheduled, api)
  - Added `source_type` field (model_name, url, batch)
  - Added `brand_id` reference for tracking which brand is being ingested
  - Added `models_created` and `models_updated` counters
  - Added `metadata` JSONB for flexible job configuration
  
  ## Security
  - All new tables have RLS enabled
  - Admins have full access
  - Public can read published trim levels
  - SEO content is readable when model is published
*/

-- ============================================================================
-- 1. DEALERS: ADD POSTCODE RANGE AND BRAND PREFERENCE
-- ============================================================================

DO $$
BEGIN
  -- Add postcode range fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dealers' AND column_name = 'postcode_from'
  ) THEN
    ALTER TABLE dealers ADD COLUMN postcode_from integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dealers' AND column_name = 'postcode_to'
  ) THEN
    ALTER TABLE dealers ADD COLUMN postcode_to integer;
  END IF;
  
  -- Add brand preference (replaces loose 'brand' text field)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dealers' AND column_name = 'brand_preference'
  ) THEN
    ALTER TABLE dealers ADD COLUMN brand_preference uuid REFERENCES brands(id) ON DELETE SET NULL;
  END IF;
  
  -- Add updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dealers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE dealers ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add index for postcode range queries
CREATE INDEX IF NOT EXISTS idx_dealers_postcode_range ON dealers(postcode_from, postcode_to) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_dealers_brand_preference ON dealers(brand_preference) WHERE active = true;

-- Add updated_at trigger for dealers
DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add validation check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'dealers' AND constraint_name = 'dealers_postcode_range_valid'
  ) THEN
    ALTER TABLE dealers ADD CONSTRAINT dealers_postcode_range_valid 
      CHECK (
        (postcode_from IS NULL AND postcode_to IS NULL) 
        OR 
        (postcode_from IS NOT NULL AND postcode_to IS NOT NULL AND postcode_from <= postcode_to)
      );
  END IF;
END $$;

-- ============================================================================
-- 2. NEW TABLE: TRIM LEVELS / UTSTYRSNIVÅER
-- ============================================================================

CREATE TABLE IF NOT EXISTS trim_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  price_nok integer,
  range_wltp_km integer,
  drivetrain text,
  drive_type text,
  equipment_highlights text,
  display_order integer DEFAULT 0,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT trim_levels_unique_slug UNIQUE (model_id, slug),
  CONSTRAINT trim_levels_price_positive CHECK (price_nok IS NULL OR price_nok > 0),
  CONSTRAINT trim_levels_range_positive CHECK (range_wltp_km IS NULL OR range_wltp_km > 0)
);

CREATE INDEX IF NOT EXISTS idx_trim_levels_model_id ON trim_levels(model_id);
CREATE INDEX IF NOT EXISTS idx_trim_levels_published ON trim_levels(published);
CREATE INDEX IF NOT EXISTS idx_trim_levels_display_order ON trim_levels(model_id, display_order);

CREATE TRIGGER update_trim_levels_updated_at
  BEFORE UPDATE ON trim_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE trim_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published trim levels" ON trim_levels;
CREATE POLICY "Public can read published trim levels"
  ON trim_levels FOR SELECT
  TO authenticated, anon
  USING (
    published = true 
    AND EXISTS (
      SELECT 1 FROM models 
      WHERE models.id = trim_levels.model_id 
      AND models.published = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage trim levels" ON trim_levels;
CREATE POLICY "Admins can manage trim levels"
  ON trim_levels FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 3. MODELS: ADD SEO CONTENT AND FAQ FIELDS
-- ============================================================================

DO $$
BEGIN
  -- Add SEO content field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'seo_content'
  ) THEN
    ALTER TABLE models ADD COLUMN seo_content jsonb;
  END IF;
  
  -- Add FAQ content field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'faq_content'
  ) THEN
    ALTER TABLE models ADD COLUMN faq_content jsonb;
  END IF;
  
  -- Add content generation timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'content_generated_at'
  ) THEN
    ALTER TABLE models ADD COLUMN content_generated_at timestamptz;
  END IF;
END $$;

COMMENT ON COLUMN models.seo_content IS 'JSONB structure: {sections: [{heading: string, content: string, keywords: string[]}]}';
COMMENT ON COLUMN models.faq_content IS 'JSONB structure: {questions: [{question: string, answer: string}]}';

-- ============================================================================
-- 4. INGESTION JOBS: ENHANCE TRACKING AND METADATA
-- ============================================================================

DO $$
BEGIN
  -- Add job type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'job_type'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN job_type text DEFAULT 'manual' 
      CHECK (job_type IN ('manual', 'scheduled', 'api', 'batch'));
  END IF;
  
  -- Add source type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'source_type'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN source_type text DEFAULT 'model_name'
      CHECK (source_type IN ('model_name', 'url', 'batch', 'api'));
  END IF;
  
  -- Add brand reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
  END IF;
  
  -- Add result counters
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'models_created'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN models_created integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'models_updated'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN models_updated integer DEFAULT 0;
  END IF;
  
  -- Add metadata for flexible configuration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add source URL if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingestion_jobs' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE ingestion_jobs ADD COLUMN source_url text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_brand_id ON ingestion_jobs(brand_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_job_type ON ingestion_jobs(job_type);

COMMENT ON COLUMN ingestion_jobs.metadata IS 'Flexible JSONB for job configuration, progress tracking, and results';

-- ============================================================================
-- 5. MODEL_DEALERS: ADD UPDATED_AT
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'model_dealers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE model_dealers ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_model_dealers_updated_at ON model_dealers;
CREATE TRIGGER update_model_dealers_updated_at
  BEFORE UPDATE ON model_dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();