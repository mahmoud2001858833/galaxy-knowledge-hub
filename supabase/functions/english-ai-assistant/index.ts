
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
    const { message, language } = await req.json()
    
    const GEMINI_API_KEY = "AIzaSyC1u3-VRvMHRz-DxYJJp3Y9a1eqGOCk4CQ"
    
    const prompt = language === 'ar' ? 
      `أنت مساعد ذكي متخصص في تعلم اللغة الإنجليزية. مهمتك مساعدة الطلاب العرب على تعلم الإنجليزية بطريقة فعالة.

خبراتك تشمل:
- قواعد اللغة الإنجليزية (Grammar)
- المفردات والمصطلحات
- النطق الصحيح
- أساليب التعبير
- الكتابة الأكاديمية
- الاختبارات الدولية (IELTS, TOEFL)
- المحادثة العملية

عند الإجابة:
- اشرح بوضوح وبساطة
- أعط أمثلة عملية
- اذكر القاعدة النحوية إذا كانت ذات صلة
- قدم نصائح للحفظ والممارسة
- استخدم اللغة العربية في الشرح

السؤال: ${message}

قدم إجابة شاملة ومفيدة تساعد الطالب على الفهم والتطبيق.` :
      `You are an intelligent AI assistant specialized in English language learning. Your mission is to help students learn English effectively.

Your expertise includes:
- English Grammar
- Vocabulary and terminology
- Correct pronunciation
- Expression methods
- Academic writing
- International tests (IELTS, TOEFL)
- Practical conversation

When answering:
- Explain clearly and simply
- Give practical examples
- Mention grammar rules if relevant
- Provide memorization and practice tips
- Use English in explanations

Question: ${message}

Provide a comprehensive and helpful answer that helps the student understand and apply.`

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
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || (language === 'ar' ? "عذراً، لم أتمكن من فهم السؤال. يمكنك إعادة الصياغة؟" : "Sorry, I couldn't understand the question. Could you rephrase it?")

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
