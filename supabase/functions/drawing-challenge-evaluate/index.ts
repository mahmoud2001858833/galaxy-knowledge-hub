import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, player1Name, player2Name } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const systemPrompt = `أنت حكم محترف في تقييم الأعمال الفنية. تم تكليف طالبين برسم: "${prompt}"

قيّم العملين بناءً على:
1. مدى التزام الرسم بالفكرة المطلوبة
2. الإبداع والأصالة
3. التقنية والجودة الفنية
4. التكوين والتوازن البصري

اختر الفائز وقدم تقييماً شاملاً يتضمن:
- من الفائز ولماذا
- نقاط القوة في عمل كل طالب
- نصائح للتحسين لكل طالب

قدم التقييم بأسلوب تشجيعي وبناء.

ملاحظة: الطالب الأول هو "${player1Name}" والطالب الثاني هو "${player2Name}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", response.status, errorText);
      throw new Error("Failed to get evaluation from AI");
    }

    const data = await response.json();
    const evaluation = data.candidates?.[0]?.content?.parts?.[0]?.text || "تم تقديم عملين رائعين! كلاكما أبدعتما.";

    return new Response(
      JSON.stringify({ evaluation }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in drawing-challenge-evaluate function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
