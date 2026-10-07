-- وكلاء الامتحانات: وكيل مختص بملفات يرفعها الأدمن. له رابط عام (يتطلب تسجيل دخول) فيه محادثة مصدرها الوحيد
-- ملفات الوكيل، وإنشاء امتحانات من هذه الملفات فقط (لا رفع من المستخدم).

create table if not exists public.exam_agents (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique check (char_length(token) between 8 and 40),
  name         text not null check (char_length(name) between 1 and 120),
  description  text check (description is null or char_length(description) <= 1000),
  subject      text,
  grade        text,
  welcome      text check (welcome is null or char_length(welcome) <= 1000),
  instructions text check (instructions is null or char_length(instructions) <= 3000), -- توجيهات إضافية من الأدمن للوكيل
  file_ids     uuid[] not null default '{}',
  is_active    boolean not null default true,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.exam_agents enable row level security;

-- الأدمن فقط يقرأ/يكتب مباشرة؛ المستخدمون يصلون عبر الرابط (RPC أدناه) فلا يمكنهم سرد كل الوكلاء.
drop policy if exists "agents admin all" on public.exam_agents;
create policy "agents admin all" on public.exam_agents
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- فهرس نصي لصفحات ملفات الوكيل (للاسترجاع في المحادثة)
create table if not exists public.exam_agent_pages (
  id        bigint generated always as identity primary key,
  agent_id  uuid not null references public.exam_agents(id) on delete cascade,
  file_id   uuid not null references public.exam_library_files(id) on delete cascade,
  page      integer not null check (page >= 1),
  content   text not null,
  norm      text not null,   -- نص مطبَّع (تشكيل/همزات/«ال») يُحسب في المتصفح ويُطابَق به الاستعلام
  tsv       tsvector generated always as (to_tsvector('simple', norm)) stored
);
create index if not exists exam_agent_pages_tsv_idx on public.exam_agent_pages using gin (tsv);
create index if not exists exam_agent_pages_agent_idx on public.exam_agent_pages (agent_id, file_id, page);

alter table public.exam_agent_pages enable row level security;
drop policy if exists "agent pages admin all" on public.exam_agent_pages;
create policy "agent pages admin all" on public.exam_agent_pages
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- هل هذا المسار ملف لوكيل فعّال؟ (SECURITY DEFINER لأن المستخدم العادي لا يقرأ exam_agents)
create or replace function public.is_agent_file(p_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.exam_agents a
    join public.exam_library_files f on f.id = any(a.file_ids)
    where a.is_active and f.storage_path = p_path
  );
$$;
create or replace function public.is_agent_file_id(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.exam_agents a where a.is_active and p_id = any(a.file_ids));
$$;

-- ملفات الوكيل تُقرأ لأي مستخدم مسجل عبر الوكيل حتى لو لم تكن «منشورة» في المكتبة العامة
drop policy if exists "library read published or admin" on public.exam_library_files;
create policy "library read published or admin" on public.exam_library_files
  for select to authenticated
  using (is_published or public.has_role(auth.uid(), 'admin') or public.is_agent_file_id(id));

drop policy if exists "library files read" on storage.objects;
create policy "library files read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exam-library'
    and (
      public.has_role(auth.uid(), 'admin')
      or exists (select 1 from public.exam_library_files f where f.storage_path = objects.name and f.is_published)
      or public.is_agent_file(objects.name)
    )
  );

-- جلب الوكيل بالرابط (مسجّلون فقط): بياناته العامة + صفوف ملفاته. لا يُرجع التوجيهات الداخلية.
create or replace function public.get_exam_agent(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare a public.exam_agents; files jsonb;
begin
  if auth.uid() is null then return null; end if;
  select * into a from public.exam_agents where token = p_token and is_active;
  if not found then return null; end if;
  select coalesce(jsonb_agg(to_jsonb(f) order by array_position(a.file_ids, f.id)), '[]'::jsonb) into files
    from public.exam_library_files f where f.id = any(a.file_ids);
  return jsonb_build_object(
    'id', a.id, 'name', a.name, 'description', a.description, 'subject', a.subject, 'grade', a.grade,
    'welcome', a.welcome, 'files', files);
end $$;
revoke all on function public.get_exam_agent(text) from public, anon;
grant execute on function public.get_exam_agent(text) to authenticated;

-- بحث في صفحات الوكيل (للدالة الطرفية بمفتاح الخدمة فقط)
create or replace function public.agent_search_pages(p_agent uuid, p_query text, p_k integer default 10)
returns table (file_id uuid, page integer, content text, rank real)
language sql stable security definer set search_path = public as $$
  select p.file_id, p.page, p.content, ts_rank_cd(p.tsv, to_tsquery('simple', p_query))::real
  from public.exam_agent_pages p
  where p.agent_id = p_agent and p.tsv @@ to_tsquery('simple', p_query)
  order by 4 desc
  limit greatest(1, least(p_k, 20));
$$;
revoke all on function public.agent_search_pages(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.agent_search_pages(uuid, text, integer) to service_role;
