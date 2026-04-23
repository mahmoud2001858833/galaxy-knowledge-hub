import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { analysis, schema, html, model = "google/gemini-2.5-pro" } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not set");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const sys = `أنت مهندس JS محترف. اكتب JS كامل (داخل <script>) يربط منطق المنصة بالـ HTML المعطى.

يجب أن يتضمن JS:
1) محرك DB كامل في localStorage:
const DB = {
  _key: 'platform_db_v1',
  _data: JSON.parse(localStorage.getItem('platform_db_v1') || '{}'),
  _save(){ localStorage.setItem(this._key, JSON.stringify(this._data)); },
  table(n){ if(!this._data[n]) this._data[n]=[]; const self=this; return {
    all:()=>self._data[n],
    find:id=>self._data[n].find(r=>r.id===id),
    where:fn=>self._data[n].filter(fn),
    insert:r=>{r.id=r.id||crypto.randomUUID();r.created_at=r.created_at||new Date().toISOString();self._data[n].push(r);self._save();return r;},
    update:(id,p)=>{const r=self._data[n].find(x=>x.id===id);if(r){Object.assign(r,p);self._save();}return r;},
    remove:id=>{self._data[n]=self._data[n].filter(x=>x.id!==id);self._save();},
    count:()=>self._data[n].length
  };}
};
2) seed البيانات الأولية من schema عند أول تشغيل (تحقق إذا فارغ).
3) نظام Auth كامل (إذا needsAuth):
   - تسجيل/دخول/خروج عبر DB.table('users')
   - تخزين currentUser في localStorage('current_user')
   - عند الدخول: إخفاء #auth-screen وإظهار #app-screen + ملء اسم/إيميل المستخدم في الشريط العلوي والبروفايل
   - زر تسجيل خروج يمسح currentUser ويعيد لشاشة Login
4) CRUD لكل جدول: التقاط submit النماذج، عرض القوائم بـ render functions، أزرار تعديل/حذف.
5) ملف شخصي وإعدادات تعمل (تعديل الاسم، تغيير كلمة السر، dark/light mode عبر classList).
6) تنقل tabs (إخفاء/إظهار الأقسام).
7) Toasts جميلة (دالة showToast(msg, type)).
8) AI Chat:
const AI_ENDPOINT = '${SUPABASE_URL}/functions/v1/platform-ai-proxy';
const AI_KEY = '${SUPABASE_ANON}';
async function askAI(prompt, history=[]){
  const r = await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+AI_KEY},body:JSON.stringify({messages:[...history,{role:'user',content:prompt}]})});
  const d = await r.json(); return d.reply || d.error || 'خطأ';
}
ربط زر إرسال AI بـ #ai-input و #ai-messages مع typing indicator.

أرجع JS فقط داخل بلوك \`\`\`javascript ... \`\`\` (بدون <script> tags).
لا تشرح، لا تعيد HTML.`;

    const userMsg = `Schema: ${JSON.stringify(schema)}\nAnalysis: ${JSON.stringify(analysis)}\nIDs المتوفرة في HTML: ${(html.match(/id="[^"]+"/g) || []).slice(0, 80).join(', ')}`;

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
      console.error("logic err", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      const msg = status === 429 ? "تم تجاوز حد الاستخدام" : status === 402 ? "نفدت الاعتمادات" : "خطأ في بناء المنطق";
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const m = text.match(/```(?:javascript|js)\n?([\s\S]*?)```/i);
    const js = m ? m[1].trim() : text.trim();
    return new Response(JSON.stringify({ js }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("logic fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
