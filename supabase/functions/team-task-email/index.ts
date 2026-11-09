// Emails a newly assigned team task to the people it is for (Resend).
//
// Two ways in:
// - { task_id }: called by the principal/supervisor right after creating a task that starts now.
//   The caller must be a team lead (principal or supervisor).
// - { scheduled: true }: called every minute by pg_cron (team_dispatch_scheduled_tasks). It claims the
//   scheduled tasks whose publish_at has come and that were not sent yet (sets emailed_at), then emails
//   them. Safe to call by anyone: it only ever sends a due task once.
// Recipients: the assigned member, or every member holding the task's role when it is open to anyone in that role.
//
// Sender: TEAM_EMAIL_FROM (e.g. "ذروة العلم <tasks@althrow.com>", on a domain verified in Resend).
// Without a verified domain Resend only delivers to the Resend account's own address; such failures
// come back as reason "domain_unverified" so the page can say so.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const ROLE_LABELS: Record<string, string> = {
  principal: 'الرئيس',
  supervisor: 'المشرف',
  speaker: 'المتكلم',
  page_manager: 'مسؤول الصفحة',
  auditor: 'المدقق',
  ai_manager: 'مسؤول الذكاء الاصطناعي',
  file_manager: 'مسؤول رفع الملفات',
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const nl = (s: string) => esc(s).replace(/\n/g, '<br>');

function html(t: { title: string; details: string | null; role: string; due_at: string | null; extra: string[] }, to: string, from: string, site: string) {
  const due = t.due_at
    ? new Date(t.due_at).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'full', timeStyle: 'short' })
    : 'بدون موعد محدد';
  const reqs = t.extra.length
    ? `<h3 style="margin:20px 0 8px;font-size:15px">متطلبات إضافية</h3><ul style="margin:0;padding-right:18px;color:#334155">${t.extra.map((r) => `<li style="margin:4px 0">${esc(r)}</li>`).join('')}</ul>`
    : '';
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(t.title)}</title></head>
<body style="margin:0;background:#f1f5f9;padding:24px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#0f172a">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#2563eb,#0ea5e9);padding:22px 24px;color:#fff">
      <div style="font-size:13px;opacity:.9">ذروة العلم · مهمة جديدة لـ ${esc(to)}</div>
      <h1 style="margin:6px 0 0;font-size:21px;line-height:1.5">${esc(t.title)}</h1>
    </div>
    <div style="padding:24px">
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#64748b;width:110px">الدور</td><td style="padding:6px 0;font-weight:bold">${esc(ROLE_LABELS[t.role] ?? t.role)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">الموعد</td><td style="padding:6px 0;font-weight:bold">${esc(due)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">من</td><td style="padding:6px 0">${esc(from)}</td></tr>
      </table>
      ${t.details ? `<h3 style="margin:20px 0 8px;font-size:15px">التفاصيل</h3><div style="line-height:1.9;color:#334155">${nl(t.details)}</div>` : ''}
      ${reqs}
      <div style="margin-top:26px;text-align:center">
        <a href="${site}/team" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:12px">فتح لوحة الموظفين</a>
      </div>
    </div>
    <div style="padding:14px 24px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center">وصلتك هذه الرسالة لأنك عضو في فريق ذروة العلم.</div>
  </div>
