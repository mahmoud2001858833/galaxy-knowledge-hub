import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `أنت مبرمج محترف متخصص في تطوير الويب. مهمتك إنشاء وتعديل كود HTML, CSS, JavaScript.

القواعد:
1. أنشئ كود نظيف ومنظم ومعلق باللغة العربية
2. استخدم أفضل الممارسات البرمجية
3. اجعل التصميم متجاوب تماماً (Responsive)
4. استخدم Tailwind CSS للتنسيق
5. أضف تأثيرات وأنيميشن جذابة
6. تأكد من إمكانية الوصول (Accessibility)
7. استخدم ألوان متناسقة وجميلة
8. أضف تعليقات توضيحية للكود المعقد

عند الرد، استخدم هذا الشكل بالضبط:
---FILE:index.html---
محتوى الملف
---END_FILE---

---FILE:style.css---
محتوى الملف
---END_FILE---

---FILE:script.js---
محتوى الملف
---END_FILE---

ثم اكتب شرح مختصر بالعربية للتغييرات التي قمت بها.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentFiles, conversationHistory } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // بناء السياق من الملفات الحالية
    let contextMessage = ''
    if (currentFiles && currentFiles.length > 0) {
      contextMessage = '\n\nالملفات الحالية في المشروع:\n\n'
      currentFiles.forEach((file: any) => {
        contextMessage += `---FILE:${file.file_name}---\n${file.content}\n---END_FILE---\n\n`
      })
    }

    // بناء رسائل المحادثة
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-5), // آخر 5 رسائل للسياق
      { role: 'user', content: message + contextMessage }
    ]

    console.log('Calling Lovable AI with message:', message)

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد لحساب Lovable AI الخاص بك.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        )
      }

      return new Response(
        JSON.stringify({ error: 'خطأ في الاتصال بالذكاء الاصطناعي' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'لا يوجد رد'

    console.log('AI Response received, length:', aiResponse.length)

    // استخراج الملفات من الرد
    const files: any[] = []
    const fileRegex = /---FILE:(.+?)---\n([\s\S]*?)---END_FILE---/g
    let match

    while ((match = fileRegex.exec(aiResponse)) !== null) {
      const fileName = match[1].trim()
      const content = match[2].trim()
      files.push({
        file_name: fileName,
        content: content,
        file_type: fileName.split('.').pop() || 'txt'
      })
    }

    // استخراج الشرح
    const explanation = aiResponse.split('---END_FILE---').pop()?.trim() || ''

    console.log('Extracted files:', files.length, 'Explanation length:', explanation.length)

    return new Response(
      JSON.stringify({
        files,
        explanation,
        raw_response: aiResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in ai-code-generator:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `خطأ في معالجة الطلب: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
