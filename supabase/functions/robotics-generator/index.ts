import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت مهندس روبوتات محترف ومصمم نظم مدمجة. مهمتك تحويل وصف فكرة روبوت بالعربية إلى مواصفات هندسية كاملة قابلة للتنفيذ.

أعد دائماً JSON فقط بهذا الشكل بدون أي نص قبل أو بعد:
{
  "robotName": "اسم إبداعي للروبوت",
  "summary": "ملخص في سطرين عن وظيفته",
  "category": "تعليمي|صناعي|طبي|منزلي|زراعي|عسكري|ترفيهي",
  "difficulty": "مبتدئ|متوسط|متقدم",
  "estimatedCost": "التكلفة التقديرية بالدينار الأردني",
  "buildTime": "الوقت المتوقع للبناء",
  "components": [
    { "name": "اسم المكون", "quantity": "العدد", "price": "السعر بالدينار", "purpose": "الغرض منه", "shopUrl": "https://www.aliexpress.com/wholesale?SearchText=ESP32" }
  ],
  "mechanicalDesign": {
    "frame": "وصف الهيكل والأبعاد",
    "actuators": "المحركات والمشغلات",
    "sensors": "أنواع الحساسات وأماكنها",
    "powerSystem": "نظام الطاقة والبطاريات"
  },
  "electricalSchema": "وصف نصي مفصل لمخطط التوصيلات الكهربائية بصيغة سهلة الفهم",
  "code": {
    "language": "Arduino C++",
    "filename": "robot_main.ino",
    "content": "كود كامل قابل للتنفيذ مباشرة على Arduino/ESP32 مع تعليقات بالعربية"
  },
  "assemblySteps": [
    "خطوة 1...",
    "خطوة 2...",
    "خطوة 3..."
  ],
  "safetyTips": ["نصيحة أمان 1", "نصيحة أمان 2"],
  "futureUpgrades": ["ترقية مقترحة 1", "ترقية مقترحة 2"]
}

اجعل الكود حقيقياً ومفصلاً (50+ سطر) وليس placeholder. استخدم مكتبات شائعة مثل Servo.h, Wire.h, Adafruit. اجعل قائمة المكونات شاملة (10+ عنصر) مع روابط شراء حقيقية على AliExpress.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();
    if (!idea || typeof idea !== "string" || idea.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "يجب وصف فكرة الروبوت بـ 5 أحرف على الأقل" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ROBOTICS_AI_KEY = Deno.env.get("ROBOTICS_AI_KEY");

    // Try Lovable Gateway first (recommended)
    if (LOVABLE_API_KEY) {
      try {
        const resp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `فكرة الروبوت: ${idea}` },
              ],
            }),
          }
        );

        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "تم تجاوز حد الاستخدام، حاول لاحقاً" }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: "نفدت اعتمادات الذكاء الاصطناعي" }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (resp.ok) {
          const data = await resp.json();
          const text: string = data?.choices?.[0]?.message?.content ?? "";
          const json = extractJson(text);
          if (json) {
            return new Response(JSON.stringify(json), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          console.error("Gateway failed", resp.status, await resp.text());
        }
      } catch (e: any) {
        console.error("Gateway error", e);
      }
    }

    // Fallback: Gemini Direct
    if (ROBOTICS_AI_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${ROBOTICS_AI_KEY}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\nفكرة الروبوت: ${idea}` }],
            },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error("Gemini direct failed", resp.status, t);
        return new Response(
          JSON.stringify({ error: "فشل توليد الروبوت", details: t.slice(0, 200) }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await resp.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const json = extractJson(text);
      if (json) {
        return new Response(JSON.stringify(json), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: "تعذر توليد مواصفات الروبوت" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    console.error("robotics-generator error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractJson(text: string): any | null {
  if (!text) return null;
  // Strip markdown code fences
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*$/g, "")
    .trim();
  // Find first { and last }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (e: any) {
    console.error("JSON parse failed", e);
    return null;
  }
}
