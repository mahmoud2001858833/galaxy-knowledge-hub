-- Add comments table for BTEC projects
CREATE TABLE IF NOT EXISTS public.btec_project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.btec_student_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.btec_project_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Anyone can view BTEC project comments" 
ON public.btec_project_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create BTEC project comments" 
ON public.btec_project_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own BTEC project comments" 
ON public.btec_project_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_btec_project_comments_project_id ON public.btec_project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_btec_project_comments_created_at ON public.btec_project_comments(created_at DESC);

-- Enable realtime for comments
ALTER TABLE public.btec_project_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.btec_project_comments;