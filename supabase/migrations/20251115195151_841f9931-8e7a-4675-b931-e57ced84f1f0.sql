-- Create school_news_comments table
CREATE TABLE IF NOT EXISTS public.school_news_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.school_news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_news_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view comments"
ON public.school_news_comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add comments"
ON public.school_news_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.school_news_comments
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can delete any comment"
ON public.school_news_comments
FOR DELETE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin');

-- Create trigger for updating updated_at
CREATE TRIGGER update_school_news_comments_updated_at
BEFORE UPDATE ON public.school_news_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_school_news_updated_at();

-- Create index for faster queries
CREATE INDEX idx_school_news_comments_news_id ON public.school_news_comments(news_id);
CREATE INDEX idx_school_news_comments_user_id ON public.school_news_comments(user_id);