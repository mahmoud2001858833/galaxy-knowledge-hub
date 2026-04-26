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

    // الحصول على رابط المشروع وAPI key لتمريرهما للمنصة المُنشأة (لاستخدام AI Gateway)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const systemPrompt = `أنت مهندس واجهات أمامية محترف من الطراز الأول (مستوى Lovable / v0 / Bolt). مهمتك بناء منصة ويب كاملة وقابلة للاستخدام الفوري في صفحة HTML واحدة.

============= متطلبات إلزامية صارمة =============

1. **هيكل الصفحة**: HTML5 كامل + Tailwind CDN + خط Cairo + dir="rtl" + lang="ar".
   استخدم: <script src="https://cdn.tailwindcss.com"></script>
   استخدم: <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">

2. **التصميم**: داكن احترافي، تدرّجات (violet/cyan/purple/pink)، glassmorphism، ظلال neon glow، animations سلسة، responsive كامل، hover effects على كل عنصر تفاعلي.

3. **قاعدة بيانات حقيقية محلية (localStorage DB)**: يجب تضمين كائن \`DB\` كامل في JavaScript يعمل كقاعدة بيانات:
\`\`\`js
const DB = {
  _key: 'platform_db_v1',
  _data: JSON.parse(localStorage.getItem('platform_db_v1') || '{}'),
  _save() { localStorage.setItem(this._key, JSON.stringify(this._data)); },
  table(name) {
    if (!this._data[name]) this._data[name] = [];
    return {
      all: () => this._data[name],
      find: (id) => this._data[name].find(r => r.id === id),
      where: (fn) => this._data[name].filter(fn),
      insert: (row) => { row.id = row.id || crypto.randomUUID(); row.created_at = new Date().toISOString(); this._data[name].push(row); DB._save(); return row; },
      update: (id, patch) => { const r = this._data[name].find(x => x.id === id); if (r) { Object.assign(r, patch); DB._save(); } return r; },
      remove: (id) => { this._data[name] = this._data[name].filter(x => x.id !== id); DB._save(); },
      count: () => this._data[name].length,
    };
  }
};
\`\`\`
أنشئ جداول مناسبة لطبيعة المنصة (مثال: users, posts, tasks, products, messages...) واستخدمها فعليًا في كل عمليات CRUD داخل الواجهة.

4. **مصادقة محلية بسيطة**: زر "تسجيل دخول/تسجيل" في أعلى المنصة يستخدم DB.table('users') ويحفظ المستخدم الحالي في localStorage. أظهر اسم المستخدم بعد الدخول.

5. **مساعد ذكاء اصطناعي مدمج (AI Chat)**: زر عائم في الأسفل يفتح نافذة دردشة. عند إرسال رسالة، اتصل بـ:
\`\`\`js
const AI_ENDPOINT = '${SUPABASE_URL}/functions/v1/platform-ai-proxy';
const AI_KEY = '${SUPABASE_ANON}';
async function askAI(prompt, history = []) {
  const r = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AI_KEY },
    body: JSON.stringify({ messages: [...history, { role: 'user', content: prompt }] })
  });
  const d = await r.json();
  return d.reply || d.error || 'حدث خطأ';
}
\`\`\`
وحدة AI يجب أن تظهر دائمًا كزر عائم (floating action button) في الزاوية بـ glow effect.

6. **محرر كود ومنفّذ Python و C++ مدمج**: أضف tab أو قسم "💻 المحرر البرمجي" يحتوي على:
   - textarea لكتابة الكود
   - select لاختيار اللغة (Python / C++ / JavaScript)
   - زر "تشغيل" يُنفّذ الكود
   - منطقة output

   لـ Python استخدم Pyodide:
   \`\`\`html
   <script src="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"></script>
   \`\`\`
   وللتنفيذ:
   \`\`\`js
   let _pyodide;
   async function runPython(code) {
     if (!_pyodide) _pyodide = await loadPyodide();
     let out = '';
     _pyodide.setStdout({ batched: (s) => out += s + '\\n' });
     try { await _pyodide.runPythonAsync(code); return out; } catch (e: any) { return 'خطأ: ' + e.message; }
   }
   \`\`\`

   لـ C++ استخدم JSCPP:
   \`\`\`html
   <script src="https://cdn.jsdelivr.net/npm/JSCPP@latest/dist/JSCPP.es5.min.js"></script>
   \`\`\`
   \`\`\`js
   function runCpp(code) {
     let out = '';
     try { JSCPP.run(code, '', { stdio: { write: (s) => out += s } }); return out; } catch (e: any) { return 'خطأ: ' + e.message; }
   }
   \`\`\`

   لـ JavaScript: \`new Function(code)()\` مع try/catch.

7. **التفاعلية**: كل زر يعمل، كل نموذج يحفظ في DB ويظهر النتيجة فورًا، رسائل toast جميلة (أنشئها يدويًا)، تحديث حي بدون reload.

8. **محتوى المنصة**: اقرأ وصف المستخدم بعناية وابنِ ميزاتها الأساسية. لا تكتفِ بقالب فارغ — أضف بيانات seed افتراضية في DB عند أول تشغيل لتظهر المنصة كاملة.

9. **التنقّل**: استخدم tabs أو sidebar للتنقل بين الأقسام (مثل: الرئيسية، البيانات، AI، المحرر، الإعدادات).

10. **أرجع الكود فقط داخل بلوك** \`\`\`html ... \`\`\` **بدون أي شرح خارج البلوك. الكود يجب أن يكون كاملاً (1500+ سطر) جاهزاً للتشغيل المباشر بنسخه إلى ملف .html.**`;

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
  } catch (e: any) {
    console.error("tech-ai-platform-builder error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
