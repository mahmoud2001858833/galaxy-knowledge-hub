// Resumable seeder for specialty medications in clinical_interventions_catalog.
import { corsHeaders, callGemini, rest, svcHeaders } from '../_shared/gemini.ts';

const SPECIALTIES = [
  { key: 'cardiology', ar: 'أمراض القلب' },
  { key: 'orthopedics', ar: 'العظام والمفاصل' },
  { key: 'internal', ar: 'الباطنية' },
  { key: 'neurology', ar: 'الأعصاب' },
  { key: 'pulmonology', ar: 'الجهاز التنفسي' },
  { key: 'nephrology', ar: 'الكلى' },
  { key: 'endocrinology', ar: 'الغدد والسكري' },
  { key: 'gastro', ar: 'الجهاز الهضمي' },
  { key: 'emergency', ar: 'الطوارئ' },
  { key: 'pediatrics', ar: 'الأطفال' },
  { key: 'obgyn', ar: 'النساء والولادة' },
  { key: 'dermatology', ar: 'الجلدية' },
  { key: 'ophthalmology', ar: 'العيون' },
  { key: 'ent', ar: 'الأنف والأذن والحنجرة' },
  { key: 'psychiatry', ar: 'الطب النفسي' },
];
const TARGET = 10;

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_ar: { type: 'string' },
          name_en: { type: 'string' },
          short_ar: { type: 'string' },
          default_params: { type: 'object' },
          mechanism_ar: { type: 'string' },
          expected_effects: { type: 'object' },
          contraindications_ar: { type: 'array', items: { type: 'string' } },
          references_ar: { type: 'array', items: { type: 'string' } },
          evidence_level: { type: 'string' },
        },
        required: ['name_ar', 'mechanism_ar'],
      },
    },
  },
  required: ['items'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const status: any[] = [];
    for (const sp of SPECIALTIES) {
      const r = await fetch(
        rest(`/clinical_interventions_catalog?category=eq.medication&condition_keys=cs.{${sp.key}}&select=id`),
        { headers: svcHeaders() },
      );
      const existing = ((await r.json()) as any[]).length;
      if (existing >= TARGET) { status.push({ specialty: sp.key, existing, added: 0 }); continue; }
      const need = TARGET - existing;
      try {
        const out = await callGemini(
          'أنت مرجع صيدلي/طبي. أرجِع JSON فقط بأدوية حقيقية ومعتمدة.',
          `أنشئ ${need} دواءً واقعياً ومعتمداً يُستخدم في تخصص "${sp.ar}". لكل دواء:
- name_ar الاسم العلمي بالعربي
- name_en الاسم الإنجليزي
- short_ar وصف مختصر
- default_params (jsonb: dose, route, frequency, duration, max_daily)
- mechanism_ar آلية العمل
- expected_effects (jsonb: مقاييس تقريبية كـ symptom_relief، side_effect_risk)
- contraindications_ar (3-5 موانع)
- references_ar (مراجع: BNF/UpToDate/FDA/EMA/NICE)
- evidence_level (A/B/C)
نوّع بين الفئات الدوائية للتخصص. لا تكرّر.`,
          SCHEMA,
        );
        const rows = (out.items || []).map((it: any) => ({
          category: 'medication',
          condition_keys: [sp.key],
          name_ar: it.name_ar,
          name_en: it.name_en || null,
          short_ar: it.short_ar || null,
          default_params: it.default_params || {},
          mechanism_ar: it.mechanism_ar || null,
          expected_effects: it.expected_effects || {},
          contraindications_ar: it.contraindications_ar || [],
          references_ar: it.references_ar || [],
          evidence_level: it.evidence_level || null,
        }));
        if (rows.length) {
          await fetch(rest('/clinical_interventions_catalog'), {
            method: 'POST', headers: svcHeaders(), body: JSON.stringify(rows),
          });
        }
        status.push({ specialty: sp.key, existing, added: rows.length });
      } catch (e) {
        status.push({ specialty: sp.key, existing, error: (e as Error).message });
      }
    }
    return new Response(JSON.stringify({ status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
