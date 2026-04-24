import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Generates a complete multi-file project structure (20+ files).
 * Uses tool-calling for reliable structured output.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { description, analysis, schema, model = "google/gemini-2.5-flash" } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not set");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const tables = (schema?.tables || []).map((t: any) => t.name).filter(Boolean);
    const needsAuth = analysis?.needsAuth !== false;

    // Build expected file list: a real modular structure with 20+ files
    const fileList = [
      "index.html",
      "assets/css/main.css",
      "assets/css/theme.css",
      "assets/css/components.css",
      "assets/js/app.js",
      "assets/js/router.js",
      "assets/js/db.js",
      "assets/js/auth.js",
      "assets/js/ai.js",
      "assets/js/utils.js",
      "assets/js/toast.js",
      "assets/js/seed.js",
      "pages/home.html",
      "pages/login.html",
      "pages/signup.html",
      "pages/profile.html",
      "pages/settings.html",
      "pages/ai-chat.html",
      ...tables.map((t: string) => `pages/${t}.html`),
      ...tables.map((t: string) => `assets/js/modules/${t}.js`),
      "README.md",
    ];

    const sys = `أنت مهندس برمجيات محترف. ستنتج مشروع ويب كامل احترافي متعدد الملفات (لا أقل من 20 ملف).

# هيكلية المشروع المطلوبة (إلزامية):
\`\`\`
/index.html                    ← نقطة الدخول (تحمّل CSS + app.js)
/assets/css/main.css           ← إعادة تعيين + layout
/assets/css/theme.css          ← متغيرات CSS، ألوان، خطوط، dark mode
/assets/css/components.css     ← buttons, cards, modals, forms, tables
/assets/js/app.js              ← bootstrap التطبيق
/assets/js/router.js           ← SPA router (hash-based)
/assets/js/db.js               ← محرك قاعدة البيانات الاحترافي
/assets/js/auth.js             ← نظام تسجيل دخول كامل
/assets/js/ai.js               ← مساعد ذكاء اصطناعي
/assets/js/utils.js            ← helpers (date, format, validate)
/assets/js/toast.js            ← نظام إشعارات
/assets/js/seed.js             ← بيانات أولية
/assets/js/modules/<table>.js  ← ملف لكل جدول (CRUD + UI)
/pages/home.html               ← الصفحة الرئيسية / Dashboard
/pages/login.html              ← شاشة تسجيل الدخول
/pages/signup.html             ← شاشة التسجيل
/pages/profile.html            ← الملف الشخصي
/pages/settings.html           ← الإعدادات
/pages/ai-chat.html            ← دردشة AI
/pages/<table>.html            ← صفحة لكل جدول
/README.md                     ← شرح المشروع
\`\`\`

# قاعدة البيانات الاحترافية (db.js) — إلزامي:
يجب أن تتضمن:
- نظام schema validation (types, required, unique, default, foreignKey)
- indexes للبحث السريع
- علاقات (one-to-many, many-to-many) عبر foreignKey
- transactions (atomic operations)
- query builder: where, orderBy, limit, offset, select
- pagination
- soft delete (deleted_at)
- timestamps تلقائية (created_at, updated_at)
- import/export JSON
- migrations (versioning)
- hooks (beforeCreate, afterUpdate, ...)

مثال للاستخدام داخل ملفات الـ modules:
\`\`\`js
const users = DB.table('users');
users.insert({email, password, name});
users.where(u => u.role === 'admin').orderBy('created_at', 'desc').limit(10).get();
users.with('posts').find(id);
\`\`\`

# المتطلبات لكل ملف:
- index.html: <link> لكل CSS، <script type="module" src="assets/js/app.js">، RTL، خط Cairo، فيه <div id="app"></div> فقط
- main.css: reset احترافي، utilities (flex, grid, spacing)
- theme.css: متغيرات HSL، dark mode بـ data-theme، تدرجات
- components.css: تصميم glassmorphism احترافي، animations، responsive
- router.js: hash router مع guards (يمنع دخول الصفحات قبل auth)
- db.js: محرك كامل كما وُصف أعلاه (200+ سطر)
- auth.js: register, login, logout, getCurrentUser, requireAuth, hash كلمة السر بـ SubtleCrypto SHA-256
- ai.js: يستدعي ${SUPABASE_URL}/functions/v1/platform-ai-proxy مع Bearer ${SUPABASE_ANON}
- modules/<table>.js: CRUD كامل + render list + render form + validation
- pages/<page>.html: HTML fragment فقط (بدون <html><body>)، يُحقن في #app
- README.md: شرح كيف يعمل

# المخرجات:
استدعِ الأداة \`generate_project\` بمصفوفة ملفات. كل ملف يحتوي:
- path: المسار الكامل
- content: المحتوى الكامل للملف (لا تختصر)
- language: html|css|javascript|markdown

أنتج جميع الملفات (${fileList.length}+ ملف). لا تترك أي ملف فارغاً. التزم بالعربية في النصوص الظاهرة.`;

    const userMsg = `وصف المنصة: ${description}
التحليل: ${JSON.stringify(analysis)}
Schema: ${JSON.stringify(schema)}
الجداول: ${tables.join(", ")}
needsAuth: ${needsAuth}

أنتج المشروع كاملاً (${fileList.length}+ ملف) عبر استدعاء الأداة generate_project.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_project",
          description: "Generate a complete multi-file web project (20+ files)",
          parameters: {
            type: "object",
            properties: {
              files: {
                type: "array",
                description: "Array of project files. Must contain at least 20 files.",
                items: {
                  type: "object",
                  properties: {
                    path: { type: "string", description: "Full file path e.g. assets/js/db.js" },
                    content: { type: "string", description: "Complete file content" },
                    language: { type: "string", enum: ["html", "css", "javascript", "markdown", "json"] },
                  },
                  required: ["path", "content", "language"],
                  additionalProperties: false,
                },
              },
            },
            required: ["files"],
            additionalProperties: false,
          },
        },
      },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_project" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("files err", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      const msg =
        status === 429 ? "تم تجاوز حد الاستخدام، حاول بعد قليل"
        : status === 402 ? "نفدت اعتمادات الذكاء الاصطناعي"
        : "خطأ في توليد ملفات المشروع";
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let files: any[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        files = parsed.files || [];
      } catch (e) {
        console.error("parse tool args err", e);
      }
    }

    if (!files.length) {
      return new Response(JSON.stringify({ error: "لم يتم توليد أي ملفات، حاول مرة أخرى" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ files }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("files fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
