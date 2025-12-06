import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, currentValue } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing math question:', question);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `أنت مساعد رياضي ذكي متخصص في حل المسائل الرياضية. 
    
مهامك:
1. حل المسائل الرياضية بدقة
2. شرح خطوات الحل بوضوح
3. تقديم النتيجة النهائية

القيمة الحالية في الحاسبة: ${currentValue}

قواعد الإجابة:
- إذا كان السؤال يتطلب حساباً، قدم الإجابة مع الشرح
- استخدم اللغة العربية
- كن مختصراً ومفيداً
- إذا كان السؤال عن عملية حسابية، أضف النتيجة الرقمية في نهاية إجابتك بعد كلمة "النتيجة:"

أمثلة:
- سؤال: "ما هو جذر 144؟" - الإجابة: "جذر 144 = 12، لأن 12 × 12 = 144. النتيجة: 12"
- سؤال: "احسب 15% من 200" - الإجابة: "15% من 200 = (15/100) × 200 = 30. النتيجة: 30"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد للحساب" }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'لم أتمكن من معالجة السؤال';

    // Extract numeric result if present
    let result: number | undefined;
    const resultMatch = answer.match(/النتيجة:\s*([-\d.]+)/);
    if (resultMatch) {
      result = parseFloat(resultMatch[1]);
    }

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ answer, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in math-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
