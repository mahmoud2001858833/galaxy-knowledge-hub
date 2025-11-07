-- Update all artist images to use the specified Unsplash URL
UPDATE public.artists
SET image_url = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400';

-- Update drawing_challenges table to support room-based challenges
ALTER TABLE public.drawing_challenges
ADD COLUMN IF NOT EXISTS room_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS room_created_by UUID,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Create index on room_number for faster searches
CREATE INDEX IF NOT EXISTS idx_drawing_challenges_room_number ON public.drawing_challenges(room_number);
CREATE INDEX IF NOT EXISTS idx_drawing_challenges_status ON public.drawing_challenges(status);