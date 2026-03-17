import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { topic, difficulty = 'medium', questionCount = 10, language = 'ar', questionTypes = ['mcq', 'trueFalse', 'essay'] } = await req.json();
    
    const API_KEY = Deno.env.get('GJU_AI_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isArabic = language === 'ar';
    const difficultyMap: Record<string, string> = {
      easy: isArabic ? 'سهل' : 'easy',
      medium: isArabic ? 'متوسط' : 'medium',
      hard: isArabic ? 'صعب' : 'hard',
    };

    const prompt = isArabic
      ? `أنت مولّد اختبارات ذكي متقدم. أنشئ اختباراً شاملاً حول الموضوع التالي:

الموضوع: "${topic}"
المستوى: ${difficultyMap[difficulty]}
عدد الأسئلة: ${questionCount}
أنواع الأسئلة المطلوبة: ${questionTypes.join(', ')}

أنشئ اختباراً متنوعاً يشمل:
- أسئلة اختيار من متعدد (mcq) مع 4 خيارات
- أسئلة صح وخطأ (trueFalse)
- أسئلة مقالية (essay) مع إجابات نموذجية

أجب بصيغة JSON:
{
  "title": "عنوان الاختبار",
  "topic": "الموضوع",
  "difficulty": "المستوى",
  "totalPoints": 100,
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "نص السؤال",
      "options": ["أ", "ب", "ج", "د"],
      "correctAnswer": "أ",
      "explanation": "شرح الإجابة",
      "points": 5
    },
    {
      "id": 2,
      "type": "trueFalse",
      "question": "نص السؤال",
      "correctAnswer": true,
      "explanation": "شرح",
      "points": 3
    },
    {
      "id": 3,
      "type": "essay",
      "question": "نص السؤال المقالي",
      "modelAnswer": "الإجابة النموذجية",
      "gradingCriteria": ["معيار 1", "معيار 2"],
      "points": 10
    }
  ]
}`
      : `You are an advanced AI quiz generator. Create a comprehensive quiz on:

Topic: "${topic}"
Difficulty: ${difficultyMap[difficulty]}
Questions: ${questionCount}
Types: ${questionTypes.join(', ')}

Create diverse questions including MCQ (4 options), True/False, and Essay with model answers.

Respond in JSON:
{
  "title": "Quiz Title",
  "topic": "topic",
  "difficulty": "level",
  "totalPoints": 100,
  "questions": [
    {"id": 1, "type": "mcq", "question": "q", "options": ["a","b","c","d"], "correctAnswer": "a", "explanation": "exp", "points": 5},
    {"id": 2, "type": "trueFalse", "question": "q", "correctAnswer": true, "explanation": "exp", "points": 3},
    {"id": 3, "type": "essay", "question": "q", "modelAnswer": "ans", "gradingCriteria": ["c1"], "points": 10}
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      return new Response(JSON.stringify(JSON.parse(responseText)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response(JSON.stringify({ title: topic, questions: [], error: 'Parse error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Quiz generation failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
