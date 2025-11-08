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
    const { text, mode } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    
    if (mode === 'identify') {
      prompt = `أنت خبير في علم العروض العربي. حلل الأبيات الشعرية التالية وحدد:

1. **البحر الشعري**: اذكر اسم البحر بدقة
2. **التفعيلات**: اكتب التفعيلات العروضية لكل شطر
3. **الكتابة العروضية**: اكتب البيت بالطريقة العروضية
4. **الزحافات والعلل**: إن وُجدت
5. **القافية ورويّها**: حدد حرف الروي ونوع القافية

الأبيات:
${text}

قدم التحليل بشكل واضح ومنظم.`;
    } else if (mode === 'ai_chat') {
      prompt = `أنت مساعد ذكي متخصص في علم العروض العربي. أنت خبير في:
- البحور الشعرية الستة عشر
- التفعيلات العروضية
- الزحافات والعلل
- القافية والروي
- الكتابة العروضية
- تقطيع الشعر

السؤال: ${text}

قدم إجابة دقيقة ومفصلة مع أمثلة إن أمكن.`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من معالجة الطلب.';

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
