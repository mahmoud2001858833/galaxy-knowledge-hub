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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
            role: "system",
            content: "أنت مساعد ذكي متخصص في إنشاء أفكار إبداعية للتحديات الفنية. اقترح فكرة واحدة مثيرة للاهتمام وواضحة يمكن للطالب رسمها أو تصميمها. يجب أن تكون الفكرة واضحة ومحددة، إبداعية وملهمة، قابلة للتنفيذ بأساليب فنية متنوعة، وتشجع على الابتكار والتفكير الإبداعي. قدم فقط الفكرة نفسها في جملة أو جملتين، بدون مقدمات أو شرح إضافي."
          },
          {
            role: "user",
            content: "أعطني فكرة إبداعية لتحدي فني"
          }
        ],
        temperature: 0.9,
        max_tokens: 200,
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
      throw new Error("Failed to get prompt from AI");
    }

    const data = await response.json();
    const prompt = data.choices?.[0]?.message?.content || "ارسم منظراً طبيعياً يعبر عن الهدوء والسكينة";

    return new Response(
      JSON.stringify({ prompt }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in art-challenge-prompt function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
