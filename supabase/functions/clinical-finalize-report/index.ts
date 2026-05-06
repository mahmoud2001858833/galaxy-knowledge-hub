// Generate the final clinical report from all session events.
import { corsHeaders, callGemini, getUserId, rest, svcHeaders } from '../_shared/gemini.ts';

const SYSTEM = `أنت أخصائي إكلينيكي مرجعي. تكتب تقريراً سريرياً نهائياً لمحاكاة قام بها طالب بحث.
- لا تشخّص قطعياً، استخدم لغة "مرجّح/يتوافق مع".
- اربط ملاحظاتك بأحداث الجلسة الفعلية.
- اقترح توصيات قابلة للتنفيذ ومراجع علمية (DSM-5-TR, ICF-CY, WHO, ABA literature).
- اللغة عربية فصحى مهنية.
أرجِع JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer' },
    diagnosis_ar: { type: 'string' },
    summary_ar: { type: 'string' },
    strengths_ar: { type: 'array', items: { type: 'string' } },
    weaknesses_ar: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    references_ar: { type: 'array', items: { type: 'string' } },
    rubric: {
      type: 'object',
      properties: {
        communication: { type: 'integer' },
        attention: { type: 'integer' },
        affect: { type: 'integer' },
        compliance: { type: 'integer' },
        sensory: { type: 'integer' },
      },
      required: ['communication','attention','affect','compliance','sensory'],
    },
  },
  required: ['score','summary_ar','strengths_ar','weaknesses_ar','recommendations_ar','references_ar','rubric'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { sessionId } = await req.json();
    if (!sessionId) return new Response(JSON.stringify({ error: 'sessionId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const sRes = await fetch(rest(`/clinical_sessions?id=eq.${sessionId}&select=*`), { headers: svcHeaders() });
    const [session] = await sRes.json();
    if (!session || session.user_id !== userId)
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const [cRes, pRes, eRes] = await Promise.all([
      fetch(rest(`/clinical_cases?id=eq.${session.case_id}&select=*`), { headers: svcHeaders() }),
      session.protocol_id
        ? fetch(rest(`/clinical_protocols?id=eq.${session.protocol_id}&select=*`), { headers: svcHeaders() })
        : Promise.resolve(new Response('[]')),
      fetch(rest(`/clinical_session_events?session_id=eq.${sessionId}&order=t_ms.asc&select=*`), { headers: svcHeaders() }),
    ]);
    const [c] = await cRes.json();
    const pArr = await (pRes as Response).json();
    const fi = session.free_intent || {};
    const p = pArr[0] || { name_ar: 'تجربة حرّة', short_ar: fi.title || '' };
    const events = await eRes.json();

    const log = events.map((e: any) => `t=${e.t_ms}ms [${e.actor}/${e.event_type}] ${JSON.stringify(e.payload).slice(0, 200)} | A=${e.attention} X=${e.anxiety} P=${e.progress}`).join('\n');

    const prompt = `الحالة: ${c.name_ar} (${c.age_years} سنة، ${c.gender}، فئة ${c.category}، شدة ${c.severity})
الملخص: ${c.summary_ar}
البروتوكول: ${p.name_ar} — ${p.short_ar}${session.mode === 'free' ? `\nنمط: تجربة حرّة. التدخّل: ${fi.title || ''} ${fi.details ? '— ' + fi.details : ''} ${fi.dose ? '• جرعة ' + fi.dose : ''} ${fi.duration ? '• مدّة ' + fi.duration : ''}` : ''}
المؤشرات النهائية: انتباه ${session.attention} • قلق ${session.anxiety} • تقدّم ${session.progress}

سجل الجلسة الكامل:
${log.slice(0, 8000)}

اكتب تقريراً سريرياً شاملاً مبنياً على هذه الأحداث. score = 0-100 يعكس جودة تطبيق الطالب للبروتوكول وملاءمة تدخلاته.`;

    const result = await callGemini(SYSTEM, prompt, SCHEMA);

    // Upsert report
    const insertResp = await fetch(rest('/clinical_reports?on_conflict=session_id'), {
      method: 'POST',
      headers: svcHeaders({ Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify({
        user_id: userId, session_id: sessionId,
        score: Math.max(0, Math.min(100, result.score || 0)),
        diagnosis_ar: result.diagnosis_ar ?? null,
        summary_ar: result.summary_ar,
        strengths_ar: result.strengths_ar ?? [],
        weaknesses_ar: result.weaknesses_ar ?? [],
        recommendations_ar: result.recommendations_ar ?? [],
        references_ar: result.references_ar ?? [],
        rubric: result.rubric ?? {},
      }),
    });
    if (!insertResp.ok) throw new Error(`insert report ${insertResp.status}: ${await insertResp.text()}`);
    const [report] = await insertResp.json();

    await fetch(rest(`/clinical_sessions?id=eq.${sessionId}`), {
      method: 'PATCH', headers: svcHeaders(),
      body: JSON.stringify({ status: 'completed', ended_at: new Date().toISOString() }),
    });

    return new Response(JSON.stringify({ reportId: report.id, shareToken: report.share_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('clinical-finalize-report', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
