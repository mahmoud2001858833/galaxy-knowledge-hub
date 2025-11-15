-- Add category and is_pinned columns to school_news
ALTER TABLE public.school_news 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'إعلانات',
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_school_news_category ON public.school_news(category);
CREATE INDEX IF NOT EXISTS idx_school_news_pinned ON public.school_news(is_pinned);