-- Create supabase_connections table for storing user Supabase connections
CREATE TABLE IF NOT EXISTS supabase_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  supabase_url TEXT NOT NULL,
  anon_key TEXT NOT NULL,
  service_role_key TEXT,
  schema_name TEXT DEFAULT 'public',
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  tables_cache JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE supabase_connections ENABLE ROW LEVEL SECURITY;

-- Users can only access connections for their own projects
CREATE POLICY "Users manage own project connections" ON supabase_connections
  FOR ALL USING (
    project_id IN (
      SELECT id FROM ai_builder_projects WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_supabase_connections_updated_at
  BEFORE UPDATE ON supabase_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_builder_updated_at();