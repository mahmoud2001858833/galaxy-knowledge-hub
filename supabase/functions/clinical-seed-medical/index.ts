// Resumable seeder for medical specialty cases & protocols.
import { corsHeaders, callGemini, rest, svcHeaders } from '../_shared/gemini.ts';

const SPECIALTIES = [
  { key: 'cardiology',    ar: 'أمراض القلب' },
  { key: 'orthopedics',   ar: 'العظام والمفاصل' },
  { key: 'internal',      ar: 'الباطنية' },
  { key: 'neurology',     ar: 'الأعصاب' },
  { key: 'pulmonology',   ar: 'الجهاز التنفسي' },
  { key: 'nephrology',    ar: 'الكلى' },
  { key: 'endocrinology', ar: 'الغدد والسكري' },
  { key: 'gastro',        ar: 'الجهاز الهضمي' },
  { key: 'emergency',     ar: 'الطوارئ' },
  { key: 'pediatrics',    ar: 'الأطفال' },
  { key: 'obgyn',         ar: 'النساء والولادة' },
  { key: 'dermatology',   ar: 'الجلدية' },
  { key: 'ophthalmology', ar: 'العيون' },
  { key: 'ent',           ar: 'الأنف والأذن والحنجرة' },
  { key: 'psychiatry',    ar: 'الطب النفسي' },
];

const TARGET_CASES = 15;
const TARGET_PROTOCOLS = 8;

const CASES_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: {
      type: 'object',
      properties: {
        code: { type: 'string' }, name_ar: { type: 'string' },
        age_years: { type: 'integer' }, gender: { type: 'string' },
        severity: { type: 'string' }, summary_ar: { type: 'string' },
        history_ar: { type: 'string' },
        sensory_profile: { type: 'object' },
        vitals_initial: { type: 'object' },
        current_medications: { type: 'array', items: { type: 'string' } },
        presenting_signs_ar: { type: 'array', items: { type: 'string' } },
        patient_persona_ar: { type: 'string' }, reference_ar: { type: 'string' },
      },
      required: ['code','name_ar','age_years','severity','summary_ar','presenting_signs_ar','patient_persona_ar'],
    } },
  },
  required: ['items'],
};

