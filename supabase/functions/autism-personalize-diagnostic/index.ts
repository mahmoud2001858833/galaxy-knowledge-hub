// Personalizes a diagnostic battery AFTER the 5 fixed baseline games.
// Receives baseline results + child profile, returns a tailored battery (4-6 games).
import { geminiFetch } from "../_shared/gemini-shim.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMPLATES = [
  'bubble_tracking','look_with_me','emotion_cards','calm_sounds','story_sequence',
  'magic_mirror','change_the_rule','request_to_get','social_choice','rhythm_turns',
  'spot_difference','name_response',
];

const SCHEMA = {
  type: 'object',
  properties: {
    games: {
      type: 'array', minItems: 4, maxItems: 6,
      items: {
        type: 'object',
        properties: {
          template_id: { type: 'string' },
          title_ar: { type: 'string' },
          instructions_ar: { type: 'string' },
          target_skill_ar: { type: 'string' },
          rationale_ar: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy','medium','hard'] },
          duration_sec: { type: 'integer' },
          adaptations_ar: { type: 'array', items: { type: 'string' } },
        },
        required: ['template_id','title_ar','instructions_ar','target_skill_ar','rationale_ar','difficulty','duration_sec'],
      },
    },
    strengths_ar: { type: 'array', items: { type: 'string' } },
    weaknesses_ar: { type: 'array', items: { type: 'string' } },
    overall_strategy_ar: { type: 'string' },
  },
  required: ['games','strengths_ar','weaknesses_ar','overall_strategy_ar'],
};

function fallback(weakIds: string[]) {
  const pick = weakIds.length ? weakIds : ['social_choice','change_the_rule','rhythm_turns','spot_difference'];
  return {
    strengths_ar: ['تفاعل أساسي مع الألعاب'],
    weaknesses_ar: ['يحتاج متابعة لمهارات اجتماعية ومرونة'],
    overall_strategy_ar: 'بطارية افتراضية تركّز على نقاط الضعف المحتملة.',
    games: pick.slice(0, 4).map((id) => ({
      template_id: id,
      title_ar: 'لعبة مخصّصة',
      instructions_ar: 'اتبع التعليمات داخل اللعبة.',
      target_skill_ar: 'مهارة مستهدفة',
      rationale_ar: 'تغطية للنقاط الضعيفة.',
      difficulty: 'medium',
      duration_sec: 70,
      adaptations_ar: ['قلّل الصعوبة عند الإحباط', 'كرّر التعليمة بهدوء'],
    })),
  };
}

const SYSTEM = `أنت أخصائي تشخيص نمائي. حلّل نتائج 5 ألعاب أساسية لطفل وضمن العمر المعطى،
ثم اختر بطارية مخصّصة (4-6 ألعاب) من القوالب المتاحة فقط (template_id) تركّز على نقاط الضعف وتعزّز نقاط القوة.
استخدم اسم الطفل في instructions_ar حين يكون مناسباً. لا تخترع template_id جديد. أعد JSON صرفاً وفق الـ schema.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { childName = '', ageYears = 6, baselineResults = [] } = await req.json().catch(() => ({}));

    // Heuristic: weak templates = baseline accuracy < 0.5
    const weakIds: string[] = (baselineResults || [])
      .filter((r: any) => (r?.accuracy ?? 1) < 0.5)
      .map((r: any) => r?.template_id)
      .filter(Boolean);

    const userPrompt = `الطفل: ${childName || '—'} (${ageYears} سنة)
نتائج الألعاب الأساسية الخمسة:
${(baselineResults || []).map((r: any, i: number) =>
  `${i + 1}. ${r.template_id}: دقة=${Math.round((r.accuracy ?? 0) * 100)}% • مدة=${Math.round((r.duration_ms ?? 0) / 1000)}ث`,
).join('\n') || '—'}

القوالب المتاحة: ${TEMPLATES.join(', ')}

اقترح بطارية مخصّصة وفق الـ schema:
${JSON.stringify(SCHEMA)}`;

    const resp = await geminiFetch('personalize-diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userPrompt },
        ],
        tools: [{ type: 'function', function: { name: 'personalized_battery', description: 'بطارية ألعاب مخصّصة', parameters: SCHEMA } }],
        tool_choice: { type: 'function', function: { name: 'personalized_battery' } },
      }),
    });

    if (!resp.ok) {
      console.error('AI error', resp.status, await resp.text().catch(() => ''));
      return new Response(JSON.stringify({ ...fallback(weakIds), _warning: 'ai_error' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = null;
    try { parsed = typeof args === 'string' ? JSON.parse(args) : args; } catch { parsed = null; }
    if (!parsed?.games?.length) parsed = fallback(weakIds);
    const valid = new Set(TEMPLATES);
    parsed.games = parsed.games.filter((g: any) => valid.has(g.template_id)).slice(0, 6);
    if (parsed.games.length < 3) parsed = fallback(weakIds);

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('autism-personalize-diagnostic error', e);
    return new Response(JSON.stringify({ ...fallback([]), error: String(e) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
