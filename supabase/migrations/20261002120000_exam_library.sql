-- مكتبة ملفات الامتحانات: يرفعها الأدمن ويختارها كل المستخدمين المسجلين بلا رفع.
-- الصلاحية الحقيقية = دور admin في user_roles (has_role). بوابة لوحة الأدمن في الواجهة لا تُعتمد للأمان.

create table if not exists public.exam_library_files (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 200),
  description   text check (description is null or char_length(description) <= 1000),
  subject       text,
  grade         text,
  file_name     text not null,
  storage_path  text not null unique,
  mime_type     text not null,
  size_bytes    bigint not null check (size_bytes > 0),
  page_count    integer,
  units         jsonb,        -- نتيجة تقسيم الملف إلى وحدات (تُحسب مرة عند الرفع)
  is_published  boolean not null default false,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists exam_library_files_pub_idx on public.exam_library_files(is_published, created_at desc);

alter table public.exam_library_files enable row level security;

drop policy if exists "library read published or admin" on public.exam_library_files;
create policy "library read published or admin" on public.exam_library_files
  for select to authenticated
  using (is_published or public.has_role(auth.uid(), 'admin'));

drop policy if exists "library admin insert" on public.exam_library_files;
create policy "library admin insert" on public.exam_library_files
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "library admin update" on public.exam_library_files;
create policy "library admin update" on public.exam_library_files
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "library admin delete" on public.exam_library_files;
create policy "library admin delete" on public.exam_library_files
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- حاوية خاصة (ليست public): التنزيل بروابط موقّعة قصيرة العمر للمسجلين فقط
insert into storage.buckets (id, name, public)
values ('exam-library', 'exam-library', false)
on conflict (id) do nothing;

drop policy if exists "library files read" on storage.objects;
create policy "library files read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exam-library'
    and (
      public.has_role(auth.uid(), 'admin')
      or exists (
        select 1 from public.exam_library_files f
        where f.storage_path = objects.name and f.is_published
      )
    )
  );

drop policy if exists "library files admin insert" on storage.objects;
create policy "library files admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'exam-library' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "library files admin update" on storage.objects;
create policy "library files admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'exam-library' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'exam-library' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "library files admin delete" on storage.objects;
create policy "library files admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'exam-library' and public.has_role(auth.uid(), 'admin'));
