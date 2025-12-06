import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// System Prompt متقدم جداً لإنشاء منصات متكاملة
const ULTRA_ADVANCED_SYSTEM_PROMPT = `أنت مهندس برمجيات محترف ومصمم UI/UX عالمي المستوى متخصص في بناء منصات ويب متكاملة.

## ⚡ قواعد الإخراج الصارمة:

1. كل ملف يبدأ بـ: ---FILE:path/filename.ext---
2. كل ملف ينتهي بـ: ---END_FILE---
3. يجب إنشاء **15-25 ملف على الأقل** لكل مشروع

## 📁 الهيكل الإجباري للمشاريع (15+ ملف):

\`\`\`
/
├── index.html                    # الصفحة الرئيسية
├── pages/
│   ├── login.html               # صفحة تسجيل الدخول
│   ├── register.html            # صفحة التسجيل
│   ├── dashboard.html           # لوحة التحكم
│   ├── admin.html               # لوحة الإدارة
│   ├── profile.html             # صفحة الملف الشخصي
│   └── news.html                # صفحة الأخبار/المحتوى
├── styles/
│   ├── main.css                 # المتغيرات والأساسيات
│   ├── components.css           # المكونات (buttons, cards, forms)
│   ├── auth.css                 # أنماط صفحات المصادقة
│   ├── dashboard.css            # أنماط لوحة التحكم
│   ├── responsive.css           # التصميم المتجاوب
│   └── animations.css           # الحركات والانتقالات
├── scripts/
│   ├── app.js                   # التطبيق الرئيسي
│   ├── auth.js                  # نظام المصادقة
│   ├── supabase-client.js       # اتصال Supabase
│   ├── api.js                   # استدعاءات API
│   ├── ui.js                    # تفاعلات الواجهة
│   ├── utils.js                 # دوال مساعدة
│   └── router.js                # التنقل بين الصفحات
├── backend/
│   ├── server.py                # Python backend (اختياري)
│   └── api.php                  # PHP API (اختياري)
└── config.json                  # إعدادات المشروع
\`\`\`

## 🎨 نظام التصميم المتقدم (في main.css):

\`\`\`css
:root {
  /* Colors */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #818cf8;
  --secondary: #ec4899;
  --secondary-hover: #db2777;
  --accent: #06b6d4;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* Backgrounds */
  --bg-dark: #0f172a;
  --bg-darker: #020617;
  --surface: #1e293b;
  --surface-hover: #334155;
  --surface-light: #475569;
  
  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  /* Borders */
  --border: #334155;
  --border-light: #475569;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, var(--primary), var(--secondary));
  --gradient-dark: linear-gradient(180deg, var(--bg-dark), var(--bg-darker));
  --gradient-glow: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(236,72,153,0.3));
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 15px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 40px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 40px rgba(99,102,241,0.4);
  --shadow-glow-pink: 0 0 40px rgba(236,72,153,0.3);
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: all 0.15s ease;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="light"] {
  --bg-dark: #f8fafc;
  --bg-darker: #ffffff;
  --surface: #ffffff;
  --surface-hover: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --border: #e2e8f0;
}
\`\`\`

## 🔐 نظام المصادقة الكامل (في auth.js):

\`\`\`javascript
// Supabase Auth Integration
const AuthManager = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  },
  
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/pages/login.html';
  },
  
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  async checkAuth() {
    const user = await this.getUser();
    if (!user) {
      window.location.href = '/pages/login.html';
      return null;
    }
    return user;
  },
  
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};
\`\`\`

## 📰 نظام رفع الأخبار/البيانات (في api.js):

\`\`\`javascript
// News/Content API
const ContentAPI = {
  async getAll(table = 'news') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async getById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  async create(table, item) {
    const user = await AuthManager.getUser();
    const { data, error } = await supabase
      .from(table)
      .insert([{ ...item, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async update(table, id, updates) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  
  async uploadImage(file, bucket = 'uploads') {
    const fileName = \`\${Date.now()}-\${file.name}\`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    return publicUrl;
  }
};
\`\`\`

## ✨ مكونات UI مدمجة تلقائياً:

1. **Toast Notifications** - إشعارات منبثقة أنيقة
2. **Loading States** - حالات التحميل
3. **Modal/Dialog** - النوافذ المنبثقة
4. **Dark/Light Mode Toggle** - تبديل السمة
5. **Form Validation** - التحقق من المدخلات
6. **Skeleton Loaders** - هياكل التحميل
7. **Responsive Navigation** - تنقل متجاوب
8. **Smooth Animations** - حركات سلسة
9. **Error/Empty States** - حالات الخطأ والفراغ
10. **Pagination** - ترقيم الصفحات

## 🎯 متطلبات الجودة:

- كود نظيف ومنظم مع تعليقات
- تصميم متجاوب لجميع الأحجام
- أداء سريع وتحميل فوري
- لا أخطاء في Console
- Accessibility (a11y) كاملة
- SEO-friendly markup
- دعم RTL للعربية

## 📋 عند طلب منصة مع تسجيل دخول:

1. إنشاء صفحات: login.html, register.html, dashboard.html
2. نظام auth.js كامل مع Supabase
3. حماية الصفحات (Protected Routes)
4. جلسة المستخدم والتخزين المحلي
5. نموذج تسجيل/دخول مع validation
6. رسائل خطأ واضحة
7. Forgot Password (اختياري)

## 📋 عند طلب نظام رفع أخبار/بيانات:

1. صفحة admin.html لإدارة المحتوى
2. نموذج إضافة/تعديل مع رفع صور
3. جدول عرض البيانات مع بحث وفلترة
4. أزرار تعديل وحذف
5. تأكيد الحذف (Confirmation Modal)
6. إشعارات النجاح/الفشل

## 🔗 SQL للجداول المطلوبة (اعرضها للمستخدم):

\`\`\`sql
-- جدول المستخدمين
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الأخبار
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT,
  user_id UUID REFERENCES auth.users,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view published news" ON news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
\`\`\`

ابدأ الكود مباشرة. أنشئ 15+ ملف على الأقل مع نظام متكامل.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentFiles, conversationHistory, supabaseConfig } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    let systemPrompt = ULTRA_ADVANCED_SYSTEM_PROMPT
    
    // إضافة معلومات Supabase إذا كان متصلاً
    if (supabaseConfig?.connected && supabaseConfig?.url && supabaseConfig?.anonKey) {
      systemPrompt += `

