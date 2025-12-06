import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = Deno.env.get('ISLAMIC_ERAS_AI_KEY') || Deno.env.get('GOOGLE_AI_API_KEY');

const eraNames: Record<string, string> = {
  'pre-prophethood': 'قبل البعثة (الجاهلية)',
  'post-prophethood-pre-hijra': 'بعد البعثة - قبل الهجرة',
  'post-hijra': 'بعد الهجرة',
  'post-prophetic': 'بعد العصر النبوي (عصر الخلفاء الراشدين)',
  'modern': 'العصر الحديث'
};

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, eraId, era1, era2 } = await req.json();

    if (!GOOGLE_AI_API_KEY) {
      throw new Error('API key not configured');
    }

    if (type === 'getEraDetails') {
      const eraName = eraNames[eraId] || eraId;
      
      const prompt = `أنت مؤرخ إسلامي متخصص. أعطني معلومات تفصيلية عن فترة "${eraName}" في التاريخ الإسلامي.

أرجع النتيجة بتنسيق JSON فقط بدون أي نص إضافي:
{
  "era": {
    "name": "${eraName}",
    "period": "الفترة الزمنية التقريبية",
    "customs": [
      "عادة 1 مميزة لهذه الفترة",
      "عادة 2",
      "عادة 3",
      "عادة 4"
    ],
    "laws": [
      "قانون أو تشريع 1",
      "قانون 2",
      "قانون 3",
      "قانون 4"
    ],
    "characteristics": [
      "خاصية 1 لهذه الفترة",
      "خاصية 2",
      "خاصية 3"
    ],
    "socialAspects": [
      "جانب اجتماعي 1",
      "جانب اجتماعي 2",
      "جانب اجتماعي 3"
    ]
  }
}`;

      const result = await callGeminiAPI(prompt);
      
      let era = null;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          era = parsed.era;
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return new Response(JSON.stringify({ era }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'compareEras') {
      const era1Name = eraNames[era1] || era1;
      const era2Name = eraNames[era2] || era2;
      
      const prompt = `أنت مؤرخ إسلامي متخصص. قارن بين فترتين في التاريخ الإسلامي:
الفترة الأولى: "${era1Name}"
الفترة الثانية: "${era2Name}"

أريد مقارنة شاملة توضح كيف تغيرت العادات والقوانين والممارسات الاجتماعية من الفترة الأولى إلى الثانية.

أرجع النتيجة بتنسيق JSON فقط بدون أي نص إضافي:
{
  "comparison": {
    "era1": {
      "name": "${era1Name}",
      "period": "الفترة الزمنية"
    },
    "era2": {
      "name": "${era2Name}",
      "period": "الفترة الزمنية"
    },
    "changes": [
      {
        "category": "العبادات",
        "from": "كيف كانت في الفترة الأولى",
        "to": "كيف أصبحت في الفترة الثانية",
        "significance": "أهمية هذا التغيير"
      },
      {
        "category": "المعاملات التجارية",
        "from": "الوصف",
        "to": "الوصف",
        "significance": "الأهمية"
      },
      {
        "category": "وضع المرأة",
        "from": "الوصف",
        "to": "الوصف",
        "significance": "الأهمية"
      },
      {
        "category": "النظام القضائي",
        "from": "الوصف",
        "to": "الوصف",
        "significance": "الأهمية"
      },
      {
        "category": "التعليم والعلم",
        "from": "الوصف",
        "to": "الوصف",
        "significance": "الأهمية"
      }
    ],
    "summary": "ملخص شامل للتغييرات الرئيسية بين الفترتين (3-4 جمل)"
  }
}`;

      const result = await callGeminiAPI(prompt);
      
      let comparison = null;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          comparison = parsed.comparison;
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return new Response(JSON.stringify({ comparison }), {
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
