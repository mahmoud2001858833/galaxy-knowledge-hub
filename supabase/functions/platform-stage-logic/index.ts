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

    // استخرج كل الـ ids الموجودة لتمريرها للـ AI
    const ids = Array.from(new Set((html.match(/id="([^"]+)"/g) || []).map((s: string) => s.slice(4, -1))));

    const sys = `أنت Senior Frontend Engineer (مستوى Staff في Google/Meta). اكتب JavaScript احترافي خالٍ من الأخطاء يربط HTML المعطى بمنطق كامل وفعّال.

⚠️ قاعدة ذهبية: كل id موجود في HTML يجب أن يعمل. لا تترك أي زر معطّل.

## البنية الإلزامية للكود:

### 1) Utils
\`\`\`js
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const fmt = {
  date:d=>new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'}),
  time:d=>new Date(d).toLocaleString('ar-EG'),
  num:n=>new Intl.NumberFormat('ar-EG').format(n),
  truncate:(s,n=50)=>s&&s.length>n?s.slice(0,n)+'…':s||''
};
async function sha(t){const b=new TextEncoder().encode(t);const h=await crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,'0')).join('');}
\`\`\`

### 2) Toast System (احترافي)
\`\`\`js
function toast(msg,type='info'){
  const c=$('#toast-container')||document.body;
  const colors={success:'from-emerald-500 to-teal-500',error:'from-red-500 to-rose-500',info:'from-violet-500 to-cyan-500',warn:'from-amber-500 to-orange-500'};
  const icons={success:'✓',error:'✕',info:'ℹ',warn:'⚠'};
  const t=document.createElement('div');
  t.className=\`toast bg-gradient-to-r \${colors[type]} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] backdrop-blur-xl\`;
  t.innerHTML=\`<span class="text-xl font-bold">\${icons[type]}</span><span class="flex-1">\${msg}</span>\`;
  c.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(-10px)';setTimeout(()=>t.remove(),300);},3500);
}
\`\`\`

### 3) DB Engine في localStorage (مع seed تلقائي)
\`\`\`js
const DB={
  _key:'platform_db_v2',
  _data:JSON.parse(localStorage.getItem('platform_db_v2')||'{}'),
  _save(){localStorage.setItem(this._key,JSON.stringify(this._data));},
  table(n){if(!this._data[n])this._data[n]=[];const s=this;return{
    all:()=>[...s._data[n]],
    find:id=>s._data[n].find(r=>r.id===id),
    where:fn=>s._data[n].filter(fn),
    insert:r=>{r.id=r.id||crypto.randomUUID();r.created_at=r.created_at||new Date().toISOString();r.updated_at=new Date().toISOString();s._data[n].push(r);s._save();return r;},
    update:(id,p)=>{const r=s._data[n].find(x=>x.id===id);if(r){Object.assign(r,p,{updated_at:new Date().toISOString()});s._save();}return r;},
    remove:id=>{s._data[n]=s._data[n].filter(x=>x.id!==id);s._save();},
    count:()=>s._data[n].length
  };},
  reset(){localStorage.removeItem(this._key);this._data={};}
};
\`\`\`
Seed: لكل جدول من schema، إذا DB.table(name).count()===0 أدخل كل صفوف seed (اضرب password_hash بـ sha إن وُجد).

### 4) Auth (إذا needsAuth):
- currentUser من localStorage('current_user')
- showApp(): يخفي #auth-screen ويظهر #app-screen، يحدّث اسم/بريد/avatar في الشريط العلوي والبروفايل، ينادي renderAll()
- showAuth(): العكس
- login: يقرأ #login-email/#login-password، يبحث في users، يقارن sha(password)===password_hash، ينجح أو يفشل بـ toast
- signup: يتحقق من عدم تكرار البريد، ينشئ مستخدماً جديداً مع password_hash مشفّر، يدخله مباشرة
- logout: يمسح current_user ويعيد لـ showAuth()
- عند load: إذا current_user موجود showApp() وإلا showAuth()

### 5) Navigation (Tabs):
- كل .nav-link[data-section] عند الضغط: يخفي كل [id^="section-"]، يظهر #section-{value}، يضيف active class
- الافتراضي: dashboard

### 6) CRUD لكل جدول:
لكل جدول t من schema:
- render{T}(): يرسم #{t}-list كـ grid/table جميل من DB.table(t).all() — كل صف مع أزرار تعديل/حذف
- empty state إذا فارغ
- #{t}-add-btn يفتح #{t}-modal بنموذج فارغ
- زر حذف يستخدم confirm("هل أنت متأكد؟") ثم DB.table(t).remove(id) ثم render
- زر تعديل يفتح modal مع تعبئة الحقول، عند submit يحدّث
- إخفاء/إظهار modal: classList.toggle('hidden-section')
- التحقق من الحقول required قبل insert

### 7) Profile + Settings:
- #profile-form يحدّث بيانات currentUser في DB.table('users')
- #theme-toggle يبدّل document.documentElement.classList.toggle('dark') ويحفظ في localStorage

### 8) AI Chat (REQUIRED):
\`\`\`js
const AI_ENDPOINT='${SUPABASE_URL}/functions/v1/platform-ai-proxy';
const AI_KEY='${SUPABASE_ANON}';
let aiHistory=[];
async function askAI(prompt){
  try{
    const r=await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+AI_KEY},body:JSON.stringify({messages:[...aiHistory,{role:'user',content:prompt}]})});
    const d=await r.json();return d.reply||d.error||'حدث خطأ';
  }catch (e: any){return 'تعذّر الاتصال بالذكاء الاصطناعي';}
}
\`\`\`
- #ai-fab يفتح #ai-modal، #ai-send يأخذ #ai-input، يضيف رسالة المستخدم في #ai-messages، يظهر typing، ينادي askAI، يضيف الرد، يخفي typing
- رسائل المستخدم: محاذاة يسار، gradient violet→cyan، rounded-2xl
- رسائل المساعد: محاذاة يمين، glass، rounded-2xl

### 9) Dashboard stats:
حدّث الأرقام من DB.table(t).count() لكل جدول.

### 10) تشغيل:
\`\`\`js
document.addEventListener('DOMContentLoaded',()=>{
  seedAll();
  bindAuth();
  bindNav();
  bindAllCRUD();
  bindAI();
  bindProfile();
  bindTheme();
  initApp();
});
\`\`\`

⚠️ القواعد:
- كل event listener مُعلَّف على عنصر تأكّد من وجوده أولاً (if(el))
- لا تستخدم innerHTML مع بيانات مستخدم خام دون تنظيف بسيط (escape <)
- كل دالة render تُفرغ الحاوية أولاً ثم تبني من جديد
- استخدم template literals مع classes Tailwind نفسها في الـ HTML للحفاظ على الاتساق البصري
- علّق الكود بالعربية بإيجاز

أعد JavaScript فقط داخل بلوك \`\`\`javascript ... \`\`\` بدون <script> tags وبدون شرح.`;

    const userMsg = `Schema: ${JSON.stringify(schema)}
Analysis: ${JSON.stringify(analysis)}
IDs الموجودة في HTML (يجب ربطها كلها): ${ids.join(', ')}

اكتب JS كامل احترافي يربط كل شيء.`;

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
  } catch (e: any) {
    console.error("logic fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