## 🔗 Supabase متصل - استخدم هذه الإعدادات:

\`\`\`javascript
// في supabase-client.js
const SUPABASE_URL = '${supabaseConfig.url}';
const SUPABASE_ANON_KEY = '${supabaseConfig.anonKey}';

// تضمين Supabase SDK
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// إنشاء العميل
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
\`\`\`

أنشئ نظام مصادقة يعمل مع Supabase Auth ونظام رفع بيانات يحفظ في قاعدة البيانات.`
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
      userMessage = `الملفات الحالية في المشروع:\n${filesContext}\n\nالطلب: ${message}`
    }

    messages.push({ role: 'user', content: userMessage })

    console.log('Generating code with Lovable AI Gateway...')
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
        max_tokens: 32000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة بعد دقيقة.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد للاستمرار في استخدام الخدمة.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        )
      }
      
      throw new Error(`API Error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.choices?.[0]?.message?.content || ''

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

    // Method 2: Alternative with spaces
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

    // Method 3: Markdown code blocks with filenames
    if (files.length === 0) {
      const mdRegex = /```(\w+)\s*(?:\/\/|<!--|#)?\s*(\S+\.(?:html|css|js|json|py|php))\s*(?:-->)?\n([\s\S]*?)```/g
      while ((match = mdRegex.exec(generatedContent)) !== null) {
        const filePath = match[2].trim()
        const content = match[3].trim()
        if (filePath && content) {
          files.push(createFileObject(filePath, content))
        }
      }
    }

    // Method 4: Simple markdown fallback
    if (files.length === 0) {
      const htmlMatch = generatedContent.match(/```html\n([\s\S]*?)```/)
      const cssMatch = generatedContent.match(/```css\n([\s\S]*?)```/)
      const jsMatch = generatedContent.match(/```(?:javascript|js)\n([\s\S]*?)```/)

      if (htmlMatch) files.push(createFileObject('index.html', htmlMatch[1].trim()))
      if (cssMatch) files.push(createFileObject('styles/main.css', cssMatch[1].trim()))
      if (jsMatch) files.push(createFileObject('scripts/app.js', jsMatch[1].trim()))
    }

    // استخراج SQL للجداول إن وجد
    const sqlMatch = generatedContent.match(/```sql\n([\s\S]*?)```/)
    const sqlSchema = sqlMatch ? sqlMatch[1].trim() : null

    // بناء الشرح
    let explanation = `## ✅ تم إنشاء ${files.length} ملف\n\n`
    
    // تصنيف الملفات
    const htmlFiles = files.filter(f => f.file_type === 'html')
    const cssFiles = files.filter(f => f.file_type === 'css')
    const jsFiles = files.filter(f => f.file_type === 'javascript' || f.file_type === 'js')
    const otherFiles = files.filter(f => !['html', 'css', 'javascript', 'js'].includes(f.file_type))
    
    if (htmlFiles.length > 0) {
      explanation += `### 📄 صفحات HTML (${htmlFiles.length})\n`
      htmlFiles.forEach(f => { explanation += `- ${f.file_name}\n` })
      explanation += '\n'
    }
    
    if (cssFiles.length > 0) {
      explanation += `### 🎨 أنماط CSS (${cssFiles.length})\n`
      cssFiles.forEach(f => { explanation += `- ${f.file_name}\n` })
      explanation += '\n'
    }
    
    if (jsFiles.length > 0) {
      explanation += `### ⚡ سكربتات JavaScript (${jsFiles.length})\n`
      jsFiles.forEach(f => { explanation += `- ${f.file_name}\n` })
      explanation += '\n'
    }
    
    if (otherFiles.length > 0) {
      explanation += `### 📁 ملفات أخرى (${otherFiles.length})\n`
      otherFiles.forEach(f => { explanation += `- ${f.file_name}\n` })
      explanation += '\n'
    }

    if (sqlSchema) {
      explanation += `\n---\n\n### 🗄️ SQL للجداول المطلوبة\n\n\`\`\`sql\n${sqlSchema}\n\`\`\`\n\n📋 **انسخ هذا الكود وألصقه في** [Supabase SQL Editor](https://supabase.com/dashboard/project/esifpjjehdnpkhyilctv/sql/new)`
    }

    console.log(`Created ${files.length} files`)

    return new Response(
      JSON.stringify({ explanation, files, sqlSchema }),
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
    'htm': 'html',
    'css': 'css',
    'js': 'javascript',
    'javascript': 'javascript',
    'json': 'json',
    'py': 'python',
    'php': 'php',
    'md': 'markdown',
    'cpp': 'cpp',
    'c': 'c'
  }
  return {
    file_name: filePath,
    file_type: typeMap[extension] || extension,
    content
  }
}
