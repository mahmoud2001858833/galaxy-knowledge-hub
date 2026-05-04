// Autism screening AI analyzer.
// Uses dedicated Gemini key (AUTISM_GEMINI_API_KEY). Falls back to Lovable
// AI Gateway on quota errors. Output is grounded in CDC/AAP/NICE/WHO and
// must use risk-band language (never "diagnosis").

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOURCES = `
- CDC Diagnosis (HCP): https://www.cdc.gov/autism/hcp/diagnosis/index.html
- CDC How is Autism Diagnosed: https://www.cdc.gov/autism/diagnosis/index.html
- CDC Clinical Screening: https://www.cdc.gov/autism/hcp/screening/index.html
- CDC Treatment & Intervention: https://www.cdc.gov/autism/treatment/index.html
- CDC Accessing Services: https://www.cdc.gov/autism/services/index.html
- AAP (Hyman et al., 2020): https://publications.aap.org/pediatrics/article/145/1/e20193447/36917
- NICE CG170: https://www.nice.org.uk/guidance/cg170
- WHO Autism Fact Sheet: https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders
- WHO Caregiver Skills Training: https://www.who.int/teams/mental-health-and-substance-use/policy-law-rights/caregiver-skills-training
`;

const SYSTEM_PROMPT = `أنت مساعد متخصص في تحليل نتائج فحص أولي لطيف التوحد.
يجب أن يكون تحليلك مستنداً حصراً للمصادر الرسمية:
${SOURCES}

قواعد صارمة:
1. لا تُصدر تشخيصاً أبداً. استخدم لغة "مؤشرات" و"يستحق المتابعة" و"يُنصح بتقييم متخصص".
2. التشخيص النهائي وفق DSM-5 يتطلب فريقاً سريرياً متعدد التخصصات (CDC).
3. اربط ملاحظاتك بالمجالات: التواصل الاجتماعي، السلوك المقيّد/المتكرر، الحس، اللغة، اللعب.
4. التوصيات يجب أن تشمل: التدخل المبكر (خصوصاً تحت 3 سنوات وفق CDC)، تدريب مقدمي الرعاية (WHO CST)، التدخلات النفسية-الاجتماعية المبنية على اللعب (NICE).
5. إذا كان النطاق "refer"، اذكر صراحةً ضرورة مراجعة طبيب أطفال نمائي أو فريق تشخيص مختص.
6. اكتب بالعربية الفصحى الواضحة، مع ذكر الأرقام بالأرقام العربية الغربية (1, 2, 3).
7. أعد الإجابة كـ JSON صرف وفق المخطط المطلوب فقط، دون أي نص خارج JSON.`;

const TOOL_SCHEMA = {
  type: 'function',
  function: {
    name: 'autism_report',
    description: 'تقرير فحص أولي لطيف التوحد',
    parameters: {
      type: 'object',
      properties: {
        risk_band: { type: 'string', enum: ['low', 'monitor', 'refer'] },
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
      required: ['risk_band', 'summary_ar', 'domain_scores', 'observations', 'red_flags', 'strengths', 'recommendations', 'next_steps', 'citations'],
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
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + '\n\nأعد JSON فقط بالشكل التالي:\n' + JSON.stringify(TOOL_SCHEMA.function.parameters) }] },
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
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
      tool_choice: { type: 'function', function: { name: 'autism_report' } },
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
- نتيجة الاستبيان (محسوبة محلياً وفق هيكلية M-CHAT-R و DSM-5):
${JSON.stringify(questionnaireResult ?? null, null, 2)}
- ملاحظات الألعاب التفاعلية (مؤشرات سلوكية، ليست تشخيصية):
${JSON.stringify(gameInsights ?? [], null, 2)}

حلّل هذه البيانات وأعطِ تقريراً عربياً متكاملاً وفق المخطط المطلوب، مستنداً للمصادر المذكورة، مع قائمة citations تحتوي على روابط فعلية من تلك المصادر فقط.`;

    const geminiKey = Deno.env.get('AUTISM_GEMINI_API_KEY');
    let report: any;
    let provider = 'gemini';
    try {
      if (!geminiKey) throw new Error('No Gemini key');
      report = await callGemini(geminiKey, userPrompt);
    } catch (e) {
      console.warn('Gemini failed, falling back to Lovable Gateway:', e);
      provider = 'gateway';
      report = await callGateway(userPrompt);
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
