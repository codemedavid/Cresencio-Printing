/*
  # Create storage bucket for VIP ID files

  1. Storage Setup
    - Create 'vip-id-files' bucket for storing VIP member ID documents
    - Set bucket to be publicly accessible for reading (for admin viewing)
    - Allow authenticated users to upload ID files

  2. Security
    - Public read access for ID files (admin needs to view them)
    - Authenticated upload access only
    - File size and type restrictions via policies
*/

-- Create storage bucket for VIP ID files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vip-id-files',
  'vip-id-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to VIP ID files (for admin viewing)
CREATE POLICY "Public read access for VIP ID files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'vip-id-files');

-- Allow authenticated users to upload VIP ID files
CREATE POLICY "Authenticated users can upload VIP ID files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vip-id-files');

-- Allow authenticated users to update VIP ID files
CREATE POLICY "Authenticated users can update VIP ID files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'vip-id-files');

-- Allow authenticated users to delete VIP ID files
CREATE POLICY "Authenticated users can delete VIP ID files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'vip-id-files');
