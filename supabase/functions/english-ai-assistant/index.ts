
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language } = await req.json();
    
    console.log('English AI Assistant request:', { message, language });

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const systemPrompt = language === 'ar' 
      ? `أنت مساعد ذكي متخصص في تعليم اللغة الإنجليزية. أجب باللغة العربية بوضوح ودقة عالية.

خبرتك تشمل:
- قواعد اللغة الإنجليزية
- المفردات والتعابير
- النطق الصحيح
- مهارات الكتابة والقراءة
- التحدث والاستماع
- الأدب الإنجليزي
- تقنيات التعلم الفعالة

قدم إجابات شاملة مع أمثلة عملية وتوضيحات واضحة.`
      : `You are an intelligent assistant specialized in English language teaching. Answer clearly with high accuracy in English.

Your expertise includes:
- English grammar rules
- Vocabulary and expressions
- Correct pronunciation
- Writing and reading skills
- Speaking and listening
- English literature
- Effective learning techniques

Provide comprehensive answers with practical examples and clear explanations.`;

    const userPrompt = `${systemPrompt}

السؤال: ${message}

يرجى تقديم إجابة شاملة ومفيدة لتعلم اللغة الإنجليزية.`;

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
                text: userPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من معالجة السؤال.';

    console.log('English assistant response generated successfully');

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in English AI assistant function:', errorMessage);
    return new Response(
      JSON.stringify({ 
        reply: 'عذراً، حدث خطأ في معالجة السؤال. يرجى المحاولة مرة أخرى.',
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
