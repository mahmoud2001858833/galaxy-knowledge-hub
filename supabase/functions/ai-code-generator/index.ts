import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `أنت مطور ويب خبير ومحترف للغاية. مهمتك إنشاء تطبيقات ويب متكاملة وقوية واحترافية.

## 🎯 قدراتك المتقدمة:
1. إنشاء واجهات مستخدم عصرية وجذابة باستخدام Tailwind CSS
2. تقسيم الكود لملفات متعددة ومنظمة حسب الوظيفة
3. دعم قاعدة بيانات Supabase للمشاريع التي تحتاج تخزين بيانات
4. إنشاء أنظمة مصادقة كاملة (تسجيل دخول/خروج/تسجيل جديد)
5. إنشاء لوحات تحكم وإدارة بيانات متقدمة
6. دعم Real-time updates و Live data
7. إضافة ميزات متقدمة تلقائياً لجعل المشروع احترافياً

## 📁 هيكل الملفات المطلوب:
قسّم الكود بشكل منطقي ومنظم:

### ملفات أساسية:
- **index.html** - الصفحة الرئيسية
- **styles/main.css** - التنسيقات الرئيسية
- **styles/components.css** - تنسيقات المكونات
- **scripts/app.js** - المنطق الرئيسي
- **scripts/utils.js** - الدوال المساعدة

### للمشاريع مع قاعدة بيانات:
- **scripts/supabase-client.js** - إعداد Supabase
- **scripts/database.js** - عمليات قاعدة البيانات
- **scripts/auth.js** - نظام المصادقة

### صفحات إضافية:
- **pages/login.html** - تسجيل الدخول
- **pages/dashboard.html** - لوحة التحكم

## 🔐 دعم Supabase:
عند طلب قاعدة بيانات أو تسجيل دخول، استخدم:

\`\`\`javascript
const SUPABASE_URL = 'https://esifpjjehdnpkhyilctv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaWZwamplaGRucGtoeWlsY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQ5NDYsImV4cCI6MjA2MDc1MDk0Nn0.xfaLcyAgvZx2yKsNAdf94cuNZQfXPGQcAYb1xiSYI7k';
\`\`\`

أضف مكتبة Supabase:
\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
\`\`\`

مثال supabase-client.js:
\`\`\`javascript
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  return { data, error };
}

async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function fetchData(table) {
  const { data, error } = await supabaseClient.from(table).select('*');
  return { data, error };
}

async function insertData(table, data) {
  const { data: result, error } = await supabaseClient.from(table).insert(data).select();
  return { data: result, error };
}
\`\`\`

## 📋 قواعد البرمجة:

1. **الجودة**: كود نظيف وقابل للصيانة
2. **التصميم**: Tailwind CSS حصرياً، متجاوب 100%، أنيميشن سلسة
3. **الوظائف**: معالجة أخطاء، Loading States، Toast Notifications، Form Validation
4. **الأمان**: لا تعرض بيانات حساسة، استخدم HTTPS
5. **الأداء**: Lazy Loading، تقليل الطلبات، Caching

## 🎁 الميزات التلقائية (أضفها دائماً):
✅ Loading States
✅ Error Handling  
✅ Toast Notifications
✅ Responsive Design
✅ Form Validation
✅ Smooth Animations
✅ Accessibility

## 💡 إضافات ذكية:
- للنماذج: التحقق من الصحة، رسائل خطأ، إظهار/إخفاء كلمات المرور
- للجداول: بحث وفلترة، ترتيب، Pagination
- للـ Dashboard: إحصائيات، Real-time updates، تصدير تقارير

## 📤 صيغة الرد:

\`\`\`
---FILE:index.html---
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اسم المشروع</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- المحتوى -->
</body>
</html>
---END_FILE---

---FILE:styles/main.css---
/* التنسيقات */
---END_FILE---

---FILE:scripts/app.js---
// الكود الرئيسي
---END_FILE---
\`\`\`

ثم اكتب شرح مختصر بالعربية للتغييرات والميزات المضافة.

⚠️ مهم: لا تضع كل الكود في ملف واحد، قسّمه بشكل منطقي، أضف ميزات إضافية احترافية، استخدم أحدث التقنيات.
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
      ...(conversationHistory || []).slice(-5),
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
        max_tokens: 8192,
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