-- Create function to adjust art project likes count
CREATE OR REPLACE FUNCTION adjust_art_project_likes(project_id UUID, increment INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE art_projects
  SET likes_count = GREATEST(0, likes_count + increment)
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;