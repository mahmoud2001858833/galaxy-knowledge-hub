-- RLS lockdown: messaging tables
-- Each table had a "Public access for X" (ALL, true/true for anon) policy, and messages /
-- group_messages also had "Allow all for X". Together they let anyone holding the anon key
-- read every DM, post as any user, and edit or delete any message or contact list.
-- The scoped policies that remain already match how the chat UI queries these tables:
--   messages:        read own DMs (sender/receiver) + room messages; insert as self
--   group_messages:  read (authenticated); insert as self
--   group_chats:     read (authenticated)
--   contacts:        read/insert own
--   private_*:       participant-scoped (tables currently unused by the app)

DROP POLICY IF EXISTS "Public access for messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all for messages" ON public.messages;
DROP POLICY IF EXISTS "Public access for group_messages" ON public.group_messages;
DROP POLICY IF EXISTS "Allow all for group_messages" ON public.group_messages;
DROP POLICY IF EXISTS "Public access for group_chats" ON public.group_chats;
DROP POLICY IF EXISTS "Public access for contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public access for private_messages" ON public.private_messages;
DROP POLICY IF EXISTS "Public access for private_chats" ON public.private_chats;
DROP POLICY IF EXISTS "Public access for private_chat_participants" ON public.private_chat_participants;
