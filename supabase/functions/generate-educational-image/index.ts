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
    const { prompt, subject, grade } = await req.json();
    
    const geminiApiKey = Deno.env.get('JORDANIAN_AI_IMAGE_KEY')!;

    // Generate educational image
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `أنشئ صورة تعليمية توضيحية: ${prompt}\n\nالمادة: ${subject}\nالصف: ${grade}\n\nالصورة يجب أن تكون:\n- واضحة وبسيطة\n- مناسبة للمنهاج الأردني\n- ذات قيمة تعليمية\n- ملونة وجذابة`
            }]
          }],
          modalities: ["image", "text"],
          generationConfig: {
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    const imageBase64 = data.candidates?.[0]?.message?.images?.[0]?.image_url?.url || '';

    return new Response(
      JSON.stringify({ imageBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});