-- Create school_news table for Anaba School magazine
CREATE TABLE public.school_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  author_name TEXT NOT NULL,
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.school_news ENABLE ROW LEVEL SECURITY;

-- Anyone can view school news
CREATE POLICY "Anyone can view school news"
ON public.school_news
FOR SELECT
USING (true);

-- Only super admins can insert news
CREATE POLICY "Super admins can insert news"
ON public.school_news
FOR INSERT
WITH CHECK (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

-- Only super admins can update news
CREATE POLICY "Super admins can update news"
ON public.school_news
FOR UPDATE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

-- Only super admins can delete news
CREATE POLICY "Super admins can delete news"
ON public.school_news
FOR DELETE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_school_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_school_news_updated_at
BEFORE UPDATE ON public.school_news
FOR EACH ROW
EXECUTE FUNCTION public.update_school_news_updated_at();

-- Create school_news_likes table
CREATE TABLE public.school_news_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.school_news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

-- Enable RLS
ALTER TABLE public.school_news_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view news likes"
ON public.school_news_likes
FOR SELECT
USING (true);

-- Authenticated users can like news
CREATE POLICY "Authenticated users can like news"
ON public.school_news_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike news
CREATE POLICY "Users can unlike news"
ON public.school_news_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to adjust news likes count
CREATE OR REPLACE FUNCTION public.adjust_school_news_likes(news_id_param UUID, increment_param INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE school_news
  SET likes_count = GREATEST(0, likes_count + increment_param)
  WHERE id = news_id_param;
END;
$$;