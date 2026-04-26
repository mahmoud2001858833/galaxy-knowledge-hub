import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { essayType, wordCount, additionalInfo } = await req.json()
    
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const essayTypeArabic = {
      article: 'مقالة',
      story: 'قصة',
      descriptive: 'تعبير وصفي',
      argumentative: 'تعبير حجاجي',
      narrative: 'تعبير سردي'
    }[essayType] || 'مقالة'
    
    const prompt = `أنت كاتب متخصص في اللغة العربية. قم بكتابة ${essayTypeArabic} متكاملة باللغة العربية الفصحى.

المواصفات:
- نوع التعبير: ${essayTypeArabic}
- عدد الكلمات المطلوب: ${wordCount} كلمة (تقريباً)
${additionalInfo ? `- معلومات إضافية: ${additionalInfo}` : ''}

يجب أن يكون التعبير:
1. مكتوباً بلغة عربية فصيحة وسليمة
2. متناسقاً ومترابطاً
3. يحتوي على مقدمة وعرض وخاتمة
4. يتبع خصائص نوع التعبير المطلوب
5. خالياً من الأخطاء الإملائية والنحوية

اكتب التعبير الآن:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from AI API')
    }
    
    const essay = data.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ essay }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ في معالجة الطلب' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
