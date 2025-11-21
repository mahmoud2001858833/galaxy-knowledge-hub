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
    const GEMINI_API_KEY = 'AIzaSyA1l95elLm-B3zvDtcaTolkCKZ-kd1vGPU';
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `أنت خبير في علم الصرف العربي. قم بتحليل الكلمة التالية بالتفصيل:

الكلمة: ${word}

قدم:
1. **الجذر**: ما هو الجذر الثلاثي أو الرباعي للكلمة؟
2. **الوزن الصرفي**: ما هو وزنها على الميزان الصرفي؟
3. **الزيادات**: ما هي الحروف الزائدة وأماكنها؟
4. **الدلالة اللغوية**: ما هي الدلالة اللغوية للزيادات والتغييرات؟
5. **أمثلة مشابهة**: أعط 3 كلمات على نفس الوزن

نسق الإخراج بشكل جميل ومنظم مع شرح واضح.`;

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