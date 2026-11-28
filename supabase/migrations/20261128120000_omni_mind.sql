-- "العقل الموسوعي" (omni-mind): a unified, admin-only AI assistant grounded in uploaded reference
-- books, with image generation, mind maps, concept graphs, voice and experiment linking.
-- Admin-only for now (is_platform_admin), same RLS pattern as admin_brain_memory.

CREATE TABLE IF NOT EXISTS public.omni_mind_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS omni_mind_sessions_user_idx ON public.omni_mind_sessions (user_id, updated_at DESC);
ALTER TABLE public.omni_mind_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS omni_mind_sessions_admin ON public.omni_mind_sessions;
CREATE POLICY omni_mind_sessions_admin ON public.omni_mind_sessions FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.omni_mind_messages (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.omni_mind_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content text NOT NULL DEFAULT '',
  tool_calls jsonb,
  tool_call_id text,
  attachments jsonb, -- images / mind maps / concept graphs / experiment refs rendered inline
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS omni_mind_messages_session_idx ON public.omni_mind_messages (session_id, created_at);
ALTER TABLE public.omni_mind_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS omni_mind_messages_admin ON public.omni_mind_messages;
CREATE POLICY omni_mind_messages_admin ON public.omni_mind_messages FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
