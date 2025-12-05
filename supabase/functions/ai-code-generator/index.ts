import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_AI_KEY = Deno.env.get('PLATFORM_BUILDER_AI_KEY') || Deno.env.get('GOOGLE_AI_API_KEY');

const ULTRA_PRO_SYSTEM_PROMPT = `أنت مهندس برمجيات خبير ومصمم UI/UX عالمي المستوى. مهمتك إنشاء تطبيقات ويب احترافية تنافس أفضل المواقع العالمية.

## ⚠️ قواعد صارمة للصيغة (اتبعها بدقة):

كل ملف يبدأ بـ: ---FILE:path/filename.ext---
كل ملف ينتهي بـ: ---END_FILE---

مثال:
---FILE:index.html---
<!DOCTYPE html>
<html>...</html>
---END_FILE---

## 📁 الهيكل الإجباري (8+ ملفات):

/
├── index.html
├── styles/
│   ├── main.css         # المتغيرات والأساسيات
│   ├── components.css   # أنماط المكونات
│   └── animations.css   # الحركات
├── scripts/
│   ├── app.js          # المنطق الرئيسي
│   ├── utils.js        # دوال مساعدة
│   └── ui.js           # تفاعلات الواجهة
└── config.json

## 🎨 معايير التصميم الإجبارية:

### CSS Variables (في main.css):
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #ec4899;
  --accent: #06b6d4;
  --background: #0f172a;
  --surface: #1e293b;
  --surface-hover: #334155;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: #334155;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --gradient-primary: linear-gradient(135deg, var(--primary), var(--secondary));
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 30px rgba(99,102,241,0.4);
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition: all 0.3s ease;
}

[data-theme="light"] {
  --background: #f8fafc;
  --surface: #ffffff;
  --surface-hover: #f1f5f9;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

### تصميم متجاوب:
@media (max-width: 768px) { }
@media (max-width: 640px) { }

### Animations:
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

## 🧩 مكونات UI احترافية:

### Buttons:
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  transition: var(--transition);
  cursor: pointer;
  border: none;
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
.btn-outline {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text);
}
.btn-outline:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
}

### Cards:
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  transition: var(--transition);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

### Inputs:
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  transition: var(--transition);
}
.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
}

### Nav:
.nav {
  position: sticky;
  top: 0;
  background: rgba(15,23,42,0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

## ✨ ميزات تُضاف تلقائياً:

1. Dark/Light Mode Toggle
2. Loading Skeletons
3. Toast Notifications
4. Form Validation
5. Smooth Scroll
6. Hover Effects
7. Page Transitions
8. Error States
9. Empty States
10. Responsive Design

## 📝 JavaScript Patterns:

// Theme Toggle
const toggleTheme = () => {
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

// Toast
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = \`toast toast-\${type}\`;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Loading
const setLoading = (el, loading) => {
  el.classList.toggle('loading', loading);
  el.disabled = loading;
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  initApp();
});

## 🎯 معايير الجودة:
- كود نظيف ومنظم
- تعليقات واضحة
- أسماء متغيرات واضحة
- لا أخطاء في Console
- يعمل على جميع الشاشات
- سريع التحميل

ابدأ الكود مباشرة بدون شرح. أنشئ 8+ ملفات على الأقل.`;

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

    if (!GOOGLE_AI_KEY) {
      throw new Error('API key not configured')
    }

    let systemPrompt = ULTRA_PRO_SYSTEM_PROMPT
    
    if (supabaseConfig?.connected && supabaseConfig?.url && supabaseConfig?.anonKey) {
      systemPrompt += `

## 🔗 Supabase متصل:
const SUPABASE_URL = '${supabaseConfig.url}';
const SUPABASE_ANON_KEY = '${supabaseConfig.anonKey}';
أضف <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
واستخدم: const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);`
    }

    const messages: Array<{ role: string; parts: Array<{ text: string }> }> = []

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-4).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })
      })
    }

    let userMessage = message
    if (currentFiles && currentFiles.length > 0) {
      const filesContext = currentFiles.map((f: any) => `- ${f.file_name}`).join('\n')
      userMessage = `الملفات الحالية:\n${filesContext}\n\nالطلب: ${message}`
    }

    console.log('Generating code with Gemini...')
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...messages,
            { role: 'user', parts: [{ text: userMessage }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 30000,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة بعد دقيقة' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      throw new Error(`API Error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('Response length:', generatedContent.length)

    // Parse files
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

    // Method 3: Markdown code blocks
    if (files.length === 0) {
      const mdRegex = /```(\w+)\s*(?:\/\/|<!--)?\s*(\S+\.(?:html|css|js|json))\s*(?:-->)?\n([\s\S]*?)```/g
      while ((match = mdRegex.exec(generatedContent)) !== null) {
        const filePath = match[2].trim()
        const content = match[3].trim()
        if (filePath && content) {
          files.push(createFileObject(filePath, content))
        }
      }
    }

    // Method 4: Simple markdown
    if (files.length === 0) {
      const htmlMatch = generatedContent.match(/```html\n([\s\S]*?)```/)
      const cssMatch = generatedContent.match(/```css\n([\s\S]*?)```/)
      const jsMatch = generatedContent.match(/```(?:javascript|js)\n([\s\S]*?)```/)

      if (htmlMatch) files.push(createFileObject('index.html', htmlMatch[1].trim()))
      if (cssMatch) files.push(createFileObject('styles/main.css', cssMatch[1].trim()))
      if (jsMatch) files.push(createFileObject('scripts/app.js', jsMatch[1].trim()))
    }

    // Build explanation
    let explanation = `## ✅ تم إنشاء ${files.length} ملف\n\n`
    files.forEach(f => {
      const icon = f.file_type === 'html' ? '📄' : f.file_type === 'css' ? '🎨' : f.file_type === 'js' ? '⚡' : '📁'
      explanation += `${icon} ${f.file_name}\n`
    })

    console.log(`Created ${files.length} files`)

    return new Response(
      JSON.stringify({ explanation, files }),
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
    'md': 'markdown'
  }
  return {
    file_name: filePath,
    file_type: typeMap[extension] || extension,
    content
  }
}
