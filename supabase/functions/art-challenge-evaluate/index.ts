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
    const { prompt, imageUrl } = await req.json();
    const GOOGLE_AI_API_KEY = "AIzaSyAbAo_OV5kaFLtvPe6rdd5Vm-Yo1itqJHU";

    const systemPrompt = `أنت ناقد فني محترف متخصص في تقييم الأعمال الفنية. تم تكليف الطالب برسم أو تصميم: "${prompt}"

قيّم العمل الفني المرفق بناءً على:
1. مدى التزام العمل بالفكرة المطلوبة
2. الإبداع والأصالة في التنفيذ
3. التقنية والجودة الفنية
4. التكوين والتوازن البصري
5. استخدام الألوان والإضاءة

قدم تقييماً شاملاً يتضمن:
- التقييم العام للعمل
- نقاط القوة في العمل
- نقاط يمكن تحسينها
- نصائح محددة للتطوير
- تشجيع وتحفيز للطالب

قدم التقييم بأسلوب تشجيعي وبناء ومفصل.`;

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
    const evaluation = data.candidates?.[0]?.content?.parts?.[0]?.text || "عمل رائع! لقد أبدعت في تنفيذ الفكرة.";

    return new Response(
      JSON.stringify({ evaluation }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in art-challenge-evaluate function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
