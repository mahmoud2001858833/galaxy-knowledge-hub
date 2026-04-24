import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type FileObj = { path: string; content: string; language: string };

// ============ Normalize users table fields (CRITICAL fix) ============
function normalizeUsersTable(tables: any[]): any[] {
  const out = JSON.parse(JSON.stringify(tables || []));
  let users = out.find((t: any) => t.name === "users");
  if (!users) {
    users = {
      name: "users",
      displayName: "المستخدمون",
      fields: [],
    };
    out.unshift(users);
  }
  const fields: any[] = users.fields || [];
  // Rename any password-like field to "password"
  const seen = new Set<string>();
  const cleaned: any[] = [];
  for (const f of fields) {
    let n = String(f.name || "").toLowerCase();
    if (["password_hash", "pwd", "pass", "passwd"].includes(n)) n = "password";
    if (seen.has(n)) continue;
    seen.add(n);
    cleaned.push({ ...f, name: n, hidden: n === "password" ? true : f.hidden });
  }
  // Ensure required standard fields exist
  const ensure = (name: string, def: any) => {
    if (!seen.has(name)) {
      cleaned.push({ name, ...def });
      seen.add(name);
    }
  };
  ensure("id", { type: "uuid", primary: true });
  ensure("email", { type: "string", required: true, unique: true });
  ensure("password", { type: "string", required: true, hidden: true });
  ensure("name", { type: "string", required: true });
  ensure("avatar", { type: "url" });
  ensure("role", { type: "enum", options: ["user", "admin"], default: "user" });
  ensure("bio", { type: "text" });
  ensure("created_at", { type: "datetime", auto: true });
  ensure("updated_at", { type: "datetime", auto: true });
  users.fields = cleaned;
  return out;
}

// Ensure helper tables (notifications, settings) exist
function ensureCoreTables(tables: any[]): any[] {
  const out = [...tables];
  const has = (n: string) => out.some((t) => t.name === n);
  if (!has("notifications")) {
    out.push({
      name: "notifications",
      displayName: "الإشعارات",
      fields: [
        { name: "id", type: "uuid", primary: true },
        { name: "user_id", type: "uuid", required: true },
        { name: "title", type: "string", required: true },
        { name: "body", type: "text" },
        { name: "type", type: "enum", options: ["info", "success", "warning", "error"], default: "info" },
        { name: "read", type: "boolean", default: false },
        { name: "created_at", type: "datetime", auto: true },
      ],
    });
  }
  if (!has("settings")) {
    out.push({
      name: "settings",
      displayName: "الإعدادات",
      fields: [
        { name: "id", type: "uuid", primary: true },
        { name: "user_id", type: "uuid", required: true, unique: true },
        { name: "theme", type: "enum", options: ["dark", "light"], default: "dark" },
        { name: "language", type: "enum", options: ["ar", "en"], default: "ar" },
        { name: "notifications_enabled", type: "boolean", default: true },
        { name: "created_at", type: "datetime", auto: true },
        { name: "updated_at", type: "datetime", auto: true },
      ],
    });
  }
  return out;
}

function defaultCoreFiles(analysis: any, schema: any, supabaseUrl: string, supabaseAnon: string): FileObj[] {
  const platformName = analysis?.platformName || "منصتي الذكية";
  const tables: any[] = schema?.tables || [];
  const tableNames = tables.map((t) => t.name);

  const indexHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${platformName}</title>
<meta name="description" content="${platformName} - منصة ذكية متكاملة" />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="assets/css/theme.css">
<link rel="stylesheet" href="assets/css/main.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/animations.css">
<link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
<div id="app"></div>
<div id="toast-root"></div>
<div id="modal-root"></div>
<div id="ai-floating-root"></div>
<script src="assets/js/utils.js"></script>
<script src="assets/js/i18n.js"></script>
<script src="assets/js/toast.js"></script>
<script src="assets/js/db.js"></script>
<script src="assets/js/seed.js"></script>
<script src="assets/js/auth.js"></script>
<script src="assets/js/upload.js"></script>
<script src="assets/js/export.js"></script>
<script src="assets/js/search.js"></script>
<script src="assets/js/notifications.js"></script>
<script src="assets/js/ai.js"></script>
<script src="assets/js/components/modal.js"></script>
<script src="assets/js/components/navbar.js"></script>
<script src="assets/js/components/floating-ai.js"></script>
<script src="assets/js/router.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>`;

  const notFoundHtml = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>404 - غير موجود</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap" rel="stylesheet">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f0f23,#1a1a3e);font-family:'Cairo',sans-serif;color:#fff;text-align:center}
.box{padding:3rem}.code{font-size:8rem;font-weight:900;background:linear-gradient(135deg,#a855f7,#06b6d4);-webkit-background-clip:text;color:transparent;line-height:1}
a{color:#06b6d4;text-decoration:none;border:1px solid #06b6d4;padding:.7rem 1.4rem;border-radius:10px;display:inline-block;margin-top:1.5rem}</style></head>
<body><div class="box"><div class="code">404</div><h2>الصفحة غير موجودة</h2><a href="index.html">عودة للرئيسية</a></div></body></html>`;

  const themeCss = `:root{
  --bg:222 47% 6%;
  --surface:222 47% 9%;
  --surface-2:222 47% 12%;
  --surface-3:222 47% 15%;
  --border:222 32% 20%;
  --border-strong:222 32% 30%;
  --text:210 40% 98%;
  --text-muted:215 20% 70%;
  --text-dim:215 20% 50%;
  --primary:262 83% 62%;
  --primary-2:189 94% 55%;
  --primary-glow:262 83% 75%;
  --accent:142 76% 50%;
  --danger:0 84% 60%;
  --warn:38 92% 55%;
  --info:217 91% 60%;
  --radius:14px;
  --radius-sm:8px;
  --radius-lg:20px;
  --shadow:0 12px 40px -12px hsl(262 83% 30% / .55);
  --shadow-glow:0 0 60px -10px hsl(var(--primary)/.4);
  --gradient-primary:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-2)));
  --gradient-accent:linear-gradient(135deg,hsl(var(--accent)),hsl(189 94% 55%));
}
[data-theme="light"]{
  --bg:210 40% 98%;
  --surface:0 0% 100%;
  --surface-2:210 40% 96%;
  --surface-3:210 40% 92%;
  --border:215 16% 85%;
  --border-strong:215 16% 70%;
  --text:222 47% 11%;
  --text-muted:215 16% 47%;
  --text-dim:215 16% 60%;
}
*{box-sizing:border-box}
body{background:hsl(var(--bg));color:hsl(var(--text));font-family:'Cairo',sans-serif;margin:0;min-height:100vh;}
.glass{background:hsl(var(--surface)/.7);backdrop-filter:blur(14px);border:1px solid hsl(var(--border)/.6);border-radius:var(--radius);}
.text-muted{color:hsl(var(--text-muted));}
.text-dim{color:hsl(var(--text-dim));}
a{color:hsl(var(--primary-2));text-decoration:none;}
a:hover{text-decoration:underline;}`;

  const mainCss = `.container{max-width:1280px;margin:0 auto;padding:24px;}
.flex{display:flex;}.grid{display:grid;}
.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}
.items-center{align-items:center;}.items-start{align-items:flex-start;}.items-end{align-items:flex-end;}
.justify-between{justify-content:space-between;}.justify-center{justify-content:center;}.justify-end{justify-content:flex-end;}
.flex-wrap{flex-wrap:wrap;}.flex-1{flex:1;}.flex-col{flex-direction:column;}
.text-center{text-align:center;}.text-right{text-align:right;}.text-left{text-align:left;}
.w-full{width:100%}.h-full{height:100%}.min-h-screen{min-height:100vh}
.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}
.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}
.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8{padding:2rem}
.px-2{padding-left:.5rem;padding-right:.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}
.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}
.rounded{border-radius:10px;}.rounded-lg{border-radius:14px;}.rounded-xl{border-radius:18px;}.rounded-full{border-radius:9999px;}
.shadow{box-shadow:var(--shadow);}.shadow-glow{box-shadow:var(--shadow-glow);}
.hidden{display:none;}.relative{position:relative}.absolute{position:absolute}.fixed{position:fixed}
.z-10{z-index:10}.z-50{z-index:50}.z-100{z-index:100}
.cursor-pointer{cursor:pointer}
.text-xs{font-size:.75rem}.text-sm{font-size:.875rem}.text-base{font-size:1rem}.text-lg{font-size:1.125rem}.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem}.text-3xl{font-size:1.875rem}
.font-bold{font-weight:700}.font-black{font-weight:900}.font-semibold{font-weight:600}
.gradient-text{background:var(--gradient-primary);-webkit-background-clip:text;color:transparent;}`;

  const componentsCss = `.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.2rem;border-radius:12px;font-weight:700;cursor:pointer;border:none;transition:all .2s;font-family:inherit;font-size:.95rem;text-decoration:none;}
