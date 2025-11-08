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
    const GOOGLE_AI_API_KEY = "AIzaSyAbAo_OV5kaFLtvPe6rdd5Vm-Yo1itqJHU";

    const systemPrompt = `أنت مساعد ذكي متخصص في إنشاء أفكار إبداعية للتحديات الفنية. اقترح فكرة واحدة مثيرة للاهتمام وواضحة يمكن للطالب رسمها أو تصميمها. يجب أن تكون الفكرة:
- واضحة ومحددة
- إبداعية وملهمة
- قابلة للتنفيذ بأساليب فنية متنوعة
- تشجع على الابتكار والتفكير الإبداعي

قدم فقط الفكرة نفسها في جملة أو جملتين، بدون مقدمات أو شرح إضافي.`;

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
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", response.status, errorText);
      throw new Error("Failed to get prompt from AI");
    }

    const data = await response.json();
    const prompt = data.candidates?.[0]?.content?.parts?.[0]?.text || "ارسم منظراً طبيعياً يعبر عن الهدوء والسكينة";

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
