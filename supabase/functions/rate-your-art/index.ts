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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Processing image from:", imageUrl);

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد إلى Lovable AI" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      throw new Error("Failed to get evaluation from AI");
    }

    const data = await response.json();
    const evaluation = data.choices?.[0]?.message?.content || "عمل فني رائع! لديك موهبة واضحة ومهارات مميزة. استمر في التطوير والإبداع.";

    return new Response(
      JSON.stringify({ evaluation }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
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
