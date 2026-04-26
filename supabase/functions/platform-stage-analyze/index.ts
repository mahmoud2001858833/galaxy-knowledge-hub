import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { description } = await req.json();
    if (!description) {
      return new Response(JSON.stringify({ error: "وصف المنصة مطلوب" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not set");

    const sys = `أنت محلل متطلبات منصات ويب. أعد JSON فقط (بدون markdown) بالشكل:
{
  "platformName": "اسم مقترح بالعربية",
  "platformType": "نوع المنصة (مثل: إدارة مهام، متجر، تواصل اجتماعي...)",
  "targetUsers": "الفئة المستهدفة",
  "coreFeatures": ["ميزة1", "ميزة2", ...],
  "needsAuth": true,
  "needsAI": true,
  "needsCodeRunner": false,
  "suggestedTables": ["users","posts",...],
  "colorTheme": "violet-cyan أو emerald-cyan أو ...",
  "summary": "ملخص قصير بسطرين"
}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `وصف المنصة: ${description}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("analyze err", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      const msg = status === 429 ? "تم تجاوز حد الاستخدام، حاول لاحقاً"
        : status === 402 ? "نفدت اعتمادات الذكاء الاصطناعي"
        : "خطأ في تحليل المتطلبات";
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    let analysis: any;
    try { analysis = JSON.parse(text); } catch { analysis = { summary: text }; }
    return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("analyze fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
