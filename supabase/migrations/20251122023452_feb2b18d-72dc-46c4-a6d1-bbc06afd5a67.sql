-- Create table for Jordanian Assistant user profiles
CREATE TABLE IF NOT EXISTS public.jordanian_assistant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  semester TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create table for chat history
CREATE TABLE IF NOT EXISTS public.jordanian_assistant_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.jordanian_assistant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jordanian_assistant_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.jordanian_assistant_users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.jordanian_assistant_users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.jordanian_assistant_users
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chat history
CREATE POLICY "Users can view their own chat history"
  ON public.jordanian_assistant_chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history"
  ON public.jordanian_assistant_chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_jordanian_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jordanian_users_updated_at
  BEFORE UPDATE ON public.jordanian_assistant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_jordanian_users_updated_at();