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
    
    const difficultyEnglish = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard'
    }[difficulty] || 'Medium'
    
    // Split large requests into batches
    const batchSize = 20;
    const batches = Math.ceil(questionCount / batchSize);
    let allQuestions: any[] = [];

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, questionCount - (batch * batchSize));
      
      const prompt = `You are an expert in preparing educational questions for English language. Create ${currentBatchSize} questions according to the following specifications:

Question description:
${description}

${grammarRules ? `Required grammar rules:\n${grammarRules}` : ''}

Difficulty level: ${difficultyEnglish}

Questions should be:
1. Clear and specific
2. Cover different aspects of the topic
3. Appropriate for the specified difficulty level
4. Contain detailed model answers
5. Diverse and different from each other

Present the questions in the following format exactly:
Question 1: [Question text]
Answer: [Detailed model answer]
Rule: [Related grammar rule if any]
---

Create the questions now:`;

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
        throw new Error('Rate limit exceeded, please try again later');
      }
      if (response.status === 402) {
        throw new Error('Please add credits to Lovable AI');
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
        if (line.startsWith('Question')) {
          currentSection = 'question'
          question = line.replace(/Question \d+:\s*/, '')
        } else if (line.startsWith('Answer:')) {
          currentSection = 'answer'
          answer = line.replace('Answer:', '').trim()
        } else if (line.startsWith('Rule:')) {
          currentSection = 'rule'
          grammarRule = line.replace('Rule:', '').trim()
        } else if (line.trim()) {
          if (currentSection === 'question') question += ' ' + line.trim()
          else if (currentSection === 'answer') answer += '\n' + line.trim()
          else if (currentSection === 'rule') grammarRule += ' ' + line.trim()
        }
      })
      
      return {
        question: question.trim(),
        answer: answer.trim(),
        difficulty: difficultyEnglish,
        grammarRule: grammarRule.trim() || undefined
      }
    }).filter(q => q.question && q.answer)

    allQuestions = allQuestions.concat(batchQuestions);
    }

    return new Response(
      JSON.stringify({ questions: allQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing the request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})