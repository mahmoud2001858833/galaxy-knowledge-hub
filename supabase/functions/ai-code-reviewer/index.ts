import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { code, language: progLang = 'javascript', reviewType = 'full', uiLanguage = 'ar' } = await req.json();
    
    const API_KEY = Deno.env.get('GJU_AI_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isArabic = uiLanguage === 'ar';

    const prompt = isArabic
      ? `أنت مراجع أكواد خبير ومتقدم جداً. حلّل الكود التالي تحليلاً شاملاً:

لغة البرمجة: ${progLang}
نوع المراجعة: ${reviewType}

الكود:
\`\`\`${progLang}
${code}
\`\`\`

قدّم تحليلاً شاملاً يتضمن:
1. **التقييم العام**: تقييم من 100 مع وصف
2. **الأخطاء**: أخطاء برمجية مع رقم السطر والشرح
3. **تحسينات الأداء**: اقتراحات لتحسين الأداء
4. **الأمان**: ثغرات أمنية محتملة
5. **أفضل الممارسات**: اقتراحات لاتباع أفضل الممارسات
6. **الكود المُحسّن**: نسخة محسّنة من الكود

أجب بصيغة JSON:
{
  "overallScore": 75,
  "overallAssessment": "تقييم عام",
  "bugs": [{"line": 1, "severity": "high|medium|low", "description": "وصف", "fix": "الإصلاح"}],
  "performance": [{"issue": "مشكلة", "suggestion": "اقتراح", "impact": "high|medium|low"}],
  "security": [{"vulnerability": "ثغرة", "risk": "high|medium|low", "fix": "الإصلاح"}],
  "bestPractices": [{"current": "الحالي", "suggested": "المقترح", "reason": "السبب"}],
  "improvedCode": "الكود المحسّن",
  "summary": "ملخص التحليل"
}`
      : `You are an expert code reviewer. Analyze this code comprehensively:

Language: ${progLang}
Review type: ${reviewType}

Code:
\`\`\`${progLang}
${code}
\`\`\`

Provide:
1. Overall score (0-100)
2. Bugs with line numbers
3. Performance improvements
4. Security vulnerabilities
5. Best practices
6. Improved code version

Respond in JSON:
{
  "overallScore": 75,
  "overallAssessment": "assessment",
  "bugs": [{"line": 1, "severity": "high|medium|low", "description": "desc", "fix": "fix"}],
  "performance": [{"issue": "issue", "suggestion": "sug", "impact": "high|medium|low"}],
  "security": [{"vulnerability": "vuln", "risk": "high|medium|low", "fix": "fix"}],
  "bestPractices": [{"current": "curr", "suggested": "sug", "reason": "reason"}],
  "improvedCode": "improved code",
  "summary": "summary"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      return new Response(JSON.stringify(JSON.parse(responseText)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response(JSON.stringify({ overallScore: 0, summary: responseText, bugs: [], performance: [], security: [], bestPractices: [], improvedCode: "" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Code review failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
