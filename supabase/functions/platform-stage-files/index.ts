import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type FileObj = { path: string; content: string; language: string };

// ============ Default professional core files (always present, no AI needed) ============
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
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="assets/css/theme.css">
<link rel="stylesheet" href="assets/css/main.css">
<link rel="stylesheet" href="assets/css/components.css">
</head>
<body>
<div id="app"></div>
<div id="toast-root"></div>
<script src="assets/js/utils.js"></script>
<script src="assets/js/toast.js"></script>
<script src="assets/js/db.js"></script>
<script src="assets/js/seed.js"></script>
<script src="assets/js/auth.js"></script>
<script src="assets/js/ai.js"></script>
<script src="assets/js/router.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>`;

  const themeCss = `:root{
  --bg:222 47% 6%;
  --surface:222 47% 9%;
  --surface-2:222 47% 12%;
  --border:222 32% 20%;
  --text:210 40% 98%;
  --text-muted:215 20% 70%;
  --primary:262 83% 62%;
  --primary-2:189 94% 55%;
  --accent:142 76% 50%;
  --danger:0 84% 60%;
  --warn:38 92% 55%;
  --radius:14px;
  --shadow:0 12px 40px -12px hsl(262 83% 30% / .55);
}
[data-theme="light"]{
  --bg:210 40% 98%;
  --surface:0 0% 100%;
  --surface-2:210 40% 96%;
  --border:215 16% 85%;
  --text:222 47% 11%;
  --text-muted:215 16% 47%;
}
body{background:hsl(var(--bg));color:hsl(var(--text));font-family:'Cairo',sans-serif;}
.glass{background:hsl(var(--surface)/.7);backdrop-filter:blur(14px);border:1px solid hsl(var(--border)/.6);border-radius:var(--radius);}
.btn-primary{background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-2)));color:white;}
.text-muted{color:hsl(var(--text-muted));}`;

  const mainCss = `*,*::before,*::after{box-sizing:border-box;}
body{margin:0;min-height:100vh;}
.container{max-width:1180px;margin:0 auto;padding:24px;}
.flex{display:flex;}.grid{display:grid;}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}
.items-center{align-items:center;}.justify-between{justify-content:space-between;}
.text-center{text-align:center;}
.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}
.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}
.p-3{padding:.75rem}.p-4{padding:1rem}.p-6{padding:1.5rem}
.rounded{border-radius:10px;}.rounded-lg{border-radius:14px;}.rounded-xl{border-radius:18px;}
.shadow{box-shadow:var(--shadow);}
@media(max-width:640px){.container{padding:14px;}}`;

  const componentsCss = `.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.1rem;border-radius:12px;font-weight:700;cursor:pointer;border:none;transition:all .2s;font-family:inherit;}
.btn-primary{background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-2)));color:white;box-shadow:0 6px 20px -6px hsl(var(--primary)/.6);}
.btn-primary:hover{transform:translateY(-1px);}
.btn-ghost{background:transparent;color:hsl(var(--text));border:1px solid hsl(var(--border));}
.btn-danger{background:hsl(var(--danger));color:white;}
.input,.textarea,.select{width:100%;padding:.7rem 1rem;border-radius:10px;background:hsl(var(--surface-2));border:1px solid hsl(var(--border));color:hsl(var(--text));font-family:inherit;font-size:.95rem;}
.input:focus,.textarea:focus{outline:none;border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/.2);}
.label{display:block;margin-bottom:.4rem;font-weight:600;font-size:.9rem;color:hsl(var(--text-muted));}
.card{background:hsl(var(--surface));border:1px solid hsl(var(--border));border-radius:var(--radius);padding:1.25rem;}
.table{width:100%;border-collapse:collapse;}
.table th,.table td{padding:.75rem 1rem;text-align:right;border-bottom:1px solid hsl(var(--border));}
.table th{background:hsl(var(--surface-2));font-weight:700;}
.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:hsl(var(--surface));border:1px solid hsl(var(--border));padding:.8rem 1.4rem;border-radius:12px;box-shadow:var(--shadow);z-index:9999;animation:slideIn .25s ease;}
.toast-success{border-color:hsl(var(--accent));}.toast-error{border-color:hsl(var(--danger));}
@keyframes slideIn{from{opacity:0;transform:translate(-50%,-12px);}to{opacity:1;transform:translate(-50%,0);}}
.nav{display:flex;gap:.4rem;padding:.6rem;background:hsl(var(--surface)/.6);backdrop-filter:blur(14px);border-radius:var(--radius);margin-bottom:1.5rem;flex-wrap:wrap;}
.nav a{padding:.5rem 1rem;border-radius:10px;text-decoration:none;color:hsl(var(--text-muted));font-weight:600;}
.nav a.active{background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-2)));color:white;}
.badge{display:inline-block;padding:.15rem .6rem;border-radius:999px;font-size:.75rem;background:hsl(var(--surface-2));color:hsl(var(--text-muted));}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9000;backdrop-filter:blur(4px);}
.modal{background:hsl(var(--surface));border:1px solid hsl(var(--border));border-radius:var(--radius);padding:1.5rem;max-width:520px;width:92%;}`;

  const utilsJs = `window.Utils = {
  uuid: () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now(),
  formatDate: (d) => new Date(d).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}),
  validateEmail: (e) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(e),
  escape: (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  debounce: (fn, ms=300) => { let t; return (...a) => { clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; },
  async sha256(text){
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  },
};`;

  const toastJs = `window.Toast = {
  show(msg, type='info'){
    const root = document.getElementById('toast-root') || document.body;
    const el = document.createElement('div');
    el.className = 'toast toast-'+type;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(), 250); }, 2400);
  },
  success(m){ this.show(m,'success'); },
  error(m){ this.show(m,'error'); },
};`;

  // ===== Professional DB engine =====
  const schemaJson = JSON.stringify(
    tables.reduce((acc: any, t: any) => {
      acc[t.name] = {
        fields: t.fields || [],
        indexes: t.indexes || [],
        relations: t.relations || [],
      };
      return acc;
    }, {}),
    null, 2
  );

  const dbJs = `// ============ Professional localStorage DB engine ============
window.DB = (function(){
  const KEY = 'app_db_v1';
  const SCHEMA = ${schemaJson};
  let store = load();

  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(store)); }
  function ensure(name){
    if (!store[name]) store[name] = { rows: [], seq: 1 };
    return store[name];
  }
  function now(){ return new Date().toISOString(); }
  function validate(name, row, isUpdate=false){
    const s = SCHEMA[name];
    if (!s) return row;
    for (const f of (s.fields||[])){
      if (!isUpdate && f.required && (row[f.name]===undefined || row[f.name]==='' || row[f.name]===null)){
        if (f.default !== undefined) row[f.name] = f.default;
        else throw new Error('الحقل '+f.name+' مطلوب');
      }
      if (f.unique && row[f.name] !== undefined){
        const exists = (store[name]?.rows||[]).find(r => r[f.name]===row[f.name] && r.id!==row.id && !r.deleted_at);
        if (exists) throw new Error(f.name+' موجود مسبقاً');
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
        store[name].rows.push(row); save();
        return row;
      },
      update(id, patch){
        const idx = store[name].rows.findIndex(r => r.id===id);
        if (idx<0) throw new Error('غير موجود');
        const merged = { ...store[name].rows[idx], ...patch, updated_at: now() };
        validate(name, merged, true);
        store[name].rows[idx] = merged; save();
        return merged;
      },
      delete(id){
        const idx = store[name].rows.findIndex(r => r.id===id);
        if (idx<0) return false;
        store[name].rows[idx].deleted_at = now(); save();
        return true;
      },
      hardDelete(id){
        store[name].rows = store[name].rows.filter(r => r.id!==id); save();
      },
      count(){ return this.all().length; },
      truncate(){ store[name].rows = []; save(); },
    };
  }
  function makeQuery(name, rows){
    let _rows = rows;
    return {
      orderBy(field, dir='asc'){
        _rows = [..._rows].sort((a,b) => {
          const v1=a[field], v2=b[field];
          if (v1<v2) return dir==='asc'?-1:1;
          if (v1>v2) return dir==='asc'?1:-1;
          return 0;
        });
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
    export: () => JSON.stringify(store, null, 2),
    import: (json) => { store = JSON.parse(json); save(); },
    reset: () => { store = {}; save(); },
    stats(){
      const out = {};
      for (const t of Object.keys(SCHEMA)) out[t] = table(t).count();
      return out;
    }
  };
})();`;

  const seedJs = `// initial demo data
(function(){
  if (localStorage.getItem('app_seeded_v1')) return;
  try {
    ${tableNames.map((t) => `
    if (DB.table('${t}').count() === 0) {
      // demo seed for ${t}
      try { DB.table('${t}').insert({ name: 'عنصر تجريبي 1' }); } catch {}
      try { DB.table('${t}').insert({ name: 'عنصر تجريبي 2' }); } catch {}
    }`).join("\n")}
    localStorage.setItem('app_seeded_v1','1');
  } catch(e){ console.warn('seed', e); }
})();`;

  const authJs = `window.Auth = (function(){
  const SK = 'app_session_v1';
  async function register({email, password, name}){
    if (!Utils.validateEmail(email)) throw new Error('بريد غير صالح');
    if (!password || password.length < 6) throw new Error('كلمة المرور 6 أحرف على الأقل');
    const exists = DB.table('users').where(u => u.email===email).first();
    if (exists) throw new Error('البريد مسجل مسبقاً');
    const hash = await Utils.sha256(password);
    const user = DB.table('users').insert({ email, name: name||email.split('@')[0], password: hash, role:'user' });
    setSession(user); return user;
  }
  async function login({email, password}){
    const hash = await Utils.sha256(password);
    const user = DB.table('users').where(u => u.email===email && u.password===hash).first();
    if (!user) throw new Error('بيانات الدخول خاطئة');
    setSession(user); return user;
  }
  function logout(){ localStorage.removeItem(SK); location.hash = '#/login'; }
  function setSession(user){ localStorage.setItem(SK, JSON.stringify({ id: user.id, email: user.email, ts: Date.now() })); }
  function current(){
    try {
      const s = JSON.parse(localStorage.getItem(SK));
      if (!s) return null;
      return DB.table('users').find(s.id);
    } catch { return null; }
  }
  function require(){
    const u = current();
    if (!u) { location.hash = '#/login'; return null; }
    return u;
  }
  return { register, login, logout, current, require };
})();`;

  const aiJs = `window.AI = (function(){
  const URL = ${JSON.stringify(supabaseUrl + "/functions/v1/platform-ai-proxy")};
  const KEY = ${JSON.stringify(supabaseAnon)};
  async function ask(prompt, system){
    try {
      const r = await fetch(URL, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEY},
        body: JSON.stringify({ prompt, system })
      });
      if (!r.ok) throw new Error('AI error '+r.status);
      const d = await r.json();
      return d.text || d.message || '';
    } catch(e){ return 'تعذر الاتصال بالمساعد: '+e.message; }
  }
  return { ask };
})();`;

  const routerJs = `window.Router = (function(){
  const routes = {};
  function register(path, handler, opts={}){ routes[path] = { handler, opts }; }
  async function go(){
    const hash = location.hash.replace('#','') || '/';
    const path = hash.split('?')[0];
    const route = routes[path] || routes['/'];
    if (!route) { document.getElementById('app').innerHTML = '<div class="container"><div class="card">404</div></div>'; return; }
    if (route.opts.requireAuth && !Auth.current()) { location.hash = '#/login'; return; }
    try { await route.handler(); renderNav(); } catch(e){ console.error(e); Toast.error(e.message); }
  }
  function renderNav(){
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const path = (location.hash.replace('#','') || '/').split('?')[0];
    nav.querySelectorAll('a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#'+path);
    });
  }
  window.addEventListener('hashchange', go);
  return { register, go };
})();`;

  const navItems = [
    `<a href="#/">🏠 الرئيسية</a>`,
    ...tableNames.slice(0, 6).map((t) => `<a href="#/${t}">${t}</a>`),
    `<a href="#/ai-chat">🤖 المساعد</a>`,
    `<a href="#/profile">👤 الملف</a>`,
    `<a href="#/settings">⚙️ الإعدادات</a>`,
  ].join("");

  const appJs = `// ============ Bootstrap ============
function shell(content){
  return \`<div class="container">
    <header class="flex items-center justify-between mb-6 mt-4">
      <h1 style="margin:0;font-size:1.5rem;font-weight:900;background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-2)));-webkit-background-clip:text;color:transparent;">${platformName}</h1>
      <div class="flex gap-2 items-center">
        <span id="user-chip" class="badge"></span>
        <button class="btn btn-ghost" onclick="document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme')==='light'?'':'light')">🌓</button>
      </div>
    </header>
    <nav id="main-nav" class="nav">${navItems}</nav>
    <main>\${content}</main>
  </div>\`;
}
function renderUserChip(){
  const u = Auth.current();
  const chip = document.getElementById('user-chip');
  if (chip) chip.textContent = u ? '👤 '+(u.name||u.email) : '';
}

function pageHome(){
  const u = Auth.current();
  const stats = DB.stats();
  const cards = Object.entries(stats).map(([t,c]) => \`
    <div class="card"><div class="text-muted" style="font-size:.85rem">\${t}</div><div style="font-size:1.8rem;font-weight:900">\${c}</div></div>
  \`).join('');
  document.getElementById('app').innerHTML = shell(\`
    <div class="card mb-6">
      <h2 style="margin-top:0">مرحباً \${u?.name || 'بك'} 👋</h2>
      <p class="text-muted">${platformName} — منصة ذكية متكاملة بقاعدة بيانات احترافية ومساعد AI.</p>
      \${u ? '' : '<a href="#/login" class="btn btn-primary">تسجيل الدخول</a> <a href="#/signup" class="btn btn-ghost">إنشاء حساب</a>'}
    </div>
    <h3 class="mb-4">📊 الإحصائيات</h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem">\${cards}</div>
  \`);
  renderUserChip();
}

function pageLogin(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card" style="max-width:420px;margin:2rem auto">
      <h2 style="margin-top:0">تسجيل الدخول</h2>
      <form id="lf">
        <label class="label">البريد</label>
        <input class="input mb-4" name="email" type="email" required />
        <label class="label">كلمة المرور</label>
        <input class="input mb-4" name="password" type="password" required />
        <button class="btn btn-primary" style="width:100%" type="submit">دخول</button>
        <p class="text-muted mt-4" style="text-align:center;font-size:.9rem">لا تملك حساباً؟ <a href="#/signup">سجّل الآن</a></p>
      </form>
    </div>
  \`);
  document.getElementById('lf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { await Auth.login({email: fd.get('email'), password: fd.get('password')}); Toast.success('أهلاً بك!'); location.hash='#/'; }
    catch(err){ Toast.error(err.message); }
  });
}

function pageSignup(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card" style="max-width:420px;margin:2rem auto">
      <h2 style="margin-top:0">إنشاء حساب</h2>
      <form id="sf">
        <label class="label">الاسم</label>
        <input class="input mb-4" name="name" required />
        <label class="label">البريد</label>
        <input class="input mb-4" name="email" type="email" required />
        <label class="label">كلمة المرور (6+)</label>
        <input class="input mb-4" name="password" type="password" required minlength="6" />
        <button class="btn btn-primary" style="width:100%" type="submit">إنشاء</button>
        <p class="text-muted mt-4" style="text-align:center;font-size:.9rem">لديك حساب؟ <a href="#/login">دخول</a></p>
      </form>
    </div>
  \`);
  document.getElementById('sf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { await Auth.register({name:fd.get('name'),email:fd.get('email'),password:fd.get('password')}); Toast.success('تم إنشاء الحساب'); location.hash='#/'; }
    catch(err){ Toast.error(err.message); }
  });
}

function pageProfile(){
  const u = Auth.require(); if (!u) return;
  document.getElementById('app').innerHTML = shell(\`
    <div class="card" style="max-width:520px;margin:0 auto">
      <h2 style="margin-top:0">👤 الملف الشخصي</h2>
      <div class="mb-4"><strong>الاسم:</strong> \${Utils.escape(u.name)}</div>
      <div class="mb-4"><strong>البريد:</strong> \${Utils.escape(u.email)}</div>
      <div class="mb-4"><strong>تاريخ الانضمام:</strong> \${Utils.formatDate(u.created_at)}</div>
      <button class="btn btn-danger" onclick="Auth.logout()">تسجيل خروج</button>
    </div>
  \`);
}

function pageSettings(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card" style="max-width:520px;margin:0 auto">
      <h2 style="margin-top:0">⚙️ الإعدادات</h2>
      <button class="btn btn-ghost mb-4" onclick="navigator.clipboard.writeText(DB.export()); Toast.success('تم النسخ')">📤 تصدير البيانات</button>
      <button class="btn btn-danger" onclick="if(confirm('متأكد؟')){DB.reset();location.reload();}">🗑️ مسح كل البيانات</button>
    </div>
  \`);
}

function pageAIChat(){
  document.getElementById('app').innerHTML = shell(\`
    <div class="card" style="max-width:680px;margin:0 auto">
      <h2 style="margin-top:0">🤖 المساعد الذكي</h2>
      <div id="ai-log" style="min-height:240px;max-height:380px;overflow:auto;padding:1rem;background:hsl(var(--surface-2));border-radius:10px;margin-bottom:1rem"></div>
      <form id="aif" class="flex gap-2">
        <input class="input" name="q" placeholder="اسأل..." required />
        <button class="btn btn-primary">إرسال</button>
      </form>
    </div>
  \`);
  const log = document.getElementById('ai-log');
  document.getElementById('aif').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = e.target.q.value; e.target.q.value='';
    log.innerHTML += '<div style="margin-bottom:.6rem"><strong>أنت:</strong> '+Utils.escape(q)+'</div>';
    log.innerHTML += '<div id="ai-pending" class="text-muted">يفكر...</div>';
    log.scrollTop = log.scrollHeight;
    const ans = await AI.ask(q);
    document.getElementById('ai-pending').remove();
    log.innerHTML += '<div style="margin-bottom:1rem;padding:.6rem 1rem;background:hsl(var(--primary)/.1);border-radius:10px"><strong>المساعد:</strong> '+Utils.escape(ans)+'</div>';
    log.scrollTop = log.scrollHeight;
  });
}

// Generic table page (CRUD UI)
function makeTablePage(tableName, fields){
  return function(){
    Auth.require();
    const rows = DB.table(tableName).all();
    const cols = fields.filter(f => !['password','deleted_at'].includes(f.name)).slice(0, 5);
    const rowsHtml = rows.map(r => \`
      <tr>
        \${cols.map(c => '<td>'+Utils.escape(String(r[c.name] ?? ''))+'</td>').join('')}
        <td><button class="btn btn-danger" style="padding:.3rem .7rem;font-size:.8rem" onclick="if(confirm('حذف؟')){DB.table('\${tableName}').delete('\${r.id}');location.reload();}">حذف</button></td>
      </tr>
    \`).join('') || '<tr><td colspan="'+(cols.length+1)+'" class="text-muted text-center">لا توجد بيانات</td></tr>';

    const formFields = fields
      .filter(f => !['id','created_at','updated_at','deleted_at'].includes(f.name))
      .map(f => \`<label class="label">\${f.name}\${f.required?' *':''}</label><input class="input mb-3" name="\${f.name}" type="\${f.type==='number'?'number':f.name==='password'?'password':f.name==='email'?'email':'text'}" \${f.required?'required':''} />\`).join('');

    document.getElementById('app').innerHTML = shell(\`
      <div class="grid" style="grid-template-columns:1fr 320px;gap:1.5rem">
        <div class="card">
          <h2 style="margin-top:0">📋 \${tableName} (\${rows.length})</h2>
          <table class="table">
            <thead><tr>\${cols.map(c => '<th>'+c.name+'</th>').join('')}<th>إجراء</th></tr></thead>
            <tbody>\${rowsHtml}</tbody>
          </table>
        </div>
        <div class="card">
          <h3 style="margin-top:0">➕ إضافة</h3>
          <form id="addf">\${formFields}<button class="btn btn-primary" style="width:100%">حفظ</button></form>
        </div>
      </div>
    \`);
    document.getElementById('addf').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try { DB.table(tableName).insert(data); Toast.success('تمت الإضافة'); location.reload(); }
      catch(err){ Toast.error(err.message); }
    });
    renderUserChip();
  };
}

// ============ Routes ============
Router.register('/', pageHome);
Router.register('/login', pageLogin);
Router.register('/signup', pageSignup);
Router.register('/profile', pageProfile, { requireAuth: true });
Router.register('/settings', pageSettings, { requireAuth: true });
Router.register('/ai-chat', pageAIChat);
${tables.map((t) => `Router.register('/${t.name}', makeTablePage('${t.name}', ${JSON.stringify(t.fields || [])}), { requireAuth: true });`).join("\n")}

// Initial render
if (!location.hash) location.hash = '#/';
Router.go();`;

  const readme = `# ${platformName}

مشروع ويب احترافي متعدد الملفات تم توليده بواسطة باني المنصات الذكي.

## الهيكلية
- \`index.html\` نقطة الدخول
- \`assets/css/\` ملفات التصميم (theme, main, components)
- \`assets/js/\` المنطق (db, auth, ai, router, app, utils, toast, seed)
- \`assets/js/modules/\` ملف لكل جدول بمنطق CRUD مخصص
- \`pages/\` صفحات HTML

## الجداول
${tables.map((t) => `- **${t.name}**: ${(t.fields || []).map((f: any) => f.name).join(", ")}`).join("\n")}

## التشغيل
افتح \`index.html\` في المتصفح، أو ارفع الملفات على أي استضافة ثابتة.
`;

  return [
    { path: "index.html", content: indexHtml, language: "html" },
    { path: "assets/css/theme.css", content: themeCss, language: "css" },
    { path: "assets/css/main.css", content: mainCss, language: "css" },
    { path: "assets/css/components.css", content: componentsCss, language: "css" },
    { path: "assets/js/utils.js", content: utilsJs, language: "javascript" },
    { path: "assets/js/toast.js", content: toastJs, language: "javascript" },
    { path: "assets/js/db.js", content: dbJs, language: "javascript" },
    { path: "assets/js/seed.js", content: seedJs, language: "javascript" },
    { path: "assets/js/auth.js", content: authJs, language: "javascript" },
    { path: "assets/js/ai.js", content: aiJs, language: "javascript" },
    { path: "assets/js/router.js", content: routerJs, language: "javascript" },
    { path: "assets/js/app.js", content: appJs, language: "javascript" },
    { path: "README.md", content: readme, language: "markdown" },
  ];
}

