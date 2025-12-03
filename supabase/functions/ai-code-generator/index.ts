import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `أنت مطور ويب خبير ومحترف للغاية ومتقدم جداً. مهمتك إنشاء تطبيقات ويب متكاملة وقوية واحترافية.

## 🎯 قبل كتابة الكود:
اشرح للمستخدم بالتفصيل:
- 🎯 ماذا ستفعل بالضبط
- 📁 الملفات التي ستنشئها
- ✨ الميزات التي ستضيفها
- 🎨 أسلوب التصميم

## 🌟 قواعد إلزامية:

### 1. تقسيم الكود (10+ ملفات كحد أدنى):
- index.html
- styles/main.css
- styles/components.css
- styles/animations.css
- styles/responsive.css
- scripts/app.js
- scripts/utils.js
- scripts/ui.js
- scripts/api.js
- config.json

### 2. عند طلب تسجيل دخول أو قاعدة بيانات:
أضف:
- scripts/supabase-client.js
- scripts/auth.js
- pages/login.html
- pages/register.html
- pages/dashboard.html

### 3. الكود يجب أن يكون احترافي:
✅ أنيميشن متقدمة
✅ الوضع الداكن والفاتح
✅ تصميم متجاوب 100%
✅ Loading Skeletons
✅ Toast Notifications
✅ Form Validation
✅ Hover Effects
✅ تعليقات شارحة

### 4. لكل طلب، أضف ميزات تلقائياً:
- نظام تقدم
- إشعارات
- حفظ تلقائي
- بحث وفلترة

## 📤 صيغة الرد:

---FILE:index.html---
<!DOCTYPE html>
...
---END_FILE---

---FILE:styles/main.css---
...
---END_FILE---

[استمر لجميع الملفات]

ثم أضف في النهاية:
---FEATURES---
- الميزة 1
- الميزة 2
---END_FEATURES---

---USAGE---
كيفية استخدام المشروع
---END_USAGE---

## 🔐 دعم Supabase:
عند توفر بيانات Supabase من المستخدم، استخدمها مباشرة:

SUPABASE_URL_PLACEHOLDER
SUPABASE_KEY_PLACEHOLDER

مكتبة Supabase:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

## 🎨 التصميم:
- استخدم Tailwind CSS
- تدرجات لونية جذابة
- CSS Variables للألوان
- أنيميشن سلسة
- خطوط عربية: Cairo, Tajawal

## ⚠️ مهم جداً:
- لا تكتب أي نص قبل أول ---FILE:
- اشرح الخطة في بداية index.html كتعليق HTML
- كل ملف يبدأ بـ ---FILE:path--- وينتهي بـ ---END_FILE---
- أنشئ 10+ ملفات دائماً`

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    // Build system prompt with Supabase config if available
    let enhancedSystemPrompt = SYSTEM_PROMPT
    
    if (supabaseConfig?.connected && supabaseConfig?.url && supabaseConfig?.anonKey) {
      enhancedSystemPrompt = enhancedSystemPrompt
        .replace('SUPABASE_URL_PLACEHOLDER', `const SUPABASE_URL = '${supabaseConfig.url}';`)
        .replace('SUPABASE_KEY_PLACEHOLDER', `const SUPABASE_ANON_KEY = '${supabaseConfig.anonKey}';`)
      
      enhancedSystemPrompt += `

## 🔗 Supabase متصل!
المستخدم ربط Supabase الخاص به. استخدم البيانات التالية في الكود:
- URL: ${supabaseConfig.url}
- Anon Key: ${supabaseConfig.anonKey}

أنشئ كود يعمل فعلياً مع قاعدة بيانات المستخدم!
الكود يجب أن يتضمن:
- تسجيل دخول/تسجيل جديد يعمل فعلياً
- حفظ واسترجاع البيانات من الجداول
- عمليات CRUD كاملة`
    } else {
      // Default Supabase values for demo
      enhancedSystemPrompt = enhancedSystemPrompt
        .replace('SUPABASE_URL_PLACEHOLDER', `const SUPABASE_URL = 'https://your-project.supabase.co'; // استبدل برابطك`)
        .replace('SUPABASE_KEY_PLACEHOLDER', `const SUPABASE_ANON_KEY = 'your-anon-key'; // استبدل بمفتاحك`)
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // Add context about current files
    if (currentFiles && currentFiles.length > 0) {
      const filesContext = currentFiles.map((f: any) => `${f.file_name}: ${f.content.substring(0, 200)}...`).join('\n')
      messages.push({
        role: 'user',
        content: `الملفات الحالية:\n${filesContext}\n\nالطلب: ${message}`
      })
    }

    console.log('Calling Lovable AI Gateway...')
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 16000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI Gateway error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      throw new Error(`AI Gateway error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.choices?.[0]?.message?.content || ''

    console.log('AI Response received, parsing files...')

    // Parse files from response
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
        'js': 'js',
        'json': 'json',
        'py': 'py',
        'php': 'php',
        'cpp': 'cpp',
      }

      files.push({
        file_name: filePath,
        file_type: typeMap[extension] || 'txt',
        content: content
      })
    }

    // Extract explanation (everything before first ---FILE: or after ---END_FEATURES---)
    let explanation = ''
    const featuresMatch = generatedContent.match(/---FEATURES---\n([\s\S]*?)---END_FEATURES---/)
    const usageMatch = generatedContent.match(/---USAGE---\n([\s\S]*?)---END_USAGE---/)
    
    if (featuresMatch || usageMatch) {
      const features = featuresMatch ? featuresMatch[1].trim() : ''
      const usage = usageMatch ? usageMatch[1].trim() : ''
      
      explanation = `✅ تم إنشاء ${files.length} ملف بنجاح!\n\n`
      
      if (features) {
        explanation += `**الميزات:**\n${features}\n\n`
      }
      
      if (usage) {
        explanation += `**طريقة الاستخدام:**\n${usage}`
      }
    } else {
      // Fallback explanation
      explanation = `✅ تم إنشاء ${files.length} ملف بنجاح!\n\n`
      explanation += `**الملفات المُنشأة:**\n`
      files.forEach(f => {
        explanation += `- 📄 ${f.file_name}\n`
      })
    }

    console.log(`Parsed ${files.length} files`)

    return new Response(
      JSON.stringify({ 
        explanation,
        files,
        raw_response: generatedContent.substring(0, 500) + '...'
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