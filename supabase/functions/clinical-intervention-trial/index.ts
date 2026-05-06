// Free-form intervention trial: student picks (or types) any intervention and AI simulates the patient's response.
import { corsHeaders, callGemini, getUserId, rest, svcHeaders } from '../_shared/gemini.ts';

const SYSTEM = `أنت محرّك محاكاة سريرية تعليمي للتربية الخاصة.
عند تطبيق تدخّل (دواء/علاج سلوكي/وسيلة حسّية/إجراء تربوي/AAC/وسيلة بصرية أو سمعية) على المريض الافتراضي:
- التزم بدقّة ملف المريض (السن، الفئة، الشدة، الحساسيات، الموانع).
- قدّر الاستجابة قصيرة وطويلة المدى بشكل واقعي ومستند للأدلة.
- اذكر تحذيرات أمان وموانع استعمال صريحة لأي دواء أو إجراء حسّاس.
- أرفق تفسيراً سريرياً مختصراً ومراجع موثوقة (DSM-5-TR, AAP, NICE, WHO, Cochrane).
- لا تكتب تشخيصاً قاطعاً ولا وصفة طبية. هذه محاكاة تعليمية فقط.
أرجِع JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    patient_say_ar: { type: 'string' },
    behavior_change_ar: { type: 'string' },
    immediate_metrics: {
      type: 'object',
      properties: {
        attention: { type: 'integer' },
        anxiety: { type: 'integer' },
        progress: { type: 'integer' },
        alertness: { type: 'integer' },
        therapeutic_response: { type: 'integer' },
      },
      required: ['attention','anxiety','progress'],
    },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          t: { type: 'string' },
          attention: { type: 'integer' },
          anxiety: { type: 'integer' },
          progress: { type: 'integer' },
          symptoms_ar: { type: 'string' },
        },
        required: ['t','attention','anxiety','progress','symptoms_ar'],
      },
    },
    side_effects_ar: { type: 'array', items: { type: 'string' } },
    safety_warnings_ar: { type: 'array', items: { type: 'string' } },
    clinical_explanation_ar: { type: 'string' },
    references_ar: { type: 'array', items: { type: 'string' } },
    success_score: { type: 'integer' },
  },
  required: ['patient_say_ar','behavior_change_ar','immediate_metrics','timeline','clinical_explanation_ar','success_score'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { sessionId, interventionId, customLabel, category, params, apply } = await req.json();
    if (!sessionId) return new Response(JSON.stringify({ error: 'sessionId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!interventionId && !customLabel) return new Response(JSON.stringify({ error: 'intervention required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Load session
    const sRes = await fetch(rest(`/clinical_sessions?id=eq.${sessionId}&select=*`), { headers: svcHeaders() });
    const [session] = await sRes.json();
    if (!session || session.user_id !== userId)
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const [cRes, pRes, iRes] = await Promise.all([
      fetch(rest(`/clinical_cases?id=eq.${session.case_id}&select=*`), { headers: svcHeaders() }),
      session.protocol_id
        ? fetch(rest(`/clinical_protocols?id=eq.${session.protocol_id}&select=*`), { headers: svcHeaders() })
        : Promise.resolve(new Response('[]')),
      interventionId
        ? fetch(rest(`/clinical_interventions_catalog?id=eq.${interventionId}&select=*`), { headers: svcHeaders() })
        : Promise.resolve(new Response('[]')),
    ]);
    const [c] = await cRes.json();
    const pArr = await (pRes as Response).json();
    const fi = session.free_intent || {};
    const p = pArr[0] || { name_ar: session.mode === 'free' ? `تجربة حرّة: ${fi.title || ''}` : '—' };
    const interv = interventionId ? (await (iRes as Response).json())[0] : null;

    const interventionLabel = interv?.name_ar || customLabel || 'تدخّل غير محدّد';
    const cat = interv?.category || category || 'custom';

    const prompt = `المريض: ${c.name_ar} (${c.age_years} سنة، ${c.gender}، شدة ${c.severity}، فئة ${c.category}).
