import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, language = "javascript", existingCode = "" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `أنت مساعد برمجي خبير. مهمتك توليد كود ${language} نظيف، حديث، وموثّق.

قواعد صارمة جداً يجب الالتزام بها دون استثناء:
1. **يجب** أن تبدأ ردك بكتلة كود markdown كاملة بصيغة \`\`\`${language}\\n...\\n\`\`\`.
2. لا ترد أبداً بشرح فقط دون كود. حتى لو كان الطلب بسيطاً، اكتب الكود الكامل القابل للتشغيل.
3. الكود يجب أن يكون كاملاً ومستقلاً (بدون "..." أو "// أكمل هنا").
4. بعد كتلة الكود فقط، اكتب شرحاً مختصراً بالعربية للخطوات الأساسية (3-6 نقاط).
5. إذا كان هناك كود حالي، حسّنه أو أضف الميزة المطلوبة عليه دون كسر ما يعمل، وأعد الكود الكامل بعد التعديل.
6. لا تضع تعليقات في الكود مثل "TODO" أو "ضع منطقك هنا" — اكتب المنطق الفعلي.

مثال على التنسيق المطلوب:
\`\`\`${language}
// الكود الكامل هنا
\`\`\`

**الشرح:**
- النقطة الأولى
- النقطة الثانية`;

    const userMsg = existingCode
      ? `الكود الحالي:\n\`\`\`${language}\n${existingCode}\n\`\`\`\n\nالمطلوب: ${prompt}`
      : prompt;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "تم تجاوز الحد، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "نفدت الاعتمادات، أضف رصيداً" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "خطأ من خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    // استخراج الكود من بلوك markdown
    const codeMatch = text.match(/```[\w]*\n?([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : text;
    const explanation = text.replace(/```[\w]*\n?[\s\S]*?```/, "").trim();

    return new Response(JSON.stringify({ code, explanation, raw: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("tech-ai-code-gen error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
