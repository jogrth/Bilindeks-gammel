/*
  # Add new enrichment source values

  1. Changes
    - Add 'openai_generated' value
    - Add 'generic_fallback' value

  2. Notes
    - Must be done in separate transactions from usage
    - Migration of data will happen in next migration
*/

ALTER TYPE enrichment_source_type ADD VALUE IF NOT EXISTS 'openai_generated';
ALTER TYPE enrichment_source_type ADD VALUE IF NOT EXISTS 'generic_fallback';
