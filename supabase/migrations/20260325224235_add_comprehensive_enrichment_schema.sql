/*
  # Comprehensive Enrichment Pipeline Schema

  1. New Tables
    - `model_images` - Store multiple images per model with ordering
    - `model_trim_levels` - Store utstyrsnivåer with detailed specs per trim
    - `model_faqs` - Store model-specific FAQ entries
    - `model_seo_sections` - Store generated SEO content sections

  2. Changes to models table
    - Add structured spec fields with confidence tracking
    - Add quality score and review status
    - Add image_primary_url for quick access

  3. Security
    - Enable RLS on all new tables
    - Admin-only write access
    - Public read access for published content
*/

-- Model Images Table
CREATE TABLE IF NOT EXISTS model_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  caption text,
  source text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE model_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view model images"
  ON model_images FOR SELECT
  USING (true);

CREATE POLICY "System admins can manage model images"
  ON model_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_model_images_model_id ON model_images(model_id);
CREATE INDEX IF NOT EXISTS idx_model_images_is_primary ON model_images(model_id, is_primary);

-- Model Trim Levels (Utstyrsnivåer)
CREATE TABLE IF NOT EXISTS model_trim_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_from_nok integer,
  range_wltp_km integer,
  drivetrain text,
  battery_kwh numeric(5,1),
  power_hp integer,
  features jsonb DEFAULT '[]'::jsonb,
  display_order integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE model_trim_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trim levels"
  ON model_trim_levels FOR SELECT
  USING (true);

CREATE POLICY "System admins can manage trim levels"
  ON model_trim_levels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_model_trim_levels_model_id ON model_trim_levels(model_id);

-- Model FAQs
CREATE TABLE IF NOT EXISTS model_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE model_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view FAQs"
  ON model_faqs FOR SELECT
  USING (true);

CREATE POLICY "System admins can manage FAQs"
  ON model_faqs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_model_faqs_model_id ON model_faqs(model_id);

-- Model SEO Sections
CREATE TABLE IF NOT EXISTS model_seo_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  heading text NOT NULL,
  content text NOT NULL,
  display_order integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(model_id, section_key)
);

ALTER TABLE model_seo_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEO sections"
  ON model_seo_sections FOR SELECT
  USING (true);

CREATE POLICY "System admins can manage SEO sections"
  ON model_seo_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM system_admins
      WHERE system_admins.user_id = auth.uid()
      AND system_admins.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_model_seo_sections_model_id ON model_seo_sections(model_id);

-- Add structured spec fields to models table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'segment') THEN
    ALTER TABLE models ADD COLUMN segment text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'body_type') THEN
    ALTER TABLE models ADD COLUMN body_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'charge_speed_kw') THEN
    ALTER TABLE models ADD COLUMN charge_speed_kw integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'battery_kwh') THEN
    ALTER TABLE models ADD COLUMN battery_kwh numeric(5,1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'power_hp') THEN
    ALTER TABLE models ADD COLUMN power_hp integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'acceleration_0_100') THEN
    ALTER TABLE models ADD COLUMN acceleration_0_100 numeric(4,1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'model_year_from') THEN
    ALTER TABLE models ADD COLUMN model_year_from integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'model_year_to') THEN
    ALTER TABLE models ADD COLUMN model_year_to integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'image_primary_url') THEN
    ALTER TABLE models ADD COLUMN image_primary_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'quality_score') THEN
    ALTER TABLE models ADD COLUMN quality_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'review_status') THEN
    ALTER TABLE models ADD COLUMN review_status text DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'needs_review_reasons') THEN
    ALTER TABLE models ADD COLUMN needs_review_reasons jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'spec_confidence') THEN
    ALTER TABLE models ADD COLUMN spec_confidence jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'spec_sources') THEN
    ALTER TABLE models ADD COLUMN spec_sources jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_models_segment ON models(segment);
CREATE INDEX IF NOT EXISTS idx_models_body_type ON models(body_type);
CREATE INDEX IF NOT EXISTS idx_models_quality_score ON models(quality_score);
CREATE INDEX IF NOT EXISTS idx_models_review_status ON models(review_status);

CREATE OR REPLACE FUNCTION update_model_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER model_images_updated_at_trigger
  BEFORE UPDATE ON model_images
  FOR EACH ROW
  EXECUTE FUNCTION update_model_images_updated_at();

CREATE OR REPLACE FUNCTION update_model_trim_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER model_trim_levels_updated_at_trigger
  BEFORE UPDATE ON model_trim_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_model_trim_levels_updated_at();

COMMENT ON TABLE model_images IS 'Store multiple images per model with ordering and metadata';
COMMENT ON TABLE model_trim_levels IS 'Store trim levels (utstyrsnivåer) with detailed specs';
COMMENT ON TABLE model_faqs IS 'Store model-specific FAQ entries';
COMMENT ON TABLE model_seo_sections IS 'Store generated SEO content sections';

COMMENT ON COLUMN models.segment IS 'Vehicle segment (e.g., compact, midsize, SUV)';
COMMENT ON COLUMN models.body_type IS 'Body type (e.g., sedan, SUV, hatchback)';
COMMENT ON COLUMN models.quality_score IS 'Quality score 0-100 based on data completeness';
COMMENT ON COLUMN models.review_status IS 'Review status: draft, needs_review, reviewed, published';
COMMENT ON COLUMN models.needs_review_reasons IS 'Array of reasons why manual review is needed';
COMMENT ON COLUMN models.spec_confidence IS 'JSON object mapping spec fields to confidence scores';
COMMENT ON COLUMN models.spec_sources IS 'JSON object mapping spec fields to data sources';
