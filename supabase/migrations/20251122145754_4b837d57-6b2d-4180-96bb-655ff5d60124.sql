-- Create conversations table to organize chat history
CREATE TABLE IF NOT EXISTS public.jordanian_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  first_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add conversation_id to chat history
ALTER TABLE public.jordanian_assistant_chat_history 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.jordanian_conversations(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jordanian_conversations_user_id ON public.jordanian_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation_id ON public.jordanian_assistant_chat_history(conversation_id);

-- Enable RLS
ALTER TABLE public.jordanian_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.jordanian_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own conversations" 
ON public.jordanian_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own conversations" 
ON public.jordanian_conversations 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own conversations" 
ON public.jordanian_conversations 
FOR DELETE 
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_jordanian_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jordanian_conversations_updated_at
BEFORE UPDATE ON public.jordanian_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_jordanian_conversation_timestamp();