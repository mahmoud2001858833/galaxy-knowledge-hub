
-- =====================================================
-- Security fixes batch
-- =====================================================

-- 1. Fix broken RLS on private_chat_participants (self-comparison bug)
DROP POLICY IF EXISTS "يمكن للمستخدمين رؤية المشاركين في " ON public.private_chat_participants;
CREATE POLICY "Users can view participants in their chats"
ON public.private_chat_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.private_chat_participants p1
    WHERE p1.chat_id = private_chat_participants.chat_id
      AND p1.user_id = auth.uid()
  )
);

-- 2. Fix broken RLS on private_messages (self-comparison bug) -- SELECT + INSERT
DROP POLICY IF EXISTS "يمكن للمستخدمين قراءة رسائل المحا" ON public.private_messages;
DROP POLICY IF EXISTS "يمكن للمستخدمين إضافة رسائل في الم" ON public.private_messages;

CREATE POLICY "Users can read messages in their chats"
ON public.private_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.private_chat_participants p
    WHERE p.chat_id = private_messages.chat_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their chats"
ON public.private_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.private_chat_participants p
    WHERE p.chat_id = private_messages.chat_id
      AND p.user_id = auth.uid()
  )
);

-- 3. Restrict contact_messages DELETE to admins only
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Restrict jordanian_conversations to owner (user_id is text, cast)
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.jordanian_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.jordanian_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.jordanian_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.jordanian_conversations;

CREATE POLICY "Users view own conversations"
ON public.jordanian_conversations
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users create own conversations"
ON public.jordanian_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users update own conversations"
ON public.jordanian_conversations
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users delete own conversations"
ON public.jordanian_conversations
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- 5. Restrict builder_app_users SELECT to project owner only (don't expose password_hash + email publicly)
DROP POLICY IF EXISTS "Anyone can read users of published projects" ON public.builder_app_users;
-- "Project owners can manage users" already exists and covers SELECT for owners

-- 6. Storage ownership verification on UPDATE/DELETE for user-owned buckets
-- project-images
DROP POLICY IF EXISTS "Users can update their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;
CREATE POLICY "Owner update project images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete project images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- lesson-videos
DROP POLICY IF EXISTS "Teachers can update their own lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their own lesson videos" ON storage.objects;
CREATE POLICY "Owner update lesson videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'lesson-videos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'lesson-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete lesson videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'lesson-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- tawjihi-files
DROP POLICY IF EXISTS "Users can update their own tawjihi files in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own tawjihi files in storage" ON storage.objects;
CREATE POLICY "Owner update tawjihi files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tawjihi-files' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'tawjihi-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete tawjihi files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tawjihi-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- grammar-files
DROP POLICY IF EXISTS "Users can update their own grammar files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own grammar files" ON storage.objects;
CREATE POLICY "Owner update grammar files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'grammar-files' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'grammar-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete grammar files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'grammar-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 7. Set search_path on all functions missing it
ALTER FUNCTION public.update_jordanian_content_updated_at() SET search_path = public;
ALTER FUNCTION public.update_jordanian_conversation_timestamp() SET search_path = public;
ALTER FUNCTION public.update_jordanian_users_updated_at() SET search_path = public;
ALTER FUNCTION public.update_accessibility_settings_updated_at() SET search_path = public;
ALTER FUNCTION public.update_art_projects_updated_at() SET search_path = public;
ALTER FUNCTION public.update_teacher_projects_updated_at() SET search_path = public;
ALTER FUNCTION public.auto_create_builder_settings() SET search_path = public;
ALTER FUNCTION public.update_builder_updated_at() SET search_path = public;
ALTER FUNCTION public.update_ai_builder_updated_at() SET search_path = public;
ALTER FUNCTION public.update_tenant_updated_at() SET search_path = public;
