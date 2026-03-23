/*
  # Improve handle_new_user function with error handling

  1. Changes
    - Add explicit error handling and logging
    - Ensure function works correctly even if profile already exists
    - Set proper updated_at value
    
  2. Security
    - Maintains SECURITY DEFINER for bypassing RLS
    - Only inserts profiles for actual new users
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert new profile
  -- Use ON CONFLICT to handle race conditions or re-runs
  INSERT INTO public.profiles (
    id,
    email,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_app_metadata->>'is_admin')::boolean, false),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
