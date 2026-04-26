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

async function generateImage(eventDescription: string, eventTitle: string, locationDescription?: string): Promise<string | null> {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured for image generation');
      return null;
    }

    // قائمة الأنبياء والصحابة العشرة المبشرين بالجنة
    const prophetsAndCompanions = [
      'محمد', 'النبي', 'الرسول', 'عيسى', 'موسى', 'إبراهيم', 'نوح', 'آدم', 'داود', 'سليمان',
      'يوسف', 'يونس', 'إسماعيل', 'إسحاق', 'يعقوب', 'هارون', 'زكريا', 'يحيى', 'إلياس', 'الخضر',
      'أبو بكر الصديق', 'عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب',
      'طلحة بن عبيد الله', 'الزبير بن العوام', 'عبد الرحمن بن عوف', 'سعد بن أبي وقاص',
      'سعيد بن زيد', 'أبو عبيدة بن الجراح'
    ];

    // التحقق من ذكر الأنبياء أو الصحابة
    const mentionsProphetOrCompanion = prophetsAndCompanions.some(name => 
      eventTitle.includes(name) || eventDescription.includes(name)
    );

    let lightInstructions = '';
    if (mentionsProphetOrCompanion) {
      lightInstructions = `
      CRITICAL INSTRUCTION: This event involves prophets or blessed companions.
      - ANY human figures must be shown ONLY as pure radiant divine light (bright white/golden glow)
      - ABSOLUTELY NO facial features, body details, or human shapes should be visible
      - Replace human figures with ethereal light orbs or luminous silhouettes
      - The light should be majestic, peaceful, and emanating divine blessing
      - Focus on the spiritual atmosphere rather than physical representations`;
    }

    const locationInfo = locationDescription ? `Location/Setting: ${locationDescription}.` : '';

    const imagePrompt = `Create a beautiful, artistic historical illustration representing: ${eventTitle}. 
    Scene description: ${eventDescription}
    ${locationInfo}
    ${lightInstructions}
    
    Style Guidelines:
    - Elegant Islamic art style with intricate geometric patterns
    - Warm golden, emerald, and deep blue colors
    - Historical Middle Eastern/Arabian architecture
    - Peaceful, spiritual atmosphere
    - NO text, letters, Arabic script, or watermarks on the image
    - Pure visual artistic representation only
    - Ultra high quality, cinematic, 16:9 aspect ratio
    - Dramatic lighting and atmospheric depth`;

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
  } catch (error: any) {
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
      } catch (e: any) {
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
      } catch (e: any) {
        console.error('JSON parsing error:', e);
      }

      return new Response(JSON.stringify({ event }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'generateImage') {
      const { locationDescription } = await req.json().catch(() => ({}));
      const imageUrl = await generateImage(eventDescription, eventTitle, locationDescription);
      
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
