-- Add full_name and has_seen_welcome_guide columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_welcome_guide BOOLEAN DEFAULT FALSE;

-- Update existing rows to have default value
UPDATE profiles SET has_seen_welcome_guide = FALSE WHERE has_seen_welcome_guide IS NULL;
