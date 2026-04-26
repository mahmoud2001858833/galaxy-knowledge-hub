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
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const difficultyArabic = {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب'
    }[difficulty] || 'متوسط'
    
    // Split large requests into batches
    const batchSize = 20;
    const batches = Math.ceil(questionCount / batchSize);
    let allQuestions: any[] = [];

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, questionCount - (batch * batchSize));
      
      const prompt = `أنت خبير في إعداد الأسئلة التعليمية للغة العربية. قم بإنشاء ${currentBatchSize} سؤال وفقاً للمواصفات التالية:

وصف الأسئلة:
${description}

${grammarRules ? `القواعد النحوية المطلوبة:\n${grammarRules}` : ''}

مستوى الصعوبة: ${difficultyArabic}

يجب أن تكون الأسئلة:
1. واضحة ومحددة
2. تغطي جوانب مختلفة من الموضوع
3. مناسبة لمستوى الصعوبة المحدد
4. تحتوي على إجابات نموذجية مفصلة
5. متنوعة ومختلفة عن بعضها

قدم الأسئلة بالتنسيق التالي بدقة:
السؤال 1: [نص السؤال]
الإجابة: [الإجابة النموذجية المفصلة]
القاعدة: [القاعدة النحوية المرتبطة إن وجدت]
---

أنشئ الأسئلة الآن:`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3000
        })
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً');
      }
      if (response.status === 402) {
        throw new Error('يرجى إضافة رصيد إلى Lovable AI');
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from AI API')
    }
    
    const rawQuestions = data.choices[0].message.content
    
    // Parse the questions
    const questionBlocks = rawQuestions.split('---').filter(block => block.trim())
    const batchQuestions = questionBlocks.map(block => {
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

    allQuestions = allQuestions.concat(batchQuestions);
    }

    return new Response(
      JSON.stringify({ questions: allQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ في معالجة الطلب' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
