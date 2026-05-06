// Generates a long-form interactive program (multi-day plan) ONCE per child.
// Persists to autism_programs / autism_program_days / autism_program_games.

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

const SYSTEM = `أنت أخصائي تدخّل مبكر لطيف التوحد. ستصمّم برنامجاً علاجياً تفاعلياً يوميًا لمدة محددة من الأيام.
لكل يوم: موضوع تدريبي ومهارة مستهدفة و3-4 ألعاب متنوعة (لا تكرر نفس القالب يومين متتاليين).
استخدم template_id حرفياً من القائمة:
${TEMPLATES.join(', ')}

تدرّج: الأيام الأولى تأسيس وانتباه، ثم تفاعل وتقليد، ثم تواصل ومشاعر، ثم دمج اجتماعي ومرونة. الصعوبة تبدأ easy وتتدرج حسب اليوم.
أعد JSON فقط.`;

function buildSchema(totalDays: number) {
  return {
    type: 'object',
    properties: {
      title_ar: { type: 'string' },
      summary_ar: { type: 'string' },
      days: {
        type: 'array',
        minItems: totalDays,
        maxItems: totalDays,
        items: {
          type: 'object',
          properties: {
            day_index: { type: 'integer' },
            theme_ar: { type: 'string' },
            focus_skill_ar: { type: 'string' },
            rationale_ar: { type: 'string' },
            games: {
              type: 'array',
              minItems: 3, maxItems: 4,
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
          required: ['day_index', 'theme_ar', 'focus_skill_ar', 'games'],
        },
      },
    },
    required: ['title_ar', 'summary_ar', 'days'],
  };
}

async function callGateway(prompt: string, schema: any): Promise<any> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      tools: [{ type: 'function', function: { name: 'program', description: 'برنامج علاجي', parameters: schema } }],
      tool_choice: { type: 'function', function: { name: 'program' } },
    }),
  });
  if (!resp.ok) throw new Error(`Gateway ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error('No tool call');
  return JSON.parse(args);
}

// Builds program in chunks (gateway might struggle with 60+ days at once)
async function generateInChunks(profile: any, totalDays: number) {
  const CHUNK = 14;
  const allDays: any[] = [];
  let title = ''; let summary = '';
  for (let start = 1; start <= totalDays; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, totalDays);
    const schema = buildSchema(end - start + 1);
    const userPrompt = `صمّم الأيام من ${start} إلى ${end} (إجمالي البرنامج ${totalDays} يوماً) لطفل:
- العمر: ${profile.age_years ?? '—'}
- مستوى الدعم DSM-5: ${profile.support_level ?? 1}
- الملف الوظيفي: ${profile.functional_profile ?? '—'}
- المسارات الموصى بها: ${(profile.recommended_game_tracks || []).join(', ') || '—'}
- ملاحظات: ${profile.notes_summary ?? '—'}
${start === 1 ? 'أعطِ أيضاً عنواناً وملخّصاً للبرنامج كاملاً.' : 'لا حاجة لتغيير عنوان البرنامج، ركّز على الأيام.'}
استخدم day_index الفعلي ضمن المدى المطلوب.`;
    const chunk = await callGateway(userPrompt, schema);
    if (start === 1) { title = chunk.title_ar; summary = chunk.summary_ar; }
    for (const d of chunk.days) {
      d.games = (d.games || []).filter((g: any) => TEMPLATES.includes(g.template_id));
      allDays.push(d);
    }
  }
  return { title_ar: title, summary_ar: summary, days: allDays };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { profile, totalDays = 28, childProfileId } = await req.json();
    if (!profile || !childProfileId) {
      return new Response(JSON.stringify({ error: 'profile + childProfileId مطلوبان' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const days = Math.max(7, Math.min(120, totalDays));

    // Auth
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: serviceKey },
    });
    if (!userResp.ok) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { id: userId } = await userResp.json();

    const program = await generateInChunks(profile, days);

    // Insert program
    const insProgramResp = await fetch(`${supabaseUrl}/rest/v1/autism_programs`, {
      method: 'POST',
      headers: {
        apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json', Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId, child_profile_id: childProfileId,
        total_days: days, title_ar: program.title_ar, summary_ar: program.summary_ar,
      }),
    });
    if (!insProgramResp.ok) throw new Error(`insert program ${insProgramResp.status}: ${await insProgramResp.text()}`);
    const [progRow] = await insProgramResp.json();

    // Insert days + games
    for (const d of program.days) {
      const dayResp = await fetch(`${supabaseUrl}/rest/v1/autism_program_days`, {
        method: 'POST',
        headers: {
          apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json', Prefer: 'return=representation',
        },
        body: JSON.stringify({
          program_id: progRow.id, day_index: d.day_index,
          theme_ar: d.theme_ar, focus_skill_ar: d.focus_skill_ar, rationale_ar: d.rationale_ar,
        }),
      });
      const [dayRow] = await dayResp.json();
      const games = (d.games || []).map((g: any, i: number) => ({
        day_id: dayRow.id, order_index: i,
        template_id: g.template_id, title_ar: g.title_ar,
        instructions_ar: g.instructions_ar, target_skill_ar: g.target_skill_ar,
        difficulty: g.difficulty, duration_sec: g.duration_sec,
        success_criteria_ar: g.success_criteria_ar,
        adaptations_ar: g.adaptations_ar ?? [],
      }));
      if (games.length) {
        await fetch(`${supabaseUrl}/rest/v1/autism_program_games`, {
          method: 'POST',
          headers: {
            apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(games),
        });
      }
    }

    return new Response(JSON.stringify({ programId: progRow.id, shareToken: progRow.share_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('autism-generate-program', e);
    const msg = e instanceof Error ? e.message : 'error';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
