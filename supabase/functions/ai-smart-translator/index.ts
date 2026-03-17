import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { text, sourceLang = 'ar', targetLang = 'en', mode = 'translate', uiLanguage = 'ar' } = await req.json();
    
    const API_KEY = Deno.env.get('GJU_AI_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isArabic = uiLanguage === 'ar';
    const langNames: Record<string, string> = { ar: 'العربية', en: 'الإنجليزية', fr: 'الفرنسية', es: 'الإسبانية', de: 'الألمانية', tr: 'التركية' };

    const prompt = isArabic
      ? `أنت مترجم فوري ذكي ومعلم لغات متقدم. ترجم النص التالي مع تحليل لغوي شامل:

النص: "${text}"
من: ${langNames[sourceLang] || sourceLang}
إلى: ${langNames[targetLang] || targetLang}
الوضع: ${mode === 'translate' ? 'ترجمة' : mode === 'grammar' ? 'تصحيح قواعد' : 'محادثة'}

قدّم:
1. الترجمة الدقيقة
2. ترجمة بديلة
3. تحليل نحوي للجملة الأصلية
4. تصحيح الأخطاء اللغوية إن وجدت
5. كلمات مفتاحية مع النطق الصوتي
6. أمثلة استخدام في سياقات مختلفة
7. مستوى صعوبة النص

أجب بصيغة JSON:
{
  "translation": "الترجمة",
  "alternativeTranslation": "ترجمة بديلة",
  "grammarAnalysis": "تحليل نحوي",
  "corrections": [{"original": "خطأ", "corrected": "صحيح", "rule": "القاعدة"}],
  "keyVocabulary": [{"word": "كلمة", "translation": "ترجمة", "pronunciation": "نطق", "partOfSpeech": "نوع"}],
  "usageExamples": [{"source": "مثال أصلي", "target": "ترجمة المثال"}],
  "difficultyLevel": "beginner|intermediate|advanced",
  "tips": ["نصيحة 1"]
}`
      : `You are an advanced AI translator and language teacher. Translate with comprehensive linguistic analysis:

Text: "${text}"
From: ${sourceLang}
To: ${targetLang}
Mode: ${mode}

Provide translation, alternative, grammar analysis, corrections, vocabulary with pronunciation, usage examples, and difficulty level.

Respond in JSON:
{
  "translation": "translation",
  "alternativeTranslation": "alt",
  "grammarAnalysis": "analysis",
  "corrections": [{"original": "err", "corrected": "fix", "rule": "rule"}],
  "keyVocabulary": [{"word": "w", "translation": "t", "pronunciation": "p", "partOfSpeech": "pos"}],
  "usageExamples": [{"source": "src", "target": "tgt"}],
  "difficultyLevel": "beginner|intermediate|advanced",
  "tips": ["tip"]
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
      return new Response(JSON.stringify({ translation: responseText, alternativeTranslation: "", grammarAnalysis: "", corrections: [], keyVocabulary: [], usageExamples: [], difficultyLevel: "intermediate", tips: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Translation failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
