/*
  # Add updated_at trigger to dealers table

  1. Changes
    - Add trigger to automatically update `updated_at` timestamp on dealers table
  
  2. Notes
    - Uses existing `update_updated_at()` function
    - No schema changes, just trigger addition
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_dealers_updated_at'
  ) THEN
    CREATE TRIGGER update_dealers_updated_at
      BEFORE UPDATE ON dealers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
