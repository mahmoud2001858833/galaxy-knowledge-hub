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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Processing challenge evaluation for:", imageUrl);

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
        max_tokens: 1024,
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
    const evaluation = data.choices?.[0]?.message?.content || "عمل رائع! لقد أبدعت في تنفيذ الفكرة.";

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
