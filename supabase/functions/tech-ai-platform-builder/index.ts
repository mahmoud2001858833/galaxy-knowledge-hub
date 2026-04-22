import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, conversation = [] } = await req.json();
    if (!description || typeof description !== "string") {
      return new Response(JSON.stringify({ error: "وصف المنصة مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `أنت مهندس واجهات أمامية محترف. مهمتك بناء منصة ويب كاملة تعمل في صفحة HTML واحدة (HTML + CSS + JS مدمجة).
متطلبات إلزامية:
- صفحة HTML واحدة كاملة قابلة للتشغيل مباشرة في المتصفح.
- استخدم تصميماً عصرياً مع Tailwind عبر CDN <script src="https://cdn.tailwindcss.com"></script>.
- اجعل الواجهة باللغة العربية مع dir="rtl" وخط Cairo من Google Fonts.
- ألوان داكنة جذابة، تدرّجات بنفسجية/زرقاء، تأثيرات glow وhover.
- تفاعلية حقيقية: أزرار تعمل، نماذج تستجيب، حركات سلسة.

أرجع الكود فقط داخل بلوك markdown \`\`\`html ... \`\`\` بدون أي شرح خارج البلوك.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: description },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages,
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
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "خطأ من الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const codeMatch = text.match(/```html\n?([\s\S]*?)```/i);
    const html = codeMatch ? codeMatch[1].trim() : text;

    return new Response(JSON.stringify({ html, raw: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tech-ai-platform-builder error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
