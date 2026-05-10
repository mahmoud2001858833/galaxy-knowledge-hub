// AI-driven device usage: patient-specific reading + interpretation + safe deltas.
import { corsHeaders, callGemini, getUserId, rest, svcHeaders } from '../_shared/gemini.ts';

const SYSTEM = `أنت محرّك محاكاة طبية تعليمي. يستخدم الطالب جهازاً طبياً على المريض الافتراضي.
- اعتمد ملف المريض (السن، الجنس، التشخيص/الفئة، الشدة، العلامات الحالية) لتوليد قراءة واقعية.
- اكتب القراءة الرقمية + waveform_hint نصياً (نوع الإيقاع/الموجة) عند الانطباق.
- قدّم تفسيراً سريرياً مختصراً ونقاط شاذة وتوصيات الخطوة التالية.
- metric_deltas تعكس تأثير الإجراء على المريض (التشخيصي ≈ 0، العلاجي قد يحسّن المؤشرات).
- لا تكتب وصفة طبية حقيقية — هذه محاكاة تعليمية.
أرجِع JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    reading_ar: { type: 'string' },
    vitals: {
      type: 'object',
      properties: {
        hr: { type: 'integer' }, bp_sys: { type: 'integer' }, bp_dia: { type: 'integer' },
        spo2: { type: 'integer' }, resp: { type: 'integer' }, temp: { type: 'number' },
        glucose: { type: 'integer' },
      },
    },
    waveform_hint: { type: 'string' },
    interpretation_ar: { type: 'string' },
    abnormal_findings_ar: { type: 'array', items: { type: 'string' } },
    recommended_next_steps_ar: { type: 'array', items: { type: 'string' } },
    success_score: { type: 'integer' },
    metric_deltas: {
      type: 'object',
      properties: { attention: { type: 'integer' }, anxiety: { type: 'integer' }, progress: { type: 'integer' } },
    },
  },
  required: ['reading_ar','interpretation_ar','success_score'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { sessionId, deviceKey, params, apply } = await req.json();
    if (!sessionId || !deviceKey) return new Response(JSON.stringify({ error: 'sessionId and deviceKey required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const sRes = await fetch(rest(`/clinical_sessions?id=eq.${sessionId}&select=*`), { headers: svcHeaders() });
    const [session] = await sRes.json();
    if (!session || session.user_id !== userId)
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const [cRes, dRes] = await Promise.all([
      fetch(rest(`/clinical_cases?id=eq.${session.case_id}&select=*`), { headers: svcHeaders() }),
      fetch(rest(`/clinical_devices?key=eq.${deviceKey}&select=*`), { headers: svcHeaders() }),
    ]);
    const [c] = await cRes.json();
    const [device] = await dRes.json();
    if (!device) return new Response(JSON.stringify({ error: 'device not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const prompt = `المريض: ${c.name_ar} (${c.age_years} سنة، ${c.gender}، فئة ${c.category}، شدة ${c.severity}).
العلامات الحالية: ${JSON.stringify(c.presenting_signs_ar)}
الملف الحسّي/السريري: ${JSON.stringify(c.sensory_profile)}
المؤشرات الحالية في الجلسة: انتباه ${session.attention} • قلق ${session.anxiety} • تقدّم ${session.progress}

الجهاز المُستخدَم الآن:
- النوع: ${device.category} — ${device.name_ar}
- المعاملات: ${JSON.stringify(params || {})}
- الوصف: ${device.description_ar}

ولّد قراءة واقعية لهذا الجهاز على هذا المريض. إن كان الجهاز ECG اذكر waveform_hint مثل: "Sinus tachycardia HR 130" أو "Atrial fibrillation, irregular irregular".
متطلبات: vitals عند الانطباق فقط، success_score 0-100، metric_deltas بين -15 و +15.`;

    let result: any;
    try {
      result = await callGemini(SYSTEM, prompt, SCHEMA);
    } catch (e) {
      // Fallback so the simulator never blocks the user (e.g. AI quota / 429 / 402)
      console.warn('callGemini failed, using local fallback', e);
      result = {
        reading_ar: `قراءة محلّية افتراضية لجهاز ${device.name_ar} على ${c.name_ar}`,
        vitals: c.vitals_initial || {},
        waveform_hint: 'sinus',
        interpretation_ar: 'محاكاة محلّية بدون AI — القراءة مأخوذة من الملف المبدئي للحالة.',
        abnormal_findings_ar: [],
        recommended_next_steps_ar: ['استكمل بقية الفحوصات', 'سجّل التغيّر في علامات المريض'],
        success_score: 75,
        metric_deltas: { progress: 3 },
      };
    }

    const insertRes = await fetch(rest('/clinical_device_uses'), {
      method: 'POST', headers: svcHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({ session_id: sessionId, user_id: userId, device_key: deviceKey, params: params || {}, ai_reading: result, applied_to_session: !!apply }),
    });
    const [use] = await insertRes.json();

    if (apply) {
      const d = result.metric_deltas || {};
      const newAttention = Math.max(0, Math.min(100, Number(session.attention) + Number(d.attention || 0)));
      const newAnxiety   = Math.max(0, Math.min(100, Number(session.anxiety)   + Number(d.anxiety   || 0)));
      const newProgress  = Math.max(0, Math.min(100, Number(session.progress)  + Number(d.progress  || 0)));
      const t_ms = Date.now() - new Date(session.started_at).getTime();
      await fetch(rest('/clinical_session_events'), {
        method: 'POST', headers: svcHeaders(),
        body: JSON.stringify([
          { session_id: sessionId, t_ms, actor: 'student', event_type: 'device_use',
            payload: { action: `استخدم جهاز: ${device.name_ar}`, params },
            attention: session.attention, anxiety: session.anxiety, progress: session.progress },
          { session_id: sessionId, t_ms: t_ms + 1, actor: 'system', event_type: 'clinical_note',
            payload: { note: `${result.reading_ar} — ${result.interpretation_ar}`, vitals: result.vitals, score: result.success_score },
            attention: newAttention, anxiety: newAnxiety, progress: newProgress },
        ]),
      });
      await fetch(rest(`/clinical_sessions?id=eq.${sessionId}`), {
        method: 'PATCH', headers: svcHeaders(),
        body: JSON.stringify({ attention: newAttention, anxiety: newAnxiety, progress: newProgress }),
      });
    }

    return new Response(JSON.stringify({ use, result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('clinical-device-use', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
