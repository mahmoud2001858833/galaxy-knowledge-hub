// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY غير مهيأ");

    const { reportId, toEmails, note } = await req.json();
    if (!reportId) throw new Error("reportId مطلوب");
    if (!Array.isArray(toEmails) || toEmails.length === 0) throw new Error("toEmails مطلوب");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: r, error } = await sb
      .from("clinical_reports")
      .select(
        "*, clinical_sessions(started_at, ended_at, clinical_cases(name_ar, age_years, category), clinical_protocols(name_ar))"
      )
      .eq("id", reportId)
      .maybeSingle();
    if (error) throw error;
    if (!r) throw new Error("التقرير غير موجود");

    const session = r.clinical_sessions;
    const caseName = session?.clinical_cases?.name_ar || "حالة سريرية";
    const protocolName = session?.clinical_protocols?.name_ar || "تجربة حرّة";
    const score = Math.round(Number(r.score) || 0);
    const scoreColor = score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
    const origin = req.headers.get("origin") || "https://galaxy-knowledge-hub.lovable.app";
    const publicUrl = r.share_token ? `${origin}/clinical/r/${r.share_token}` : null;

    const li = (arr: string[] | null | undefined) =>
      (arr || []).map((s) => `<li style="margin:4px 0;">${escapeHtml(s)}</li>`).join("");

    const rubricRows = Object.entries(r.rubric || {})
      .map(
        ([k, v]) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${escapeHtml(k)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:left;font-weight:bold;color:#0f172a;">${Math.round(Number(v) || 0)}/100</td>
        </tr>`
      )
      .join("");

    const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;padding:24px;border-radius:24px 24px 0 0;">
      <div style="font-size:12px;opacity:.85;letter-spacing:1px;">منصة دامج — مختبر المحاكاة السريرية</div>
      <h1 style="margin:8px 0 4px;font-size:22px;">التقرير السريري النهائي</h1>
      <div style="font-size:14px;opacity:.9;">${escapeHtml(caseName)} • ${escapeHtml(protocolName)}</div>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 24px 24px;border:1px solid #e2e8f0;border-top:none;">
      ${note ? `<div style="background:#f8fafc;border-right:4px solid #0ea5e9;padding:10px 14px;margin-bottom:18px;font-size:14px;color:#334155;">${escapeHtml(note)}</div>` : ""}

      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:13px;color:#64748b;">الدرجة الكلّية</div>
        <div style="font-size:42px;font-weight:800;color:${scoreColor};line-height:1;margin-top:4px;">${score}<span style="font-size:18px;color:#94a3b8;">/100</span></div>
      </div>

      ${r.diagnosis_ar ? `<div style="margin-bottom:14px;font-size:14px;"><b>الانطباع التشخيصي:</b> ${escapeHtml(r.diagnosis_ar)}</div>` : ""}
      <p style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 18px;">${escapeHtml(r.summary_ar || "")}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:18px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <thead><tr style="background:#f8fafc;"><th style="padding:8px 10px;text-align:right;font-size:12px;color:#64748b;">المحور</th><th style="padding:8px 10px;text-align:left;font-size:12px;color:#64748b;">الدرجة</th></tr></thead>
        <tbody>${rubricRows || `<tr><td colspan="2" style="padding:14px;text-align:center;font-size:12px;color:#94a3b8;">لا توجد محاور تقييم</td></tr>`}</tbody>
      </table>

      <div style="display:grid;gap:12px;margin-bottom:18px;">
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:12px;">
          <div style="font-weight:bold;color:#065f46;margin-bottom:6px;">✅ نقاط القوة</div>
          <ul style="margin:0;padding-right:18px;font-size:13px;color:#065f46;">${li(r.strengths_ar) || "<li>—</li>"}</ul>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px;">
          <div style="font-weight:bold;color:#92400e;margin-bottom:6px;">⚠️ نقاط للتطوير</div>
          <ul style="margin:0;padding-right:18px;font-size:13px;color:#92400e;">${li(r.weaknesses_ar) || "<li>—</li>"}</ul>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:12px;">
          <div style="font-weight:bold;color:#1e40af;margin-bottom:6px;">🎯 التوصيات</div>
          <ul style="margin:0;padding-right:18px;font-size:13px;color:#1e40af;">${li(r.recommendations_ar) || "<li>—</li>"}</ul>
        </div>
      </div>

      ${
        publicUrl
          ? `<div style="text-align:center;margin-top:24px;">
              <a href="${publicUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:bold;font-size:14px;">عرض التقرير الكامل</a>
            </div>`
          : ""
      }

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
        تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين • منصة دامج
      </div>
    </div>
  </div>
</body></html>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "منصة دامج <onboarding@resend.dev>",
        to: toEmails,
        subject: `تقرير سريري: ${caseName} — ${score}/100`,
        html,
      }),
    });
    const out = await resp.json();
    if (!resp.ok) throw new Error(out?.message || "تعذّر الإرسال");

    return new Response(JSON.stringify({ ok: true, id: out.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
