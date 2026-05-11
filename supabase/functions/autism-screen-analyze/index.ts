import { geminiFetch } from "../_shared/gemini-shim.ts";
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

const SYSTEM_PROMPT = `أنت مساعد متخصص في تحليل نتائج فحص أولي لطيف التوحد وفق DSM-5 (ASD).
يجب أن يكون تحليلك مستنداً حصراً للمصادر الرسمية:
${SOURCES}

قواعد صارمة:
1. لا تُصدر تشخيصاً نهائياً. استخدم لغة "مؤشرات" و"مستوى دعم تقديري" و"يُنصح بتقييم متخصص".
2. التشخيص النهائي وفق DSM-5 يتطلب فريقاً سريرياً متعدد التخصصات (طبيب أطفال نمائي، أخصائي نفسي، أخصائي نطق، علاج وظيفي).
3. حدّد مستوى الدعم التقديري (1/2/3) وفق DSM-5 بناءً على شدة المؤشرات في كل بُعد، ووضّح الأدلة الرقمية التي استندت إليها (من الاستبيان والألعاب).
4. حدّد الملف الوظيفي السائد: social_communication | sensory | restricted_repetitive | language | mixed
5. حدّد الملف المعرفي التقديري: high_functioning | moderate | needs_substantial_support
6. أعطِ confidence_score (0-100) يعكس وضوح المؤشرات وقوة الأدلة.
7. لكل بُعد من أبعاد DSM-5 الثلاثة (التواصل الاجتماعي A، السلوك المقيّد/المتكرر B، الحساسية الحسية) اذكر:
   - score (0-100)
   - confidence (0-100)
   - evidence: قائمة بالأدلة الرقمية ("الاستبيان أظهر X%"، "لعبة Y أظهرت Z").
   - clinical_note: ملاحظة سريرية موجزة لما يعنيه هذا للأهل.
8. اقترح recommended_game_tracks (3-5) من: attention, joint_attention, emotion, sensory_regulation, imitation, sequencing, flexibility, requesting, social_scenarios, turn_taking
9. اقترح parent_actions (4-6) أفعال محددة لولي الأمر يمكن البدء بها هذا الأسبوع.
10. اقترح referral_priority: 'immediate' | 'within_month' | 'monitor'.
11. اكتب بالعربية الفصحى الواضحة، أرقام عربية غربية (1, 2, 3).
12. أعد JSON صرف فقط وفق schema، دون نص خارجي.`;

