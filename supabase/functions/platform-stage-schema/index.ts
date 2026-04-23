import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { analysis } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not set");

    const sys = `أنت مصمم قواعد بيانات. بناءً على تحليل المنصة، صمّم schema مناسب لـ localStorage DB.
أعد JSON فقط:
{
  "tables": [
    { "name": "users", "fields": [{"name":"id","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"full_name","type":"string"},{"name":"avatar","type":"string"},{"name":"created_at","type":"datetime"}], "seed": [{"email":"demo@demo.com","password":"123456","full_name":"مستخدم تجريبي"}] },
    ...
  ],
  "relationships": ["posts.user_id -> users.id", ...],
  "notes": "ملاحظات تصميم"
}
احرص دوماً على وجود جدول users إذا كانت needsAuth=true، وأضف بيانات seed واقعية لكل جدول (3-5 صفوف).`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `التحليل: ${JSON.stringify(analysis)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("schema err", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      const msg = status === 429 ? "تم تجاوز حد الاستخدام" : status === 402 ? "نفدت الاعتمادات" : "خطأ في تصميم القاعدة";
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    let schema: any;
    try { schema = JSON.parse(text); } catch { schema = { tables: [] }; }
    return new Response(JSON.stringify({ schema }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("schema fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
