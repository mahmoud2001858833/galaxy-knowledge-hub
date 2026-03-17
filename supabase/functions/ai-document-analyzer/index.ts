import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { text, imageBase64, language = 'ar', analysisType = 'full' } = await req.json();
    
    const API_KEY = Deno.env.get('GJU_AI_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isArabic = language === 'ar';

    const systemPrompt = isArabic
      ? `أنت محلل مستندات ذكي متقدم. حلّل المحتوى التالي وقدّم:
1. **ملخص شامل**: ملخص واضح ومختصر للمحتوى
2. **النقاط الرئيسية**: استخراج أهم 5-8 نقاط رئيسية
3. **المفاهيم الأساسية**: شرح المفاهيم والمصطلحات المهمة
4. **أسئلة مراجعة**: 5 أسئلة مراجعة متنوعة (اختيار متعدد + مقالية) مع الإجابات
5. **خريطة ذهنية**: هيكل خريطة ذهنية للمحتوى
6. **تحليل إضافي**: أي ملاحظات أو توصيات إضافية

أجب بصيغة JSON:
{
  "summary": "الملخص",
  "keyPoints": ["نقطة 1", "نقطة 2"],
  "concepts": [{"term": "مصطلح", "definition": "تعريف"}],
  "reviewQuestions": [{"question": "سؤال", "type": "mcq|essay", "options": ["خيار1"], "answer": "الإجابة"}],
  "mindMap": {"central": "الموضوع", "branches": [{"title": "فرع", "items": ["عنصر"]}]},
  "additionalNotes": "ملاحظات"
}`
      : `You are an advanced AI document analyzer. Analyze the following content and provide:
1. **Comprehensive Summary**
2. **Key Points**: 5-8 main points
3. **Core Concepts**: Important terms with definitions
4. **Review Questions**: 5 diverse questions (MCQ + essay) with answers
5. **Mind Map**: Structure for the content
6. **Additional Analysis**

Respond in JSON:
{
  "summary": "summary",
  "keyPoints": ["point 1"],
  "concepts": [{"term": "term", "definition": "def"}],
  "reviewQuestions": [{"question": "q", "type": "mcq|essay", "options": ["opt"], "answer": "ans"}],
  "mindMap": {"central": "topic", "branches": [{"title": "branch", "items": ["item"]}]},
  "additionalNotes": "notes"
}`;

    const parts: any[] = [{ text: systemPrompt + "\n\nContent:\n" + (text || "Analyze the attached image") }];
    
    if (imageBase64) {
      const mimeMatch = imageBase64.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = imageBase64.replace(/^data:.*?;base64,/, '');
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const result = JSON.parse(responseText);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response(JSON.stringify({
        summary: responseText,
        keyPoints: [],
        concepts: [],
        reviewQuestions: [],
        mindMap: { central: "", branches: [] },
        additionalNotes: ""
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
