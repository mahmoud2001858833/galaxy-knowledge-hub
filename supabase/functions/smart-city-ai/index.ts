import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_KEY = "AIzaSyAyC_JZtXVKTUXXbW1EDsoxiFu-IWd5B_A";

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini error:", response.status, errText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callLovableAI(prompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Lovable AI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function getAIResponse(prompt: string): Promise<string> {
  try {
    return await callGemini(prompt);
  } catch (err: any) {
    console.log("Gemini failed, falling back to Lovable AI:", err);
    return await callLovableAI(prompt);
  }
}

function buildArchitecturalPrompt(params: any): string {
  return `أنت خبير تصميم معماري ذكي. بناءً على المعطيات التالية، قدم 3 اقتراحات تصميمية مختلفة بصيغة JSON فقط (بدون أي نص إضافي):

المعطيات:
- نوع المبنى: ${params.buildingType}
- المساحة: ${params.area} متر مربع
- الأسلوب المعماري: ${params.style}
- المناخ: ${params.climate}
- الميزانية: ${params.budget}
- متطلبات الطاقة: ${params.energyRequirements || "عادية"}

أرجع JSON بالشكل التالي:
{
  "suggestions": [
    {
      "name": "اسم التصميم",
      "description": "وصف مفصل للتصميم",
      "features": ["ميزة 1", "ميزة 2", "ميزة 3"],
      "materials": ["مادة 1", "مادة 2"],
      "ratings": {
        "energy": 4.5,
        "efficiency": 4.0,
        "aesthetics": 4.8,
        "cost": 3.5,
        "sustainability": 4.2
      },
      "estimatedCost": "تقدير التكلفة",
      "constructionTime": "المدة المتوقعة",
      "imagePrompt": "وصف تفصيلي بالإنجليزية لتوليد صورة معمارية لهذا التصميم"
    }
  ]
}`;
}

function buildRoboticPrompt(question: string): string {
  return `أنت خبير في تقنيات البناء الروبوتي والطباعة ثلاثية الأبعاد وCAD/CAM في مجال العمارة والبناء.
أجب على السؤال التالي بشكل مفصل وعلمي باللغة العربية:

السؤال: ${question}

قدم إجابة شاملة تتضمن:
1. شرح تفصيلي
2. أمثلة عملية
3. مميزات وتحديات
4. تطبيقات مستقبلية`;
}

function buildInteriorPrompt(params: any): string {
  return `أنت مصمم داخلي محترف يستخدم الذكاء الاصطناعي. بناءً على المعطيات التالية، قدم اقتراحات تصميم داخلي بصيغة JSON فقط (بدون أي نص إضافي):

المعطيات:
- نوع الغرفة: ${params.roomType}
- المساحة: ${params.area} متر مربع
- الأسلوب: ${params.style}
- الميزانية: ${params.budget}
- وقت اليوم: ${params.timeOfDay || "نهاري"}
- نشاط المستخدم: ${params.activity || "عام"}

أرجع JSON بالشكل التالي:
{
  "design": {
    "colorPalette": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "neutral": "#hex",
      "description": "وصف لوحة الألوان"
    },
    "furniture": [
      {"name": "اسم الأثاث", "description": "الوصف", "material": "المادة", "estimatedPrice": "السعر التقديري"}
    ],
    "lighting": {
      "type": "نوع الإضاءة",
      "description": "وصف نظام الإضاءة",
      "tips": ["نصيحة 1", "نصيحة 2"]
    },
    "spaceOptimization": ["نصيحة 1", "نصيحة 2"],
    "moodDescription": "وصف الأجواء العامة",
    "imagePrompt": "وصف تفصيلي بالإنجليزية لتوليد صورة للتصميم الداخلي"
  }
}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    let prompt = "";
    
    switch (action) {
      case "architectural_design":
        prompt = buildArchitecturalPrompt(params);
        break;
      case "robotic_info":
        prompt = buildRoboticPrompt(params.question);
        break;
      case "interior_design":
        prompt = buildInteriorPrompt(params);
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const result = await getAIResponse(prompt);

    // Try to parse JSON from result
    let parsed = null;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, return raw text
    }

    return new Response(JSON.stringify({ result: parsed || result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("smart-city-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
