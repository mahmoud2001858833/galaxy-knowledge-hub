-- Enable realtime for class_chat_messages table
ALTER TABLE public.class_chat_messages REPLICA IDENTITY FULL;

-- Add the table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'class_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.class_chat_messages;
  END IF;
END $$;