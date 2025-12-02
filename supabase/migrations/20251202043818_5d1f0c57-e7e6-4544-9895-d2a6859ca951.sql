-- ============================================
-- Multi-Tenant Architecture Implementation
-- ============================================

-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  plan TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create tenant_members table
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- 3. Add tenant_id to ai_builder_projects if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_builder_projects' 
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.ai_builder_projects 
    ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Add tenant_id to ai_builder_files if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_builder_files' 
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.ai_builder_files 
    ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Add tenant_id to ai_builder_conversations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_builder_conversations' 
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.ai_builder_conversations 
    ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- 7. Create Security Definer Functions
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM tenant_members 
  WHERE user_id = _user_id 
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members 
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  )
$$;

CREATE OR REPLACE FUNCTION public.user_has_tenant_role(_user_id UUID, _tenant_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members 
    WHERE user_id = _user_id 
    AND tenant_id = _tenant_id 
    AND role = _role
  )
$$;

-- 8. Create trigger function for auto-creating tenant
CREATE OR REPLACE FUNCTION public.auto_create_tenant_on_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  existing_tenant_id UUID;
BEGIN
  -- Check if user already has a tenant
  SELECT tenant_id INTO existing_tenant_id
  FROM tenant_members
  WHERE user_id = NEW.user_id
  LIMIT 1;
  
  IF existing_tenant_id IS NOT NULL THEN
    -- Use existing tenant
    NEW.tenant_id := existing_tenant_id;
  ELSE
    -- Create new tenant
    INSERT INTO tenants (owner_user_id, name, slug)
    VALUES (
      NEW.user_id, 
      'My Workspace',
      'ws-' || substring(gen_random_uuid()::text, 1, 8)
    )
    RETURNING id INTO new_tenant_id;
    
    -- Add user as owner
    INSERT INTO tenant_members (tenant_id, user_id, role)
    VALUES (new_tenant_id, NEW.user_id, 'owner');
    
    NEW.tenant_id := new_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. Create trigger on ai_builder_projects
DROP TRIGGER IF EXISTS auto_create_tenant_trigger ON public.ai_builder_projects;
CREATE TRIGGER auto_create_tenant_trigger
BEFORE INSERT ON public.ai_builder_projects
FOR EACH ROW
WHEN (NEW.tenant_id IS NULL)
EXECUTE FUNCTION public.auto_create_tenant_on_project();

-- 10. Create RLS Policies for tenants table
DROP POLICY IF EXISTS "Owners can view their tenants" ON public.tenants;
CREATE POLICY "Owners can view their tenants"
ON public.tenants FOR SELECT
USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Members can view their tenant" ON public.tenants;
CREATE POLICY "Members can view their tenant"
ON public.tenants FOR SELECT
USING (user_belongs_to_tenant(auth.uid(), id));

DROP POLICY IF EXISTS "Owners can update their tenants" ON public.tenants;
CREATE POLICY "Owners can update their tenants"
ON public.tenants FOR UPDATE
USING (owner_user_id = auth.uid());

-- 11. Create RLS Policies for tenant_members table
DROP POLICY IF EXISTS "Users can view members in their tenant" ON public.tenant_members;
CREATE POLICY "Users can view members in their tenant"
ON public.tenant_members FOR SELECT
USING (user_belongs_to_tenant(auth.uid(), tenant_id));

DROP POLICY IF EXISTS "Owners can manage members" ON public.tenant_members;
CREATE POLICY "Owners can manage members"
ON public.tenant_members FOR ALL
USING (user_has_tenant_role(auth.uid(), tenant_id, 'owner'));

-- 12. Update RLS Policies for ai_builder_projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.ai_builder_projects;
DROP POLICY IF EXISTS "Users can view projects in their tenant" ON public.ai_builder_projects;
CREATE POLICY "Users can view projects in their tenant"
ON public.ai_builder_projects FOR SELECT
USING (
  auth.uid() = user_id OR
  (tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id))
);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.ai_builder_projects;
CREATE POLICY "Users can create their own projects"
ON public.ai_builder_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.ai_builder_projects;
CREATE POLICY "Users can update projects in their tenant"
ON public.ai_builder_projects FOR UPDATE
USING (
  auth.uid() = user_id OR
  (tenant_id IS NOT NULL AND user_has_tenant_role(auth.uid(), tenant_id, 'owner'))
);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.ai_builder_projects;
CREATE POLICY "Users can delete projects in their tenant"
ON public.ai_builder_projects FOR DELETE
USING (
  auth.uid() = user_id OR
  (tenant_id IS NOT NULL AND user_has_tenant_role(auth.uid(), tenant_id, 'owner'))
);

-- 13. Update RLS Policies for ai_builder_files
DROP POLICY IF EXISTS "Users can view their project files" ON public.ai_builder_files;
CREATE POLICY "Users can view files in their tenant"
ON public.ai_builder_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND (ai_builder_projects.user_id = auth.uid() OR user_belongs_to_tenant(auth.uid(), ai_builder_projects.tenant_id))
  )
);

DROP POLICY IF EXISTS "Users can create files in their projects" ON public.ai_builder_files;
CREATE POLICY "Users can create files in their tenant"
ON public.ai_builder_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND (ai_builder_projects.user_id = auth.uid() OR user_belongs_to_tenant(auth.uid(), ai_builder_projects.tenant_id))
  )
);

DROP POLICY IF EXISTS "Users can update their project files" ON public.ai_builder_files;
DROP POLICY IF EXISTS "Users can delete their project files" ON public.ai_builder_files;
CREATE POLICY "Users can manage files in their tenant"
ON public.ai_builder_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND (ai_builder_projects.user_id = auth.uid() OR user_belongs_to_tenant(auth.uid(), ai_builder_projects.tenant_id))
  )
);

-- 14. Update RLS Policies for ai_builder_conversations
DROP POLICY IF EXISTS "Users can view their project conversations" ON public.ai_builder_conversations;
CREATE POLICY "Users can view conversations in their tenant"
ON public.ai_builder_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_conversations.project_id
    AND (ai_builder_projects.user_id = auth.uid() OR user_belongs_to_tenant(auth.uid(), ai_builder_projects.tenant_id))
  )
);

DROP POLICY IF EXISTS "Users can create conversations in their projects" ON public.ai_builder_conversations;
CREATE POLICY "Users can create conversations in their tenant"
ON public.ai_builder_conversations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_conversations.project_id
    AND (ai_builder_projects.user_id = auth.uid() OR user_belongs_to_tenant(auth.uid(), ai_builder_projects.tenant_id))
  )
);

-- 15. Create trigger for updating tenants updated_at
CREATE OR REPLACE FUNCTION public.update_tenant_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_tenant_updated_at();