// ============ Per-table module file (deterministic, no AI) ============
function moduleFileFor(table: any): FileObj {
  const name = table.name;
  const fields = table.fields || [];
  return {
    path: `assets/js/modules/${name}.js`,
    language: "javascript",
    content: `// ============ Module: ${name} ============
window.${name}Module = {
  schema: ${JSON.stringify(fields, null, 2)},
  list(filter){ const t = DB.table('${name}'); return filter ? t.where(filter).get() : t.all(); },
  get(id){ return DB.table('${name}').find(id); },
  create(data){ return DB.table('${name}').insert(data); },
  update(id, patch){ return DB.table('${name}').update(id, patch); },
  remove(id){ return DB.table('${name}').delete(id); },
  count(){ return DB.table('${name}').count(); },
  search(q){
    const ql = String(q||'').toLowerCase();
    return DB.table('${name}').where(r => JSON.stringify(r).toLowerCase().includes(ql)).get();
  },
};`,
  };
}

// ============ Per-table page fragment (deterministic) ============
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

    // Build core deterministic files (always succeed, no AI required → instant)
    const core = defaultCoreFiles(analysis || {}, schema || { tables: [] }, SUPABASE_URL, SUPABASE_ANON);
    const tables: any[] = (schema?.tables || []);
    const modules = tables.map(moduleFileFor);
    const pages = tables.map(pageFileFor);

    // Add common page fragments
    const commonPages: FileObj[] = [
      { path: "pages/home.html", language: "html", content: `<section class="card"><h2>الرئيسية</h2><p>أهلاً بك.</p></section>` },
      { path: "pages/login.html", language: "html", content: `<section class="card"><h2>تسجيل الدخول</h2></section>` },
      { path: "pages/signup.html", language: "html", content: `<section class="card"><h2>إنشاء حساب</h2></section>` },
      { path: "pages/profile.html", language: "html", content: `<section class="card"><h2>الملف الشخصي</h2></section>` },
      { path: "pages/settings.html", language: "html", content: `<section class="card"><h2>الإعدادات</h2></section>` },
      { path: "pages/ai-chat.html", language: "html", content: `<section class="card"><h2>المساعد الذكي</h2></section>` },
    ];

    const all = [...core, ...modules, ...pages, ...commonPages];

    // Deduplicate by path
    const seen = new Set<string>();
    const files = all.filter((f) => {
      if (seen.has(f.path)) return false;
      seen.add(f.path);
      return true;
    });

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
