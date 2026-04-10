/*
  # Migrate existing enrichment source data

  1. Changes
    - Update 'ai_generated' → 'openai_generated'
    - Update 'partial' → 'generic_fallback'

  2. Notes
    - Enum values must exist before this migration (previous migration)
*/

UPDATE models 
SET enrichment_source = 'openai_generated' 
WHERE enrichment_source = 'ai_generated';

UPDATE models 
SET enrichment_source = 'generic_fallback' 
WHERE enrichment_source = 'partial';
