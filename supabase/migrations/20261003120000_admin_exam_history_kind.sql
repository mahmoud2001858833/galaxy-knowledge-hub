-- يضيف نوع السجل (امتحان / بنك أسئلة) إلى قائمة الأدمن.
drop function if exists public.admin_exam_history(integer, integer);

create or replace function public.admin_exam_history(_limit integer default 100, _offset integer default 0)
returns table (
  id uuid, owner_id uuid, owner_name text, owner_email text,
  title text, subject text, grade text, question_count integer,
  sources jsonb, request text, online_exam_id uuid, online_token text,
  online_active boolean, submissions bigint, created_at timestamptz, total_count bigint, kind text
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
    count(*) over () as total_count,
    coalesce(h.options ->> 'kind', 'exam') as kind
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
