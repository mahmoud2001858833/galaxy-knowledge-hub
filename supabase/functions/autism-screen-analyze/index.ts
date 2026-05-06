// Autism screening AI analyzer (v2).
// Returns risk_band + DSM-5 support level + functional/cognitive profile +
// recommended game tracks for the AI therapy generator.
// Primary key: AUTISM_GEMINI_API_KEY_V2 (with fallback to AUTISM_GEMINI_API_KEY,
// then Lovable AI Gateway on quota errors).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOURCES = `
- CDC Diagnosis (HCP): https://www.cdc.gov/autism/hcp/diagnosis/index.html
- CDC How is Autism Diagnosed: https://www.cdc.gov/autism/diagnosis/index.html
- CDC Clinical Screening: https://www.cdc.gov/autism/hcp/screening/index.html
- CDC Treatment & Intervention: https://www.cdc.gov/autism/treatment/index.html
- AAP (Hyman et al., 2020): https://publications.aap.org/pediatrics/article/145/1/e20193447/36917
- NICE CG170: https://www.nice.org.uk/guidance/cg170
- WHO Autism Fact Sheet: https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders
- WHO Caregiver Skills Training: https://www.who.int/teams/mental-health-and-substance-use/policy-law-rights/caregiver-skills-training
- DSM-5 ASD Severity Levels (APA, 2013)
`;

const SYSTEM_PROMPT = `أنت مساعد متخصص في تحليل نتائج فحص أولي لطيف التوحد.
يجب أن يكون تحليلك مستنداً حصراً للمصادر الرسمية:
${SOURCES}

قواعد صارمة:
1. لا تُصدر تشخيصاً نهائياً. استخدم لغة "مؤشرات" و"مستوى دعم تقديري" و"يُنصح بتقييم متخصص".
2. التشخيص النهائي وفق DSM-5 يتطلب فريقاً سريرياً متعدد التخصصات.
3. حدّد مستوى الدعم التقديري (1/2/3) وفق DSM-5 بناءً على شدة المؤشرات.
4. حدّد الملف الوظيفي السائد: social_communication | sensory | restricted_repetitive | language | mixed
5. حدّد الملف المعرفي التقديري: high_functioning | moderate | needs_substantial_support
6. أعطِ confidence_score (0-100) يعكس وضوح المؤشرات.
7. اقترح recommended_game_tracks (3-5) من: attention, joint_attention, emotion, sensory_regulation, imitation, sequencing, flexibility, requesting, social_scenarios, turn_taking
8. اكتب بالعربية الفصحى الواضحة، أرقام عربية غربية (1, 2, 3).
9. أعد JSON صرف فقط وفق schema، دون نص خارجي.`;

const TOOL_SCHEMA = {
  type: 'function',
  function: {
    name: 'autism_report',
    description: 'تقرير فحص أولي موسّع لطيف التوحد',
    parameters: {
      type: 'object',
      properties: {
        risk_band: { type: 'string', enum: ['low', 'monitor', 'refer'] },
        support_level: { type: 'integer', enum: [1, 2, 3] },
        functional_profile: { type: 'string', enum: ['social_communication', 'sensory', 'restricted_repetitive', 'language', 'mixed'] },
        cognitive_profile: { type: 'string', enum: ['high_functioning', 'moderate', 'needs_substantial_support'] },
        confidence_score: { type: 'number' },
        recommended_game_tracks: { type: 'array', items: { type: 'string' } },
        summary_ar: { type: 'string' },
        domain_scores: {
          type: 'object',
          properties: {
            social_communication: { type: 'number' },
            restricted_repetitive: { type: 'number' },
            sensory: { type: 'number' },
            language: { type: 'number' },
            play: { type: 'number' },
          },
          required: ['social_communication', 'restricted_repetitive', 'sensory', 'language', 'play'],
        },
        observations: { type: 'array', items: { type: 'string' } },
        red_flags: { type: 'array', items: { type: 'string' } },
        strengths: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        next_steps: { type: 'array', items: { type: 'string' } },
        citations: {
          type: 'array',
          items: {
            type: 'object',
            properties: { title: { type: 'string' }, url: { type: 'string' } },
            required: ['title', 'url'],
          },
        },
      },
      required: ['risk_band', 'support_level', 'functional_profile', 'cognitive_profile', 'confidence_score', 'recommended_game_tracks', 'summary_ar', 'domain_scores', 'observations', 'red_flags', 'strengths', 'recommendations', 'next_steps', 'citations'],
    },
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(apiKey: string, userPrompt: string, model = 'gemini-2.5-flash'): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT + '\n\nأعد JSON فقط وفق:\n' + JSON.stringify(TOOL_SCHEMA.function.parameters) }] },
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return JSON.parse(text);
    }
    const t = await resp.text();
    lastErr = new Error(`Gemini ${resp.status}: ${t}`);
    // Retry on overload/rate-limit
    if (resp.status === 503 || resp.status === 429) {
      await sleep(800 * (attempt + 1));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;
}

async function callGateway(userPrompt: string, model = 'google/gemini-2.5-flash'): Promise<any> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: 'function', function: { name: 'autism_report' } },
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error('No tool call returned');
      return JSON.parse(args);
    }
    const t = await resp.text();
    lastErr = new Error(`Gateway ${resp.status}: ${t}`);
    if (resp.status === 503 || resp.status === 429) {
      await sleep(800 * (attempt + 1));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { ageTrack, demographics, questionnaireResult, gameInsights } = body ?? {};
    if (!ageTrack) {
      return new Response(JSON.stringify({ error: 'ageTrack مطلوب' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `بيانات الفحص الأولي:
- المسار العمري: ${ageTrack}
- البيانات الديموغرافية: ${JSON.stringify(demographics ?? {})}
- نتيجة الاستبيان: ${JSON.stringify(questionnaireResult ?? null, null, 2)}
- ملاحظات الألعاب: ${JSON.stringify(gameInsights ?? [], null, 2)}

حلّل هذه البيانات وأعطِ تقريراً عربياً متكاملاً يشمل: المستوى التقديري للدعم وفق DSM-5، الملف الوظيفي والمعرفي، ومسارات الألعاب الموصى بها لخطة العلاج التفاعلية.`;

    const keys = [
      Deno.env.get('AUTISM_GEMINI_API_KEY_V2'),
      Deno.env.get('AUTISM_GEMINI_API_KEY'),
    ].filter(Boolean) as string[];

    let report: any = null;
    let provider = 'gemini';
    let lastErr: any = null;
    for (const k of keys) {
      try {
        report = await callGemini(k, userPrompt);
        break;
      } catch (e) {
        lastErr = e;
        console.warn('Gemini key failed:', e);
      }
    }
    if (!report) {
      provider = 'gateway';
      try {
        report = await callGateway(userPrompt);
      } catch (e) {
        throw lastErr ?? e;
      }
    }

    return new Response(JSON.stringify({ report, provider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('autism-screen-analyze error:', e);
    const msg = e instanceof Error ? e.message : 'خطأ غير معروف';
    const status = msg.includes('429') ? 429 : msg.includes('402') ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
