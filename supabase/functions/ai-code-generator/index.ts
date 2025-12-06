import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// System Prompt متقدم - مُحسَّن للإنتاج الكثيف
const ULTRA_ADVANCED_SYSTEM_PROMPT = `أنت مهندس برمجيات محترف. مهمتك إنشاء منصات ويب متكاملة.

## ⚠️ قاعدة صارمة - اقرأ بعناية:
يجب إنشاء **12 ملف على الأقل** لكل مشروع. هذا إلزامي.

## 📁 الملفات المطلوبة (اثني عشر ملف كحد أدنى):

1. index.html - الصفحة الرئيسية
2. pages/login.html - تسجيل الدخول
3. pages/register.html - التسجيل
4. pages/dashboard.html - لوحة التحكم
5. pages/admin.html - لوحة الإدارة
6. styles/main.css - الأنماط الرئيسية والمتغيرات
7. styles/components.css - المكونات
8. styles/auth.css - أنماط المصادقة
9. scripts/app.js - التطبيق الرئيسي
10. scripts/auth.js - نظام المصادقة
11. scripts/supabase-client.js - اتصال Supabase
12. scripts/ui.js - تفاعلات الواجهة

## 🎯 صيغة الإخراج (اتبعها بدقة):

\`\`\`
---FILE:index.html---
<!DOCTYPE html>
<html>
...
</html>
---END_FILE---

---FILE:pages/login.html---
<!DOCTYPE html>
...
---END_FILE---
\`\`\`

## 🎨 نظام التصميم (ضمّنه في main.css):

\`\`\`css
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
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
  --text-muted: #94a3b8;
  --border: #334155;
  --gradient-primary: linear-gradient(135deg, var(--primary), var(--secondary));
  --shadow-glow: 0 0 40px rgba(99,102,241,0.4);
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition: all 0.3s ease;
}

[data-theme="light"] {
  --bg-dark: #f8fafc;
  --bg-darker: #ffffff;
  --surface: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border: #e2e8f0;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
}
\`\`\`

## 🔐 نظام المصادقة (في auth.js):

\`\`\`javascript
const AuthManager = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() {
    await supabase.auth.signOut();
    window.location.href = '/pages/login.html';
  },
  async checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) window.location.href = '/pages/login.html';
    return user;
  }
};
\`\`\`

## 📰 نظام رفع البيانات (في app.js للصفحات الإدارية):

\`\`\`javascript
async function createNews(title, content, imageUrl) {
  const user = await AuthManager.getUser();
  const { data, error } = await supabase
    .from('news')
    .insert([{ title, content, image_url: imageUrl, user_id: user.id }])
    .select().single();
  if (error) throw error;
  return data;
}

async function loadNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}
\`\`\`

## ✨ مكونات مطلوبة:
- Toast Notifications
- Loading States
- Dark/Light Mode Toggle
- Form Validation
- Responsive Navigation
- Smooth Animations

## 📋 SQL للجداول (أضفه في نهاية ردك):

\`\`\`sql
-- Users Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Table
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT,
  user_id UUID REFERENCES auth.users,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "View published news" ON news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage news" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
\`\`\`

## 🚨 تذكير نهائي:
- أنشئ 12 ملف على الأقل
- استخدم صيغة ---FILE:path--- و ---END_FILE---
- كل ملف منفصل بالكامل
- تصميم احترافي مع gradients وanimations
- ابدأ الآن مباشرة بالكود`;

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
