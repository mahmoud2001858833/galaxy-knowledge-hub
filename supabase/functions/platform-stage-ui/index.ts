import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { description, analysis, schema, model = "google/gemini-2.5-pro" } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not set");

    const sys = `أنت مصمم UI محترف. أنتج HTML + Tailwind فقط (بدون JS عمل، فقط hooks placeholder بـ id) لمنصة ويب RTL عربية.

متطلبات إلزامية:
- <!doctype html> + <html lang="ar" dir="rtl"> + Tailwind CDN + خط Cairo + dark theme.
- تصميم glassmorphism احترافي، تدرجات حسب colorTheme، shadows neon، animations سلسة، responsive كامل.
- Sidebar/Tabs للتنقل بين الأقسام: الرئيسية، (كل جدول من schema له قسم)، AI Chat، الإعدادات، الملف الشخصي.
- إذا needsAuth=true: صفحة Login/Signup منفصلة (div بـ id="auth-screen") + شاشة المنصة (div بـ id="app-screen" hidden).
- شريط علوي يحتوي: شعار، اسم المستخدم، قائمة منسدلة (الملف الشخصي، الإعدادات، تسجيل الخروج).
- لكل جدول: قسم يحتوي على نموذج إضافة + قائمة عرض + أزرار تعديل/حذف (مع id واضح مثل id="users-list" id="users-form").
- زر AI عائم في الزاوية + modal دردشة (id="ai-modal", id="ai-input", id="ai-messages").
- صفحة "ملفي الشخصي" تعرض: avatar, name, email, تاريخ التسجيل, إحصائيات، أزرار تعديل وتسجيل خروج.
- صفحة "الإعدادات": وضع داكن/فاتح، اللغة، الإشعارات.
- لا تكتب أي <script> منطقي — فقط <script src="https://cdn.tailwindcss.com"></script>. سيُضاف JS لاحقاً.
- اجعل كل العناصر التفاعلية تحمل id وصفي حتى يربطها JS لاحقاً.
- أرجع HTML كامل داخل بلوك \`\`\`html ... \`\`\` بدون شرح.`;

    const userMsg = `الوصف: ${description}\nالتحليل: ${JSON.stringify(analysis)}\nSchema: ${JSON.stringify(schema)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("ui err", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      const msg = status === 429 ? "تم تجاوز حد الاستخدام" : status === 402 ? "نفدت الاعتمادات" : "خطأ في توليد الواجهة";
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const m = text.match(/```html\n?([\s\S]*?)```/i);
    const html = m ? m[1].trim() : text.trim();
    return new Response(JSON.stringify({ html }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ui fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
