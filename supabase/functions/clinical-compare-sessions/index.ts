// Compare multiple completed sessions for the same student. Returns analytical comparison.
import { corsHeaders, callGemini, getUserId, rest, svcHeaders } from '../_shared/gemini.ts';

const SYSTEM = `أنت محلل سريري. تقارن عدة جلسات محاكاة قام بها طالب لتُظهر تطوّر مهاراته السريرية.
أرجِع JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    title_ar: { type: 'string' },
    overall_trend_ar: { type: 'string' },
    insights_ar: { type: 'array', items: { type: 'string' } },
    next_focus_ar: { type: 'array', items: { type: 'string' } },
    radar: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dimension: { type: 'string' },
          values: { type: 'array', items: { type: 'integer' } },
        },
        required: ['dimension','values'],
      },
    },
  },
  required: ['title_ar','overall_trend_ar','insights_ar','next_focus_ar','radar'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { sessionIds } = await req.json();
    if (!Array.isArray(sessionIds) || sessionIds.length < 2)
      return new Response(JSON.stringify({ error: 'يلزم اختيار جلستين على الأقل' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const ids = sessionIds.map(String).join(',');
    const rRes = await fetch(rest(`/clinical_reports?session_id=in.(${ids})&select=*,clinical_sessions(case_id,protocol_id,started_at,attention,anxiety,progress)`), { headers: svcHeaders() });
    const reports = await rRes.json();
    const owned = reports.filter((r: any) => r.user_id === userId);
    if (owned.length < 2) return new Response(JSON.stringify({ error: 'لا توجد تقارير كافية' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const summary = owned.map((r: any, i: number) =>
      `جلسة #${i + 1}: درجة ${Math.round(r.score)}، ${r.summary_ar?.slice(0, 200)}، rubric=${JSON.stringify(r.rubric)}`,
    ).join('\n');

    const prompt = `قارن الجلسات التالية للطالب نفسه واكتب تحليلاً مقارناً:\n${summary}\n\nradar يجب أن يحتوي 5 أبعاد: التواصل، الانتباه، الوجدان، الالتزام، التنظيم الحسّي. كل dimension.values بنفس عدد الجلسات وبالترتيب نفسه.`;

    const result = await callGemini(SYSTEM, prompt, SCHEMA);
    return new Response(JSON.stringify({ reports: owned, analysis: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('clinical-compare-sessions', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
