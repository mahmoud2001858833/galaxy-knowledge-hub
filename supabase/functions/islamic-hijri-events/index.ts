import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callLovableAI(prompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function generateImage(eventDescription: string, eventTitle: string): Promise<string | null> {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured for image generation');
      return null;
    }

    const imagePrompt = `Create a beautiful, artistic historical illustration representing: ${eventTitle}. 
    Scene description: ${eventDescription}
    Style: Elegant Islamic art style with geometric patterns, warm golden and emerald colors, 
    historical Middle Eastern architecture, peaceful atmosphere, no text or letters on the image, 
    just pure visual artistic representation. Ultra high quality, 16:9 aspect ratio.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: imagePrompt }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      console.error('Image generation error:', await response.text());
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, year, eventName, eventDescription, eventTitle } = await req.json();

    if (type === 'searchByYear') {
      const prompt = `أنت مؤرخ إسلامي متخصص. أعطني قائمة بأهم الأحداث التي وقعت في السنة ${year} الهجرية.

أرجع النتيجة بتنسيق JSON فقط بدون أي نص إضافي:
{
  "events": [
    {
      "title": "اسم الحدث",
      "hijriYear": "${year} هـ",
      "gregorianYear": "التاريخ الميلادي المقابل",
      "description": "وصف مختصر للحدث في جملتين",
      "significance": "أهمية الحدث التاريخية"
    }
  ]
}

إذا لم تكن هناك أحداث معروفة في هذه السنة، أرجع قائمة فارغة.`;

      const result = await callLovableAI(prompt);
      
      let events = [];
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          events = parsed.events || [];
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'searchByEvent') {
      const prompt = `أنت مؤرخ إسلامي متخصص. أعطني معلومات تفصيلية ومشوقة عن الحدث التالي: "${eventName}"

أرجع النتيجة بتنسيق JSON فقط بدون أي نص إضافي:
{
  "event": {
    "title": "اسم الحدث الكامل",
    "hijriYear": "السنة الهجرية",
    "gregorianYear": "السنة الميلادية",
    "description": "وصف تفصيلي ومشوق للحدث (3-4 جمل)",
    "significance": "الأهمية التاريخية والدينية للحدث",
    "details": [
      "تفصيل 1",
      "تفصيل 2", 
      "تفصيل 3",
      "تفصيل 4"
    ]
  }
}

إذا كان الحدث غير معروف، أرجع null بدلاً من event.`;

      const result = await callLovableAI(prompt);
      
      let event = null;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          event = parsed.event;
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return new Response(JSON.stringify({ event }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'generateImage') {
      const imageUrl = await generateImage(eventDescription, eventTitle);
      
      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid request type');

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في معالجة الطلب';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
