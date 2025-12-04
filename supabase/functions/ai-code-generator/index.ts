import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// استخدام مفتاح Google AI المخصص لمنشئ المنصات
const GOOGLE_AI_KEY = Deno.env.get('PLATFORM_BUILDER_AI_KEY');

const ULTRA_ADVANCED_SYSTEM_PROMPT = `أنت مطور ويب خبير جداً ومتقدم للغاية. مهمتك إنشاء تطبيقات ويب متكاملة تعمل فعلياً 100%.

## 🎯 القاعدة الذهبية - قبل أي كود:
اشرح بالتفصيل في أول ردك:
1. 📋 **الخطة الكاملة**: ماذا ستبني بالضبط
2. 🗄️ **قاعدة البيانات**: الجداول التي ستُنشأ وأعمدتها
3. 🔐 **الأمان**: سياسات RLS المطلوبة
4. 📁 **الملفات**: قائمة الملفات (15+ ملف)
5. ✨ **الميزات الإضافية**: ما ستضيفه تلقائياً

## 🗄️ عند طلب مشروع يحتاج قاعدة بيانات:

### أولاً: أعطِ المستخدم Schema SQL الكامل:
\`\`\`sql
-- إنشاء الجداول
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- تفعيل RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- إنشاء السياسات
CREATE POLICY "policy_name" ON public.table_name ...;
\`\`\`

### ثانياً: أنشئ الكود الذي يتصل بهذه الجداول فعلياً:
- استخدم مكتبة Supabase JS
- الكود يجب أن يعمل 100% مع الجداول المُعرَّفة
- كل العمليات (إضافة، تعديل، حذف، عرض) يجب أن تعمل

## 🤖 عند طلب ذكاء اصطناعي:

### أنشئ اتصال حقيقي مع AI:
\`\`\`javascript
// استخدم Google Gemini API مباشرة أو Edge Function
async function askAI(question) {
  const response = await fetch('EDGE_FUNCTION_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question })
  });
  return response.json();
}
\`\`\`

أو أنشئ Edge Function كاملة للذكاء الاصطناعي.

## 📁 هيكل الملفات الإلزامي (15+ ملف):

### الملفات الأساسية:
- index.html
- styles/main.css
- styles/components.css
- styles/animations.css
- styles/responsive.css
- styles/dark-mode.css
- scripts/app.js
- scripts/utils.js
- scripts/ui.js
- scripts/api.js
- scripts/storage.js
- config.json

### عند وجود Supabase:
- scripts/supabase-client.js
- scripts/auth.js
- scripts/database.js
- pages/login.html
- pages/register.html
- pages/dashboard.html
- pages/admin.html

### عند طلب ذكاء اصطناعي:
- scripts/ai-chat.js
- pages/ai-assistant.html
- components/chat-widget.html

## 🎨 معايير التصميم الإلزامية:

1. **الألوان والتدرجات:**
   - استخدم CSS Variables
   - تدرجات جذابة
   - ألوان متناسقة

2. **الأنيميشن:**
   - transition لكل hover
   - keyframes للعناصر الرئيسية
   - scroll animations

3. **التجاوب:**
   - Mobile-first
   - Breakpoints: 480px, 768px, 1024px, 1280px

4. **الوضع الداكن:**
   - متغيرات CSS للوضع الداكن
   - زر تبديل
   - حفظ التفضيل

## ✨ ميزات تُضاف تلقائياً:

1. Loading skeletons/spinners
2. Toast notifications
3. Form validation
4. Error handling
5. Empty states
6. Search & filter
7. Pagination
8. Keyboard shortcuts
9. localStorage for preferences
10. Accessibility (ARIA)

## 📤 صيغة الرد المطلوبة:

### أولاً - الشرح والخطة:
ابدأ بشرح الخطة الكاملة...

### ثانياً - Schema قاعدة البيانات (إن وُجد):
---DATABASE_SCHEMA---
CREATE TABLE...
---END_DATABASE_SCHEMA---

### ثالثاً - الملفات:
---FILE:index.html---
<!DOCTYPE html>
...
---END_FILE---

---FILE:styles/main.css---
:root {
  --primary: #6366f1;
  ...
}
---END_FILE---

[استمر لجميع الملفات]

### رابعاً - الملخص:
---FEATURES---
- الميزة 1: شرح
- الميزة 2: شرح
---END_FEATURES---

---USAGE---
كيفية استخدام المشروع...
---END_USAGE---

## 🔗 بيانات Supabase:
SUPABASE_CONFIG_PLACEHOLDER

## ⚠️ قواعد صارمة:

1. ✅ كل الأكواد يجب أن تعمل فعلياً - لا أكواد وهمية
2. ✅ كل الروابط يجب أن تعمل - لا صفحات 404
3. ✅ كل الأزرار يجب أن تفعل شيئاً حقيقياً
4. ✅ عند طلب حفظ بيانات، يجب أن تُحفظ فعلياً في Supabase
5. ✅ عند طلب ذكاء اصطناعي، يجب أن يعمل فعلياً
6. ❌ لا تستخدم console.log كبديل عن الوظائف الحقيقية
7. ❌ لا تترك أي placeholder أو TODO
8. ❌ لا تنشئ أقل من 15 ملف

## 📋 أمثلة على المشاريع:

### مثال 1: مجلة مدرسية
الجداول: news, comments, likes, categories
الملفات: 20+ ملف
الميزات: إضافة أخبار، تعليقات، إعجابات، بحث، فلترة، لوحة إدارة

### مثال 2: متجر إلكتروني
الجداول: products, categories, orders, users
الملفات: 25+ ملف
الميزات: عرض منتجات، سلة شراء، checkout، لوحة إدارة

### مثال 3: مساعد ذكي
الجداول: conversations, messages
الملفات: 18+ ملف
الميزات: محادثة AI حقيقية، حفظ المحادثات، بحث

الآن، أنشئ المشروع المطلوب بجودة احترافية عالية!`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentFiles, conversationHistory, supabaseConfig, projectType } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!GOOGLE_AI_KEY) {
      throw new Error('PLATFORM_BUILDER_AI_KEY is not configured')
    }

    // Build enhanced system prompt with Supabase config
    let systemPrompt = ULTRA_ADVANCED_SYSTEM_PROMPT
    
    if (supabaseConfig?.connected && supabaseConfig?.url && supabaseConfig?.anonKey) {
      const supabaseInfo = `
## 🔗 Supabase متصل ومُفعَّل!

**بيانات الاتصال:**
\`\`\`javascript
const SUPABASE_URL = '${supabaseConfig.url}';
const SUPABASE_ANON_KEY = '${supabaseConfig.anonKey}';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
\`\`\`

**تعليمات مهمة:**
1. أنشئ Schema SQL للجداول المطلوبة وأعطها للمستخدم
2. أنشئ كود JavaScript يتصل فعلياً بهذه الجداول
3. كل عمليات CRUD يجب أن تعمل مع Supabase
4. استخدم supabase.auth للمصادقة
5. استخدم supabase.from('table').select/insert/update/delete

**مكتبة Supabase:**
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

**Service Key للعمليات المتقدمة:**
${supabaseConfig.serviceKey ? `متاح للاستخدام في Edge Functions` : 'غير متاح - سيحتاج المستخدم لتنفيذ SQL يدوياً'}
`
      systemPrompt = systemPrompt.replace('SUPABASE_CONFIG_PLACEHOLDER', supabaseInfo)
    } else {
      systemPrompt = systemPrompt.replace('SUPABASE_CONFIG_PLACEHOLDER', `
## ⚠️ Supabase غير متصل
عند طلب ميزات قاعدة بيانات:
1. أنشئ Schema SQL كامل يمكن للمستخدم نسخه
2. أنشئ كود يعمل مع Supabase (سيحتاج المستخدم للربط لاحقاً)
3. استخدم placeholders واضحة: YOUR_SUPABASE_URL, YOUR_ANON_KEY
`)
    }

    // Build conversation messages
    const conversationMessages: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((msg: any) => {
        conversationMessages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })
      })
    }

    // Add context about current files if they exist
    let userMessage = message
    if (currentFiles && currentFiles.length > 0) {
      const filesContext = currentFiles.map((f: any) => 
        `📄 ${f.file_name} (${f.file_type})`
      ).join('\n')
      userMessage = `الملفات الحالية:\n${filesContext}\n\n---\n\nطلب المستخدم: ${message}`
    }

    console.log('Calling Google Gemini AI with advanced prompt...')
    
    // Call Google Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }]
            },
            ...conversationMessages,
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 32000,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Gemini AI error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة بعد دقيقة' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      throw new Error(`Google Gemini AI error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('AI Response received, parsing...')

    // Parse database schema
    let databaseSchema = ''
    const schemaMatch = generatedContent.match(/---DATABASE_SCHEMA---\n([\s\S]*?)---END_DATABASE_SCHEMA---/)
    if (schemaMatch) {
      databaseSchema = schemaMatch[1].trim()
    }

    // Parse files
    const files: Array<{ file_name: string; file_type: string; content: string }> = []
    const fileRegex = /---FILE:(.+?)---\n([\s\S]*?)---END_FILE---/g
    let match

    while ((match = fileRegex.exec(generatedContent)) !== null) {
      const filePath = match[1].trim()
      const content = match[2].trim()
      const extension = filePath.split('.').pop()?.toLowerCase() || 'txt'
      
      const typeMap: Record<string, string> = {
        'html': 'html',
        'css': 'css',
        'js': 'javascript',
        'json': 'json',
        'sql': 'sql',
        'py': 'python',
        'php': 'php',
        'cpp': 'cpp',
        'ts': 'typescript',
      }

      files.push({
        file_name: filePath,
        file_type: typeMap[extension] || 'text',
        content: content
      })
    }

    // Extract features and usage
    let explanation = ''
    const featuresMatch = generatedContent.match(/---FEATURES---\n([\s\S]*?)---END_FEATURES---/)
    const usageMatch = generatedContent.match(/---USAGE---\n([\s\S]*?)---END_USAGE---/)

    // Get the explanation before the first ---FILE: or ---DATABASE_SCHEMA---
    const firstMarker = generatedContent.indexOf('---FILE:')
    const schemaMarker = generatedContent.indexOf('---DATABASE_SCHEMA---')
    const explanationEnd = Math.min(
      firstMarker > 0 ? firstMarker : Infinity,
      schemaMarker > 0 ? schemaMarker : Infinity
    )
    
    if (explanationEnd < Infinity) {
      explanation = generatedContent.substring(0, explanationEnd).trim()
    }

    // Build final explanation
    let finalExplanation = ''
    
    if (explanation) {
      finalExplanation = explanation + '\n\n'
    }

    if (databaseSchema) {
      finalExplanation += `## 🗄️ قاعدة البيانات\n\nيجب تنفيذ هذا الكود في Supabase SQL Editor:\n\n\`\`\`sql\n${databaseSchema}\n\`\`\`\n\n`
    }

    finalExplanation += `## ✅ الملفات المُنشأة (${files.length} ملف)\n\n`
    
    // Group files by folder
    const folders: Record<string, string[]> = {}
    files.forEach(f => {
      const parts = f.file_name.split('/')
      const folder = parts.length > 1 ? parts[0] : 'root'
      if (!folders[folder]) folders[folder] = []
      folders[folder].push(f.file_name)
    })

    Object.entries(folders).forEach(([folder, fileList]) => {
      finalExplanation += `📁 **${folder === 'root' ? 'الجذر' : folder}**\n`
      fileList.forEach(f => {
        finalExplanation += `   - ${f}\n`
      })
      finalExplanation += '\n'
    })

    if (featuresMatch) {
      finalExplanation += `## ✨ الميزات\n\n${featuresMatch[1].trim()}\n\n`
    }

    if (usageMatch) {
      finalExplanation += `## 📖 طريقة الاستخدام\n\n${usageMatch[1].trim()}`
    }

    console.log(`Parsed ${files.length} files, schema: ${databaseSchema ? 'yes' : 'no'}`)

    return new Response(
      JSON.stringify({ 
        explanation: finalExplanation,
        files,
        databaseSchema,
        raw_response: generatedContent.substring(0, 1000) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in ai-code-generator:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `خطأ في توليد الكود: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
