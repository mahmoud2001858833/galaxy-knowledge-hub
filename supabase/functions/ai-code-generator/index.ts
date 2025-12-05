import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_AI_KEY = Deno.env.get('PLATFORM_BUILDER_AI_KEY');

const ULTRA_ADVANCED_SYSTEM_PROMPT = `أنت مطور ويب خبير جداً. مهمتك إنشاء تطبيقات ويب متكاملة تعمل 100%.

## ⚠️ تعليمات الصيغة - اتبعها بالضبط:

عند إنشاء الملفات، استخدم هذه الصيغة فقط:

---FILE:اسم_الملف.امتداد---
محتوى الملف هنا
---END_FILE---

مثال صحيح:
---FILE:index.html---
<!DOCTYPE html>
<html>...</html>
---END_FILE---

---FILE:styles/main.css---
body { margin: 0; }
---END_FILE---

---FILE:scripts/app.js---
console.log('Hello');
---END_FILE---

## 📁 الملفات المطلوبة (على الأقل 5 ملفات):
- index.html (الصفحة الرئيسية)
- styles/main.css (التنسيقات الأساسية)
- styles/components.css (تنسيقات المكونات)
- scripts/app.js (الكود الرئيسي)
- scripts/utils.js (الوظائف المساعدة)

## 🎨 معايير التصميم:
- استخدم CSS Variables للألوان
- أضف hover effects وtransitions
- اجعل التصميم متجاوباً (responsive)
- استخدم تدرجات ألوان جذابة
- أضف ظلال وحواف دائرية

## ✨ أضف تلقائياً:
- Loading states
- Error handling
- Form validation
- Toast notifications
- Dark mode toggle

## 🔗 بيانات Supabase:
SUPABASE_CONFIG_PLACEHOLDER

## ⚠️ قواعد صارمة:
1. ✅ استخدم الصيغة ---FILE:name--- و ---END_FILE--- فقط
2. ✅ لا تستخدم \`\`\`html أو \`\`\`css بدون ---FILE:
3. ✅ كل ملف يبدأ بـ ---FILE: وينتهي بـ ---END_FILE---
4. ✅ أنشئ 5 ملفات على الأقل
5. ✅ الكود يجب أن يعمل فعلياً

الآن، أنشئ المشروع المطلوب!`

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
      throw new Error('PLATFORM_BUILDER_AI_KEY is not configured')
    }

    let systemPrompt = ULTRA_ADVANCED_SYSTEM_PROMPT
    
    if (supabaseConfig?.connected && supabaseConfig?.url && supabaseConfig?.anonKey) {
      const supabaseInfo = `
## 🔗 Supabase متصل!
const SUPABASE_URL = '${supabaseConfig.url}';
const SUPABASE_ANON_KEY = '${supabaseConfig.anonKey}';
استخدم: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
`
      systemPrompt = systemPrompt.replace('SUPABASE_CONFIG_PLACEHOLDER', supabaseInfo)
    } else {
      systemPrompt = systemPrompt.replace('SUPABASE_CONFIG_PLACEHOLDER', 'Supabase غير متصل - استخدم localStorage للحفظ المؤقت')
    }

    const conversationMessages: Array<{ role: string; parts: Array<{ text: string }> }> = []

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-4).forEach((msg: any) => {
        conversationMessages.push({
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

    console.log('Calling Google Gemini AI...')
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...conversationMessages,
            { role: 'user', parts: [{ text: userMessage }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16000,
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
      
      throw new Error(`Gemini error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('AI Response received, length:', generatedContent.length)

    // Parse files with multiple methods
    const files: Array<{ file_name: string; file_type: string; content: string }> = []
    
    // Method 1: Standard format ---FILE:name---
    const fileRegex = /---FILE:(.+?)---\n([\s\S]*?)---END_FILE---/g
    let match
    while ((match = fileRegex.exec(generatedContent)) !== null) {
      const filePath = match[1].trim()
      const content = match[2].trim()
      files.push(createFileObject(filePath, content))
    }

    // Method 2: Alternative format ---FILE: name ---
    if (files.length === 0) {
      const altRegex = /---FILE:\s*(.+?)\s*---\n([\s\S]*?)(?=---FILE:|---END|$)/g
      while ((match = altRegex.exec(generatedContent)) !== null) {
        const filePath = match[1].trim()
        let content = match[2].trim()
        if (content.endsWith('---')) {
          content = content.slice(0, -3).trim()
        }
        files.push(createFileObject(filePath, content))
      }
    }

    // Method 3: Markdown code blocks with filename comment
    if (files.length === 0) {
      const mdRegex = /```(\w+)\s*(?:\/\/|<!--)?\s*(\S+\.(?:html|css|js|json))\s*(?:-->)?\n([\s\S]*?)```/g
      while ((match = mdRegex.exec(generatedContent)) !== null) {
        const filePath = match[2].trim()
        const content = match[3].trim()
        files.push(createFileObject(filePath, content))
      }
    }

    // Method 4: Simple markdown blocks - create default files
    if (files.length === 0) {
      const htmlMatch = generatedContent.match(/```html\n([\s\S]*?)```/)
      const cssMatch = generatedContent.match(/```css\n([\s\S]*?)```/)
      const jsMatch = generatedContent.match(/```(?:javascript|js)\n([\s\S]*?)```/)

      if (htmlMatch) files.push(createFileObject('index.html', htmlMatch[1].trim()))
      if (cssMatch) files.push(createFileObject('styles/main.css', cssMatch[1].trim()))
      if (jsMatch) files.push(createFileObject('scripts/app.js', jsMatch[1].trim()))
    }

    // Build explanation
    let explanation = ''
    const firstFileIndex = generatedContent.indexOf('---FILE:')
    const firstCodeBlock = generatedContent.indexOf('```')
    const cutPoint = Math.min(
      firstFileIndex > 0 ? firstFileIndex : Infinity,
      firstCodeBlock > 0 ? firstCodeBlock : Infinity
    )
    
    if (cutPoint < Infinity && cutPoint > 50) {
      explanation = generatedContent.substring(0, cutPoint).trim()
    }

    explanation += `\n\n## ✅ الملفات المُنشأة (${files.length} ملف)\n\n`
    files.forEach(f => {
      explanation += `- 📄 ${f.file_name}\n`
    })

    console.log(`Parsed ${files.length} files`)

    return new Response(
      JSON.stringify({ explanation, files }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `خطأ في توليد الكود: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function createFileObject(filePath: string, content: string) {
  const extension = filePath.split('.').pop()?.toLowerCase() || 'txt'
  const typeMap: Record<string, string> = {
    'html': 'html',
    'css': 'css',
    'js': 'js',
    'javascript': 'js',
    'json': 'json',
    'py': 'python',
    'php': 'php',
  }
  return {
    file_name: filePath,
    file_type: typeMap[extension] || 'text',
    content
  }
}
