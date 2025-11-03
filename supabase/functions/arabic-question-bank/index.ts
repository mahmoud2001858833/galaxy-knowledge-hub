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
    const { description, grammarRules, questionCount, difficulty } = await req.json()
    
    const GEMINI_API_KEY = "AIzaSyAx2V-sMox-5DV6p_WM1cwB8SjZVd271LA"
    
    const difficultyArabic = {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب'
    }[difficulty] || 'متوسط'
    
    const prompt = `أنت خبير في إعداد الأسئلة التعليمية للغة العربية. قم بإنشاء ${questionCount} سؤال وفقاً للمواصفات التالية:

وصف الأسئلة:
${description}

${grammarRules ? `القواعد النحوية المطلوبة:\n${grammarRules}` : ''}

مستوى الصعوبة: ${difficultyArabic}

يجب أن تكون الأسئلة:
1. واضحة ومحددة
2. تغطي جوانب مختلفة من الموضوع
3. مناسبة لمستوى الصعوبة المحدد
4. تحتوي على إجابات نموذجية مفصلة

قدم الأسئلة بالتنسيق التالي:
السؤال 1: [نص السؤال]
الإجابة: [الإجابة النموذجية المفصلة]
القاعدة: [القاعدة النحوية المرتبطة إن وجدت]
---

أنشئ الأسئلة الآن:`;

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
    
    const rawQuestions = data.candidates[0].content.parts[0].text
    
    // Parse the questions
    const questionBlocks = rawQuestions.split('---').filter(block => block.trim())
    const questions = questionBlocks.map(block => {
      const lines = block.trim().split('\n')
      let question = ''
      let answer = ''
      let grammarRule = ''
      
      let currentSection = ''
      lines.forEach(line => {
        if (line.startsWith('السؤال')) {
          currentSection = 'question'
          question = line.replace(/السؤال \d+:\s*/, '')
        } else if (line.startsWith('الإجابة:')) {
          currentSection = 'answer'
          answer = line.replace('الإجابة:', '').trim()
        } else if (line.startsWith('القاعدة:')) {
          currentSection = 'rule'
          grammarRule = line.replace('القاعدة:', '').trim()
        } else if (line.trim()) {
          if (currentSection === 'question') question += ' ' + line.trim()
          else if (currentSection === 'answer') answer += '\n' + line.trim()
          else if (currentSection === 'rule') grammarRule += ' ' + line.trim()
        }
      })
      
      return {
        question: question.trim(),
        answer: answer.trim(),
        difficulty: difficultyArabic,
        grammarRule: grammarRule.trim() || undefined
      }
    }).filter(q => q.question && q.answer)

    return new Response(
      JSON.stringify({ questions }),
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