const PROTOCOLS_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: {
      type: 'object',
      properties: {
        code: { type: 'string' }, name_ar: { type: 'string' },
        short_ar: { type: 'string' }, goal_ar: { type: 'string' },
        steps: { type: 'array', items: {
          type: 'object',
          properties: { title_ar: { type: 'string' }, instruction_ar: { type: 'string' }, duration_sec: { type: 'integer' }, success_ar: { type: 'string' } },
          required: ['title_ar','instruction_ar','success_ar'],
        } },
        reference_ar: { type: 'string' },
      },
      required: ['code','name_ar','goal_ar','steps'],
    } },
  },
  required: ['items'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const only = url.searchParams.get('only');
    const status: any[] = [];
    const list = only ? SPECIALTIES.filter((s) => s.key === only) : SPECIALTIES;
    for (const sp of list) {
      const [casesRes, protocolsRes] = await Promise.all([
        fetch(rest(`/clinical_cases?category=eq.${sp.key}&select=id`), { headers: svcHeaders() }),
        fetch(rest(`/clinical_protocols?category=eq.${sp.key}&select=id`), { headers: svcHeaders() }),
      ]);
      const cExist = (await casesRes.json()).length;
      const pExist = (await protocolsRes.json()).length;
      const entry: any = { specialty: sp.key, cases: cExist, protocols: pExist, added_cases: 0, added_protocols: 0 };

      if (cExist < TARGET_CASES) {
        const need = Math.min(6, TARGET_CASES - cExist);
        try {
          const out = await callGemini(
            'أنت استشاري طبي متخصص. أرجِع JSON فقط، محتوى دقيق وواقعي بمستوى مرجع سريري.',
            `أنشئ ${need} حالة سريرية واقعية متنوّعة الشدة (mild/moderate/severe) في تخصص "${sp.ar}". لكل حالة:
- code فريد بصيغة ${sp.key}_<اسم_مختصر_بالإنجليزي>
- name_ar اسم مريض عربي
- age_years متناسب مع التخصص (الأطفال/الكبار)
- gender: male أو female
- severity: mild/moderate/severe
- summary_ar (2-3 جمل واضحة)
- history_ar (تاريخ مرضي مفصّل: شكوى رئيسية، مدة، عوامل مفاقمة، أمراض مزمنة، أدوية، حساسية، تاريخ عائلي)
- presenting_signs_ar (5-8 علامات سريرية واقعية ودقيقة)
- vitals_initial (jsonb): {hr, sbp, dbp, spo2, rr, temp_c, glucose_mgdl} بأرقام واقعية حسب الحالة والشدة
- current_medications (مصفوفة نصوص: اسم الدواء + الجرعة، مثل "Metformin 850mg BID")
- sensory_profile (jsonb إضافي: pain_scale 0-10، consciousness AVPU، أي مكونات حسية مهمة)
- patient_persona_ar (شخصية تفاعل واقعية بصوت المريض)
- reference_ar (مرجع موثوق: UpToDate/AHA/NICE/WHO/ESC/CDC)
نوّع الحالات: لا تكرّر نفس التشخيص، اشمل الحالات الحادة والمزمنة والشائعة والنادرة.`,
            CASES_SCHEMA
          );
          const rows = (out.items || []).map((it: any) => ({
            code: it.code, category: sp.key, name_ar: it.name_ar, age_years: it.age_years,
            gender: it.gender || 'male', severity: it.severity, summary_ar: it.summary_ar,
            history_ar: it.history_ar || '', sensory_profile: it.sensory_profile || {},
            vitals_initial: it.vitals_initial || {},
            current_medications: it.current_medications || [],
            presenting_signs_ar: it.presenting_signs_ar || [], patient_persona_ar: it.patient_persona_ar,
            reference_ar: it.reference_ar || '',
          }));
          if (rows.length) {
            await fetch(rest('/clinical_cases'), { method: 'POST', headers: svcHeaders(), body: JSON.stringify(rows) });
            entry.added_cases = rows.length;
          }
        } catch (e) { entry.cases_error = (e as Error).message; }
      }

      if (pExist < TARGET_PROTOCOLS) {
        const need = Math.min(4, TARGET_PROTOCOLS - pExist);
        try {
          const out = await callGemini(
            'أنت استشاري طبي ومرجع للبروتوكولات السريرية. أرجِع JSON فقط.',
            `أنشئ ${need} بروتوكولاً سريرياً قياسياً مختلفاً في تخصص "${sp.ar}" (مثل: ACLS، DKA management، Asthma exacerbation، Stroke code، Sepsis bundle، NIPT، فحص جسدي شامل...). لكل بروتوكول:
- code فريد
- name_ar
- short_ar وصف مختصر
- goal_ar الهدف السريري
- steps (6-10 خطوات منطقية بالترتيب)، لكل خطوة: title_ar، instruction_ar (تعليمات تنفيذية واضحة)، duration_sec (تقدير زمني)، success_ar (معيار نجاح)
- reference_ar (AHA/ESC/NICE/UpToDate/WHO/CDC)
نوّع بين بروتوكولات الطوارئ والتشخيص والعلاج.`,
            PROTOCOLS_SCHEMA
          );
          const rows = (out.items || []).map((it: any) => ({
            code: it.code, category: sp.key, name_ar: it.name_ar, short_ar: it.short_ar || '',
            goal_ar: it.goal_ar, steps: it.steps || [], reference_ar: it.reference_ar || '',
          }));
          if (rows.length) {
            await fetch(rest('/clinical_protocols'), { method: 'POST', headers: svcHeaders(), body: JSON.stringify(rows) });
            entry.added_protocols = rows.length;
          }
        } catch (e) { entry.protocols_error = (e as Error).message; }
      }
      status.push(entry);
    }
    return new Response(JSON.stringify({ status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