const TOOL_SCHEMA = {
  type: 'function',
  function: {
    name: 'autism_report',
    description: 'تقرير فحص أولي موسّع لطيف التوحد وفق DSM-5',
    parameters: {
      type: 'object',
      properties: {
        risk_band: { type: 'string', enum: ['low', 'monitor', 'refer'] },
        support_level: { type: 'integer', enum: [1, 2, 3] },
        functional_profile: { type: 'string', enum: ['social_communication', 'sensory', 'restricted_repetitive', 'language', 'mixed'] },
        cognitive_profile: { type: 'string', enum: ['high_functioning', 'moderate', 'needs_substantial_support'] },
        confidence_score: { type: 'number' },
        recommended_game_tracks: { type: 'array', items: { type: 'string' } },
        referral_priority: { type: 'string', enum: ['immediate', 'within_month', 'monitor'] },
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
        dsm_dimensions: {
          type: 'object',
          properties: {
            social_communication: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                confidence: { type: 'number' },
                evidence: { type: 'array', items: { type: 'string' } },
                clinical_note: { type: 'string' },
              },
              required: ['score', 'confidence', 'evidence', 'clinical_note'],
            },
            restricted_repetitive: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                confidence: { type: 'number' },
                evidence: { type: 'array', items: { type: 'string' } },
                clinical_note: { type: 'string' },
              },
              required: ['score', 'confidence', 'evidence', 'clinical_note'],
            },
            sensory: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                confidence: { type: 'number' },
                evidence: { type: 'array', items: { type: 'string' } },
                clinical_note: { type: 'string' },
              },
              required: ['score', 'confidence', 'evidence', 'clinical_note'],
            },
          },
          required: ['social_communication', 'restricted_repetitive', 'sensory'],
        },
        observations: { type: 'array', items: { type: 'string' } },
        red_flags: { type: 'array', items: { type: 'string' } },
        strengths: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        parent_actions: { type: 'array', items: { type: 'string' } },
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
      required: ['risk_band', 'support_level', 'functional_profile', 'cognitive_profile', 'confidence_score', 'recommended_game_tracks', 'referral_priority', 'summary_ar', 'domain_scores', 'dsm_dimensions', 'observations', 'red_flags', 'strengths', 'recommendations', 'parent_actions', 'next_steps', 'citations'],
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
  const key = "shim-key";
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await geminiFetch("ai-shim", {
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
    const { ageTrack, demographics, questionnaireResult, gameInsights, dsmRollup } = body ?? {};
    if (!ageTrack) {
      return new Response(JSON.stringify({ error: 'ageTrack مطلوب' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `بيانات الفحص الأولي:
- المسار العمري: ${ageTrack}
- البيانات الديموغرافية: ${JSON.stringify(demographics ?? {})}
- نتيجة الاستبيان: ${JSON.stringify(questionnaireResult ?? null, null, 2)}
- ملاحظات الألعاب (مع features رقمية و dsm_contributions): ${JSON.stringify(gameInsights ?? [], null, 2)}
- تجميع DSM-5 المحلي (Pre-computed rollup للمساعدة): ${JSON.stringify(dsmRollup ?? null, null, 2)}

استخدم البيانات الرقمية أعلاه كأدلة في حقل evidence لكل بُعد، وحلّل نقاط القوة والضعف. أعطِ تقريراً عربياً متكاملاً يشمل: المستوى التقديري للدعم وفق DSM-5، dsm_dimensions مع evidence وclinical_note لكل بُعد، الملف الوظيفي والمعرفي، parent_actions ملموسة، referral_priority، ومسارات الألعاب الموصى بها.`;

    const keys = [
      Deno.env.get('AUTISM_GEMINI_API_KEY_V2'),
      Deno.env.get('AUTISM_GEMINI_API_KEY'),
    ].filter(Boolean) as string[];

    let report: any = null;
    let provider = 'gemini';
    let lastErr: any = null;

    const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    for (const model of geminiModels) {
      for (const k of keys) {
        try {
          report = await callGemini(k, userPrompt, model);
          break;
        } catch (e) {
          lastErr = e;
          console.warn(`Gemini ${model} key failed:`, (e as Error).message);
        }
      }
      if (report) break;
    }

    if (!report) {
      provider = 'gateway';
      const gwModels = ['google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite'];
      for (const m of gwModels) {
        try {
          report = await callGateway(userPrompt, m);
          break;
        } catch (e) {
          lastErr = e;
          console.warn(`Gateway ${m} failed:`, (e as Error).message);
        }
      }
      if (!report) throw lastErr ?? new Error('AI providers unavailable');
    }

    return new Response(JSON.stringify({ report, provider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('autism-screen-analyze error:', e);
    const msg = e instanceof Error ? e.message : 'خطأ غير معروف';
    const friendly = msg.includes('503') || msg.toLowerCase().includes('overload') || msg.toLowerCase().includes('unavailable')
      ? 'نماذج الذكاء الاصطناعي مشغولة حالياً بسبب ضغط مرتفع. يرجى المحاولة بعد دقيقة.'
      : msg.includes('429')
      ? 'تم تجاوز الحصة المسموحة مؤقتاً. حاول بعد قليل.'
      : msg;
    // Always return 200 so the client receives the friendly message instead of a generic non-2xx
    return new Response(JSON.stringify({ error: friendly, raw: msg }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
