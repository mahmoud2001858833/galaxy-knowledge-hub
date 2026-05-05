// Generates a personalized therapy plan with interactive games for an autistic
// child based on their diagnostic profile. Returns 4 stages with 3-4 games each,
// drawn from a fixed catalog of game templates.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMPLATES = [
  { id: 'bubble_tracking', skill: 'انتباه بصري', track: 'attention' },
  { id: 'look_with_me', skill: 'انتباه مشترك', track: 'joint_attention' },
  { id: 'emotion_cards', skill: 'تمييز المشاعر', track: 'emotion' },
  { id: 'calm_sounds', skill: 'تنظيم حسي سمعي', track: 'sensory_regulation' },
  { id: 'story_sequence', skill: 'تسلسل أحداث', track: 'sequencing' },
  { id: 'magic_mirror', skill: 'تقليد حركات', track: 'imitation' },
  { id: 'change_the_rule', skill: 'مرونة معرفية', track: 'flexibility' },
  { id: 'request_to_get', skill: 'طلبات وظيفية', track: 'requesting' },
  { id: 'social_choice', skill: 'سيناريوهات اجتماعية', track: 'social_scenarios' },
  { id: 'rhythm_turns', skill: 'تبادل الأدوار', track: 'turn_taking' },
  { id: 'spot_difference', skill: 'انتباه للتفاصيل', track: 'attention' },
  { id: 'name_response', skill: 'استجابة للاسم', track: 'attention' },
];

const SYSTEM_PROMPT = `أنت أخصائي تدخّل مبكر لطيف التوحد. مهمتك تصميم خطة علاج تفاعلية مكوّنة من 4 مراحل بالترتيب:
1. التأسيس (انتباه واستجابة أساسية)
2. التفاعل (انتباه مشترك وتقليد)
3. التواصل (مشاعر، طلبات، حوار بسيط)
4. الدمج (لعب رمزي ومرونة وحل مشكلات اجتماعية)

اختر 3-4 ألعاب من القائمة لكل مرحلة بحيث تناسب:
- مستوى الدعم DSM-5 (1/2/3): مستوى 3 يحتاج ألعاب أبسط ومدّة أقصر.
- الملف الوظيفي: ركّز على الجانب الأضعف.
- العمر.

قائمة قوالب الألعاب المسموح بها (استخدم template_id حرفياً):
${TEMPLATES.map(t => `- ${t.id} (${t.skill}, مسار: ${t.track})`).join('\n')}

اكتب بالعربية الفصحى. أعد JSON فقط وفق المخطط.`;

const TOOL_SCHEMA = {
  type: 'function',
  function: {
    name: 'therapy_plan',
    description: 'خطة علاج تفاعلية مخصّصة',
    parameters: {
      type: 'object',
      properties: {
        plan_title: { type: 'string' },
        plan_summary_ar: { type: 'string' },
        stages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stage: { type: 'integer' },
              title_ar: { type: 'string' },
              rationale_ar: { type: 'string' },
              games: {
                type: 'array',
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
            required: ['stage', 'title_ar', 'rationale_ar', 'games'],
          },
        },
        caregiver_tips_ar: { type: 'array', items: { type: 'string' } },
      },
      required: ['plan_title', 'plan_summary_ar', 'stages', 'caregiver_tips_ar'],
    },
  },
};

async function callGemini(apiKey: string, userPrompt: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + '\n\nأعد JSON فقط وفق:\n' + JSON.stringify(TOOL_SCHEMA.function.parameters) }] },
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(text);
}

async function callGateway(userPrompt: string): Promise<any> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      tools: [TOOL_SCHEMA],
      tool_choice: { type: 'function', function: { name: 'therapy_plan' } },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gateway ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error('No tool call returned');
  return JSON.parse(args);
}

function validatePlan(plan: any): any {
  const allowed = new Set(TEMPLATES.map(t => t.id));
  if (!plan?.stages?.length) throw new Error('No stages');
  plan.stages = plan.stages.map((s: any) => ({
    ...s,
    games: (s.games || []).filter((g: any) => allowed.has(g.template_id)),
  }));
  return plan;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { profile, recentSessions } = body ?? {};
    if (!profile) {
      return new Response(JSON.stringify({ error: 'profile مطلوب' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `صمّم خطة علاج تفاعلية مخصّصة لطفل بالخصائص التالية:
- العمر: ${profile.age_years ?? '—'} سنة
- مستوى الدعم (DSM-5): ${profile.support_level ?? '—'}
- الملف الوظيفي: ${profile.functional_profile ?? '—'}
- الملف المعرفي: ${profile.cognitive_profile ?? '—'}
- المسارات الموصى بها من التشخيص: ${(profile.recommended_game_tracks || []).join(', ')}
- ملاحظات إضافية من التقرير: ${profile.notes_summary ?? '—'}
- جلسات سابقة (إن وُجدت): ${JSON.stringify(recentSessions ?? [])}

قدّم 4 مراحل تدريجية، 3-4 ألعاب لكل مرحلة، مع تعليمات قصيرة بالعربية ومدّة وصعوبة وتعديلات للتكيّف.`;

    const keys = [
      Deno.env.get('AUTISM_GEMINI_API_KEY_V2'),
      Deno.env.get('AUTISM_GEMINI_API_KEY'),
    ].filter(Boolean) as string[];

    let plan: any = null;
    let provider = 'gemini';
    let lastErr: any = null;
    for (const k of keys) {
      try { plan = await callGemini(k, userPrompt); break; }
      catch (e) { lastErr = e; console.warn('gemini failed', e); }
    }
    if (!plan) {
      provider = 'gateway';
      try { plan = await callGateway(userPrompt); }
      catch (e) { throw lastErr ?? e; }
    }

    plan = validatePlan(plan);

    return new Response(JSON.stringify({ plan, provider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('autism-generate-therapy-plan error:', e);
    const msg = e instanceof Error ? e.message : 'خطأ غير معروف';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
