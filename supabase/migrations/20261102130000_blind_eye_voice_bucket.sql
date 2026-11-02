-- Blind Eye voice clips: every sentence is synthesised once and kept here (written and read only
-- by the blind-eye-voice function with the service role), so repeated phrases never hit the
-- speech provider's rate limit again.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blind-eye-voice', 'blind-eye-voice', false, 5242880, ARRAY['audio/wav'])
ON CONFLICT (id) DO NOTHING;