</body></html>`;
}

type Task = {
  id: string;
  title: string;
  details: string | null;
  assignee_role: string;
  assignee_user_id: string | null;
  due_at: string | null;
  extra_requirements: string[] | null;
  created_at: string;
  created_by: string | null;
  publish_at: string | null;
  status: string;
};
const TASK_COLUMNS = 'id, status, title, details, assignee_role, assignee_user_id, due_at, extra_requirements, created_at, created_by, publish_at';

type Service = ReturnType<typeof createClient>;

async function sendTask(service: Service, task: Task, fromLabel: string) {
  const sent: string[] = [];
  const failed: { email: string; reason: string; detail?: string }[] = [];

  let q = service.from('team_members').select('user_id, email, display_name, role').eq('role', task.assignee_role);
  if (task.assignee_user_id) q = q.eq('user_id', task.assignee_user_id);
  const { data: members } = await q;
  const recipients = [...new Map((members ?? []).map((m) => [m.email.toLowerCase(), m])).values()];
  if (!recipients.length) return { sent, failed, note: 'no recipients' };

  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return { sent, failed, error: 'RESEND_API_KEY is not set' };
  const from = Deno.env.get('TEAM_EMAIL_FROM') ?? 'ذروة العلم <onboarding@resend.dev>';
  const site = (Deno.env.get('SITE_URL') ?? 'https://althrow.com').replace(/\/$/, '');

  for (const r of recipients) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [r.email],
        subject: `مهمة جديدة: ${task.title}`,
        html: html(
          { title: task.title, details: task.details, role: task.assignee_role, due_at: task.due_at, extra: task.extra_requirements ?? [] },
          r.display_name || ROLE_LABELS[r.role] || r.email,
          fromLabel,
          site,
        ),
      }),
    });
    if (res.ok) sent.push(r.email);
    else {
      const text = await res.text();
      failed.push({
        email: r.email,
        reason: /testing emails|verify a domain|domain is not verified/i.test(text) ? 'domain_unverified' : 'send_failed',
        detail: text.slice(0, 300),
      });
    }
  }
  return { sent, failed };
}

const leadLabel = async (service: Service, userId: string | null) => {
  if (!userId) return 'الإدارة';
  const { data } = await service.from('team_members').select('role, display_name').eq('user_id', userId);
  const lead = (data ?? []).find((r) => r.role === 'principal' || r.role === 'supervisor');
  return lead ? lead.display_name || ROLE_LABELS[lead.role] : 'الإدارة';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  let body: { task_id?: string; scheduled?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  // ------------------------------------------------ scheduled tasks whose time has come (pg_cron)
  if (body.scheduled === true) {
    const now = new Date().toISOString();
    // claim first, so an overlapping run cannot send the same task twice
    const { data: due, error } = await service
      .from('team_tasks')
      .update({ emailed_at: now })
      .not('publish_at', 'is', null)
      .lte('publish_at', now)
      .is('emailed_at', null)
      .select(TASK_COLUMNS);
    if (error) return json({ error: error.message }, 500);
    const results = [];
    for (const task of (due ?? []) as Task[]) {
      if (task.status === 'done') continue; // finished before its time: nothing to send
      results.push({ task_id: task.id, ...(await sendTask(service, task, await leadLabel(service, task.created_by))) });
    }
    return json({ ok: true, results });
  }

  // ------------------------------------------------ a task a lead just created
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await service.auth.getUser(token);
  if (!auth?.user) return json({ error: 'unauthorized' }, 401);
  if (!body.task_id || !/^[0-9a-f-]{36}$/.test(body.task_id)) return json({ error: 'bad request' }, 400);

  const { data: myRoles } = await service.from('team_members').select('role, display_name').eq('user_id', auth.user.id);
  const lead = (myRoles ?? []).find((r) => r.role === 'principal' || r.role === 'supervisor');
  if (!lead) return json({ error: 'leads only' }, 403);

  const { data: task } = await service.from('team_tasks').select(TASK_COLUMNS).eq('id', body.task_id).maybeSingle();
  if (!task) return json({ error: 'task not found' }, 404);
  // only for a task just created, so this cannot be used to spam the team with old tasks
  if (Date.now() - new Date(task.created_at).getTime() > 10 * 60 * 1000) return json({ error: 'task is not new' }, 409);
  // a scheduled task is emailed by the scheduler at its time, not now
  if (task.publish_at && new Date(task.publish_at).getTime() > Date.now()) return json({ error: 'task is scheduled' }, 409);

  await service.from('team_tasks').update({ emailed_at: new Date().toISOString() }).eq('id', task.id);
  const result = await sendTask(service, task as Task, lead.display_name || ROLE_LABELS[lead.role]);
  if ('error' in result && result.error) return json({ error: result.error }, 412);
  return json({ ok: true, ...result });
});
