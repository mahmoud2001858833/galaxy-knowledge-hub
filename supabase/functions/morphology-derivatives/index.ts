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
    const { word } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `أنت خبير في علم الصرف العربي. قم بتحليل الكلمة التالية وإظهار جميع مشتقاتها:

الكلمة: ${word}

قدم:
1. الجذر الثلاثي للكلمة
2. المشتقات الصرفية (اسم الفاعل، اسم المفعول، المصدر، صيغ المبالغة، الصفة المشبهة، اسم الزمان والمكان، اسم الآلة)
3. التصريفات المختلفة (الماضي، المضارع، الأمر)
4. شرح مختصر لكل مشتق

نسق الإخراج بشكل واضح ومنظم مع أمثلة.`;

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
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من تحليل الكلمة.';

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