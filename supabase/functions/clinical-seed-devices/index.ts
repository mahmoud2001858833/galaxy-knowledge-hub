// Resumable seeder for specialty-specific medical devices.
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
const TARGET = 6;

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          name_ar: { type: 'string' },
          name_en: { type: 'string' },
          ui_kind: { type: 'string' },
          description_ar: { type: 'string' },
          default_params: { type: 'object' },
          safety_ar: { type: 'array', items: { type: 'string' } },
          icon: { type: 'string' },
        },
        required: ['key', 'name_ar', 'description_ar'],
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
      const r = await fetch(rest(`/clinical_devices?category=eq.${sp.key}&select=key`), { headers: svcHeaders() });
      const existing = (await r.json()) as any[];
      if (existing.length >= TARGET) { status.push({ specialty: sp.key, existing: existing.length, added: 0 }); continue; }
      const need = TARGET - existing.length;
      try {
        const out = await callGemini(
          'أنت مرجع للأجهزة الطبية. أرجِع JSON فقط.',
          `أنشئ ${need} جهازاً/أداة طبية واقعية ومستخدمة فعلياً في تخصص "${sp.ar}". لكل عنصر:
- key فريد بصيغة ${sp.key}_<اسم_بالإنجليزي>
- name_ar الاسم العربي
- name_en الاسم الإنجليزي القياسي
- ui_kind نوع التفاعل المقترح (monitor/scope/meter/imaging/analyzer/instrument/assessment)
- description_ar شرح وظيفة الجهاز وكيفية الاستخدام
- default_params (jsonb بإعدادات افتراضية واقعية: نطاقات قياس، وحدات، حدود طبيعية)
- safety_ar (3-5 تحذيرات سلامة)
- icon emoji مناسب
أمثلة للتخصص: ${sp.key === 'emergency' ? 'AED, Defibrillator, BVM, Crash cart' : sp.key === 'pulmonology' ? 'Spirometer, Nebulizer, Peak flow, Ventilator' : sp.key === 'nephrology' ? 'Dialysis machine, Urine analyzer' : sp.key === 'endocrinology' ? 'Glucometer, HbA1c analyzer, Insulin pen' : sp.key === 'gastro' ? 'Endoscope, NG tube' : sp.key === 'pediatrics' ? 'Pediatric scale, Otoscope, Tympanometer' : sp.key === 'obgyn' ? 'Fetal doppler, CTG, US' : sp.key === 'dermatology' ? 'Dermatoscope, Wood lamp' : sp.key === 'ophthalmology' ? 'Slit lamp, Tonometer, Fundoscope' : sp.key === 'ent' ? 'Otoscope, Audiometer, Laryngoscope' : sp.key === 'psychiatry' ? 'PHQ-9, GAD-7, MMSE, BDI' : 'أجهزة قياسية في التخصص'}.
لا تكرّر العناصر الموجودة بهذه المفاتيح: ${existing.map((e: any) => e.key).join(', ') || 'لا شيء'}.`,
          SCHEMA,
        );
        const rows = (out.items || []).map((it: any) => ({
          key: it.key,
          name_ar: it.name_ar,
          name_en: it.name_en || null,
          category: sp.key,
          ui_kind: it.ui_kind || 'instrument',
          applicable_specialties: [sp.key],
          default_params: it.default_params || {},
          description_ar: it.description_ar || '',
          safety_ar: it.safety_ar || [],
          icon: it.icon || '🩺',
        }));
        if (rows.length) {
          await fetch(rest('/clinical_devices?on_conflict=key'), {
            method: 'POST',
            headers: svcHeaders({ Prefer: 'resolution=ignore-duplicates' }),
            body: JSON.stringify(rows),
          });
        }
        status.push({ specialty: sp.key, existing: existing.length, added: rows.length });
      } catch (e) {
        status.push({ specialty: sp.key, existing: existing.length, error: (e as Error).message });
      }
    }
    return new Response(JSON.stringify({ status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
