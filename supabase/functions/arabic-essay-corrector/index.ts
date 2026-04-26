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
    const { text, essayType, stage } = await req.json()
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const essayTypeArabic = {
      article: 'مقالة',
      story: 'قصة',
      descriptive: 'وصفي',
      argumentative: 'حجاجي',
      narrative: 'سردي'
    }[essayType] || essayType;
    
    const prompt = `أنت مصحح لغوي وأدبي محترف متخصص في اللغة العربية. قم بتصحيح النص التالي تصحيحاً كاملاً وشاملاً.

النص:
"${text}"

نوع المقالة: ${essayTypeArabic}

المطلوب:

**📊 النتيجة الإجمالية:**
[اكتب هنا تقييم شامل للمقالة من 100 مع ملاحظة عامة]

**1️⃣ التصحيح الإملائي:**
- [قائمة بالأخطاء الإملائية مع التصحيح]
- [شرح القواعد الإملائية]

**2️⃣ التصحيح القواعدي والنحوي:**
- [قائمة بالأخطاء النحوية والقواعدية مع التصحيح]
- [شرح القواعد النحوية المطبقة]

**3️⃣ التوافق مع نوع المقالة:**
- [تقييم التوافق مع نوع المقالة]
- [نقاط القوة والضعف]
- [اقتراحات محددة للتحسين]

**4️⃣ النص المصحح النهائي:**
[اكتب النص بعد التصحيح الكامل]

---
يرجى أن يكون التصحيح دقيقاً ومفصلاً وشاملاً لجميع جوانب الكتابة العربية.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }]
        })
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد إلى Lovable AI' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from AI API')
    }
    
    const correction = data.choices[0].message.content

    return new Response(
      JSON.stringify({ correction }),
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
