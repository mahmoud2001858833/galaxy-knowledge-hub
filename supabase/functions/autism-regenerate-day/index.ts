// Regenerates ONE day's games (and clears its old report) without touching the rest of the program.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMPLATES = [
  'bubble_tracking', 'look_with_me', 'emotion_cards', 'calm_sounds',
  'story_sequence', 'magic_mirror', 'change_the_rule', 'request_to_get',
  'social_choice', 'rhythm_turns', 'spot_difference', 'name_response',
  'memory_grid', 'cause_effect', 'sorting_categories', 'feelings_story',
  'breath_balloon', 'daily_routine', 'safe_choices',
];

const SYSTEM = `أنت أخصائي تدخّل مبكر لطيف التوحد. ستعيد تصميم يومٍ واحد داخل برنامج علاجي قائم.
أعطِ 3-4 ألعاب جديدة متنوعة تستخدم template_id حرفياً من القائمة:
${TEMPLATES.join(', ')}
حافظ على نفس مهارة اليوم لكن نوّع القوالب وعدّل الصعوبة. أعد JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    theme_ar: { type: 'string' },
    focus_skill_ar: { type: 'string' },
    rationale_ar: { type: 'string' },
    games: {
      type: 'array', minItems: 3, maxItems: 4,
      items: {
        type: 'object',
        properties: {
          template_id: { type: 'string' },
          title_ar: { type: 'string' },
          instructions_ar: { type: 'string' },
          target_skill_ar: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          duration_sec: { type: 'integer' },
          success_criteria_ar: { type: 'string' },
          adaptations_ar: { type: 'array', items: { type: 'string' } },
        },
        required: ['template_id', 'title_ar', 'instructions_ar', 'target_skill_ar', 'difficulty', 'duration_sec', 'success_criteria_ar', 'adaptations_ar'],
      },
    },
  },
  required: ['theme_ar', 'focus_skill_ar', 'rationale_ar', 'games'],
};

async function callGemini(prompt: string): Promise<any> {
  const keys = [
    Deno.env.get('AUTISM_GEMINI_API_KEY_V2'),
    Deno.env.get('AUTISM_GEMINI_API_KEY'),
    Deno.env.get('GEMINI_API_KEY'),
  ].filter(Boolean) as string[];
  if (!keys.length) throw new Error('Gemini API key missing');
  let lastErr: any = null;
  for (const model of ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']) {
    for (const k of keys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${k}`;
        const r = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: SYSTEM + '\n\nأعد JSON فقط وفق:\n' + JSON.stringify(SCHEMA) }] },
            generationConfig: { temperature: 0.6, responseMimeType: 'application/json' },
          }),
        });
        if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
        const d = await r.json();
        return JSON.parse(d?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}');
      } catch (e) { lastErr = e; console.warn(`Gemini ${model} failed`, (e as Error).message); }
    }
  }
  throw lastErr ?? new Error('Gemini unavailable');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { dayId, mode = 'games' } = await req.json(); // mode: 'games' | 'report'
    if (!dayId) return new Response(JSON.stringify({ error: 'dayId مطلوب' }), { status: 400, headers: corsHeaders });
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: authHeader, apikey: serviceKey } });
    if (!userResp.ok) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const { id: userId } = await userResp.json();

    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

    // Mode "report": just clear the existing day report so the user can regenerate it from the day page
    if (mode === 'report') {
      await fetch(`${supabaseUrl}/rest/v1/autism_day_reports?day_id=eq.${dayId}&user_id=eq.${userId}`, { method: 'DELETE', headers });
      return new Response(JSON.stringify({ ok: true, mode }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Mode "games": regenerate the day's games via Gemini
    const dayResp = await fetch(`${supabaseUrl}/rest/v1/autism_program_days?id=eq.${dayId}&select=*`, { headers });
    const [dayRow] = await dayResp.json();
    if (!dayRow) throw new Error('day not found');

    const progResp = await fetch(`${supabaseUrl}/rest/v1/autism_programs?id=eq.${dayRow.program_id}&select=*`, { headers });
    const [program] = await progResp.json();

    const prompt = `إعد تصميم اليوم رقم ${dayRow.day_index} من برنامج "${program?.title_ar ?? ''}" (إجمالي ${program?.total_days ?? '—'} يوم).
- الموضوع الحالي: ${dayRow.theme_ar}
- المهارة المستهدفة: ${dayRow.focus_skill_ar}
- المنطق: ${dayRow.rationale_ar ?? ''}
نوّع القوالب واجعل الألعاب ممتعة وبناءة.`;

    const out = await callGemini(prompt);
    const games = (out.games || []).filter((g: any) => TEMPLATES.includes(g.template_id));
    if (!games.length) throw new Error('AI returned no valid games');

    // Replace
    await fetch(`${supabaseUrl}/rest/v1/autism_program_games?day_id=eq.${dayId}`, { method: 'DELETE', headers });
    await fetch(`${supabaseUrl}/rest/v1/autism_day_reports?day_id=eq.${dayId}`, { method: 'DELETE', headers });
    await fetch(`${supabaseUrl}/rest/v1/autism_program_games`, {
      method: 'POST', headers,
      body: JSON.stringify(games.map((g: any, i: number) => ({
        day_id: dayId, order_index: i,
        template_id: g.template_id, title_ar: g.title_ar,
        instructions_ar: g.instructions_ar, target_skill_ar: g.target_skill_ar,
        difficulty: g.difficulty, duration_sec: g.duration_sec,
        success_criteria_ar: g.success_criteria_ar, adaptations_ar: g.adaptations_ar ?? [],
      }))),
    });
    // Update day metadata if AI suggested tweaks
    await fetch(`${supabaseUrl}/rest/v1/autism_program_days?id=eq.${dayId}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ theme_ar: out.theme_ar ?? dayRow.theme_ar, focus_skill_ar: out.focus_skill_ar ?? dayRow.focus_skill_ar, rationale_ar: out.rationale_ar ?? dayRow.rationale_ar }),
    });

    return new Response(JSON.stringify({ ok: true, mode, gamesCount: games.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('autism-regenerate-day', e);
    const msg = e instanceof Error ? e.message : 'error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
