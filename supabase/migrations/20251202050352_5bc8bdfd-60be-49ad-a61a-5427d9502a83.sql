-- حذف السياسات القديمة إن وجدت ثم إعادة إنشائها
DROP POLICY IF EXISTS "Users can create their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can create tenant memberships" ON tenant_members;
DROP POLICY IF EXISTS "Users can create projects in their tenant" ON ai_builder_projects;
DROP POLICY IF EXISTS "Users can create files in their tenant" ON ai_builder_files;
DROP POLICY IF EXISTS "Users can create conversations in their tenant" ON ai_builder_conversations;

-- المستخدمون يمكنهم إنشاء tenant خاص بهم
CREATE POLICY "Users can create their own tenant"
ON tenants FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

-- المستخدمون يمكنهم إنشاء tenant_member عند إنشاء tenant
CREATE POLICY "Users can create tenant memberships"
ON tenant_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_belongs_to_tenant(auth.uid(), tenant_id));

-- المستخدمون يمكنهم إنشاء مشاريع في tenant الخاص بهم
CREATE POLICY "Users can create projects in their tenant"
ON ai_builder_projects FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))
);

-- المستخدمون يمكنهم إنشاء ملفات في مشاريعهم
CREATE POLICY "Users can create files in their tenant"
ON ai_builder_files FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

-- المستخدمون يمكنهم إنشاء محادثات في مشاريعهم
CREATE POLICY "Users can create conversations in their tenant"
ON ai_builder_conversations FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);