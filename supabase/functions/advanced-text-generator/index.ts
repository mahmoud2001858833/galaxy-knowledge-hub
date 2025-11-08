
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
    const { topic, description, style, difficulty, wordCount, language } = await req.json();
    
    console.log('Text generation request:', { topic, style, difficulty, wordCount, language });

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // بناء البرومبت حسب المعايير المطلوبة
    let stylePrompt = "";
    switch (style) {
      case 'poetic':
        stylePrompt = "بأسلوب شعري جميل مع استخدام التشبيهات والاستعارات";
        break;
      case 'exaggerated':
        stylePrompt = "بأسلوب مبالغ فيه ومثير مع كلمات قوية ومؤثرة";
        break;
      case 'advanced':
        stylePrompt = "بأسلوب أكاديمي متقدم مع استخدام مفردات معقدة ومتخصصة";
        break;
      case 'simple':
        stylePrompt = "بأسلوب بسيط وواضح مع كلمات سهلة الفهم";
        break;
      case 'formal':
        stylePrompt = "بأسلوب رسمي ومهني";
        break;
      case 'narrative':
        stylePrompt = "بأسلوب سردي شيق";
        break;
      default:
        stylePrompt = "بأسلوب واضح ومناسب";
    }

    let difficultyPrompt = "";
    switch (difficulty) {
      case 'easy':
        difficultyPrompt = "مستوى سهل مع كلمات بسيطة وجمل قصيرة";
        break;
      case 'medium':
        difficultyPrompt = "مستوى متوسط مع تنويع في المفردات والجمل";
        break;
      case 'hard':
        difficultyPrompt = "مستوى صعب مع مفردات متقدمة وتراكيب معقدة";
        break;
      default:
        difficultyPrompt = "مستوى متوسط";
    }

    const englishPrompt = `Write a comprehensive ${language === 'en' ? 'English' : 'bilingual'} text about "${topic}".

Topic details: ${description}

Requirements:
- Style: ${stylePrompt}
- Difficulty: ${difficultyPrompt}
- Word count: approximately ${wordCount} words
- Language: ${language === 'both' ? 'Write in English first, then provide Arabic translation' : 'English only'}

Please create an engaging, well-structured text that covers the topic thoroughly.`;

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
                text: englishPrompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'فشل في توليد النص';
    
    // إذا كان المطلوب كلا اللغتين وليس النص يحتوي على العربية، نترجم
    let arabicTranslation = '';
    if (language === 'both' && !generatedText.includes('العربية') && !generatedText.includes('ترجمة')) {
      const translationPrompt = `ترجم النص التالي إلى العربية مع المحافظة على نفس الأسلوب والمستوى:

"${generatedText}"

يرجى تقديم ترجمة دقيقة وطبيعية باللغة العربية.`;

      const translationResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: translationPrompt
                }
              ]
            }
          ]
        })
      });

      const translationData = await translationResponse.json();
      arabicTranslation = translationData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    console.log('Text generation completed, length:', generatedText.length);

    return new Response(
      JSON.stringify({
        englishText: generatedText,
        arabicTranslation: arabicTranslation,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text generator function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        englishText: '',
        arabicTranslation: '',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
