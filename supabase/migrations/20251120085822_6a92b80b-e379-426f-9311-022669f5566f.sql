-- Add extracted_text column to jordanian_textbooks table
ALTER TABLE public.jordanian_textbooks 
ADD COLUMN IF NOT EXISTS extracted_text TEXT;