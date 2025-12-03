-- إضافة أعمدة Supabase للمشاريع
ALTER TABLE ai_builder_projects ADD COLUMN IF NOT EXISTS supabase_url TEXT;
ALTER TABLE ai_builder_projects ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT;
ALTER TABLE ai_builder_projects ADD COLUMN IF NOT EXISTS supabase_connected BOOLEAN DEFAULT false;
ALTER TABLE ai_builder_projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'web';
ALTER TABLE ai_builder_projects ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- تحديث السياسات للسماح بالتحديث
DROP POLICY IF EXISTS "Users can update projects in their tenant" ON ai_builder_projects;
CREATE POLICY "Users can update projects in their tenant"
ON ai_builder_projects FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  (tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id))
)
WITH CHECK (
  auth.uid() = user_id OR 
  (tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id))
);

-- السماح بحذف الملفات
DROP POLICY IF EXISTS "Users can delete files in their tenant" ON ai_builder_files;
CREATE POLICY "Users can delete files in their tenant"
ON ai_builder_files FOR DELETE
TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

-- السماح بتحديث الملفات
DROP POLICY IF EXISTS "Users can update files in their tenant" ON ai_builder_files;
CREATE POLICY "Users can update files in their tenant"
ON ai_builder_files FOR UPDATE
TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
)
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);