شخصية المريض: ${c.patient_persona_ar}
الملف الحسّي: ${JSON.stringify(c.sensory_profile)}
العلامات الحالية: ${JSON.stringify(c.presenting_signs_ar)}

البروتوكول الجاري: ${p.name_ar}
المؤشرات الحالية: انتباه ${session.attention} • قلق ${session.anxiety} • تقدّم ${session.progress}

التدخّل المُطبَّق الآن:
- النوع: ${cat}
- الاسم: ${interventionLabel}
- المعاملات (جرعة/تكرار/مدة/شدة): ${JSON.stringify(params || {})}
${interv ? `- آلية معروفة: ${interv.mechanism_ar}\n- موانع: ${JSON.stringify(interv.contraindications_ar)}\n- أدلّة: ${interv.evidence_level}` : ''}

المطلوب: محاكاة استجابة المريض الفعلية الآن، ثم خط زمني للتأثير عند: "15 دقيقة"، "1 ساعة"، "1 يوم"، "1 أسبوع".
- immediate_metrics: قيم مطلقة 0-100 بعد التدخّل مباشرة.
- success_score: 0-100 لمدى مناسبة هذا التدخّل لهذه الحالة بهذه المعاملات.
- safety_warnings_ar: حذّر صراحة من أي جرعة زائدة، تفاعل، خطر حسّي/سلوكي.`;

    const result = await callGemini(SYSTEM, prompt, SCHEMA);

    // Persist trial
    const insertTrial = await fetch(rest('/clinical_intervention_trials'), {
      method: 'POST',
      headers: svcHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({
        session_id: sessionId, user_id: userId,
        intervention_id: interventionId || null,
        category: cat,
        custom_label: interv ? null : (customLabel || null),
        params: params || {},
        ai_response: result,
        applied_to_session: !!apply,
      }),
    });
    const trialRows = await insertTrial.json();
    const trial = trialRows?.[0];

    // Optionally apply to live session
    if (apply) {
      const m = result.immediate_metrics || {};
      const newAttention = Math.max(0, Math.min(100, Number(m.attention ?? session.attention)));
      const newAnxiety   = Math.max(0, Math.min(100, Number(m.anxiety   ?? session.anxiety)));
      const newProgress  = Math.max(0, Math.min(100, Number(m.progress  ?? session.progress)));
      const t_ms = Date.now() - new Date(session.started_at).getTime();

      await fetch(rest('/clinical_session_events'), {
        method: 'POST', headers: svcHeaders(),
        body: JSON.stringify([
          {
            session_id: sessionId, t_ms, actor: 'student', event_type: 'intervention',
            payload: { action: `طبّق تدخّلاً: ${interventionLabel}`, params },
            attention: session.attention, anxiety: session.anxiety, progress: session.progress,
          },
          {
            session_id: sessionId, t_ms: t_ms + 1, actor: 'patient', event_type: 'say',
            payload: { say: result.patient_say_ar, action: result.behavior_change_ar },
            attention: newAttention, anxiety: newAnxiety, progress: newProgress,
          },
          {
            session_id: sessionId, t_ms: t_ms + 2, actor: 'system', event_type: 'clinical_note',
            payload: { note: result.clinical_explanation_ar, warnings: result.safety_warnings_ar, score: result.success_score },
            attention: newAttention, anxiety: newAnxiety, progress: newProgress,
          },
        ]),
      });
      await fetch(rest(`/clinical_sessions?id=eq.${sessionId}`), {
        method: 'PATCH', headers: svcHeaders(),
        body: JSON.stringify({ attention: newAttention, anxiety: newAnxiety, progress: newProgress }),
      });
    }

    return new Response(JSON.stringify({ trial, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('clinical-intervention-trial', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
