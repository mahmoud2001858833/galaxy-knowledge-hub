// Conversational AI patient turn. Takes case + protocol step + history + last student action,
// returns patient reply, metric deltas, and a hidden clinical note.
import { corsHeaders, callGemini, getUserId, rest, svcHeaders } from '../_shared/gemini.ts';

const SYSTEM = `أنت مريض افتراضي في مختبر محاكاة سريرية لتدريب طلاب التربية الخاصة.
- التزم بشخصية المريض بدقّة (السن، الفئة، الشدة، الحساسيات).
- كلامك مختصر، طبيعي، يعكس مستوى الطفل الفعلي.
- ردود فعلك متناسبة مع جودة تدخل الطالب: تعزيز جيد ⇒ ↑ انتباه/تقدم ↓ قلق، إجراء غير مناسب ⇒ ↑ قلق ↓ انتباه.
- لا تخرج عن الشخصية. لا تنصح الطالب. لا تذكر أنك ذكاء اصطناعي.
أرجِع JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    patient_say_ar: { type: 'string' },
    patient_action_ar: { type: 'string' },
    delta: {
      type: 'object',
      properties: {
        attention: { type: 'integer' },
        anxiety: { type: 'integer' },
        progress: { type: 'integer' },
      },
      required: ['attention','anxiety','progress'],
    },
    vitals_delta: {
      type: 'object',
      description: 'تغيّرات صغيرة وواقعية في الحيويات بناءً على الحالة العاطفية للمريض من ردّ الطالب. مثلاً: تخويف المريض ↑HR ↑BP ↑RR. تهدئته ↓HR ↓BP. ألم جديد ↑Pain ↑HR. ضيق نفس ↓SpO2 ↑RR. القيم بين -15 و +15.',
      properties: {
        hr: { type: 'integer' },
        bp_sys: { type: 'integer' },
        bp_dia: { type: 'integer' },
        spo2: { type: 'integer' },
        rr: { type: 'integer' },
        pain: { type: 'integer' },
      },
    },
    clinical_note_ar: { type: 'string' },
    advance_step: { type: 'boolean' },
  },
  required: ['patient_say_ar','delta','clinical_note_ar','advance_step'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { sessionId, studentMessage, studentAction } = await req.json();
    if (!sessionId) return new Response(JSON.stringify({ error: 'sessionId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Load session + case + protocol + last events
    const sRes = await fetch(rest(`/clinical_sessions?id=eq.${sessionId}&select=*`), { headers: svcHeaders() });
    const [session] = await sRes.json();
    if (!session || session.user_id !== userId)
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const [cRes, pRes, eRes] = await Promise.all([
      fetch(rest(`/clinical_cases?id=eq.${session.case_id}&select=*`), { headers: svcHeaders() }),
      session.protocol_id
        ? fetch(rest(`/clinical_protocols?id=eq.${session.protocol_id}&select=*`), { headers: svcHeaders() })
        : Promise.resolve(new Response('[]')),
      fetch(rest(`/clinical_session_events?session_id=eq.${sessionId}&order=t_ms.desc&limit=12&select=*`), { headers: svcHeaders() }),
    ]);
    const [c] = await cRes.json();
    const pArr = await (pRes as Response).json();
    const isFree = session.mode === 'free';
    const fi = session.free_intent || {};
    const p = pArr[0] || {
      name_ar: 'تجربة حرّة',
      short_ar: '',
      steps: [{ title_ar: fi.title || 'تدخّل حرّ', instruction_ar: fi.details || 'طبّق التدخّل وراقب الاستجابة', success_ar: 'استجابة إيجابية بدون آثار سلبية' }],
    };
    const events = (await eRes.json()).reverse();

    const step = (p.steps || [])[session.current_step] || (p.steps || [])[0] || {};
    const history = events.map((e: any) => `[${e.actor}] ${e.event_type}: ${JSON.stringify(e.payload).slice(0, 200)}`).join('\n');

    const prompt = `المريض: ${c.name_ar} (${c.age_years} سنة، ${c.gender}، شدة ${c.severity})
شخصية المريض: ${c.patient_persona_ar}
الملف الحسّي: ${JSON.stringify(c.sensory_profile)}

البروتوكول: ${p.name_ar} — الخطوة ${session.current_step + 1}/${(p.steps || []).length}: ${step.title_ar}
تعليمة الخطوة: ${step.instruction_ar}
معيار النجاح: ${step.success_ar}

المؤشرات الحالية: انتباه ${session.attention} • قلق ${session.anxiety} • تقدّم ${session.progress}

سجل آخر التفاعلات:
${history || '— (بداية الجلسة)'}

الطالب الآن:
- يقول: ${studentMessage || '—'}
- يقوم بإجراء: ${studentAction || '—'}

ردّ كمريض. حدّد delta واقعية بين -20 و +20. advance_step = true فقط إذا تحقق معيار النجاح.`;

    const result = await callGemini(SYSTEM, prompt, SCHEMA);

    const t_ms = Date.now() - new Date(session.started_at).getTime();
    const newAttention = Math.max(0, Math.min(100, Number(session.attention) + (result.delta?.attention || 0)));
    const newAnxiety   = Math.max(0, Math.min(100, Number(session.anxiety)   + (result.delta?.anxiety   || 0)));
    const newProgress  = Math.max(0, Math.min(100, Number(session.progress)  + (result.delta?.progress  || 0)));
    const newStep = result.advance_step ? Math.min((p.steps?.length || 1) - 1, session.current_step + 1) : session.current_step;

    // Insert events: student + patient + clinical_note
    const eventsToInsert: any[] = [];
    if (studentMessage || studentAction) {
      eventsToInsert.push({
        session_id: sessionId, t_ms, actor: 'student', event_type: studentMessage ? 'say' : 'action',
        payload: { say: studentMessage, action: studentAction },
        attention: session.attention, anxiety: session.anxiety, progress: session.progress,
      });
    }
    eventsToInsert.push({
      session_id: sessionId, t_ms: t_ms + 1, actor: 'patient', event_type: 'say',
      payload: { say: result.patient_say_ar, action: result.patient_action_ar },
      attention: newAttention, anxiety: newAnxiety, progress: newProgress,
    });
    eventsToInsert.push({
      session_id: sessionId, t_ms: t_ms + 2, actor: 'system', event_type: 'clinical_note',
      payload: { note: result.clinical_note_ar, delta: result.delta, advance_step: result.advance_step },
      attention: newAttention, anxiety: newAnxiety, progress: newProgress,
    });

    await fetch(rest('/clinical_session_events'), { method: 'POST', headers: svcHeaders(), body: JSON.stringify(eventsToInsert) });

    await fetch(rest(`/clinical_sessions?id=eq.${sessionId}`), {
      method: 'PATCH', headers: svcHeaders(),
      body: JSON.stringify({ attention: newAttention, anxiety: newAnxiety, progress: newProgress, current_step: newStep }),
    });

    return new Response(JSON.stringify({
      patient_say_ar: result.patient_say_ar,
      patient_action_ar: result.patient_action_ar,
      clinical_note_ar: result.clinical_note_ar,
      delta: result.delta,
      advance_step: result.advance_step,
      metrics: { attention: newAttention, anxiety: newAnxiety, progress: newProgress },
      current_step: newStep,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('clinical-patient-turn', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
