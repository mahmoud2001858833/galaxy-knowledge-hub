// Resumable seeder for the clinical interventions catalog.
// Generates per-category batches via Gemini, inserts only missing items.
import { corsHeaders, callGemini, rest, svcHeaders } from '../_shared/gemini.ts';

const CATEGORIES = [
  { key: 'medication',   ar: 'دواء',                conds: ['adhd','asd'] },
  { key: 'behavioral',   ar: 'علاج سلوكي',          conds: ['asd','adhd','learning_other'] },
  { key: 'sensory',      ar: 'تدخّل حسّي',           conds: ['asd','adhd'] },
  { key: 'aac',          ar: 'وسيلة تواصل بديلة',    conds: ['asd','hearing','learning_other'] },
  { key: 'visual_aid',   ar: 'وسيلة بصرية',         conds: ['visual','asd','learning_other'] },
  { key: 'hearing_aid',  ar: 'وسيلة سمعية',         conds: ['hearing'] },
  { key: 'educational',  ar: 'إجراء تربوي',         conds: ['learning_other','asd','adhd'] },
];

const TARGET_PER_CATEGORY = 60;

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
          condition_keys: { type: 'array', items: { type: 'string' } },
          default_params: { type: 'object' },
          mechanism_ar: { type: 'string' },
          expected_effects: { type: 'object' },
          contraindications_ar: { type: 'array', items: { type: 'string' } },
          references_ar: { type: 'array', items: { type: 'string' } },
          evidence_level: { type: 'string' },
        },
        required: ['name_ar','condition_keys','mechanism_ar'],
      },
    },
  },
  required: ['items'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const status: any[] = [];
    for (const cat of CATEGORIES) {
      const cRes = await fetch(rest(`/clinical_interventions_catalog?category=eq.${cat.key}&select=id`), { headers: svcHeaders() });
      const existing = (await cRes.json()).length;
      if (existing >= TARGET_PER_CATEGORY) { status.push({ category: cat.key, existing, added: 0 }); continue; }

      const need = Math.min(20, TARGET_PER_CATEGORY - existing);
      const prompt = `أنشئ ${need} عنصراً واقعياً ومعتمداً للفئة "${cat.ar}" (${cat.key}) في مجال التربية الخاصة.
الفئات السريرية المستهدفة: ${cat.conds.join(', ')}.
لكل عنصر: اسم عربي + إنجليزي إن وُجد، وصف مختصر، condition_keys (مجموعة فرعية من: asd, adhd, hearing, visual, learning_other)،
default_params (jsonb مناسب: dose/freq/duration للأدوية، intensity/duration للحسّي، schedule للتربوي...)،
mechanism_ar (آلية)، expected_effects (jsonb: attention/anxiety/progress تأثير تقريبي ±)،
contraindications_ar (موانع)، references_ar (DSM-5-TR/AAP/NICE/WHO/Cochrane)، evidence_level (A/B/C).
لا تكرّر العناصر الشائعة فقط — نوّع.`;
      try {
        const out = await callGemini('أنت مرجع علمي للتربية الخاصة. أرجع JSON فقط.', prompt, SCHEMA);
        const rows = (out.items || []).map((it: any) => ({
          category: cat.key,
          condition_keys: it.condition_keys || cat.conds,
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
        status.push({ category: cat.key, existing, added: rows.length });
      } catch (e) {
        status.push({ category: cat.key, existing, error: (e as Error).message });
      }
    }
    return new Response(JSON.stringify({ status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
