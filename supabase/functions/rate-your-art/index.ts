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
    const { imageUrl, description } = await req.json();
    const GOOGLE_AI_API_KEY = "AIzaSyAbAo_OV5kaFLtvPe6rdd5Vm-Yo1itqJHU";

    const systemPrompt = `أنت ناقد فني محترف ومعلم فنون متخصص في تقييم وتحليل الأعمال الفنية والتصاميم.

${description ? `وصف الطالب للعمل: "${description}"` : ""}

قم بتقييم العمل الفني المرفق بشكل شامل ومفصل. يجب أن يتضمن تقييمك:

**📊 التقييم العام:**
- تقييم شامل للعمل الفني

**✨ نقاط القوة:**
- اذكر على الأقل 3-4 نقاط قوة محددة في العمل
- استخدام الألوان والتكوين
- التقنيات الفنية المستخدمة
- الإبداع والأصالة

**📈 نقاط التحسين:**
- اذكر 2-3 نقاط يمكن تطويرها
- كن محدداً وواضحاً

**💡 نصائح للتطوير:**
- قدم نصائح عملية ومحددة
- اقترح تقنيات أو تمارين للتحسين
- وجه الطالب نحو المصادر التعليمية

**🎯 التشجيع والتحفيز:**
- شجع الطالب على الاستمرار
- أشد بالجوانب المميزة

قدم التقييم بأسلوب تشجيعي وبناء ومفصل باللغة العربية.`;

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
            maxOutputTokens: 1500,
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
    const evaluation = data.candidates?.[0]?.content?.parts?.[0]?.text || "عمل فني رائع! لديك موهبة واضحة ومهارات مميزة. استمر في التطوير والإبداع.";

    return new Response(
      JSON.stringify({ evaluation }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in rate-your-art function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
