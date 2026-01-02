
-- Create spaced_lessons table for storing lessons
CREATE TABLE public.spaced_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_name TEXT NOT NULL,
  lesson_name TEXT NOT NULL,
  first_study_date DATE NOT NULL,
  study_duration INTEGER DEFAULT 30,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  current_review_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spaced_reviews table for storing review schedules
CREATE TABLE public.spaced_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.spaced_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  review_number INTEGER NOT NULL CHECK (review_number BETWEEN 1 AND 8),
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  memory_retention DECIMAL(5,2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spaced_stats table for user statistics
CREATE TABLE public.spaced_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_reviews INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.spaced_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spaced_lessons
CREATE POLICY "Users can view their own lessons"
  ON public.spaced_lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lessons"
  ON public.spaced_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
  ON public.spaced_lessons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
  ON public.spaced_lessons FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for spaced_reviews
CREATE POLICY "Users can view their own reviews"
  ON public.spaced_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews"
  ON public.spaced_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.spaced_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.spaced_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for spaced_stats
CREATE POLICY "Users can view their own stats"
  ON public.spaced_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats"
  ON public.spaced_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.spaced_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_spaced_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_spaced_lessons_timestamp
  BEFORE UPDATE ON public.spaced_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spaced_lessons_updated_at();

-- Create indexes for performance
CREATE INDEX idx_spaced_lessons_user_id ON public.spaced_lessons(user_id);
CREATE INDEX idx_spaced_reviews_user_id ON public.spaced_reviews(user_id);
CREATE INDEX idx_spaced_reviews_lesson_id ON public.spaced_reviews(lesson_id);
CREATE INDEX idx_spaced_reviews_scheduled_date ON public.spaced_reviews(scheduled_date);
CREATE INDEX idx_spaced_stats_user_date ON public.spaced_stats(user_id, date);
