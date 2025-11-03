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
    const { text, essayType, stage } = await req.json()
    
    const GEMINI_API_KEY = "AIzaSyAx2V-sMox-5DV6p_WM1cwB8SjZVd271LA"
    
    let prompt = '';
    
    if (stage === 'spelling') {
      prompt = `أنت مصحح إملائي متخصص في اللغة العربية. قم بتصحيح الأخطاء الإملائية في النص التالي وقدم التصحيح مع شرح الأخطاء:

النص:
"${text}"

يرجى تقديم:
1. النص المصحح
2. قائمة بالأخطاء الإملائية وتصحيحها
3. توضيح القواعد الإملائية المخالفة`;
    } else if (stage === 'grammar') {
      prompt = `أنت مصحح نحوي متخصص في اللغة العربية. قم بتصحيح الأخطاء القواعدية والنحوية في النص التالي:

النص:
"${text}"

يرجى تقديم:
1. النص المصحح نحوياً
2. قائمة بالأخطاء القواعدية وتصحيحها
3. شرح القواعد النحوية المطبقة`;
    } else if (stage === 'consistency') {
      prompt = `أنت خبير في الكتابة العربية. قم بتقييم مدى توافق النص التالي مع نوع المقالة (${essayType}) وقدم اقتراحات للتحسين:

النص:
"${text}"

نوع المقالة: ${essayType}

يرجى تقديم:
1. تقييم التوافق مع نوع المقالة
2. نقاط القوة والضعف
3. اقتراحات محددة للتحسين`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from AI API')
    }
    
    const correction = data.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ correction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ في معالجة الطلب' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
