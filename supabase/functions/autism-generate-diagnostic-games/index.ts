import { geminiFetch } from "../_shared/gemini-shim.ts";
// Generates a personalized battery of diagnostic mini-games for autism screening.
// Spectrum varies per child, so the AI chooses 4-6 templates from the registry,
// adapts difficulty/duration, and writes Arabic instructions tailored to the child.
//
// Reuses LOVABLE_API_KEY (Lovable AI Gateway).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMPLATES = [
  { id: 'bubble_tracking', skill: 'انتباه بصري' },
  { id: 'look_with_me', skill: 'انتباه مشترك' },
  { id: 'emotion_cards', skill: 'تمييز انفعالات' },
  { id: 'calm_sounds', skill: 'تنظيم حسي / تحمّل سمعي' },
  { id: 'story_sequence', skill: 'تسلسل وأحداث' },
  { id: 'magic_mirror', skill: 'تقليد حركي' },
  { id: 'change_the_rule', skill: 'مرونة معرفية' },
  { id: 'request_to_get', skill: 'طلبات وظيفية / مبادرة' },
  { id: 'social_choice', skill: 'سيناريوهات اجتماعية' },
  { id: 'rhythm_turns', skill: 'تبادل أدوار' },
  { id: 'spot_difference', skill: 'انتباه للتفاصيل' },
  { id: 'name_response', skill: 'استجابة للاسم' },
];

const SYSTEM = `أنت أخصائي تشخيص نمائي. لا تستخدم أبداً أسئلة مقالية أو نصية — كل المحتوى ألعاب تفاعلية فقط.
طيف التوحد يختلف من طفل لآخر، لذلك اختر بطارية ألعاب تشخيصية مخصّصة (5 إلى 7 ألعاب) من القوالب المتاحة فقط،
بحيث تغطّي مجالات الفحص الأساسية (تواصل اجتماعي، انتباه مشترك، حسي، مرونة، تقليد، تبادل أدوار، استجابة للاسم).
- لا تخترع template_id جديد — استخدم القوائم المُعطاة فقط.
- **حاسم: كيّف اللعبة للعمر** — للصغار (2-4) مفردات بسيطة جداً ومدة 30-50 ث وصعوبة easy؛ للأطفال (5-9) متوسطة 60-90 ث؛ للمراهقين (10+) أكثر تعقيداً 90-120 ث.
- اكتب instructions_ar قصيرة وواضحة بمستوى عمر الطفل بالضبط (لا كلمات صعبة للصغار).
- اكتب target_skill_ar مكثّفاً (3-6 كلمات).
- اكتب rationale_ar (سبب اختيار هذه اللعبة لهذا الطفل بالذات بناءً على عمره).
- أعد JSON صرفاً وفق الـ schema، دون أي نص خارجي.`;

const SCHEMA = {
  type: 'object',
  properties: {
    games: {
      type: 'array',
      minItems: 4,
      maxItems: 6,
      items: {
        type: 'object',
        properties: {
          template_id: { type: 'string' },
          title_ar: { type: 'string' },
          instructions_ar: { type: 'string' },
          target_skill_ar: { type: 'string' },
          rationale_ar: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          duration_sec: { type: 'integer' },
          adaptations_ar: { type: 'array', items: { type: 'string' } },
        },
        required: ['template_id', 'title_ar', 'instructions_ar', 'target_skill_ar', 'rationale_ar', 'difficulty', 'duration_sec'],
      },
    },
    overall_strategy_ar: { type: 'string' },
  },
  required: ['games', 'overall_strategy_ar'],
};

function fallbackBattery(ageMonths: number) {
  const easy = ageMonths < 60;
  const ids = easy
    ? ['name_response', 'bubble_tracking', 'look_with_me', 'emotion_cards', 'magic_mirror']
    : ['look_with_me', 'emotion_cards', 'change_the_rule', 'social_choice', 'rhythm_turns', 'spot_difference'];
  return {
    overall_strategy_ar: 'بطارية افتراضية متوازنة (تعذّر الاتصال بالـ AI).',
    games: ids.map((id) => {
      const t = TEMPLATES.find((x) => x.id === id)!;
      return {
        template_id: id,
        title_ar: t.skill,
        instructions_ar: 'اتبع التعليمات داخل اللعبة.',
        target_skill_ar: t.skill,
        rationale_ar: 'تغطية أساسية للمجال.',
        difficulty: easy ? 'easy' : 'medium',
        duration_sec: easy ? 60 : 75,
        adaptations_ar: ['قلّل الصعوبة عند الإحباط', 'كرّر التعليمة بهدوء'],
      };
    }),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { ageMonths = 36, ageTrack = 'child', respondent = 'caregiver', name, initialConcerns = [], questionnaireResult = null } = await req.json().catch(() => ({}));

    const userPrompt = `بيانات الطفل:
- العمر: ${ageMonths} شهراً (${ageTrack})
- الاسم: ${name || '—'}
- المُجيب: ${respondent === 'self' ? 'تقييم ذاتي' : 'ولي أمر'}
- مخاوف أولية: ${initialConcerns?.length ? initialConcerns.join('، ') : 'غير محددة'}
- نتائج استبيان أولي: ${questionnaireResult ? JSON.stringify(questionnaireResult).slice(0, 1500) : 'غير متوفرة'}

القوالب المتاحة (template_id : skill):
${TEMPLATES.map((t) => `- ${t.id} : ${t.skill}`).join('\n')}

اختر بطارية ألعاب تشخيصية مخصّصة لهذا الطفل وفق الـ schema:
${JSON.stringify(SCHEMA)}`;

    const key = "shim-key";
    if (!key) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing', ...fallbackBattery(ageMonths) }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resp = await geminiFetch("ai-shim", {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userPrompt },
        ],
        tools: [{ type: 'function', function: { name: 'diagnostic_battery', description: 'بطارية ألعاب تشخيصية مخصّصة', parameters: SCHEMA } }],
        tool_choice: { type: 'function', function: { name: 'diagnostic_battery' } },
      }),
    });

    if (!resp.ok) {
      const status = resp.status;
      const body = await resp.text().catch(() => '');
      console.error('AI gateway error', status, body);
      const fb = fallbackBattery(ageMonths);
      return new Response(JSON.stringify({ ...fb, _warning: status === 429 ? 'rate_limited' : status === 402 ? 'payment_required' : 'gateway_error' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = null;
    try { parsed = typeof args === 'string' ? JSON.parse(args) : args; } catch { parsed = null; }
    if (!parsed?.games?.length) parsed = fallbackBattery(ageMonths);

    // Validate: keep only known template_ids
    const validIds = new Set(TEMPLATES.map((t) => t.id));
    parsed.games = parsed.games.filter((g: any) => validIds.has(g.template_id)).slice(0, 6);
    if (parsed.games.length < 3) parsed = fallbackBattery(ageMonths);

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('autism-generate-diagnostic-games error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown', ...fallbackBattery(36) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
