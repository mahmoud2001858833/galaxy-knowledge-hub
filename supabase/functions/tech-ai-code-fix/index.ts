import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, language = "javascript", errorMessage = "" } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "الكود مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `أنت مصحّح أكواد محترف. حلّل الكود التالي بلغة ${language}، حدّد الأخطاء (منطقية وصياغية)، وأرجع نسخة مصحّحة.
- أرجع الكود المصحّح داخل بلوك markdown \`\`\`${language} ... \`\`\`.
- بعد الكود، اكتب قائمة بالأخطاء التي وُجدت وكيف تم حلها بالعربية.`;

    const userMsg = errorMessage
      ? `الكود:\n\`\`\`${language}\n${code}\n\`\`\`\n\nرسالة الخطأ: ${errorMessage}`
      : `الكود:\n\`\`\`${language}\n${code}\n\`\`\``;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "تم تجاوز الحد، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "نفدت الاعتمادات" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      return new Response(JSON.stringify({ error: "خطأ من الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const codeMatch = text.match(/```[\w]*\n?([\s\S]*?)```/);
    const fixedCode = codeMatch ? codeMatch[1].trim() : text;
    const analysis = text.replace(/```[\w]*\n?[\s\S]*?```/, "").trim();

    return new Response(JSON.stringify({ fixedCode, analysis, raw: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("tech-ai-code-fix error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
