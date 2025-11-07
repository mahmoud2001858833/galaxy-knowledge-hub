-- Create drawing challenge messages table
CREATE TABLE IF NOT EXISTS public.drawing_challenge_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.drawing_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drawing_challenge_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone in a challenge can view messages"
ON public.drawing_challenge_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drawing_challenges
    WHERE id = challenge_id
    AND (player1_id = auth.uid() OR player2_id = auth.uid())
  )
);

CREATE POLICY "Players can send messages"
ON public.drawing_challenge_messages
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.drawing_challenges
    WHERE id = challenge_id
    AND (player1_id = auth.uid() OR player2_id = auth.uid())
  )
);

-- Add index for better performance
CREATE INDEX idx_drawing_challenge_messages_challenge_id ON public.drawing_challenge_messages(challenge_id);
CREATE INDEX idx_drawing_challenge_messages_created_at ON public.drawing_challenge_messages(created_at);

-- Enable realtime
ALTER TABLE public.drawing_challenge_messages REPLICA IDENTITY FULL;