/*
  # Add enrichment tracking fields

  1. Changes
    - Add `enrichment_source` enum field to track data origin
    - Add `enrichment_confidence` to store certainty level
    - Add `enrichment_notes` to store warnings or clarifications
    - Add indexes for querying by source

  2. Security
    - No RLS changes needed (inherits from models table)
*/

DO $$ BEGIN
  CREATE TYPE enrichment_source_type AS ENUM (
    'known_dataset',
    'ai_generated',
    'manual',
    'external_api',
    'partial'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE models
  ADD COLUMN IF NOT EXISTS enrichment_source enrichment_source_type DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS enrichment_confidence numeric(3,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS enrichment_notes text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_models_enrichment_source
  ON models(enrichment_source);

COMMENT ON COLUMN models.enrichment_source IS 'Origin of enrichment data: known_dataset, ai_generated, manual, external_api, partial';
COMMENT ON COLUMN models.enrichment_confidence IS 'Confidence score 0.00-1.00 for AI-generated content';
COMMENT ON COLUMN models.enrichment_notes IS 'Notes about data quality, estimates, or missing information';
