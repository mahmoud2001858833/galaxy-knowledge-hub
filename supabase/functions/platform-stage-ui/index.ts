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

    const theme = analysis?.colorTheme || "violet-cyan";

    const sys = `أنت Lead Product Designer في شركة عالمية (مستوى Linear / Vercel / Stripe / Apple). مهمتك: إنتاج HTML+Tailwind لمنصة ويب عربية RTL بمستوى Production احترافي مذهل — ليس Demo.

🎯 الهدف: واجهة تبدو وكأنها صُممت من فريق تصميم محترف لأشهر بأكمله.

## البنية الإلزامية (HARD REQUIREMENTS):
1. <!doctype html><html lang="ar" dir="rtl"><head> مع:
   - <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
   - <title> وصفي
   - <script src="https://cdn.tailwindcss.com"></script>
   - <script>tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Cairo','sans-serif']},animation:{'fade-in':'fadeIn .4s ease-out','slide-up':'slideUp .5s ease-out','glow':'glow 2s ease-in-out infinite'},keyframes:{fadeIn:{'0%':{opacity:'0'},'100%':{opacity:'1'}},slideUp:{'0%':{opacity:'0',transform:'translateY(20px)'},'100%':{opacity:'1',transform:'translateY(0)'}},glow:{'0%,100%':{boxShadow:'0 0 20px rgba(139,92,246,.3)'},'50%':{boxShadow:'0 0 40px rgba(139,92,246,.6)'}}}}}}</script>
   - <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
   - <link href="https://cdn.jsdelivr.net/npm/lucide-static@latest/font/lucide.css" rel="stylesheet">
   - <style> مخصص يحتوي:
     * { -webkit-font-smoothing:antialiased; }
     body { font-family:'Cairo',sans-serif; background:#0a0a0f; color:#e5e7eb; }
     .glass { backdrop-filter:blur(24px) saturate(180%); background:rgba(20,20,30,.6); border:1px solid rgba(255,255,255,.08); }
     .gradient-text { background:linear-gradient(135deg,#a78bfa,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
     .gradient-border { position:relative; }
     .gradient-border::before { content:''; position:absolute; inset:0; padding:1px; border-radius:inherit; background:linear-gradient(135deg,#8b5cf6,#06b6d4); -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
     .btn-primary { background:linear-gradient(135deg,#8b5cf6,#06b6d4); transition:all .3s; }
     .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(139,92,246,.4); }
     .card-hover { transition:all .3s; } .card-hover:hover { transform:translateY(-4px); border-color:rgba(139,92,246,.5); }
     ::-webkit-scrollbar { width:8px; height:8px; } ::-webkit-scrollbar-track { background:#0a0a0f; } ::-webkit-scrollbar-thumb { background:linear-gradient(135deg,#8b5cf6,#06b6d4); border-radius:4px; }
     .hidden-section { display:none; }
     input,textarea,select { background:rgba(15,15,25,.6); border:1px solid rgba(255,255,255,.1); color:#fff; transition:all .2s; }
     input:focus,textarea:focus,select:focus { outline:none; border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,.2); }
     .toast { animation:slideUp .3s ease-out; }

## التصميم (لون: ${theme}):
- خلفية داكنة عميقة #0a0a0f مع طبقات من النور الناعم (radial gradients باهتة بنفسجية/سيان في الزوايا).
- Glassmorphism احترافي: blur عالٍ + سطوع داخلي + حدود رفيعة شفافة.
- Gradient أساسي: from-violet-500 via-fuchsia-500 to-cyan-500.
- Shadow neon ناعم خلف العناصر المهمة.
- Spacing سخي (p-6 و p-8 و gap-6 على الأقل في البطاقات الكبرى).
- Border radius متسق (rounded-2xl للبطاقات، rounded-xl للأزرار، rounded-full للـ avatars/badges).
- Typography hierarchy واضح: h1 text-4xl/5xl font-extrabold + gradient-text، h2 text-2xl، نص text-sm/base text-gray-300.

## الهيكل:
- إذا needsAuth: <div id="auth-screen"> صفحة دخول/تسجيل احترافية بـ split layout (يسار: hero بصري متدرج وشعار وعبارة تسويقية، يمين: نموذج زجاجي بـ tabs دخول/إنشاء حساب). أزرار: id="login-btn", id="signup-btn", حقول: id="login-email", id="login-password", id="signup-name", id="signup-email", id="signup-password".
- <div id="app-screen" class="hidden-section min-h-screen">:
  * Sidebar ثابت (w-64) على اليمين (RTL): شعار أعلى، روابط تنقل بأيقونات Lucide، كل رابط .nav-link[data-section="..."]. أقسام: dashboard, [كل جدول], ai-chat, profile, settings.
  * Topbar: بحث، زر إشعارات، زر تبديل ثيم id="theme-toggle"، avatar مع dropdown (id="user-menu") يحوي: الملف الشخصي، الإعدادات، تسجيل الخروج id="logout-btn".
  * <main> يحوي أقسام كل قسم <section id="section-{name}" class="hidden-section">. القسم الافتراضي dashboard ظاهر.
- Dashboard: شبكة 4 بطاقات إحصائيات (icon + رقم كبير + label + تغيّر %)، ثم رسم بياني وهمي بـ SVG، ثم آخر النشاطات.
- لكل جدول من schema قسم كامل يحوي:
  * Header: عنوان + زر "+ إضافة" id="{table}-add-btn"
  * Modal id="{table}-modal" (hidden) يحوي نموذج id="{table}-form" بكل الحقول (ما عدا id, created_at, password_hash كـ hidden في حالة تعديل)، أزرار حفظ/إلغاء.
  * Table/Grid id="{table}-list" بأعمدة الحقول الأساسية + أزرار تعديل/حذف.
  * Empty state جميل عند عدم وجود بيانات.
- AI Chat: زر عائم id="ai-fab" أسفل اليسار + Modal id="ai-modal" (hidden) فيه #ai-messages, #ai-input, #ai-send, typing indicator id="ai-typing".
- Profile: avatar كبير، اسم، بريد، تاريخ الانضمام، إحصائيات شخصية، نموذج تعديل id="profile-form".
- Settings: تبديل ثيم، اللغة، الإشعارات، حذف الحساب.
- Toast container: <div id="toast-container" class="fixed top-4 left-4 z-[100] space-y-2"></div>

## معايير الجودة (NON-NEGOTIABLE):
✓ كل عنصر تفاعلي له id وصفي بصيغة kebab-case.
✓ كل أيقونة من Lucide عبر <i class="lucide lucide-{name}"></i> أو SVG inline.
✓ Responsive: lg: للـ sidebar الظاهر، md:hidden hamburger للموبايل.
✓ Hover states واضحة على كل زر/بطاقة.
✓ Animations: animate-fade-in على الأقسام، animate-slide-up على البطاقات.
✓ لا تستخدم alert() ولا inline styles عشوائية.
✓ كل النصوص بالعربية الفصحى الاحترافية.
✓ لا تكتب أي JavaScript منطقي — فقط Tailwind config script.
✓ HTML نظيف، صحيح، semantic، خالٍ من الأخطاء.

أعد HTML الكامل داخل بلوك \`\`\`html ... \`\`\` فقط بدون أي شرح.`;

    const userMsg = `الوصف: ${description}
التحليل: ${JSON.stringify(analysis)}
Schema: ${JSON.stringify(schema)}

أنتج HTML احترافي مذهل بمستوى Linear/Vercel.`;

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
  } catch (e: any) {
    console.error("ui fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
