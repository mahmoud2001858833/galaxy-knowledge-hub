// Idempotent seeding of 60 clinical cases + 40 protocols spanning 5 categories.
import { corsHeaders, callGemini, rest, svcHeaders } from '../_shared/gemini.ts';

const CATEGORIES = [
  { key: 'asd',           ar: 'اضطراب طيف التوحد',      cases: 14, protocols: 9 },
  { key: 'adhd',          ar: 'اضطراب فرط الحركة',      cases: 12, protocols: 8 },
  { key: 'hearing',       ar: 'الإعاقة السمعية',         cases: 12, protocols: 8 },
  { key: 'visual',        ar: 'الإعاقة البصرية',         cases: 11, protocols: 8 },
  { key: 'learning_other',ar: 'صعوبات تعلّم/تأخر لغوي', cases: 11, protocols: 7 },
];

const CASE_SYSTEM = `أنت أخصائي تربية خاصة وتشخيص. تنشئ حالات افتراضية واقعية لتدريب طلاب البحث العلمي.
لكل حالة شخصية مريض واضحة (سن، جنس، ميول، حساسيات، أسلوب كلام). اللغة عربية فصحى مبسّطة.`;

const PROTOCOL_SYSTEM = `أنت مرجع سريري. تنشئ بروتوكولات تقييم/تدخّل مبنية على أدلة (DSM-5-TR, ICF-CY, WHO).
كل بروتوكول له خطوات متسلسلة قابلة للتنفيذ في جلسة محاكاة 8-15 دقيقة.`;

function caseSchema(n: number) {
  return {
    type: 'object',
    properties: {
      cases: {
        type: 'array', minItems: n, maxItems: n,
        items: {
          type: 'object',
          properties: {
            name_ar: { type: 'string' },
            age_years: { type: 'integer' },
            gender: { type: 'string' },
            severity: { type: 'string', enum: ['mild', 'moderate', 'severe'] },
            summary_ar: { type: 'string' },
            history_ar: { type: 'string' },
            presenting_signs_ar: { type: 'array', items: { type: 'string' } },
            sensory_profile: {
              type: 'object',
              properties: {
                sound: { type: 'string' }, light: { type: 'string' },
                touch: { type: 'string' }, social: { type: 'string' },
              },
            },
            patient_persona_ar: { type: 'string' },
            reference_ar: { type: 'string' },
          },
          required: ['name_ar','age_years','gender','severity','summary_ar','history_ar','presenting_signs_ar','sensory_profile','patient_persona_ar','reference_ar'],
        },
      },
    },
    required: ['cases'],
  };
}

function protocolSchema(n: number) {
  return {
    type: 'object',
    properties: {
      protocols: {
        type: 'array', minItems: n, maxItems: n,
        items: {
          type: 'object',
          properties: {
            name_ar: { type: 'string' },
            short_ar: { type: 'string' },
            goal_ar: { type: 'string' },
            steps: {
              type: 'array', minItems: 4, maxItems: 8,
              items: {
                type: 'object',
                properties: {
                  title_ar: { type: 'string' },
                  instruction_ar: { type: 'string' },
                  duration_sec: { type: 'integer' },
                  success_ar: { type: 'string' },
                },
                required: ['title_ar','instruction_ar','duration_sec','success_ar'],
              },
            },
            scoring: {
              type: 'object',
              properties: {
                weights: {
                  type: 'object',
                  properties: {
                    communication: { type: 'integer' }, attention: { type: 'integer' },
                    affect: { type: 'integer' }, compliance: { type: 'integer' }, sensory: { type: 'integer' },
                  },
                },
              },
            },
            reference_ar: { type: 'string' },
          },
          required: ['name_ar','short_ar','goal_ar','steps','reference_ar'],
        },
      },
    },
    required: ['protocols'],
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    // Skip if already seeded (idempotent)
    const headRes = await fetch(rest('/clinical_cases?select=id&limit=1'), { headers: svcHeaders() });
    const existing = await headRes.json();
    if (Array.isArray(existing) && existing.length > 0 && req.method !== 'POST') {
      return new Response(JSON.stringify({ skipped: true, message: 'محتوى موجود' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let force = false;
    try { const body = await req.json(); force = !!body?.force; } catch {}
    if (Array.isArray(existing) && existing.length > 0 && !force) {
      return new Response(JSON.stringify({ skipped: true, message: 'محتوى موجود' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalCases = 0, totalProtocols = 0;

    for (const cat of CATEGORIES) {
      // Cases
      const caseData = await callGemini(
        CASE_SYSTEM,
        `صمّم ${cat.cases} حالة افتراضية فئة "${cat.ar}". تنوّع في العمر والشدة والجنس. لا تكرّر الأسماء.`,
        caseSchema(cat.cases),
      );
      const caseRows = (caseData.cases || []).map((c: any, i: number) => ({
        code: `${cat.key}-${Date.now().toString(36)}-${i}`,
        category: cat.key,
        name_ar: c.name_ar,
        age_years: c.age_years,
        gender: c.gender,
        severity: c.severity,
        summary_ar: c.summary_ar,
        history_ar: c.history_ar,
        sensory_profile: c.sensory_profile ?? {},
        presenting_signs_ar: c.presenting_signs_ar ?? [],
        patient_persona_ar: c.patient_persona_ar,
        reference_ar: c.reference_ar,
      }));
      if (caseRows.length) {
        const r = await fetch(rest('/clinical_cases'), { method: 'POST', headers: svcHeaders(), body: JSON.stringify(caseRows) });
        if (!r.ok) console.error('cases insert', cat.key, await r.text());
        else totalCases += caseRows.length;
      }

      // Protocols
      const protoData = await callGemini(
        PROTOCOL_SYSTEM,
        `صمّم ${cat.protocols} بروتوكولاً سريرياً لفئة "${cat.ar}" يشمل أدوات تقييم وتدخلات معتمدة. اجعل الخطوات متسلسلة وقابلة للتنفيذ في 8-15 دقيقة.`,
        protocolSchema(cat.protocols),
      );
      const protoRows = (protoData.protocols || []).map((p: any, i: number) => ({
        code: `${cat.key}-p-${Date.now().toString(36)}-${i}`,
        category: cat.key,
        name_ar: p.name_ar,
        short_ar: p.short_ar,
        goal_ar: p.goal_ar,
        steps: p.steps ?? [],
        scoring: p.scoring ?? {},
        reference_ar: p.reference_ar,
      }));
      if (protoRows.length) {
        const r = await fetch(rest('/clinical_protocols'), { method: 'POST', headers: svcHeaders(), body: JSON.stringify(protoRows) });
        if (!r.ok) console.error('protocols insert', cat.key, await r.text());
        else totalProtocols += protoRows.length;
      }
    }

    return new Response(JSON.stringify({ ok: true, cases: totalCases, protocols: totalProtocols }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('clinical-seed-content', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
