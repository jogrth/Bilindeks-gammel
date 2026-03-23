/*
  # Add is_active column to system_admins

  1. Changes
    - Add `is_active` boolean column to `system_admins` table with default true
    - Update existing records to be active

  2. Notes
    - Allows temporarily disabling admin access without deleting the record
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_admins' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE system_admins ADD COLUMN is_active boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Ensure existing records are active
UPDATE system_admins SET is_active = true WHERE is_active IS NULL;
