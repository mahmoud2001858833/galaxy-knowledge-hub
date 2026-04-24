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

    const sys = `أنت مهندس قواعد بيانات محترف. صمّم schema احترافي قوي.

أعد JSON بهذا الشكل بالضبط:
{
  "tables": [
    {
      "name": "users",
      "displayName": "المستخدمون",
      "fields": [
        {"name":"id","type":"uuid","primary":true,"default":"uuid()"},
        {"name":"email","type":"string","required":true,"unique":true,"validate":"email"},
        {"name":"password_hash","type":"string","required":true,"hidden":true},
        {"name":"full_name","type":"string","required":true,"minLength":2},
        {"name":"avatar","type":"url","default":""},
        {"name":"role","type":"enum","options":["user","admin"],"default":"user"},
        {"name":"bio","type":"text","default":""},
        {"name":"is_active","type":"boolean","default":true},
        {"name":"last_login","type":"datetime","default":null},
        {"name":"created_at","type":"datetime","default":"now()","auto":true},
        {"name":"updated_at","type":"datetime","default":"now()","auto":true}
      ],
      "indexes": ["email", "role"],
      "seed": [
        {"email":"admin@demo.com","password_hash":"sha256:demo","full_name":"المدير","role":"admin"},
        {"email":"user@demo.com","password_hash":"sha256:demo","full_name":"مستخدم تجريبي","role":"user"}
      ]
    }
  ],
  "relationships": [
    {"from":"posts.user_id","to":"users.id","type":"many-to-one","onDelete":"cascade"}
  ],
  "indexes": [
    {"table":"posts","fields":["user_id","created_at"]}
  ],
  "notes": "ملاحظات تصميم"
}

قواعد إلزامية:
- جدول users إلزامي إذا needsAuth=true (بكل الحقول أعلاه)
- كل جدول يحتوي 8-15 حقلاً متنوعاً
- استخدم أنواع متنوعة: uuid, string, text, integer, float, boolean, datetime, date, enum, url, email, json, array
- حدّد primary, unique, required, default, validate, foreignKey بدقة
- أضف indexes على الحقول كثيرة البحث
- أضف 5-10 صفوف seed واقعية بالعربية لكل جدول
- صمم 4-7 جداول حسب الحاجة (مثلاً: users, courses, lessons, enrollments, comments, notifications, settings)
- علاقات واضحة بين الجداول
- نوع الحقل foreignKey مع جدول مرتبط حقيقي

التزم بالـ JSON الصحيح فقط.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `التحليل: ${JSON.stringify(analysis)}\nصمّم schema احترافي قوي.` },
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
