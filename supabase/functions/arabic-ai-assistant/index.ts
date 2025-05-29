
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, requestType } = await req.json()
    
    const GEMINI_API_KEY = "AIzaSyC1u3-VRvMHRz-DxYJJp3Y9a1eqGOCk4CQ"
    
    let prompt = '';
    
    if (requestType === 'grammar_analysis') {
      prompt = `أنت خبير نحوي متخصص في الإعراب. قم بإعراب الجملة التالية كلمة كلمة بدقة تامة:

"${message}"

يجب أن تتبع هذا النظام بدقة:

1. حلل كل كلمة منفصلة
2. حدد نوع الكلمة (فعل، اسم، حرف)
3. حدد الموقع النحوي (فاعل، مفعول به، مضاف إليه، إلخ)
4. اذكر الإعراب الكامل مع علامة الإعراب
5. اذكر السبب النحوي

أعطني النتيجة بهذا التنسيق بالضبط:

=== تحليل الكلمات ===
كلمة1: [نوع الكلمة] | [الموقع النحوي] | [الإعراب الكامل] | [السبب]
كلمة2: [نوع الكلمة] | [الموقع النحوي] | [الإعراب الكامل] | [السبب]

=== الشرح المفصل ===
[شرح القواعد النحوية المستخدمة]

مثال للتنسيق:
ذهبَ: فعل | فعل الجملة | فعل ماضٍ مبني على الفتح | لأنه فعل ماضٍ صحيح الآخر
الطالبُ: اسم | فاعل | فاعل مرفوع وعلامة رفعه الضمة الظاهرة | لأنه من قام بالفعل`;
    } else {
      prompt = `أنت مساعد ذكي متخصص في اللغة العربية والنحو والصرف والبلاغة والأدب. الرجاء الإجابة بشكل مفصل ومفيد بالعربية عن: ${message}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من فهم السؤال"

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ في معالجة الطلب' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
