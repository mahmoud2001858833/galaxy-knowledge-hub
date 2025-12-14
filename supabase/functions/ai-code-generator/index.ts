import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Supabase credentials for generated projects
const PROJECT_SUPABASE_URL = 'https://esifpjjehdnpkhyilctv.supabase.co';
const PROJECT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaWZwamplaGRucGtoeWlsY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQ5NDYsImV4cCI6MjA2MDc1MDk0Nn0.xfaLcyAgvZx2yKsNAdf94cuNZQfXPGQcAYb1xiSYI7k';

// ===== ULTRA PROFESSIONAL SYSTEM PROMPT =====
const ULTRA_SYSTEM_PROMPT = `أنت مهندس برمجيات محترف بخبرة 15 سنة في تطوير الويب Full-Stack.
مهمتك إنشاء منصات ويب متكاملة تعمل بشكل حقيقي مع قاعدة بيانات Supabase.

## ⚠️ قواعد صارمة - اتبعها بدقة:

### 1. عدد الملفات المطلوب: 20-25 ملف كحد أدنى
لا تنشئ أقل من 20 ملف. المشروع يجب أن يكون متكاملاً.

### 2. هيكل الملفات الإلزامي:

\`\`\`
📁 الصفحات (pages/) - 6 ملفات على الأقل:
├── index.html (الصفحة الرئيسية)
├── pages/login.html (تسجيل الدخول)
├── pages/register.html (إنشاء حساب)
├── pages/dashboard.html (لوحة التحكم)
├── pages/profile.html (الملف الشخصي)
├── pages/admin.html (لوحة الإدارة)
└── pages/add-content.html (إضافة محتوى)

📁 الأنماط (styles/) - 5 ملفات:
├── styles/main.css (المتغيرات والأساسيات)
├── styles/components.css (الأزرار والبطاقات)
├── styles/auth.css (صفحات المصادقة)
├── styles/dashboard.css (لوحة التحكم)
└── styles/animations.css (الحركات)

📁 السكربتات (scripts/) - 10 ملفات على الأقل:
├── scripts/config.js (إعدادات المشروع)
├── scripts/supabase-client.js (اتصال Supabase)
├── scripts/auth.js (نظام المصادقة الكامل)
├── scripts/auth-guard.js (حماية الصفحات)
├── scripts/storage.js (رفع الملفات)
├── scripts/crud.js (عمليات CRUD)
├── scripts/ui.js (تفاعلات الواجهة)
├── scripts/toast.js (الإشعارات)
├── scripts/router.js (التنقل بين الصفحات)
└── scripts/utils.js (دوال مساعدة)
\`\`\`

### 3. صيغة الإخراج (اتبعها بالضبط):

---FILE:index.html---
الكود هنا...
---END_FILE---

---FILE:scripts/auth.js---
الكود هنا...
---END_FILE---

## 🔐 نظام Supabase المتكامل (إجباري):

### supabase-client.js:
\`\`\`javascript
// Supabase Configuration
const SUPABASE_URL = '${PROJECT_SUPABASE_URL}';
const SUPABASE_KEY = '${PROJECT_SUPABASE_KEY}';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Export for other scripts
window.supabaseClient = supabase;
console.log('✅ Supabase initialized');
\`\`\`

### auth.js (نظام مصادقة كامل يعمل فعلاً):
\`\`\`javascript
const AuthManager = {
  supabase: window.supabaseClient,
  
  // تسجيل حساب جديد
  async signUp(email, password, fullName) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      
      if (error) throw error;
      
      // إنشاء ملف شخصي
      if (data.user) {
        await this.supabase.from('builder_profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'user'
        });
      }
      
      Toast.success('تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني.');
      return { success: true, data };
    } catch (error) {
      Toast.error(error.message);
      return { success: false, error };
    }
  },
  
  // تسجيل الدخول
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      Toast.success('مرحباً بك!');
      window.location.href = 'dashboard.html';
      return { success: true, data };
    } catch (error) {
      Toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return { success: false, error };
    }
  },
  
  // تسجيل الخروج
  async signOut() {
    await this.supabase.auth.signOut();
    Toast.success('تم تسجيل الخروج');
    window.location.href = 'login.html';
  },
  
  // الحصول على المستخدم الحالي
  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  },
  
  // الاستماع لتغييرات الحالة
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

window.AuthManager = AuthManager;
\`\`\`

### auth-guard.js (حماية الصفحات):
\`\`\`javascript
const AuthGuard = {
  // حماية صفحة - يجب تسجيل الدخول
  async protectPage() {
    const user = await AuthManager.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  },
  
  // للصفحات العامة - إعادة توجيه المسجلين
  async redirectIfLoggedIn() {
    const user = await AuthManager.getCurrentUser();
    if (user) {
      window.location.href = 'dashboard.html';
    }
  }
};

window.AuthGuard = AuthGuard;
\`\`\`

### storage.js (رفع الملفات):
\`\`\`javascript
const StorageManager = {
  supabase: window.supabaseClient,
  bucket: 'project-images',
  
  async uploadFile(file, folder = 'uploads') {
    try {
      const fileName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = folder + '/' + fileName;
      
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, file, { cacheControl: '3600' });
      
      if (error) throw error;
      
      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);
      
      return { success: true, url: urlData.publicUrl, path: filePath };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  },
  
  async deleteFile(path) {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);
    return !error;
  }
};

window.StorageManager = StorageManager;
\`\`\`

### crud.js (عمليات قاعدة البيانات):
\`\`\`javascript
const DataManager = {
  supabase: window.supabaseClient,
  
  // إنشاء سجل
  async create(table, data) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },
  
  // قراءة سجلات
  async read(table, options = {}) {
    let query = this.supabase.from(table).select(options.select || '*');
    
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  // تحديث سجل
  async update(table, id, data) {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },
  
  // حذف سجل
  async delete(table, id) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

window.DataManager = DataManager;
\`\`\`

### toast.js (إشعارات):
\`\`\`javascript
const Toast = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'info') {
    this.init();
    
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = \`
      background: \${colors[type]};
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      font-weight: 500;
      max-width: 350px;
    \`;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },
  
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

window.Toast = Toast;

// Add animations
const style = document.createElement('style');
style.textContent = \`
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
\`;
document.head.appendChild(style);
\`\`\`

## 🎨 نظام التصميم (main.css):

\`\`\`css
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: rgba(99, 102, 241, 0.1);
  --secondary: #ec4899;
  --accent: #06b6d4;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  
  --bg-dark: #0f172a;
  --bg-darker: #020617;
  --surface: #1e293b;
  --surface-hover: #334155;
  
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  
  --border: #334155;
  --border-light: rgba(255,255,255,0.1);
  
  --gradient-primary: linear-gradient(135deg, var(--primary), var(--secondary));
  --gradient-dark: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
  
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.3);
  --shadow-lg: 0 20px 50px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 40px rgba(99,102,241,0.4);
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', 'Arial', sans-serif;
  background: var(--gradient-dark);
  color: var(--text-primary);
  min-height: 100vh;
  direction: rtl;
  line-height: 1.6;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* Buttons */
.btn {
  padding: 12px 28px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface-hover);
}

/* Cards */
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--border);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

/* Inputs */
.input {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg-darker);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition);
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.input::placeholder { color: var(--text-muted); }

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* Navigation */
.navbar {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 24px;
  list-style: none;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.nav-links a:hover {
  color: var(--primary);
}

/* Grid */
.grid { display: grid; gap: 24px; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Auth Pages */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: var(--surface);
  padding: 40px;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}

.auth-title {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.auth-title p {
  color: var(--text-muted);
}

/* Dashboard */
.dashboard-header {
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.stat-card {
  background: var(--surface);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  color: var(--text-muted);
  margin-top: 4px;
}
\`\`\`

## 📋 SQL للجداول (أضفه في نهاية ردك):

\`\`\`sql
-- Profiles table for project users
CREATE TABLE IF NOT EXISTS builder_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content table (news, posts, etc.)
CREATE TABLE IF NOT EXISTS builder_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT,
  author_id UUID,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE builder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read profiles" ON builder_profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON builder_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON builder_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read content" ON builder_content FOR SELECT USING (is_published = true);
CREATE POLICY "Authors manage content" ON builder_content FOR ALL USING (auth.uid() = author_id);
\`\`\`

## ⚡ متطلبات إضافية:

1. **كل صفحة HTML يجب أن تتضمن**:
   - تحميل Supabase SDK من CDN
   - تحميل جميع السكربتات بالترتيب الصحيح
   - تحميل ملفات CSS
   - تصميم متجاوب

2. **ترتيب تحميل السكربتات**:
   \`\`\`html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="../scripts/config.js"></script>
   <script src="../scripts/supabase-client.js"></script>
   <script src="../scripts/toast.js"></script>
   <script src="../scripts/auth.js"></script>
   <script src="../scripts/auth-guard.js"></script>
   <script src="../scripts/storage.js"></script>
   <script src="../scripts/crud.js"></script>
   <script src="../scripts/ui.js"></script>
   \`\`\`

3. **صفحة تسجيل الدخول يجب أن تحتوي**:
   - فورم مع email وpassword
   - رابط لإنشاء حساب
   - معالجة أخطاء
   - Loading state

4. **لوحة التحكم يجب أن تحتوي**:
   - إحصائيات
   - قائمة المحتوى
   - زر إضافة محتوى
   - تسجيل الخروج

## 🚨 تذكير نهائي:
- أنشئ 20-25 ملف
- كل ملف منفصل بصيغة ---FILE:path---
- الكود يجب أن يعمل فعلياً مع Supabase
- تصميم احترافي مع animations
- ابدأ الآن مباشرة بالكود`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentFiles, conversationHistory, supabaseConfig, projectId } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // بناء System Prompt
    let systemPrompt = ULTRA_SYSTEM_PROMPT;
    
    // إذا كان لدى المستخدم Supabase خاص، استخدم credentials الخاصة به
    if (supabaseConfig?.connected && supabaseConfig?.url && supabaseConfig?.anonKey) {
      systemPrompt = systemPrompt
        .replace(PROJECT_SUPABASE_URL, supabaseConfig.url)
        .replace(PROJECT_SUPABASE_KEY, supabaseConfig.anonKey);
      
      systemPrompt += `\n\n## ✅ Supabase متصل:\nURL: ${supabaseConfig.url}\nسيتم استخدام قاعدة بيانات المستخدم.`;
    }

    // بناء سجل المحادثة
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })
      })
    }

    // إضافة سياق الملفات الحالية
    let userMessage = message
    if (currentFiles && currentFiles.length > 0) {
      const filesContext = currentFiles.map((f: any) => `- ${f.file_name}`).join('\n')
      userMessage = `الملفات الحالية:\n${filesContext}\n\nالطلب: ${message}\n\nتذكر: أنشئ 20+ ملف وتأكد من عمل نظام المصادقة والاتصال بـ Supabase.`
    } else {
      userMessage = `${message}\n\nتذكر: أنشئ 20+ ملف متكامل مع نظام مصادقة يعمل فعلياً.`
    }

    messages.push({ role: 'user', content: userMessage })

    console.log('Generating professional code...')
    console.log('Message:', message.substring(0, 100))
    
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 64000, // زيادة للسماح بمزيد من الملفات
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى الانتظار دقيقة.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد للاستمرار.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        )
      }
      
      throw new Error(`API Error: ${response.status}`)
    }

    const responseText = await response.text()
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('استجابة فارغة')
    }

    let aiResponse
    try {
      aiResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Parse error:', responseText.substring(0, 500))
      throw new Error('فشل في قراءة الاستجابة')
    }

    const generatedContent = aiResponse.choices?.[0]?.message?.content || ''
    
    if (!generatedContent) {
      throw new Error('لم يتم إنشاء محتوى')
    }

    console.log('Response length:', generatedContent.length)

    // تحليل الملفات المولدة
    const files: Array<{ file_name: string; file_type: string; content: string }> = []
    
    // Method 1: ---FILE:name--- format
    const fileRegex = /---FILE:([^\n-]+)---\n([\s\S]*?)---END_FILE---/g
    let match
    while ((match = fileRegex.exec(generatedContent)) !== null) {
      const filePath = match[1].trim()
      const content = match[2].trim()
      if (filePath && content) {
        files.push(createFileObject(filePath, content))
      }
    }

    // Method 2: Alternative format
    if (files.length === 0) {
      const altRegex = /---FILE:\s*([^\n]+?)\s*---\n([\s\S]*?)(?=---FILE:|---END|$)/g
      while ((match = altRegex.exec(generatedContent)) !== null) {
        let filePath = match[1].trim()
        let content = match[2].trim()
        if (content.endsWith('---')) content = content.slice(0, -3).trim()
        if (filePath && content) {
          files.push(createFileObject(filePath, content))
        }
      }
    }

    // Method 3: Markdown code blocks
    if (files.length === 0) {
      const mdRegex = /```(\w+)\s*(?:\/\/|<!--|#)?\s*(\S+\.(?:html|css|js|json))\s*(?:-->)?\n([\s\S]*?)```/g
      while ((match = mdRegex.exec(generatedContent)) !== null) {
        const filePath = match[2].trim()
        const content = match[3].trim()
        if (filePath && content) {
          files.push(createFileObject(filePath, content))
        }
      }
    }

    // Method 4: Simple fallback
    if (files.length === 0) {
      const htmlMatch = generatedContent.match(/```html\n([\s\S]*?)```/)
      const cssMatch = generatedContent.match(/```css\n([\s\S]*?)```/)
      const jsMatch = generatedContent.match(/```(?:javascript|js)\n([\s\S]*?)```/)

      if (htmlMatch) files.push(createFileObject('index.html', htmlMatch[1].trim()))
      if (cssMatch) files.push(createFileObject('styles/main.css', cssMatch[1].trim()))
      if (jsMatch) files.push(createFileObject('scripts/app.js', jsMatch[1].trim()))
    }

    // استخراج SQL
    const sqlMatch = generatedContent.match(/```sql\n([\s\S]*?)```/)
    const sqlSchema = sqlMatch ? sqlMatch[1].trim() : null

    // بناء الشرح
    let explanation = `## ✅ تم إنشاء ${files.length} ملف\n\n`
    
    const htmlFiles = files.filter(f => f.file_type === 'html')
    const cssFiles = files.filter(f => f.file_type === 'css')
    const jsFiles = files.filter(f => f.file_type === 'javascript' || f.file_type === 'js')
    
    if (htmlFiles.length > 0) {
      explanation += `### 📄 صفحات HTML (${htmlFiles.length})\n`
      htmlFiles.forEach(f => { explanation += `- \`${f.file_name}\`\n` })
      explanation += '\n'
    }
    
    if (cssFiles.length > 0) {
      explanation += `### 🎨 أنماط CSS (${cssFiles.length})\n`
      cssFiles.forEach(f => { explanation += `- \`${f.file_name}\`\n` })
      explanation += '\n'
    }
    
    if (jsFiles.length > 0) {
      explanation += `### ⚡ سكربتات JavaScript (${jsFiles.length})\n`
      jsFiles.forEach(f => { explanation += `- \`${f.file_name}\`\n` })
      explanation += '\n'
    }

    if (sqlSchema) {
      explanation += `\n---\n\n### 🗄️ SQL للجداول\n\n\`\`\`sql\n${sqlSchema}\n\`\`\`\n\n📋 [افتح Supabase SQL Editor](https://supabase.com/dashboard/project/esifpjjehdnpkhyilctv/sql/new)`
    }

    explanation += `\n\n---\n\n### 🚀 الميزات المتضمنة:\n- ✅ نظام تسجيل دخول وإنشاء حساب\n- ✅ حماية الصفحات\n- ✅ اتصال Supabase\n- ✅ رفع الملفات\n- ✅ عمليات CRUD\n- ✅ إشعارات Toast\n- ✅ تصميم متجاوب`

    console.log(`Created ${files.length} files`)

    return new Response(
      JSON.stringify({ 
        explanation, 
        files, 
        sqlSchema,
        tablesCreated: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `خطأ: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function createFileObject(filePath: string, content: string) {
  const extension = filePath.split('.').pop()?.toLowerCase() || 'txt'
  const typeMap: Record<string, string> = {
    'html': 'html',
    'css': 'css',
    'js': 'javascript',
    'json': 'json',
    'py': 'python',
    'php': 'php'
  }
  return {
    file_name: filePath,
    file_type: typeMap[extension] || extension,
    content
  }
}
