// Sends a session/daily/weekly autism report to a parent via Resend.
// Generates an Arabic HTML email with inline SVG charts.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameSummary {
  title: string;
  accuracy: number;
  duration_sec: number;
  improvement_pct?: number | null;
}

interface Payload {
  kind: 'session' | 'daily' | 'weekly';
  child_name: string;
  parent_email: string;
  day_index?: number;
  overall_pct?: number;
  summary_ar?: string;
  strengths_ar?: string[];
  weaknesses_ar?: string[];
  recommendations_ar?: string[];
  games: GameSummary[];
}

const KIND_TITLE: Record<Payload['kind'], string> = {
  session: 'تقرير جلسة ألعاب',
  daily: 'تقرير اليوم العلاجي',
  weekly: 'تقرير الأسبوع',
};

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string));
}

function barChart(games: GameSummary[]): string {
  if (!games.length) return '';
  const W = 520, H = 220, P = 30;
  const max = 100;
  const bw = (W - P * 2) / games.length - 8;
  const bars = games.map((g, i) => {
    const acc = Math.max(0, Math.min(100, Math.round(g.accuracy * 100)));
    const h = (acc / max) * (H - P * 2);
    const x = P + i * ((W - P * 2) / games.length) + 4;
    const y = H - P - h;
    const colour = acc >= 70 ? '#10b981' : acc >= 40 ? '#f59e0b' : '#ef4444';
    const label = escapeHtml(g.title.slice(0, 10));
    return `
      <g>
        <rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6" fill="${colour}" />
        <text x="${x + bw/2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#111" font-family="Arial">${acc}%</text>
        <text x="${x + bw/2}" y="${H - 10}" text-anchor="middle" font-size="10" fill="#444" font-family="Arial">${label}</text>
      </g>`;
  }).join('');
  const gridY = [0, 25, 50, 75, 100].map((v) => {
    const y = H - P - (v / 100) * (H - P * 2);
    return `<line x1="${P}" x2="${W - P}" y1="${y}" y2="${y}" stroke="#e5e7eb" stroke-dasharray="3 3" />
            <text x="${P - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#888" font-family="Arial">${v}%</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:520px">
    <rect width="${W}" height="${H}" fill="#ffffff" rx="12"/>
    ${gridY}
    ${bars}
  </svg>`;
}

function buildHtml(p: Payload): string {
  const title = `${KIND_TITLE[p.kind]} — ${escapeHtml(p.child_name)}`;
  const overall = typeof p.overall_pct === 'number' ? Math.round(p.overall_pct) : Math.round(
    (p.games.reduce((s, g) => s + g.accuracy, 0) / Math.max(1, p.games.length)) * 100,
  );
  const chart = barChart(p.games);
  const gamesRows = p.games.map((g) => {
    const imp = g.improvement_pct;
    const impStr = typeof imp === 'number'
      ? `<span style="color:${imp >= 0 ? '#10b981' : '#ef4444'};font-weight:bold">${imp >= 0 ? '+' : ''}${imp}%</span>`
      : '<span style="color:#9ca3af">—</span>';
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9">${escapeHtml(g.title)}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${Math.round(g.accuracy * 100)}%</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${g.duration_sec}ث</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${impStr}</td>
    </tr>`;
  }).join('');
  const list = (arr?: string[]) => (arr && arr.length)
    ? `<ul style="margin:6px 0;padding-right:18px;color:#334155">${arr.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join('')}</ul>`
    : '<p style="color:#94a3b8;font-size:13px">—</p>';

  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:20px;color:#0f172a">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
      <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);padding:24px;color:#fff">
        <div style="font-size:13px;opacity:.9">منصة دامج — نظام التوحّد</div>
        <h1 style="margin:6px 0 0;font-size:22px">${escapeHtml(title)}</h1>
        ${p.day_index ? `<div style="margin-top:4px;font-size:13px;opacity:.95">اليوم رقم ${p.day_index}</div>` : ''}
      </div>
      <div style="padding:24px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
          <div style="flex:1;min-width:140px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:11px;color:#065f46">المعدّل العام</div>
            <div style="font-size:28px;font-weight:bold;color:#065f46">${overall}%</div>
          </div>
          <div style="flex:1;min-width:140px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:11px;color:#1e40af">عدد الألعاب</div>
            <div style="font-size:28px;font-weight:bold;color:#1e40af">${p.games.length}</div>
          </div>
        </div>
        ${p.summary_ar ? `<p style="background:#fefce8;border-right:4px solid #facc15;padding:12px 14px;border-radius:8px;color:#713f12;line-height:1.7">${escapeHtml(p.summary_ar)}</p>` : ''}

        <h3 style="margin:20px 0 8px;color:#7c3aed">📊 الأداء التفصيلي لكل لعبة</h3>
        ${chart}
        <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px">
          <thead><tr style="background:#f8fafc;color:#475569">
            <th style="padding:8px;text-align:right">اللعبة</th>
            <th style="padding:8px">الدقّة</th>
            <th style="padding:8px">المدة</th>
            <th style="padding:8px">التحسّن</th>
          </tr></thead>
          <tbody>${gamesRows}</tbody>
        </table>

        <div style="display:grid;grid-template-columns:1fr;gap:12px;margin-top:20px">
          <div style="background:#f0fdf4;border-radius:10px;padding:12px">
            <div style="font-weight:bold;color:#166534;margin-bottom:4px">✅ نقاط القوة</div>
            ${list(p.strengths_ar)}
          </div>
          <div style="background:#fef2f2;border-radius:10px;padding:12px">
            <div style="font-weight:bold;color:#991b1b;margin-bottom:4px">⚠️ نقاط للعمل عليها</div>
            ${list(p.weaknesses_ar)}
          </div>
          <div style="background:#eff6ff;border-radius:10px;padding:12px">
            <div style="font-weight:bold;color:#1e40af;margin-bottom:4px">💡 توصيات</div>
            ${list(p.recommendations_ar)}
          </div>
        </div>

        <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
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
    if (!body?.parent_email || !body?.games?.length) {
      return new Response(JSON.stringify({ error: 'parent_email and games required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!/^\S+@\S+\.\S+$/.test(body.parent_email)) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = `${KIND_TITLE[body.kind]} — ${body.child_name}${body.day_index ? ` (اليوم ${body.day_index})` : ''}`;
    const html = buildHtml(body);

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'دامج التوحّد <onboarding@resend.dev>',
        to: [body.parent_email],
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
    console.error('autism-email-report error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
