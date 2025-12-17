import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Builder Universal API endpoint
const BUILDER_API_URL = 'https://esifpjjehdnpkhyilctv.supabase.co/functions/v1/builder-universal-api';

// ===== ULTRA PROFESSIONAL SYSTEM PROMPT =====
const getSystemPrompt = (projectId: string) => `أنت مهندس برمجيات محترف بخبرة 15 سنة في تطوير الويب Full-Stack.
مهمتك إنشاء منصات ويب متكاملة تعمل بشكل حقيقي مع نظام API موحد.

## ⚠️ قواعد صارمة - اتبعها بدقة:

### 1. عدد الملفات المطلوب: 15-25 ملف كحد أدنى

### 2. هيكل الملفات الإلزامي:

\`\`\`
📁 الصفحات (pages/) - 6 ملفات على الأقل:
├── index.html (الصفحة الرئيسية)
├── pages/login.html (تسجيل الدخول)
├── pages/register.html (إنشاء حساب)
├── pages/dashboard.html (لوحة التحكم)
├── pages/profile.html (الملف الشخصي)
├── pages/add-content.html (إضافة محتوى)
└── pages/content-detail.html (عرض المحتوى)

📁 الأنماط (styles/) - 5 ملفات:
├── styles/main.css (المتغيرات والأساسيات)
├── styles/components.css (الأزرار والبطاقات)
├── styles/auth.css (صفحات المصادقة)
├── styles/dashboard.css (لوحة التحكم)
└── styles/animations.css (الحركات)

📁 السكربتات (scripts/) - 8 ملفات على الأقل:
├── scripts/config.js (إعدادات المشروع)
├── scripts/api-client.js (Builder API Client)
├── scripts/auth.js (نظام المصادقة)
├── scripts/auth-guard.js (حماية الصفحات)
├── scripts/content.js (إدارة المحتوى)
├── scripts/ui.js (تفاعلات الواجهة)
├── scripts/toast.js (الإشعارات)
└── scripts/utils.js (دوال مساعدة)
\`\`\`

### 3. صيغة الإخراج (اتبعها بالضبط):

---FILE:index.html---
الكود هنا...
---END_FILE---

---FILE:scripts/api-client.js---
الكود هنا...
---END_FILE---

## 🔐 نظام Builder API الموحد (إجباري):

### config.js:
\`\`\`javascript
// Project Configuration
const CONFIG = {
  PROJECT_ID: '${projectId}',
  API_URL: '${BUILDER_API_URL}'
};
window.CONFIG = CONFIG;
\`\`\`

### api-client.js (API Client الموحد - يعمل فوراً):
\`\`\`javascript
// Builder API Client - يتصل بقاعدة البيانات تلقائياً
const BuilderAPI = {
  token: localStorage.getItem('builder_token'),
  user: JSON.parse(localStorage.getItem('builder_user') || 'null'),

  async request(action, data = {}) {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: CONFIG.PROJECT_ID,
        action,
        data: { ...data, token: this.token }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result.data;
  },

  // ========== المصادقة ==========
  async register(email, password, fullName) {
    const result = await this.request('register', { email, password, fullName });
    this.token = result.token;
    this.user = result.user;
    localStorage.setItem('builder_token', result.token);
    localStorage.setItem('builder_user', JSON.stringify(result.user));
    return result;
  },

  async login(email, password) {
    const result = await this.request('login', { email, password });
    this.token = result.token;
    this.user = result.user;
    localStorage.setItem('builder_token', result.token);
    localStorage.setItem('builder_user', JSON.stringify(result.user));
    return result;
  },

  async logout() {
    await this.request('logout');
    this.token = null;
    this.user = null;
    localStorage.removeItem('builder_token');
    localStorage.removeItem('builder_user');
  },

  isAuthenticated() {
    return !!this.token;
  },

  getUser() {
    return this.user;
  },

  async verifySession() {
    if (!this.token) return false;
    try {
      const result = await this.request('verify_token', { token: this.token });
      this.user = result.user;
      localStorage.setItem('builder_user', JSON.stringify(result.user));
      return true;
    } catch (e) {
      this.logout();
      return false;
    }
  },

  // ========== المحتوى ==========
  async getContent(options = {}) {
    return this.request('get_content', options);
  },

  async addContent(data) {
    return this.request('add_content', data);
  },

  async updateContent(id, updates) {
    return this.request('update_content', { id, ...updates });
  },

  async deleteContent(id) {
    return this.request('delete_content', { id });
  },

  // ========== التعليقات ==========
  async getComments(contentId) {
    return this.request('get_comments', { contentId });
  },

  async addComment(contentId, commentText) {
    return this.request('add_comment', { contentId, commentText });
  },

  // ========== الإعجابات ==========
  async toggleLike(contentId) {
    return this.request('toggle_like', { contentId });
  },

  // ========== الملفات ==========
  async uploadFile(file, folder = 'uploads') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const result = await this.request('upload_file', {
            fileName: file.name,
            fileBase64: base64,
            fileType: file.type,
            folder
          });
          resolve(result);
        } catch (e) { reject(e); }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },

  async getFiles(folder, limit) {
    return this.request('get_files', { folder, limit });
  },

  // ========== الإعدادات والإحصائيات ==========
  async getSettings() {
    return this.request('get_settings');
  },

  async getStats() {
    return this.request('get_stats');
  }
};

window.BuilderAPI = BuilderAPI;
console.log('✅ Builder API initialized - Database Ready!');
\`\`\`

### auth.js (نظام مصادقة مبسط):
\`\`\`javascript
const Auth = {
  async register(email, password, fullName) {
    try {
      await BuilderAPI.register(email, password, fullName);
      Toast.success('تم إنشاء الحساب بنجاح!');
      window.location.href = 'dashboard.html';
      return true;
    } catch (error) {
      Toast.error(error.message || 'فشل إنشاء الحساب');
      return false;
    }
  },

  async login(email, password) {
    try {
      await BuilderAPI.login(email, password);
      Toast.success('مرحباً بك!');
      window.location.href = 'dashboard.html';
      return true;
    } catch (error) {
      Toast.error(error.message || 'البريد أو كلمة المرور غير صحيحة');
      return false;
    }
  },

  async logout() {
    await BuilderAPI.logout();
    Toast.success('تم تسجيل الخروج');
    window.location.href = 'login.html';
  },

  isLoggedIn() {
    return BuilderAPI.isAuthenticated();
  },

  getUser() {
    return BuilderAPI.getUser();
  }
};

window.Auth = Auth;
\`\`\`

### auth-guard.js (حماية الصفحات):
\`\`\`javascript
const AuthGuard = {
  // حماية صفحة - يجب تسجيل الدخول
  async protectPage() {
    const isValid = await BuilderAPI.verifySession();
    if (!isValid) {
      window.location.href = 'login.html';
      return null;
    }
    return BuilderAPI.getUser();
  },

  // للصفحات العامة - إعادة توجيه المسجلين
  async redirectIfLoggedIn(redirectTo = 'dashboard.html') {
    if (BuilderAPI.isAuthenticated()) {
      const isValid = await BuilderAPI.verifySession();
      if (isValid) {
        window.location.href = redirectTo;
      }
    }
  }
};

window.AuthGuard = AuthGuard;
\`\`\`

### content.js (إدارة المحتوى):
\`\`\`javascript
const ContentManager = {
  async loadContent(options = {}) {
    try {
      return await BuilderAPI.getContent(options);
    } catch (error) {
      Toast.error('فشل تحميل المحتوى');
      return [];
    }
  },

  async createContent(data) {
    try {
      const result = await BuilderAPI.addContent(data);
      Toast.success('تم إضافة المحتوى بنجاح!');
      return result;
    } catch (error) {
      Toast.error('فشل إضافة المحتوى');
      return null;
    }
  },

  async deleteContent(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return false;
    try {
      await BuilderAPI.deleteContent(id);
      Toast.success('تم الحذف');
      return true;
    } catch (error) {
      Toast.error('فشل الحذف');
      return false;
    }
  },

  async toggleLike(contentId) {
    try {
      return await BuilderAPI.toggleLike(contentId);
    } catch (error) {
      Toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }
  }
};

window.ContentManager = ContentManager;
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
    const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    
    const toast = document.createElement('div');
    toast.style.cssText = \`background:\${colors[type]};color:white;padding:14px 24px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;font-weight:500;max-width:350px;\`;
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

## 🎨 نظام التصميم الاحترافي (main.css):

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

.grid { display: grid; gap: 24px; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}
\`\`\`

## ⚡ ترتيب تحميل السكربتات في كل صفحة HTML:

\`\`\`html
<script src="../scripts/config.js"></script>
<script src="../scripts/api-client.js"></script>
<script src="../scripts/toast.js"></script>
<script src="../scripts/auth.js"></script>
<script src="../scripts/auth-guard.js"></script>
<script src="../scripts/content.js"></script>
<script src="../scripts/ui.js"></script>
\`\`\`

## 🚨 قواعد مهمة:
- لا تستخدم Supabase SDK مباشرة
- استخدم BuilderAPI فقط
- كل العمليات تتم عبر API موحد
- قاعدة البيانات جاهزة تلقائياً
- لا حاجة لأي إعداد من المستخدم

## 📋 الميزات المطلوبة في كل مشروع:
1. صفحة رئيسية جذابة
2. نظام تسجيل دخول/إنشاء حساب
3. لوحة تحكم مع إحصائيات
4. إضافة/عرض/حذف محتوى
5. نظام إعجابات
6. رفع صور
7. تصميم متجاوب احترافي

ابدأ الآن مباشرة بإنشاء الملفات!`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentFiles, conversationHistory, projectId } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // بناء System Prompt مع project ID
    const systemPrompt = getSystemPrompt(projectId);

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
      userMessage = `الملفات الحالية:\n${filesContext}\n\nالطلب: ${message}\n\nتذكر: استخدم BuilderAPI فقط (لا Supabase SDK). قاعدة البيانات جاهزة تلقائياً.`
    } else {
      userMessage = `${message}\n\nتذكر: أنشئ 15+ ملف متكامل. استخدم BuilderAPI فقط. قاعدة البيانات جاهزة تلقائياً.`
    }

    messages.push({ role: 'user', content: userMessage })

    console.log('Generating code with Builder API...')
    console.log('Project ID:', projectId)
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
        max_tokens: 64000,
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

    // بناء الشرح
    let explanation = `## ✅ تم إنشاء ${files.length} ملف\n\n`
    explanation += `### 🗄️ قاعدة البيانات: جاهزة تلقائياً ✓\n\n`
    
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

    explanation += `\n---\n\n### 🚀 الميزات الجاهزة:\n`
    explanation += `- ✅ قاعدة بيانات متصلة تلقائياً\n`
    explanation += `- ✅ نظام تسجيل دخول وإنشاء حساب\n`
    explanation += `- ✅ حماية الصفحات\n`
    explanation += `- ✅ إدارة المحتوى (إضافة/تعديل/حذف)\n`
    explanation += `- ✅ نظام إعجابات وتعليقات\n`
    explanation += `- ✅ رفع الملفات والصور\n`
    explanation += `- ✅ تصميم متجاوب احترافي\n`
    explanation += `\n**لا حاجة لأي إعداد - المنصة تعمل فوراً!** 🎉`

    console.log(`Created ${files.length} files with Builder API`)

    return new Response(
      JSON.stringify({ 
        explanation, 
        files,
        databaseReady: true
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
