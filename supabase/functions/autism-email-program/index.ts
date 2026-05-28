// Sends an email with the autism therapy program link after generation.
// Uses Resend with the platform's brand colors.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  to: string;
  child_name: string;
  program_title: string;
  program_summary?: string;
  total_days?: number;
  share_url: string;
  calendar_url?: string;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string));
}

function buildHtml(p: Payload): string {
  const title = `برنامج علاجي جديد — ${escapeHtml(p.child_name)}`;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f6f4ff;padding:24px;color:#1f1147">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(124,58,237,0.10)">
      <div style="background:linear-gradient(135deg,#7c3aed 0%,#ec4899 100%);padding:28px;color:#fff;text-align:center">
        <div style="font-size:13px;opacity:.95;letter-spacing:1px">منصة دامج · نظام التوحّد الذكي</div>
        <h1 style="margin:8px 0 0;font-size:24px;font-weight:800">🎉 جاهز برنامج ${escapeHtml(p.child_name)}!</h1>
      </div>
      <div style="padding:28px">
        <p style="font-size:15px;line-height:1.8;color:#3b2f5e;margin:0 0 16px">
          تم بنجاح إنشاء البرنامج العلاجي المخصّص <strong>${escapeHtml(p.program_title)}</strong>
          ${p.total_days ? `لمدة <strong>${p.total_days} يوماً</strong>` : ''}.
          البرنامج يحتوي على ألعاب يومية تفاعلية مدروسة، مع تقارير سلوكية يومية بالذكاء الاصطناعي.
        </p>

        ${p.program_summary ? `<div style="background:#faf7ff;border-right:4px solid #7c3aed;padding:14px 16px;border-radius:10px;color:#3b2f5e;line-height:1.8;margin-bottom:20px;font-size:14px">${escapeHtml(p.program_summary)}</div>` : ''}

        <div style="text-align:center;margin:28px 0">
          <a href="${escapeHtml(p.share_url)}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;font-size:15px;box-shadow:0 8px 20px rgba(124,58,237,0.25)">
            🔗 فتح صفحة متابعة الطفل
          </a>
        </div>

        ${p.calendar_url ? `<div style="text-align:center;margin:0 0 18px">
          <a href="${escapeHtml(p.calendar_url)}" style="display:inline-block;padding:10px 22px;background:#ffffff;color:#7c3aed;text-decoration:none;border:2px solid #ddd6fe;border-radius:12px;font-weight:bold;font-size:13px">
            📅 فتح جدول الأيام (للمشرف)
          </a>
        </div>` : ''}

        <div style="background:#fef9c3;border-radius:12px;padding:14px 16px;color:#713f12;font-size:13px;line-height:1.7;margin-top:18px">
          💡 احفظ هذا الإيميل! الرابط يفتح من أي جهاز ويُظهر تقدّم الطفل لحظة بلحظة.
        </div>

        <p style="margin-top:28px;padding-top:18px;border-top:1px solid #ede9fe;font-size:11px;color:#9ca3af;text-align:center;line-height:1.7">
          هذا التقرير تلقائي من منصة دامج لدعم التوحّد. ليس بديلاً عن التقييم الإكلينيكي.<br>
          تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين.
        </p>
      </div>
    </div>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = await req.json() as Payload;
    if (!body?.to || !body?.share_url || !body?.child_name) {
      return new Response(JSON.stringify({ error: 'to, share_url, child_name required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!/^\S+@\S+\.\S+$/.test(body.to)) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = `🎉 برنامج علاج التوحّد جاهز — ${body.child_name}`;
    const html = buildHtml(body);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'دامج التوحّد <onboarding@resend.dev>',
        to: [body.to],
        subject,
        html,
      }),
    });
    const out = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('Resend error', resp.status, out);
      return new Response(JSON.stringify({ error: out?.message || 'resend_failed', detail: out }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true, message_id: out?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('autism-email-program error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