.btn-primary{background:var(--gradient-primary);color:white;box-shadow:0 6px 20px -6px hsl(var(--primary)/.6);}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 28px -8px hsl(var(--primary)/.7);}
.btn-ghost{background:transparent;color:hsl(var(--text));border:1px solid hsl(var(--border));}
.btn-ghost:hover{background:hsl(var(--surface-2));}
.btn-danger{background:hsl(var(--danger));color:white;}
.btn-danger:hover{filter:brightness(1.1);}
.btn-success{background:hsl(var(--accent));color:white;}
.btn-sm{padding:.35rem .8rem;font-size:.8rem;}
.btn-icon{padding:.5rem;width:2.4rem;height:2.4rem;justify-content:center;}
.input,.textarea,.select{width:100%;padding:.75rem 1rem;border-radius:10px;background:hsl(var(--surface-2));border:1px solid hsl(var(--border));color:hsl(var(--text));font-family:inherit;font-size:.95rem;transition:all .2s;}
.input:focus,.textarea:focus,.select:focus{outline:none;border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/.2);}
.textarea{min-height:90px;resize:vertical;}
.label{display:block;margin-bottom:.4rem;font-weight:600;font-size:.9rem;color:hsl(var(--text-muted));}
.card{background:hsl(var(--surface));border:1px solid hsl(var(--border));border-radius:var(--radius);padding:1.5rem;transition:all .25s;}
.card-hover:hover{transform:translateY(-3px);box-shadow:var(--shadow-glow);border-color:hsl(var(--primary)/.4);}
.card-stat{background:linear-gradient(135deg,hsl(var(--surface)),hsl(var(--surface-2)));}
.table{width:100%;border-collapse:collapse;}
.table th,.table td{padding:.85rem 1rem;text-align:right;border-bottom:1px solid hsl(var(--border));}
.table th{background:hsl(var(--surface-2));font-weight:700;font-size:.85rem;color:hsl(var(--text-muted));text-transform:uppercase;letter-spacing:.05em;}
.table tr:hover{background:hsl(var(--surface-2)/.5);}
.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:hsl(var(--surface));border:1px solid hsl(var(--border));padding:.85rem 1.5rem;border-radius:12px;box-shadow:var(--shadow);z-index:9999;animation:slideDown .3s ease;display:flex;align-items:center;gap:.6rem;font-weight:600;}
.toast-success{border-color:hsl(var(--accent));border-left:4px solid hsl(var(--accent));}
.toast-error{border-color:hsl(var(--danger));border-left:4px solid hsl(var(--danger));}
.toast-warning{border-color:hsl(var(--warn));border-left:4px solid hsl(var(--warn));}
.toast-info{border-color:hsl(var(--info));border-left:4px solid hsl(var(--info));}
.nav{display:flex;gap:.4rem;padding:.6rem;background:hsl(var(--surface)/.6);backdrop-filter:blur(14px);border-radius:var(--radius);margin-bottom:1.5rem;flex-wrap:wrap;border:1px solid hsl(var(--border));}
.nav a{padding:.55rem 1.1rem;border-radius:10px;text-decoration:none;color:hsl(var(--text-muted));font-weight:600;transition:all .2s;font-size:.9rem;}
.nav a:hover{background:hsl(var(--surface-2));color:hsl(var(--text));}
.nav a.active{background:var(--gradient-primary);color:white;box-shadow:0 4px 14px -4px hsl(var(--primary)/.5);}
.badge{display:inline-block;padding:.2rem .7rem;border-radius:999px;font-size:.75rem;background:hsl(var(--surface-2));color:hsl(var(--text-muted));font-weight:600;}
.badge-primary{background:hsl(var(--primary)/.15);color:hsl(var(--primary-glow));border:1px solid hsl(var(--primary)/.3);}
.badge-success{background:hsl(var(--accent)/.15);color:hsl(var(--accent));}
.badge-danger{background:hsl(var(--danger)/.15);color:hsl(var(--danger));}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:9000;backdrop-filter:blur(6px);animation:fadeIn .2s;}
.modal{background:hsl(var(--surface));border:1px solid hsl(var(--border));border-radius:var(--radius);padding:1.75rem;max-width:560px;width:92%;max-height:88vh;overflow:auto;animation:scaleIn .2s;}
.avatar{width:42px;height:42px;border-radius:50%;background:var(--gradient-primary);display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:700;flex-shrink:0;}
.empty{padding:3rem 1rem;text-align:center;color:hsl(var(--text-muted));}
.empty-icon{font-size:3rem;margin-bottom:.5rem;opacity:.5;}`;

  const animationsCss = `@keyframes slideDown{from{opacity:0;transform:translate(-50%,-12px);}to{opacity:1;transform:translate(-50%,0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
@keyframes slideInRight{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
.animate-fade-in{animation:fadeIn .3s ease;}
.animate-slide-in{animation:slideInRight .3s ease;}
.animate-pulse{animation:pulse 2s infinite;}
.animate-float{animation:float 3s ease infinite;}
.spinner{width:18px;height:18px;border:2px solid hsl(var(--border));border-top-color:hsl(var(--primary));border-radius:50%;animation:spin .8s linear infinite;display:inline-block;}
.skeleton{background:linear-gradient(90deg,hsl(var(--surface-2)) 0%,hsl(var(--surface-3)) 50%,hsl(var(--surface-2)) 100%);background-size:200% 100%;animation:skeletonShimmer 1.4s infinite;border-radius:8px;}
@keyframes skeletonShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}`;

  const responsiveCss = `@media (max-width:1024px){.container{max-width:100%;padding:18px;}}
@media (max-width:768px){.container{padding:14px;}.nav{padding:.4rem;gap:.25rem;}.nav a{padding:.45rem .8rem;font-size:.85rem;}
.card{padding:1.1rem;}.table th,.table td{padding:.6rem;font-size:.85rem;}
.hide-mobile{display:none !important;}}
@media (max-width:480px){.btn{padding:.5rem .9rem;font-size:.85rem;}}`;

  const utilsJs = `window.Utils = {
  uuid: () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now(),
  formatDate: (d) => { try { return new Date(d).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}); } catch { return ''; } },
  formatDateShort: (d) => { try { return new Date(d).toLocaleDateString('ar-EG'); } catch { return ''; } },
  validateEmail: (e) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(e),
  escape: (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  truncate: (s, n=80) => { s = String(s||''); return s.length > n ? s.slice(0,n)+'...' : s; },
  debounce: (fn, ms=300) => { let t; return (...a) => { clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; },
  initials: (name='?') => String(name).trim().split(/\\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(),
  async sha256(text){
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  },
  qs: (sel, ctx=document) => ctx.querySelector(sel),
  qsa: (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)),
};`;

  const i18nJs = `window.I18N = (function(){
  const dict = {
    ar: {welcome:'أهلاً بك',login:'تسجيل الدخول',signup:'إنشاء حساب',logout:'تسجيل خروج',profile:'الملف الشخصي',settings:'الإعدادات',search:'بحث',save:'حفظ',cancel:'إلغاء',delete:'حذف',edit:'تعديل',add:'إضافة',email:'البريد',password:'كلمة المرور',name:'الاسم'},
    en: {welcome:'Welcome',login:'Sign in',signup:'Sign up',logout:'Sign out',profile:'Profile',settings:'Settings',search:'Search',save:'Save',cancel:'Cancel',delete:'Delete',edit:'Edit',add:'Add',email:'Email',password:'Password',name:'Name'},
  };
  let lang = localStorage.getItem('app_lang') || 'ar';
  function set(l){ lang=l; localStorage.setItem('app_lang',l); document.documentElement.lang=l; document.documentElement.dir = l==='ar'?'rtl':'ltr'; }
  function t(key){ return (dict[lang]||dict.ar)[key] || key; }
  function get(){ return lang; }
  return { set, t, get };
})();`;

  const toastJs = `window.Toast = {
  show(msg, type='info', duration=2800){
    const root = document.getElementById('toast-root') || document.body;
    const el = document.createElement('div');
    el.className = 'toast toast-'+type;
    const icon = {success:'✓',error:'✗',warning:'⚠',info:'ℹ'}[type] || 'ℹ';
    el.innerHTML = '<span style="font-size:1.1rem">'+icon+'</span><span>'+Utils.escape(msg)+'</span>';
    root.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translate(-50%,-12px)'; setTimeout(()=>el.remove(), 280); }, duration);
  },
  success(m,d){ this.show(m,'success',d); },
  error(m,d){ this.show(m,'error',d); },
  warning(m,d){ this.show(m,'warning',d); },
  info(m,d){ this.show(m,'info',d); },
};`;

  const schemaJson = JSON.stringify(
    tables.reduce((acc: any, t: any) => {
      acc[t.name] = { fields: t.fields || [], indexes: t.indexes || [], relations: t.relations || [] };
      return acc;
    }, {}),
    null, 2
  );

  const dbJs = `// ============ Professional localStorage DB engine ============
window.DB = (function(){
  const KEY = 'app_db_v2';
  const SCHEMA = ${schemaJson};
  const subs = {}; // table -> [callbacks]
  let store = load();

  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save(){ localStorage.setItem(KEY, JSON.stringify(store)); }
  function ensure(name){ if (!store[name]) store[name] = { rows: [] }; return store[name]; }
  function now(){ return new Date().toISOString(); }
  function notify(name){ (subs[name]||[]).forEach(fn => { try{ fn(); }catch{} }); }

  function validate(name, row, isUpdate=false){
    const s = SCHEMA[name];
    if (!s) return row;
    for (const f of (s.fields||[])){
      // Skip auto fields and id
      if (f.auto || f.name === 'id') continue;
      // Apply defaults
      if (!isUpdate && (row[f.name]===undefined || row[f.name]===null) && f.default !== undefined) {
        row[f.name] = typeof f.default === 'function' ? f.default() : f.default;
      }
      // Required check (only on insert)
      if (!isUpdate && f.required && (row[f.name]===undefined || row[f.name]==='' || row[f.name]===null)){
        if (f.default === undefined) throw new Error('الحقل '+f.name+' مطلوب');
      }
      // Unique check
      if (f.unique && row[f.name] !== undefined && row[f.name] !== ''){
        const exists = (store[name]?.rows||[]).find(r => r[f.name]===row[f.name] && r.id!==row.id && !r.deleted_at);
        if (exists) throw new Error(f.name+' مستخدم مسبقاً');
      }
    }
    return row;
  }

  function table(name){
    ensure(name);
    return {
      all(){ return store[name].rows.filter(r => !r.deleted_at); },
      find(id){ return store[name].rows.find(r => r.id===id && !r.deleted_at); },
      where(fn){ return makeQuery(name, store[name].rows.filter(r => !r.deleted_at && fn(r))); },
      insert(data){
        const row = { id: Utils.uuid(), ...data, created_at: now(), updated_at: now() };
        validate(name, row);
        store[name].rows.push(row); save(); notify(name);
        return row;
      },
      update(id, patch){
        const idx = store[name].rows.findIndex(r => r.id===id);
        if (idx<0) throw new Error('غير موجود');
        const merged = { ...store[name].rows[idx], ...patch, updated_at: now() };
        validate(name, merged, true);
        store[name].rows[idx] = merged; save(); notify(name);
        return merged;
      },
      delete(id){
        const idx = store[name].rows.findIndex(r => r.id===id);
        if (idx<0) return false;
        store[name].rows[idx].deleted_at = now(); save(); notify(name);
        return true;
      },
      hardDelete(id){ store[name].rows = store[name].rows.filter(r => r.id!==id); save(); notify(name); },
      count(){ return this.all().length; },
      truncate(){ store[name].rows = []; save(); notify(name); },
      paginate(page=1, perPage=20){
        const all = this.all();
        const start = (page-1)*perPage;
        return { rows: all.slice(start, start+perPage), total: all.length, page, perPage, totalPages: Math.ceil(all.length/perPage) };
      },
      search(q){
        const ql = String(q||'').toLowerCase();
        if (!ql) return this.all();
        return this.all().filter(r => JSON.stringify(r).toLowerCase().includes(ql));
      },
    };
  }

  function makeQuery(name, rows){
    let _rows = rows;
    return {
      orderBy(field, dir='asc'){
        _rows = [..._rows].sort((a,b) => { const v1=a[field],v2=b[field]; if(v1<v2)return dir==='asc'?-1:1; if(v1>v2)return dir==='asc'?1:-1; return 0; });
        return this;
      },
      limit(n){ _rows = _rows.slice(0, n); return this; },
      offset(n){ _rows = _rows.slice(n); return this; },
      get(){ return _rows; },
      first(){ return _rows[0]; },
      count(){ return _rows.length; },
    };
  }

  return {
    table,
    tables: () => Object.keys(SCHEMA),
    schema: () => SCHEMA,
    subscribe(name, fn){ (subs[name]=subs[name]||[]).push(fn); return () => { subs[name] = subs[name].filter(x=>x!==fn); }; },
    export: () => JSON.stringify(store, null, 2),
    import: (json) => { store = (typeof json==='string')?JSON.parse(json):json; save(); Object.keys(SCHEMA).forEach(notify); },
    reset: () => { store = {}; save(); Object.keys(SCHEMA).forEach(notify); },
    stats(){ const out = {}; for (const t of Object.keys(SCHEMA)) out[t] = table(t).count(); return out; },
    searchAll(q){
      const out = {};
      for (const t of Object.keys(SCHEMA)){
        const rows = table(t).search(q);
        if (rows.length) out[t] = rows.slice(0, 10);
      }
      return out;
    },
  };
})();`;

  // Realistic seed
  const arabicSamples: Record<string, any[]> = {
    posts: [
      { title: "أهلاً بكم في المنصة", content: "هذا منشور تجريبي يوضح كيف تظهر المنشورات.", views: 124 },
      { title: "نصائح للاستخدام الأمثل", content: "اكتشف الميزات المتقدمة بالنقر على المساعد الذكي.", views: 89 },
      { title: "تحديثات جديدة", content: "أضفنا ميزات رائعة هذا الأسبوع.", views: 56 },
    ],
    categories: [
      { name: "عام", description: "المحتوى العام" },
      { name: "تقني", description: "محتوى تقني" },
      { name: "تعليمي", description: "محتوى تعليمي" },
    ],
    tasks: [
      { title: "إنهاء التقرير", status: "pending", priority: "high" },
      { title: "مراجعة التصميم", status: "in_progress", priority: "medium" },
      { title: "اجتماع الفريق", status: "done", priority: "low" },
    ],
    products: [
      { name: "منتج تجريبي 1", price: 99, stock: 25 },
      { name: "منتج تجريبي 2", price: 149, stock: 12 },
      { name: "منتج تجريبي 3", price: 49, stock: 100 },
    ],
  };
  const seedJs = `// initial demo data
(function(){
  if (localStorage.getItem('app_seeded_v2')) return;
  const samples = ${JSON.stringify(arabicSamples)};
  try {
${tableNames.map((t) => `    if (DB.table(${JSON.stringify(t)}).count() === 0) {
      const data = samples[${JSON.stringify(t)}] || [{name:'عنصر تجريبي 1'},{name:'عنصر تجريبي 2'},{name:'عنصر تجريبي 3'}];
      data.forEach(d => { try { DB.table(${JSON.stringify(t)}).insert(d); } catch(e){} });
    }`).join("\n")}
    localStorage.setItem('app_seeded_v2','1');
  } catch(e){ console.warn('seed', e); }
})();`;

  // ============ Auth: uses unified "password" field ============
  const authJs = `window.Auth = (function(){
  const SK = 'app_session_v2';
  async function register({email, password, name, remember}){
    if (!Utils.validateEmail(email)) throw new Error('بريد غير صالح');
    if (!password || password.length < 6) throw new Error('كلمة المرور 6 أحرف على الأقل');
    if (!name || name.trim().length < 2) throw new Error('الاسم مطلوب');
    const exists = DB.table('users').where(u => u.email===email).first();
    if (exists) throw new Error('البريد مسجل مسبقاً');
    const hash = await Utils.sha256(password);
    const user = DB.table('users').insert({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password: hash,
      role: 'user',
      avatar: '',
      bio: ''
    });
    setSession(user, remember);
    return user;
  }
  async function login({email, password, remember}){
    if (!email || !password) throw new Error('البريد وكلمة المرور مطلوبة');
    const hash = await Utils.sha256(password);
    const user = DB.table('users').where(u =>
      u.email===email.trim().toLowerCase() && u.password===hash
    ).first();
    if (!user) throw new Error('بيانات الدخول خاطئة');
    setSession(user, remember);
    return user;
  }
  async function changePassword(oldPass, newPass){
    const u = current(); if (!u) throw new Error('غير مسجل');
    const oldHash = await Utils.sha256(oldPass);
    if (u.password !== oldHash) throw new Error('كلمة المرور الحالية خاطئة');
    if (!newPass || newPass.length < 6) throw new Error('كلمة المرور الجديدة 6 أحرف على الأقل');
    const newHash = await Utils.sha256(newPass);
    DB.table('users').update(u.id, { password: newHash });
    return true;
  }
  function updateProfile(patch){
    const u = current(); if (!u) throw new Error('غير مسجل');
    const safe = { ...patch };
    delete safe.password; delete safe.email; delete safe.role; delete safe.id;
    return DB.table('users').update(u.id, safe);
  }
  function logout(){ localStorage.removeItem(SK); sessionStorage.removeItem(SK); location.hash = '#/login'; }
  function setSession(user, remember=true){
    const sess = JSON.stringify({ id: user.id, ts: Date.now() });
    if (remember) localStorage.setItem(SK, sess); else sessionStorage.setItem(SK, sess);
  }
  function current(){
    try {
      const s = JSON.parse(localStorage.getItem(SK) || sessionStorage.getItem(SK) || 'null');
      if (!s) return null;
      return DB.table('users').find(s.id);
    } catch { return null; }
  }
  function require(){
    const u = current();
    if (!u) { Toast.warning('سجّل الدخول أولاً'); location.hash = '#/login'; return null; }
    return u;
  }
  function isAdmin(){ const u = current(); return u && u.role === 'admin'; }
  return { register, login, logout, current, require, changePassword, updateProfile, isAdmin };
})();`;

  const uploadJs = `window.Upload = {
  pickImage(){
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = () => {
        const f = input.files[0]; if (!f) return reject(new Error('لم يتم اختيار صورة'));
        if (f.size > 2 * 1024 * 1024) return reject(new Error('الحجم الأقصى 2MB'));
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('فشل القراءة'));
        reader.readAsDataURL(f);
      };
      input.click();
    });
  }
};`;

  const exportJs = `window.Exporter = {
  exportJson(){
    const data = DB.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'backup-'+Date.now()+'.json'; a.click();
    URL.revokeObjectURL(url);
    Toast.success('تم تصدير البيانات');
  },
  importJson(){
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json';
    input.onchange = async () => {
      const f = input.files[0]; if (!f) return;
      try { const text = await f.text(); DB.import(text); Toast.success('تم الاستيراد'); setTimeout(()=>location.reload(), 800); }
      catch(e){ Toast.error('ملف غير صالح'); }
    };
    input.click();
  }
};`;

  const searchJs = `window.Search = {
  global(query){ return DB.searchAll(query); },
  inTable(table, query){ return DB.table(table).search(query); }
};`;

  const notificationsJs = `window.Notifications = {
  send(userId, title, body, type='info'){
    try { DB.table('notifications').insert({ user_id: userId, title, body: body||'', type, read: false }); } catch(e){}
  },
  unreadCount(userId){
    try { return DB.table('notifications').where(n => n.user_id===userId && !n.read).count(); } catch { return 0; }
  },
  markRead(id){ try { DB.table('notifications').update(id, { read: true }); } catch(e){} },
  markAllRead(userId){
    try { DB.table('notifications').where(n => n.user_id===userId && !n.read).get().forEach(n => DB.table('notifications').update(n.id, { read: true })); } catch(e){}
  }
};`;

  const platformContext = `أنت المساعد الذكي داخل منصة "${platformName}". تعرف عن قاعدة البيانات (الجداول: ${tableNames.join("، ") || "لا يوجد"}). ساعد المستخدم في فهم البيانات، اقتراح إجراءات، شرح الميزات، والإجابة عن أي سؤال بالعربية بشكل واضح ومنظم.`;
  const aiJs = `window.AI = (function(){
  const URL = ${JSON.stringify(supabaseUrl + "/functions/v1/platform-ai-proxy")};
  const KEY = ${JSON.stringify(supabaseAnon)};
  const SYSTEM = ${JSON.stringify(platformContext)};
  const history = [];
  function contextSnapshot(){
    try {
      const u = Auth.current();
      const stats = DB.stats();
      return 'سياق حالي: المستخدم='+(u?u.name:'زائر')+'، إحصائيات='+JSON.stringify(stats);
    } catch { return ''; }
  }
  async function ask(prompt, extraSystem){
    try {
      history.push({ role:'user', content: String(prompt) });
      const r = await fetch(URL, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEY,'apikey':KEY},
        body: JSON.stringify({
          messages: history.slice(-10),
          system: SYSTEM+'\\n'+contextSnapshot()+(extraSystem?'\\n'+extraSystem:'')
        })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return '⚠️ '+(d.error || ('خطأ '+r.status));
      const reply = d.reply || d.text || d.message || '';
      if (reply) history.push({ role:'assistant', content: reply });
      return reply || 'لم يصل رد من المساعد.';
    } catch(e){ return '⚠️ تعذر الاتصال: '+e.message; }
  }
  function reset(){ history.length = 0; }
  return { ask, reset, history: () => [...history] };
})();`;

  const componentModalJs = `window.Modal = {
  open({title, body, actions}){
    const root = document.getElementById('modal-root');
    root.innerHTML = '';
    const bg = document.createElement('div'); bg.className='modal-bg';
    bg.innerHTML = '<div class="modal" onclick="event.stopPropagation()"><h3 style="margin-top:0">'+Utils.escape(title)+'</h3><div>'+body+'</div><div class="flex gap-2 justify-end mt-6" id="modal-actions"></div></div>';
    bg.onclick = () => this.close();
    root.appendChild(bg);
    const actEl = bg.querySelector('#modal-actions');
    (actions||[{label:'إغلاق', onClick: ()=>this.close()}]).forEach(a => {
      const b = document.createElement('button');
      b.className = 'btn '+(a.variant==='primary'?'btn-primary':a.variant==='danger'?'btn-danger':'btn-ghost');
      b.textContent = a.label;
      b.onclick = () => a.onClick && a.onClick();
      actEl.appendChild(b);
    });
  },
  close(){ document.getElementById('modal-root').innerHTML = ''; },
  confirm(message){
    return new Promise(resolve => {
      this.open({
        title: 'تأكيد', body: '<p>'+Utils.escape(message)+'</p>',
        actions: [
          { label:'إلغاء', onClick: () => { this.close(); resolve(false); } },
          { label:'تأكيد', variant:'danger', onClick: () => { this.close(); resolve(true); } },
        ]
      });
    });
  }
};`;

  const componentNavbarJs = `window.Navbar = {
  render(items){
    const path = (location.hash.replace('#','') || '/').split('?')[0];
    return '<nav class="nav">'+items.map(it =>
      '<a href="#'+it.path+'" class="'+(path===it.path?'active':'')+'">'+it.label+'</a>'
    ).join('')+'</nav>';
  }
};`;

  const componentFloatingAiJs = `window.FloatingAI = {
  mount(){
    const root = document.getElementById('ai-floating-root');
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = '1';
    root.innerHTML = \`
      <button id="ai-fab" style="position:fixed;bottom:20px;left:20px;width:58px;height:58px;border-radius:50%;background:var(--gradient-primary);color:white;border:none;cursor:pointer;box-shadow:0 10px 30px -8px hsl(var(--primary)/.6);font-size:1.6rem;z-index:8000;transition:transform .2s">🤖</button>
      <div id="ai-drawer" style="position:fixed;bottom:90px;left:20px;width:360px;max-width:calc(100vw - 40px);height:480px;max-height:70vh;background:hsl(var(--surface));border:1px solid hsl(var(--border));border-radius:18px;box-shadow:0 20px 60px -10px rgba(0,0,0,.5);display:none;flex-direction:column;z-index:8000;overflow:hidden">
        <div style="padding:.9rem 1rem;border-bottom:1px solid hsl(var(--border));display:flex;justify-content:space-between;align-items:center;background:var(--gradient-primary);color:white">
          <strong>🤖 المساعد الذكي</strong>
          <button id="ai-close" style="background:transparent;border:none;color:white;font-size:1.2rem;cursor:pointer">✕</button>
        </div>
        <div id="ai-log" style="flex:1;overflow:auto;padding:.9rem;font-size:.9rem"></div>
        <form id="ai-form" style="display:flex;gap:.4rem;padding:.6rem;border-top:1px solid hsl(var(--border))">
          <input id="ai-input" class="input" placeholder="اسأل أي شيء..." required style="flex:1;font-size:.85rem;padding:.55rem .8rem">
          <button class="btn btn-primary btn-sm" type="submit">إرسال</button>
        </form>
      </div>\`;
    const fab = document.getElementById('ai-fab');
    const drawer = document.getElementById('ai-drawer');
    const close = document.getElementById('ai-close');
    const log = document.getElementById('ai-log');
    const form = document.getElementById('ai-form');
    const input = document.getElementById('ai-input');
    fab.onclick = () => { drawer.style.display = drawer.style.display==='flex'?'none':'flex'; };
    close.onclick = () => { drawer.style.display='none'; };
    form.onsubmit = async (e) => {
      e.preventDefault(); const q = input.value.trim(); if (!q) return; input.value='';
      log.innerHTML += '<div style="margin-bottom:.5rem;padding:.5rem .7rem;background:hsl(var(--surface-2));border-radius:10px"><strong>أنت:</strong> '+Utils.escape(q)+'</div>';
      const pid = 'p'+Date.now(); log.innerHTML += '<div id="'+pid+'" class="text-muted" style="padding:.5rem">يفكر...</div>';
      log.scrollTop = log.scrollHeight;
      const ans = await AI.ask(q);
      const p = document.getElementById(pid); if (p) p.remove();
      log.innerHTML += '<div style="margin-bottom:.7rem;padding:.6rem .8rem;background:hsl(var(--primary)/.12);border:1px solid hsl(var(--primary)/.25);border-radius:10px;white-space:pre-wrap">'+Utils.escape(ans)+'</div>';
      log.scrollTop = log.scrollHeight;
    };
  }
};`;

  const routerJs = `window.Router = (function(){
  const routes = {};
  function register(path, handler, opts={}){ routes[path] = { handler, opts }; }
  async function go(){
    const hash = location.hash.replace('#','') || '/';
    const path = hash.split('?')[0];
    const route = routes[path] || routes['/404'] || routes['/'];
    if (!route) { document.getElementById('app').innerHTML = '<div class="container"><div class="card text-center"><h2>404</h2></div></div>'; return; }
    if (route.opts.requireAuth && !Auth.current()) { location.hash = '#/login'; return; }
    const app = document.getElementById('app');
    app.style.opacity = '0';
    setTimeout(async () => {
      try { await route.handler(); renderNav(); FloatingAI.mount(); }
      catch(e){ console.error(e); Toast.error(e.message||'خطأ'); }
      app.style.transition = 'opacity .25s'; app.style.opacity = '1';
    }, 80);
  }
  function renderNav(){
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const path = (location.hash.replace('#','') || '/').split('?')[0];
    nav.querySelectorAll('a').forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#'+path); });
  }
  window.addEventListener('hashchange', go);
  return { register, go };
})();`;

  const navItems = [
    `<a href="#/">🏠 الرئيسية</a>`,
    ...tableNames.filter((t) => !["users", "notifications", "settings"].includes(t)).slice(0, 5).map((t) => `<a href="#/${t}">${t}</a>`),
    `<a href="#/search">🔍 بحث</a>`,
    `<a href="#/ai-chat">🤖 المساعد</a>`,
    `<a href="#/profile">👤 ملفي</a>`,
    `<a href="#/settings">⚙️ الإعدادات</a>`,
  ].join("");

  const appJs = `// ============ Bootstrap ============
function shell(content){
  const u = Auth.current();
  return \`<div class="container">
    <header class="flex items-center justify-between mb-6 mt-4">
      <a href="#/" style="text-decoration:none">
        <h1 style="margin:0;font-size:1.6rem;font-weight:900" class="gradient-text">${platformName}</h1>
      </a>
      <div class="flex gap-2 items-center">
        \${u ? '<span class="badge badge-primary hide-mobile">👤 '+Utils.escape(u.name)+'</span>' : ''}
        <button class="btn btn-ghost btn-icon" title="تبديل الوضع" onclick="toggleTheme()">🌓</button>
      </div>
    </header>
    <nav id="main-nav" class="nav">${navItems}</nav>
    <main>\${content}</main>
    <footer class="text-center text-muted mt-8" style="padding:1.5rem 0;font-size:.85rem;border-top:1px solid hsl(var(--border))">
      © \${new Date().getFullYear()} ${platformName} — تم الإنشاء بـ AI
    </footer>
  </div>\`;
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'light' ? '' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('app_theme', next);
}
(function(){ const t = localStorage.getItem('app_theme'); if (t) document.documentElement.setAttribute('data-theme', t); })();

function pageHome(){
  const u = Auth.current();
  const stats = DB.stats();
  const cards = Object.entries(stats).map(([t,c]) => \`
    <div class="card card-stat card-hover">
      <div class="text-muted text-sm mb-1">\${t}</div>
      <div style="font-size:2rem;font-weight:900" class="gradient-text">\${c}</div>
    </div>
  \`).join('');
  document.getElementById('app').innerHTML = shell(\`
    <div class="card mb-6 animate-fade-in" style="background:linear-gradient(135deg,hsl(var(--primary)/.15),hsl(var(--primary-2)/.1));border-color:hsl(var(--primary)/.3)">
      <h2 style="margin-top:0;font-size:1.6rem">\${u ? 'أهلاً '+Utils.escape(u.name)+' 👋' : 'مرحباً بك في ${platformName}'}</h2>
      <p class="text-muted">منصة ذكية متكاملة بقاعدة بيانات احترافية ومساعد ذكاء اصطناعي.</p>
      \${u ? '' : '<div class="flex gap-2 mt-4"><a href="#/login" class="btn btn-primary">تسجيل الدخول</a><a href="#/signup" class="btn btn-ghost">إنشاء حساب</a></div>'}
    </div>
    <h3 class="mb-4">📊 نظرة عامة</h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem">\${cards}</div>
  \`);
}

function pageLogin(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in" style="max-width:440px;margin:2rem auto">
      <h2 style="margin-top:0;text-align:center">🔐 تسجيل الدخول</h2>
      <form id="lf">
        <label class="label">البريد الإلكتروني</label>
        <input class="input mb-4" name="email" type="email" required autofocus />
        <label class="label">كلمة المرور</label>
        <input class="input mb-4" name="password" type="password" required minlength="6" />
        <label class="flex items-center gap-2 mb-4" style="font-size:.9rem;cursor:pointer">
          <input type="checkbox" name="remember" checked /> تذكّرني
        </label>
        <button class="btn btn-primary w-full" type="submit">دخول</button>
        <p class="text-muted text-center mt-4 text-sm">لا تملك حساباً؟ <a href="#/signup">سجّل الآن</a></p>
      </form>
    </div>
  \`);
  document.getElementById('lf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await Auth.login({ email: fd.get('email'), password: fd.get('password'), remember: fd.get('remember')==='on' });
      Toast.success('أهلاً بك!'); location.hash='#/';
    } catch(err){ Toast.error(err.message); }
  });
}

function pageSignup(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in" style="max-width:440px;margin:2rem auto">
      <h2 style="margin-top:0;text-align:center">✨ إنشاء حساب</h2>
      <form id="sf">
        <label class="label">الاسم الكامل</label>
        <input class="input mb-4" name="name" required minlength="2" autofocus />
        <label class="label">البريد الإلكتروني</label>
        <input class="input mb-4" name="email" type="email" required />
        <label class="label">كلمة المرور (6 أحرف فأكثر)</label>
        <input class="input mb-4" name="password" type="password" required minlength="6" />
        <button class="btn btn-primary w-full" type="submit">إنشاء الحساب</button>
        <p class="text-muted text-center mt-4 text-sm">لديك حساب؟ <a href="#/login">دخول</a></p>
      </form>
    </div>
  \`);
  document.getElementById('sf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await Auth.register({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password'), remember: true });
      Toast.success('تم إنشاء الحساب 🎉');
      location.hash='#/';
    } catch(err){ Toast.error(err.message); }
  });
}

function pageProfile(){
  const u = Auth.require(); if (!u) return;
  document.getElementById('app').innerHTML = shell(\`
    <div class="grid" style="grid-template-columns:1fr;gap:1.5rem;max-width:680px;margin:0 auto">
      <div class="card animate-fade-in">
        <div class="flex items-center gap-4 mb-6">
          <div class="avatar" style="width:64px;height:64px;font-size:1.4rem">\${u.avatar?'<img src="'+u.avatar+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">':Utils.initials(u.name)}</div>
          <div>
            <h2 style="margin:0">\${Utils.escape(u.name)}</h2>
            <div class="text-muted text-sm">\${Utils.escape(u.email)}</div>
            <span class="badge badge-primary mt-2">\${u.role||'user'}</span>
          </div>
        </div>
        <form id="pf">
          <label class="label">الاسم</label>
          <input class="input mb-3" name="name" value="\${Utils.escape(u.name)}" />
          <label class="label">نبذة</label>
          <textarea class="textarea mb-3" name="bio">\${Utils.escape(u.bio||'')}</textarea>
          <button class="btn btn-primary" type="submit">💾 حفظ التغييرات</button>
          <button class="btn btn-ghost" type="button" id="upBtn">📷 تغيير الصورة</button>
        </form>
      </div>
      <div class="card">
        <h3 style="margin-top:0">🔒 تغيير كلمة المرور</h3>
        <form id="cpf">
          <label class="label">كلمة المرور الحالية</label>
          <input class="input mb-3" name="oldPass" type="password" required />
          <label class="label">كلمة المرور الجديدة</label>
          <input class="input mb-3" name="newPass" type="password" required minlength="6" />
          <button class="btn btn-primary" type="submit">تحديث</button>
        </form>
      </div>
      <button class="btn btn-danger" onclick="Auth.logout()">🚪 تسجيل خروج</button>
    </div>
  \`);
  document.getElementById('pf').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { Auth.updateProfile({ name: fd.get('name'), bio: fd.get('bio') }); Toast.success('تم الحفظ'); setTimeout(()=>location.reload(), 600); }
    catch(err){ Toast.error(err.message); }
  });
  document.getElementById('cpf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { await Auth.changePassword(fd.get('oldPass'), fd.get('newPass')); Toast.success('تم تحديث كلمة المرور'); e.target.reset(); }
    catch(err){ Toast.error(err.message); }
  });
  document.getElementById('upBtn').addEventListener('click', async () => {
    try { const dataUrl = await Upload.pickImage(); Auth.updateProfile({ avatar: dataUrl }); Toast.success('تم تحديث الصورة'); setTimeout(()=>location.reload(), 600); }
    catch(err){ Toast.error(err.message); }
  });
}

function pageSettings(){
  Auth.require();
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in" style="max-width:560px;margin:0 auto">
      <h2 style="margin-top:0">⚙️ الإعدادات</h2>
      <div class="flex flex-col gap-3">
        <button class="btn btn-ghost" onclick="toggleTheme()">🌓 تبديل الوضع (داكن/فاتح)</button>
        <button class="btn btn-ghost" onclick="Exporter.exportJson()">📤 تصدير كل البيانات (JSON)</button>
        <button class="btn btn-ghost" onclick="Exporter.importJson()">📥 استيراد بيانات</button>
        <button class="btn btn-danger" onclick="Modal.confirm('سيتم مسح جميع البيانات نهائياً. متأكد؟').then(ok => { if(ok){ DB.reset(); location.reload(); } })">🗑️ مسح كل البيانات</button>
      </div>
    </div>
  \`);
}

function pageAIChat(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in" style="max-width:760px;margin:0 auto">
      <h2 style="margin-top:0">🤖 المساعد الذكي</h2>
      <p class="text-muted text-sm mb-4">اسأل عن البيانات أو اطلب اقتراحات أو توضيحات.</p>
      <div id="ai-log" style="min-height:280px;max-height:440px;overflow:auto;padding:1rem;background:hsl(var(--surface-2));border-radius:12px;margin-bottom:1rem"></div>
      <form id="aif" class="flex gap-2">
        <input class="input flex-1" name="q" placeholder="اكتب سؤالك..." required autofocus />
        <button class="btn btn-primary">إرسال</button>
      </form>
    </div>
  \`);
  const log = document.getElementById('ai-log');
  document.getElementById('aif').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = e.target.q.value; e.target.q.value='';
    log.innerHTML += '<div style="margin-bottom:.6rem;padding:.6rem .9rem;background:hsl(var(--surface));border-radius:10px"><strong>أنت:</strong> '+Utils.escape(q)+'</div>';
    log.innerHTML += '<div id="ai-pending" class="text-muted" style="padding:.6rem"><span class="spinner"></span> يفكر...</div>';
    log.scrollTop = log.scrollHeight;
    const ans = await AI.ask(q);
    const p = document.getElementById('ai-pending'); if (p) p.remove();
    log.innerHTML += '<div style="margin-bottom:1rem;padding:.7rem 1rem;background:hsl(var(--primary)/.12);border:1px solid hsl(var(--primary)/.25);border-radius:10px;white-space:pre-wrap"><strong>المساعد:</strong> '+Utils.escape(ans)+'</div>';
    log.scrollTop = log.scrollHeight;
  });
}

function pageSearch(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in">
      <h2 style="margin-top:0">🔍 البحث الشامل</h2>
      <input id="sq" class="input mb-4" placeholder="ابحث في كل البيانات..." autofocus />
      <div id="sr"></div>
    </div>
  \`);
  const sq = document.getElementById('sq');
  const sr = document.getElementById('sr');
  const run = Utils.debounce(() => {
    const q = sq.value.trim();
    if (!q) { sr.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div>اكتب للبدء</div>'; return; }
    const results = Search.global(q);
    const tables = Object.keys(results);
    if (!tables.length) { sr.innerHTML = '<div class="empty">لا توجد نتائج</div>'; return; }
    sr.innerHTML = tables.map(t => \`
      <div class="mb-4">
        <h4 class="mb-2">\${t} <span class="badge">\${results[t].length}</span></h4>
        \${results[t].map(r => '<div class="p-3 mb-2" style="background:hsl(var(--surface-2));border-radius:10px;font-size:.85rem">'+Utils.truncate(JSON.stringify(r), 200)+'</div>').join('')}
      </div>
    \`).join('');
  }, 250);
  sq.addEventListener('input', run);
  run();
}

function pageAbout(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in" style="max-width:760px;margin:0 auto">
      <h2 style="margin-top:0">ℹ️ حول ${platformName}</h2>
      <p>منصة ذكية متكاملة تم إنشاؤها بتقنيات حديثة وذكاء اصطناعي.</p>
      <h3>الميزات</h3>
      <ul>
        <li>قاعدة بيانات احترافية بـ \${Object.keys(DB.schema()).length} جدول</li>
        <li>تسجيل دخول وحماية الصفحات</li>
        <li>مساعد ذكي يفهم سياق المنصة</li>
        <li>بحث شامل، تصدير/استيراد، وضع داكن وفاتح</li>
      </ul>
    </div>
  \`);
}

function pageContact(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card animate-fade-in" style="max-width:560px;margin:0 auto">
      <h2 style="margin-top:0">📧 تواصل معنا</h2>
      <form onsubmit="event.preventDefault();Toast.success('تم إرسال الرسالة');this.reset()">
        <label class="label">الاسم</label><input class="input mb-3" required />
        <label class="label">البريد</label><input class="input mb-3" type="email" required />
        <label class="label">الرسالة</label><textarea class="textarea mb-3" required></textarea>
        <button class="btn btn-primary">إرسال</button>
      </form>
    </div>
  \`);
}

// Generic table page (full CRUD)
function makeTablePage(tableName, fields){
  return function(){
    Auth.require();
    const rows = DB.table(tableName).all();
    const visible = fields.filter(f => !['password','deleted_at'].includes(f.name)).slice(0, 5);
    const rowsHtml = rows.length ? rows.map(r => \`
      <tr>
        \${visible.map(c => '<td>'+Utils.truncate(Utils.escape(String(r[c.name] ?? '')), 60)+'</td>').join('')}
        <td><button class="btn btn-danger btn-sm" onclick="Modal.confirm('حذف؟').then(ok=>{if(ok){DB.table(\\''+tableName+'\\').delete(\\''+r.id+'\\');location.reload();}})">حذف</button></td>
      </tr>
    \`).join('') : '<tr><td colspan="'+(visible.length+1)+'"><div class="empty"><div class="empty-icon">📭</div>لا توجد بيانات</div></td></tr>';

    const formFields = fields
      .filter(f => !['id','created_at','updated_at','deleted_at'].includes(f.name) && !f.auto)
      .map(f => {
        if (f.type === 'enum' && f.options) {
          return '<label class="label">'+f.name+(f.required?' *':'')+'</label><select class="select mb-3" name="'+f.name+'">'+f.options.map(o=>'<option>'+o+'</option>').join('')+'</select>';
        }
        if (f.type === 'text') return '<label class="label">'+f.name+(f.required?' *':'')+'</label><textarea class="textarea mb-3" name="'+f.name+'" '+(f.required?'required':'')+'></textarea>';
        if (f.type === 'boolean') return '<label class="flex items-center gap-2 mb-3"><input type="checkbox" name="'+f.name+'" /> '+f.name+'</label>';
        const t = f.type==='number'||f.type==='integer'||f.type==='float'?'number':f.name==='password'?'password':f.name==='email'||f.type==='email'?'email':'text';
        return '<label class="label">'+f.name+(f.required?' *':'')+'</label><input class="input mb-3" name="'+f.name+'" type="'+t+'" '+(f.required?'required':'')+' />';
      }).join('');

    document.getElementById('app').innerHTML = shell(\`
      <div class="grid" style="grid-template-columns:1fr 340px;gap:1.5rem" class="animate-fade-in">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 style="margin:0">📋 \${tableName}</h2>
            <span class="badge badge-primary">\${rows.length}</span>
          </div>
          <div style="overflow-x:auto"><table class="table">
            <thead><tr>\${visible.map(c => '<th>'+c.name+'</th>').join('')}<th>إجراء</th></tr></thead>
            <tbody>\${rowsHtml}</tbody>
          </table></div>
        </div>
        <div class="card">
          <h3 style="margin-top:0">➕ إضافة جديد</h3>
          <form id="addf">\${formFields}<button class="btn btn-primary w-full" type="submit">حفظ</button></form>
        </div>
      </div>
    \`);
    document.getElementById('addf').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {};
      const fd = new FormData(e.target);
      for (const [k,v] of fd.entries()) data[k] = v;
      // Handle checkboxes
      e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => { data[cb.name] = cb.checked; });
      try { DB.table(tableName).insert(data); Toast.success('تمت الإضافة'); location.reload(); }
      catch(err){ Toast.error(err.message); }
    });
  };
}

// ============ Routes ============
Router.register('/', pageHome);
Router.register('/login', pageLogin);
Router.register('/signup', pageSignup);
Router.register('/profile', pageProfile, { requireAuth: true });
Router.register('/settings', pageSettings, { requireAuth: true });
Router.register('/ai-chat', pageAIChat);
Router.register('/search', pageSearch);
Router.register('/about', pageAbout);
Router.register('/contact', pageContact);
${tables.map((t) => `Router.register('/${t.name}', makeTablePage('${t.name}', ${JSON.stringify(t.fields || [])}), { requireAuth: true });`).join("\n")}

if (!location.hash) location.hash = '#/';
Router.go();`;

  const readme = `# ${platformName}

مشروع ويب احترافي متعدد الملفات تم توليده بواسطة باني المنصات الذكي.

## الهيكلية
- \`index.html\` — نقطة الدخول
- \`assets/css/\` — ملفات التصميم (theme, main, components, animations, responsive)
- \`assets/js/\` — المنطق الأساسي (db, auth, ai, router, app, ...)
- \`assets/js/components/\` — مكونات (modal, navbar, floating-ai)
- \`assets/js/modules/\` — منطق CRUD لكل جدول
- \`pages/\` — صفحات HTML

## الجداول
${tables.map((t) => `- **${t.name}**: ${(t.fields || []).map((f: any) => f.name).join(", ")}`).join("\n")}

## التشغيل
افتح \`index.html\` في المتصفح، أو ارفع الملفات على أي استضافة ثابتة.
`;

  return [
    { path: "index.html", content: indexHtml, language: "html" },
    { path: "404.html", content: notFoundHtml, language: "html" },
    { path: "assets/css/theme.css", content: themeCss, language: "css" },
    { path: "assets/css/main.css", content: mainCss, language: "css" },
    { path: "assets/css/components.css", content: componentsCss, language: "css" },
    { path: "assets/css/animations.css", content: animationsCss, language: "css" },
    { path: "assets/css/responsive.css", content: responsiveCss, language: "css" },
    { path: "assets/js/utils.js", content: utilsJs, language: "javascript" },
    { path: "assets/js/i18n.js", content: i18nJs, language: "javascript" },
    { path: "assets/js/toast.js", content: toastJs, language: "javascript" },
    { path: "assets/js/db.js", content: dbJs, language: "javascript" },
    { path: "assets/js/seed.js", content: seedJs, language: "javascript" },
    { path: "assets/js/auth.js", content: authJs, language: "javascript" },
    { path: "assets/js/upload.js", content: uploadJs, language: "javascript" },
    { path: "assets/js/export.js", content: exportJs, language: "javascript" },
    { path: "assets/js/search.js", content: searchJs, language: "javascript" },
    { path: "assets/js/notifications.js", content: notificationsJs, language: "javascript" },
    { path: "assets/js/ai.js", content: aiJs, language: "javascript" },
    { path: "assets/js/components/modal.js", content: componentModalJs, language: "javascript" },
    { path: "assets/js/components/navbar.js", content: componentNavbarJs, language: "javascript" },
    { path: "assets/js/components/floating-ai.js", content: componentFloatingAiJs, language: "javascript" },
    { path: "assets/js/router.js", content: routerJs, language: "javascript" },
    { path: "assets/js/app.js", content: appJs, language: "javascript" },
    { path: "README.md", content: readme, language: "markdown" },
  ];
}

function moduleFileFor(table: any): FileObj {
  const name = table.name;
  const fields = table.fields || [];
  return {
    path: `assets/js/modules/${name}.js`,
    language: "javascript",
    content: `// ============ Module: ${name} ============
window.${name.replace(/[^a-zA-Z0-9_]/g, '_')}Module = {
  schema: ${JSON.stringify(fields, null, 2)},
  list(filter){ const t = DB.table('${name}'); return filter ? t.where(filter).get() : t.all(); },
  get(id){ return DB.table('${name}').find(id); },
  create(data){ return DB.table('${name}').insert(data); },
  update(id, patch){ return DB.table('${name}').update(id, patch); },
  remove(id){ return DB.table('${name}').delete(id); },
  count(){ return DB.table('${name}').count(); },
  paginate(page, perPage){ return DB.table('${name}').paginate(page, perPage); },
  search(q){ return DB.table('${name}').search(q); },
};`,
  };
}

function pageFileFor(table: any): FileObj {
  return {
    path: `pages/${table.name}.html`,
    language: "html",
    content: `<section class="card">
  <h2>${table.name}</h2>
  <p class="text-muted">إدارة بيانات جدول ${table.name}.</p>
</section>`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { description, analysis, schema } = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // CRITICAL: normalize users + ensure helper tables
    let tables: any[] = schema?.tables || [];
    tables = normalizeUsersTable(tables);
    tables = ensureCoreTables(tables);
    const finalSchema = { ...schema, tables };

    const core = defaultCoreFiles(analysis || {}, finalSchema, SUPABASE_URL, SUPABASE_ANON);
    const modules = tables.map(moduleFileFor);
    const pages = tables.map(pageFileFor);

    const commonPages: FileObj[] = [
      { path: "pages/home.html", language: "html", content: `<section class="card"><h2>الرئيسية</h2><p>أهلاً بك.</p></section>` },
      { path: "pages/login.html", language: "html", content: `<section class="card"><h2>تسجيل الدخول</h2></section>` },
      { path: "pages/signup.html", language: "html", content: `<section class="card"><h2>إنشاء حساب</h2></section>` },
      { path: "pages/profile.html", language: "html", content: `<section class="card"><h2>الملف الشخصي</h2></section>` },
      { path: "pages/settings.html", language: "html", content: `<section class="card"><h2>الإعدادات</h2></section>` },
      { path: "pages/ai-chat.html", language: "html", content: `<section class="card"><h2>المساعد الذكي</h2></section>` },
      { path: "pages/search.html", language: "html", content: `<section class="card"><h2>البحث الشامل</h2></section>` },
      { path: "pages/about.html", language: "html", content: `<section class="card"><h2>حول المنصة</h2></section>` },
      { path: "pages/contact.html", language: "html", content: `<section class="card"><h2>تواصل معنا</h2></section>` },
    ];

    const all = [...core, ...modules, ...pages, ...commonPages];
    const seen = new Set<string>();
    const files = all.filter((f) => { if (seen.has(f.path)) return false; seen.add(f.path); return true; });

    return new Response(JSON.stringify({ files, schema: finalSchema }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("files fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
