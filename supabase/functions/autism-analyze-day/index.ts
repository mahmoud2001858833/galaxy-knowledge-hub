// Analyzes a day's game sessions + moves and produces an AI report.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM = `أنت محلّل أداء سلوكي للأطفال في طيف التوحد. تستلم سجلات حركات لعب يوم كامل وتعطي:
- درجة عامة (0-100)
- ملخّص قصير بالعربية
- نقاط قوة (مصفوفة)
- نقاط ضعف (مصفوفة)
- توصيات لليوم التالي (مصفوفة)
حلّل أنماط الخطأ، التسرّع، التردّد، ومدى الالتزام. أعد JSON فقط.`;

const SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number' },
    summary_ar: { type: 'string' },
    strengths_ar: { type: 'array', items: { type: 'string' } },
    weaknesses_ar: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
  },
  required: ['score', 'summary_ar', 'strengths_ar', 'weaknesses_ar', 'recommendations_ar'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { dayId } = await req.json();
    if (!dayId) return new Response(JSON.stringify({ error: 'dayId مطلوب' }), { status: 400, headers: corsHeaders });

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: authHeader, apikey: serviceKey } });
    if (!userResp.ok) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const { id: userId } = await userResp.json();

    // Fetch sessions + moves for this day
    const sessResp = await fetch(`${supabaseUrl}/rest/v1/autism_game_sessions?day_id=eq.${dayId}&user_id=eq.${userId}&select=*`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const sessions = await sessResp.json();
    const sessionIds = sessions.map((s: any) => s.id);
    let moves: any[] = [];
    if (sessionIds.length) {
      const ids = sessionIds.map((i: string) => `"${i}"`).join(',');
      const mResp = await fetch(`${supabaseUrl}/rest/v1/autism_game_moves?session_id=in.(${ids})&select=*`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      });
      moves = await mResp.json();
    }

    const summary = {
      sessions_count: sessions.length,
      avg_accuracy: sessions.length ? sessions.reduce((a: number, s: any) => a + (s.accuracy ?? 0), 0) / sessions.length : 0,
      total_moves: moves.length,
      wrong_moves: moves.filter((m: any) => m.is_correct === false).length,
      sessions_brief: sessions.map((s: any) => ({ template: s.template_id, acc: s.accuracy, dur: s.duration_sec, wrongs: s.wrong_attempts })),
      move_event_types: [...new Set(moves.map((m: any) => m.event_type))],
    };

    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) throw new Error('LOVABLE_API_KEY missing');
    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: 'بيانات اليوم:\n' + JSON.stringify(summary) },
        ],
        tools: [{ type: 'function', function: { name: 'report', parameters: SCHEMA } }],
        tool_choice: { type: 'function', function: { name: 'report' } },
      }),
    });
    if (!aiResp.ok) throw new Error(`AI ${aiResp.status}: ${await aiResp.text()}`);
    const data = await aiResp.json();
    const report = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? '{}');

    // Upsert report
    await fetch(`${supabaseUrl}/rest/v1/autism_day_reports?on_conflict=day_id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId, day_id: dayId,
        score: report.score, summary_ar: report.summary_ar,
        strengths_ar: report.strengths_ar, weaknesses_ar: report.weaknesses_ar,
        recommendations_ar: report.recommendations_ar, raw: summary,
      }),
    });

    return new Response(JSON.stringify({ report }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('autism-analyze-day', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
