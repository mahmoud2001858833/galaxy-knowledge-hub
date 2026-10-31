-- Emergency rollback for 20261101140000_rls_lockdown_messaging.sql (restores the insecure state)
CREATE POLICY "Public access for messages" ON public.messages AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public access for group_messages" ON public.group_messages AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public access for group_chats" ON public.group_chats AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public access for contacts" ON public.contacts AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public access for private_messages" ON public.private_messages AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public access for private_chats" ON public.private_chats AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public access for private_chat_participants" ON public.private_chat_participants AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for messages" ON public.messages AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for group_messages" ON public.group_messages AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
