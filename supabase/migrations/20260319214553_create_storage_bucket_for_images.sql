/*
  # Create Storage Bucket for Model Images

  ## Changes Made
  
  ### 1. Storage Bucket
  Creates a public storage bucket named 'model-images' for storing car images
  
  ### 2. Security Policies
  - Public read access for all images
  - Authenticated admins can upload images
  - Authenticated admins can update/delete images
  
  ### 3. Configuration
  - Public bucket for easy access
  - Accepts common image formats (JPEG, PNG, WebP)
  - 10MB file size limit per image
*/

-- Create storage bucket for model images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'model-images',
  'model-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Allow public to read images
DROP POLICY IF EXISTS "Public can view model images" ON storage.objects;
CREATE POLICY "Public can view model images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'model-images');

-- Allow authenticated admins to upload images
DROP POLICY IF EXISTS "Admins can upload model images" ON storage.objects;
CREATE POLICY "Admins can upload model images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'model-images' 
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Allow authenticated admins to update images
DROP POLICY IF EXISTS "Admins can update model images" ON storage.objects;
CREATE POLICY "Admins can update model images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'model-images'
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    bucket_id = 'model-images'
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Allow authenticated admins to delete images
DROP POLICY IF EXISTS "Admins can delete model images" ON storage.objects;
CREATE POLICY "Admins can delete model images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'model-images'
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );