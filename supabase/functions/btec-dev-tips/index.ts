import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = "AIzaSyD4rUuEExFqobyo5Vju3Mu348TQ-5tDgSw";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_description } = await req.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `أنت خبير تطوير برمجي. قم بتقييم المشروع التالي وأعطِ نصائح تفصيلية للتطوير.\n\nوصف المشروع:\n${project_description}\n\nأعط:\n1. تقييم شامل للمشروع\n2. نقاط القوة\n3. نقاط يمكن تحسينها\n4. اقتراحات محددة للتطوير\n5. أفضل الممارسات التي يجب اتباعها\n\nأجب بالعربية بطريقة منظمة وواضحة.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    const data = await response.json();
    const tips = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ tips }), {
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
