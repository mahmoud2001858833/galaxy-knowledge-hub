-- سجل كل امتحان يُنشأ (حتى لو نُزّل PDF فقط) + رؤية الأدمن لكل الامتحانات والنتائج.

create table if not exists public.exam_history (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 300),
  subject         text,
  grade           text,
  question_count  integer not null default 0,
  sources         jsonb not null default '[]'::jsonb,   -- [{kind:'library',id,title} | {kind:'upload',name,size}]
  request         text,                                  -- الطلب الخاص للمعلم
  options         jsonb not null default '{}'::jsonb,    -- الأعداد، الصعوبة، اللغة، التوزيع...
  exam            jsonb not null,                        -- الأسئلة (بدون صور مضمّنة)
  online_exam_id  uuid references public.online_exams(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists exam_history_owner_idx on public.exam_history(owner_id, created_at desc);
create index if not exists exam_history_created_idx on public.exam_history(created_at desc);

alter table public.exam_history enable row level security;

drop policy if exists "history owner all" on public.exam_history;
create policy "history owner all" on public.exam_history
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "history admin read" on public.exam_history;
create policy "history admin read" on public.exam_history
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "history admin delete" on public.exam_history;
create policy "history admin delete" on public.exam_history
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- الأدمن يرى كل الامتحانات الإلكترونية ونتائجها، ويتحكم بفتحها/إغلاقها وحذفها
drop policy if exists "online exams admin read" on public.online_exams;
create policy "online exams admin read" on public.online_exams
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "online exams admin update" on public.online_exams;
create policy "online exams admin update" on public.online_exams
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "online exams admin delete" on public.online_exams;
create policy "online exams admin delete" on public.online_exams
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "submissions admin read" on public.online_exam_submissions;
create policy "submissions admin read" on public.online_exam_submissions
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- قائمة الأدمن: اسم وبريد صاحب الامتحان + حالة الرابط وعدد التسليمات.
-- SECURITY DEFINER لأن البريد في auth.users؛ وتعيد صفراً من الصفوف لغير الأدمن.
create or replace function public.admin_exam_history(_limit integer default 100, _offset integer default 0)
returns table (
  id uuid, owner_id uuid, owner_name text, owner_email text,
  title text, subject text, grade text, question_count integer,
  sources jsonb, request text, online_exam_id uuid, online_token text,
  online_active boolean, submissions bigint, created_at timestamptz, total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    h.id, h.owner_id,
    coalesce(nullif(p.full_name, ''), p.username) as owner_name,
    u.email::text as owner_email,
    h.title, h.subject, h.grade, h.question_count, h.sources, h.request,
    h.online_exam_id, oe.token as online_token, oe.is_active as online_active,
    (select count(*) from public.online_exam_submissions s where s.exam_id = h.online_exam_id) as submissions,
    h.created_at,
    count(*) over () as total_count
  from public.exam_history h
  left join public.profiles p on p.id = h.owner_id
  left join auth.users u on u.id = h.owner_id
  left join public.online_exams oe on oe.id = h.online_exam_id
  where public.has_role(auth.uid(), 'admin')
  order by h.created_at desc
  limit least(greatest(_limit, 1), 500) offset greatest(_offset, 0);
$$;

revoke all on function public.admin_exam_history(integer, integer) from public, anon;
grant execute on function public.admin_exam_history(integer, integer) to authenticated;
