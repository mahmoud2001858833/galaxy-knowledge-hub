
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
    const { text, direction, context, language } = await req.json()
    
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured', translation: '', explanation: '', grammarExplanation: '', keyWords: [], suggestions: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const contextDescriptions: { [key: string]: string } = {
      formal: language === 'ar' ? 'رسمي ومهني' : 'formal and professional',
      academic: language === 'ar' ? 'أكاديمي وعلمي' : 'academic and scientific',
      conversational: language === 'ar' ? 'محادثة يومية عادية' : 'casual daily conversation',
      literary: language === 'ar' ? 'أدبي وبلاغي' : 'literary and eloquent'
    }

    const prompt = language === 'ar' ? 
      `أنت مترجم ذكي ومعلم للغة الإنجليزية. مهمتك ترجمة النص التالي مع تقديم شرح تعليمي مفصل.

النص المراد ترجمته: "${text}"
اتجاه الترجمة: ${direction === 'ar-en' ? 'من العربية إلى الإنجليزية' : 'من الإنجليزية إلى العربية'}
السياق: ${contextDescriptions[context] || 'عام'}

يرجى تقديم:

1. الترجمة المناسبة للسياق المحدد
2. شرح لماذا اخترت هذه الترجمة تحديداً
3. تحليل نحوي للجملة الأصلية والمترجمة
4. استخراج أهم 3-5 كلمات مفتاحية مع معانيها ونطقها
5. اقتراحات لتحسين الترجمة أو بدائل أخرى

تنسيق الإجابة كـ JSON:
{
  "translation": "النص المترجم",
  "explanation": "شرح سبب اختيار هذه الترجمة",
  "grammarExplanation": "التحليل النحوي",
  "keyWords": [
    {
      "word": "الكلمة",
      "meaning": "المعنى",
      "pronunciation": "النطق بالرموز الصوتية"
    }
  ],
  "suggestions": ["اقتراح 1", "اقتراح 2"]
}` :
      `You are an intelligent translator and English teacher. Your task is to translate the following text with detailed educational explanation.

Text to translate: "${text}"
Translation direction: ${direction === 'ar-en' ? 'from Arabic to English' : 'from English to Arabic'}
Context: ${contextDescriptions[context] || 'general'}

Please provide:

1. Translation appropriate for the specified context
2. Explanation of why you chose this specific translation
3. Grammar analysis of both original and translated sentences
4. Extract 3-5 key words with their meanings and pronunciation
5. Suggestions for improving the translation or alternatives

Format the response as JSON:
{
  "translation": "translated text",
  "explanation": "explanation of translation choice",
  "grammarExplanation": "grammar analysis",
  "keyWords": [
    {
      "word": "word",
      "meaning": "meaning",
      "pronunciation": "phonetic pronunciation"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`

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
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Try to extract JSON from the response
    try {
      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      const result = JSON.parse(responseText)
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      const fallbackResult = {
        translation: direction === 'ar-en' ? 
          "Translation will appear here" : 
          "ستظهر الترجمة هنا",
        explanation: language === 'ar' ? 
          "حدث خطأ في تحليل الاستجابة. يرجى المحاولة مرة أخرى." :
          "Error parsing response. Please try again.",
        grammarExplanation: responseText,
        keyWords: [],
        suggestions: []
      }
      
      return new Response(
        JSON.stringify(fallbackResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Translation error occurred',
        translation: "",
        explanation: "",
        grammarExplanation: "",
        keyWords: [],
        suggestions: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
