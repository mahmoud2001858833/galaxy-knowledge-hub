import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, temperature, airQuality, population, solarEnergy, timeOfDay } = await req.json();

    const API_KEY = 'AIzaSyABqat_3N9lZNurPyi90pb94e88ihh2oUA';

    const systemPrompt = `أنت خبير في التصميم الحضري الذكي والمدن المستقبلية. تحلل سيناريوهات المدن وتقترح حلول تصميمية مبتكرة.

المعطيات الحالية للمدينة:
- درجة الحرارة: ${temperature}°C
- جودة الهواء: ${airQuality}%
- كثافة السكان: ${population}%
- مستوى الطاقة الشمسية: ${solarEnergy}%
- الوقت: ${timeOfDay === 'day' ? 'نهار' : 'ليل'}

عند تحليل السيناريو، قدم:
1. تحليل الوضع الحالي
2. التحديات المتوقعة
3. حلول تصميمية مبتكرة (3-5 حلول)
4. كيف ستتكيف المباني والبنية التحتية
5. تأثير الحلول على راحة السكان والاستدامة

اكتب بالعربية بشكل واضح ومنظم.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nسيناريو المستخدم: ${scenario}` }] }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'فشل في الاتصال بالذكاء الاصطناعي' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم الحصول على رد';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
