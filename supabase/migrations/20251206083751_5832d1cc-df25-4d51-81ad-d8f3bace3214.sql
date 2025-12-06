-- Add storage policy to allow authenticated users to upload textbook PDFs
CREATE POLICY "Authenticated users can upload jordanian textbooks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jordanian-textbooks');

-- Add storage policy to allow public read access
CREATE POLICY "Public can read jordanian textbooks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'jordanian-textbooks');

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('jordanian-textbooks', 'jordanian-textbooks', true)
ON CONFLICT (id) DO UPDATE SET public = true;