// Analyzes a day's game sessions + moves and produces an AI report.
// Also computes per-game improvement vs. the child's baseline (first ever session of that template)
// and triggers an automatic daily email to the parent when an email is on file.

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

    const restHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

    // Fetch sessions + moves for this day
    const sessResp = await fetch(`${supabaseUrl}/rest/v1/autism_game_sessions?day_id=eq.${dayId}&user_id=eq.${userId}&select=*`, { headers: restHeaders });
    const sessions: any[] = await sessResp.json();
    const sessionIds = sessions.map((s: any) => s.id);
    let moves: any[] = [];
    if (sessionIds.length) {
      const ids = sessionIds.map((i: string) => `"${i}"`).join(',');
      const mResp = await fetch(`${supabaseUrl}/rest/v1/autism_game_moves?session_id=in.(${ids})&select=*`, { headers: restHeaders });
      moves = await mResp.json();
    }

    // --- Compute improvement_by_game ---
    // For each unique template_id played today, find this child's earliest session ever
    // and compare today's average accuracy against it.
    const todayByTemplate: Record<string, { acc: number[]; durations: number[]; title?: string }> = {};
    sessions.forEach((s: any) => {
      const t = s.template_id || 'unknown';
      todayByTemplate[t] = todayByTemplate[t] || { acc: [], durations: [] };
      if (typeof s.accuracy === 'number') todayByTemplate[t].acc.push(s.accuracy);
      if (typeof s.duration_sec === 'number') todayByTemplate[t].durations.push(s.duration_sec);
    });

    const improvement_by_game: Record<string, { baseline: number; today: number; improvement_pct: number; sessions_today: number }> = {};
    for (const tid of Object.keys(todayByTemplate)) {
      try {
        const bResp = await fetch(
          `${supabaseUrl}/rest/v1/autism_game_sessions?user_id=eq.${userId}&template_id=eq.${tid}&select=accuracy,created_at&order=created_at.asc&limit=1`,
          { headers: restHeaders },
        );
        const baselineRow: any[] = await bResp.json();
        const baseline = baselineRow?.[0]?.accuracy ?? null;
        const accArr = todayByTemplate[tid].acc;
        const today = accArr.length ? accArr.reduce((a, b) => a + b, 0) / accArr.length : 0;
        const base = typeof baseline === 'number' ? baseline : today;
        const improvement_pct = base > 0
          ? Math.round(((today - base) / base) * 100)
          : Math.round(today * 100);
        improvement_by_game[tid] = {
          baseline: Math.round((base || 0) * 100) / 100,
          today: Math.round(today * 100) / 100,
          improvement_pct,
          sessions_today: accArr.length,
        };
      } catch (e) {
        console.warn('improvement calc failed for', tid, (e as Error).message);
      }
    }

    const summary = {
      sessions_count: sessions.length,
      avg_accuracy: sessions.length ? sessions.reduce((a: number, s: any) => a + (s.accuracy ?? 0), 0) / sessions.length : 0,
      total_moves: moves.length,
      wrong_moves: moves.filter((m: any) => m.is_correct === false).length,
      sessions_brief: sessions.map((s: any) => ({ template: s.template_id, acc: s.accuracy, dur: s.duration_sec, wrongs: s.wrong_attempts })),
      move_event_types: [...new Set(moves.map((m: any) => m.event_type))],
      improvement_by_game,
    };

    const geminiKeys = [
      Deno.env.get('AUTISM_GEMINI_API_KEY_V2'),
      Deno.env.get('AUTISM_GEMINI_API_KEY'),
      Deno.env.get('GEMINI_API_KEY'),
    ].filter(Boolean) as string[];
    if (!geminiKeys.length) throw new Error('Gemini API key missing');
    const userPrompt = SYSTEM + '\n\nأعد JSON فقط وفق:\n' + JSON.stringify(SCHEMA) + '\n\nبيانات اليوم (تشمل قياس التحسن لكل لعبة مقارنة بأول مرة لعبها):\n' + JSON.stringify(summary);
    let report: any = null;
    let aiErr: any = null;
    for (const model of ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']) {
      for (const gk of geminiKeys) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gk}`;
          const aiResp = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
            }),
          });
          if (!aiResp.ok) throw new Error(`Gemini ${aiResp.status}: ${await aiResp.text()}`);
          const data = await aiResp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
          report = JSON.parse(text);
          break;
        } catch (e) { aiErr = e; console.warn(`Gemini ${model} failed`, (e as Error).message); }
      }
      if (report) break;
    }
    if (!report) throw aiErr ?? new Error('Gemini unavailable');

    // Upsert report (now including improvement_by_game)
    await fetch(`${supabaseUrl}/rest/v1/autism_day_reports?on_conflict=day_id`, {
      method: 'POST',
      headers: {
        ...restHeaders,
        'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId, day_id: dayId,
        score: report.score, summary_ar: report.summary_ar,
        strengths_ar: report.strengths_ar, weaknesses_ar: report.weaknesses_ar,
        recommendations_ar: report.recommendations_ar, raw: summary,
        improvement_by_game,
      }),
    });

    // --- Auto email parent (best-effort) ---
    let emailed = false;
    try {
      // Resolve child profile + parent email + day_index
      const dayResp = await fetch(`${supabaseUrl}/rest/v1/autism_program_days?id=eq.${dayId}&select=day_index,program_id`, { headers: restHeaders });
      const dayRow = (await dayResp.json())?.[0];
      let parent_email: string | null = null;
      let child_name = 'طفلك';
      if (dayRow?.program_id) {
        const progResp = await fetch(`${supabaseUrl}/rest/v1/autism_programs?id=eq.${dayRow.program_id}&select=child_profile_id`, { headers: restHeaders });
        const prog = (await progResp.json())?.[0];
        if (prog?.child_profile_id) {
          const cpResp = await fetch(`${supabaseUrl}/rest/v1/autism_child_profiles?id=eq.${prog.child_profile_id}&select=child_name,parent_email`, { headers: restHeaders });
          const cp = (await cpResp.json())?.[0];
          parent_email = cp?.parent_email ?? null;
          child_name = cp?.child_name ?? child_name;
        }
      }
      if (parent_email) {
        // Build games payload with improvement_pct merged in
        const gamesPayload = sessions.map((s: any) => ({
          title: s.template_id,
          accuracy: s.accuracy ?? 0,
          duration_sec: s.duration_sec ?? 0,
          improvement_pct: improvement_by_game[s.template_id]?.improvement_pct ?? null,
        }));
        const emailResp = await fetch(`${supabaseUrl}/functions/v1/autism-email-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({
            kind: 'daily',
            child_name,
            parent_email,
            day_index: dayRow?.day_index,
            overall_pct: Math.round(report.score),
            summary_ar: report.summary_ar,
            strengths_ar: report.strengths_ar,
            weaknesses_ar: report.weaknesses_ar,
            recommendations_ar: report.recommendations_ar,
            games: gamesPayload,
          }),
        });
        emailed = emailResp.ok;
        if (!emailResp.ok) console.warn('email send failed', emailResp.status, await emailResp.text());
      }
    } catch (e) {
      console.warn('auto-email step failed', (e as Error).message);
    }

    return new Response(JSON.stringify({ report, improvement_by_game, emailed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('autism-analyze-day', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
