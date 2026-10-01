-- الامتحانات الإلكترونية: جداول محمية بـ RLS.
-- الطلاب لا يقرؤون هذه الجداول مباشرة أبداً؛ يمرّون عبر الدالة online-exam (service role)
-- التي تُخفي الإجابات الصحيحة وتصحّح من جهة الخادم.

create table if not exists public.online_exams (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  token       text not null unique check (char_length(token) between 8 and 32),
  title       text not null check (char_length(title) between 1 and 300),
  subject     text,
  grade       text,
  exam        jsonb not null,                       -- الأسئلة كاملة مع الإجابات (للمالك فقط)
  settings    jsonb not null default '{}'::jsonb,   -- المدة، طريقة عرض النتيجة، الخلط...
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists online_exams_owner_idx on public.online_exams(owner_id, created_at desc);

create table if not exists public.online_exam_submissions (
  id                 uuid primary key default gen_random_uuid(),
  exam_id            uuid not null references public.online_exams(id) on delete cascade,
  student_name       text not null check (char_length(student_name) between 1 and 120),
  student_name_norm  text not null,
  student_info       jsonb not null default '{}'::jsonb,
  answers            jsonb not null default '{}'::jsonb,
  auto_score         numeric not null default 0,
  auto_total         numeric not null default 0,
  manual_pending     integer not null default 0,
  time_taken_seconds integer,
  submitted_at       timestamptz not null default now()
);

create index if not exists online_exam_submissions_exam_idx on public.online_exam_submissions(exam_id, submitted_at desc);

alter table public.online_exams enable row level security;
alter table public.online_exam_submissions enable row level security;

-- المالك فقط يدير امتحاناته
drop policy if exists "owner manages own exams" on public.online_exams;
create policy "owner manages own exams" on public.online_exams
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- المالك فقط يقرأ/يحذف تسليمات امتحاناته. لا توجد سياسة INSERT:
-- التسليم يتم حصراً عبر الدالة online-exam بصلاحية service role.
drop policy if exists "owner reads submissions" on public.online_exam_submissions;
create policy "owner reads submissions" on public.online_exam_submissions
  for select to authenticated
  using (exists (select 1 from public.online_exams e where e.id = exam_id and e.owner_id = auth.uid()));

drop policy if exists "owner deletes submissions" on public.online_exam_submissions;
create policy "owner deletes submissions" on public.online_exam_submissions
  for delete to authenticated
  using (exists (select 1 from public.online_exams e where e.id = exam_id and e.owner_id = auth.uid()));

-- حاوية صور الأشكال المقصوصة من الملف الأصلي (قراءة عامة، رفع المالك فقط داخل مجلده)
insert into storage.buckets (id, name, public)
values ('exam-figures', 'exam-figures', true)
on conflict (id) do nothing;

drop policy if exists "owners upload exam figures" on storage.objects;
create policy "owners upload exam figures" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'exam-figures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "owners delete exam figures" on storage.objects;
create policy "owners delete exam figures" on storage.objects
  for delete to authenticated
  using (bucket_id = 'exam-figures' and (storage.foldername(name))[1] = auth.uid()::text);
