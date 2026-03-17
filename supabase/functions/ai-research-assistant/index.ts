import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { topic, researchType = 'comprehensive', depth = 'detailed', language = 'ar' } = await req.json();
    
    const API_KEY = Deno.env.get('GJU_AI_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isArabic = language === 'ar';

    const prompt = isArabic
      ? `أنت باحث أكاديمي ذكي متقدم. أنشئ تقريراً بحثياً شاملاً ومنظماً حول:

الموضوع: "${topic}"
نوع البحث: ${researchType}
العمق: ${depth}

أنشئ تقريراً بحثياً أكاديمياً يتضمن:
1. عنوان البحث
2. المقدمة والخلفية
3. 3-5 فصول رئيسية مع عناوين فرعية
4. الخاتمة والتوصيات
5. مراجع مقترحة
6. كلمات مفتاحية

أجب بصيغة JSON:
{
  "title": "عنوان البحث",
  "abstract": "الملخص (200 كلمة)",
  "introduction": "المقدمة",
  "chapters": [
    {
      "title": "عنوان الفصل",
      "content": "محتوى مفصّل",
      "subSections": [{"title": "عنوان فرعي", "content": "محتوى"}]
    }
  ],
  "conclusion": "الخاتمة",
  "recommendations": ["توصية 1"],
  "references": [{"title": "عنوان المرجع", "author": "المؤلف", "year": "السنة"}],
  "keywords": ["كلمة 1"],
  "wordCount": 2000
}`
      : `You are an advanced AI research assistant. Create a comprehensive research report on:

Topic: "${topic}"
Type: ${researchType}
Depth: ${depth}

Create an academic research report with:
1. Title
2. Introduction & Background
3. 3-5 main chapters with subsections
4. Conclusion & Recommendations
5. Suggested references
6. Keywords

Respond in JSON:
{
  "title": "title",
  "abstract": "abstract (200 words)",
  "introduction": "intro",
  "chapters": [{"title": "ch", "content": "content", "subSections": [{"title": "sub", "content": "c"}]}],
  "conclusion": "conclusion",
  "recommendations": ["rec"],
  "references": [{"title": "t", "author": "a", "year": "y"}],
  "keywords": ["kw"],
  "wordCount": 2000
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8192 }
        }),
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
      return new Response(JSON.stringify({ title: topic, abstract: responseText, chapters: [], conclusion: "", recommendations: [], references: [], keywords: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Research generation failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
