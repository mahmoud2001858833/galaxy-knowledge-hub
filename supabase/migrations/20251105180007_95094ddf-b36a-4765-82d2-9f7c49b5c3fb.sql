-- Drop existing storage policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;

-- Create storage policies for project-images bucket
CREATE POLICY "Users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
);

-- Allow public read access to project images
CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

-- Enable realtime for teacher_project_messages to support instant messaging
ALTER PUBLICATION supabase_realtime ADD TABLE teacher_project_messages;

-- Ensure teacher_projects has proper RLS policy for member inserts
DROP POLICY IF EXISTS "Members can insert their own projects" ON teacher_projects;

CREATE POLICY "Members can insert their own projects"
ON teacher_projects FOR INSERT
TO authenticated
WITH CHECK (member_id = auth.uid());