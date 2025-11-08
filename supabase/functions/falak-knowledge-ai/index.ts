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
    const { message, image, userName, hasImage } = await req.json()
    
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Personalized greeting with user name
    const personalizedGreeting = userName ? `مرحباً ${userName}! ` : "أهلاً بك! ";
    
    let analysisPrompt = '';
    
    if (hasImage && image) {
      // Image analysis prompt
      analysisPrompt = `${personalizedGreeting}أنا مساعدك الذكي المتخصص في المنهاج الأردني. سأحلل الصورة وأقدم لك إجابة شاملة ومفصلة.

السؤال/الطلب: ${message || "تحليل الصورة المرفقة"}

قدم إجابة كاملة وشاملة وواضحة تتضمن:

📋 تحليل شامل:
- وصف دقيق ومفصل لكل عنصر في الصورة
- تحديد الموضوع الرئيسي والمفاهيم المتعلقة
- ربط المحتوى بالمنهاج الأردني والصف المناسب

📚 شرح تفصيلي كامل:
- شرح المفاهيم الموجودة بتفاصيل علمية دقيقة
- القوانين والمبادئ المتعلقة مع شرح مفصل لكل منها
- أمثلة توضيحية وتطبيقات عملية واقعية
- تفسير واضح لكل خطوة بالتفصيل

💡 نصائح وإرشادات عملية:
- نصائح محددة للاستفادة من هذه المعلومات
- كيفية تطبيق المفاهيم في الامتحانات
- تلميحات للحفظ والفهم الأفضل

اكتب إجابة واحدة متكاملة ومفصلة (على الأقل 200 كلمة) تتضمن جميع النقاط أعلاه بأسلوب واضح ومتسلسل وسلس.`;
    } else {
      // Regular question prompt
      analysisPrompt = `${personalizedGreeting}أنا مساعدك الذكي المتخصص في المنهاج الأردني. سأجيب على سؤالك بشكل شامل ومفصل.

السؤال: ${message}

قدم إجابة كاملة وشاملة تتضمن:

🎯 تحليل السؤال:
- تحديد المطلوب من السؤال بدقة
- ربط السؤال بالمنهاج الأردني والوحدة المناسبة
- شرح أهمية هذا الموضوع وتطبيقاته

📖 شرح تفصيلي كامل:
- شرح علمي دقيق للموضوع
- القوانين والمبادئ مع شرح كل منها
- أمثلة عملية وتطبيقات واقعية
- تفسير كل نقطة بالتفصيل مع الأسباب والمبررات

💡 نصائح وإرشادات:
- نصائح محددة للفهم والحفظ
- كيفية استخدام المعلومات في الامتحانات
- طرق للممارسة والتدريب الفعال

اكتب إجابة واحدة متكاملة ومفصلة (على الأقل 200 كلمة) تتضمن جميع النقاط أعلاه بأسلوب واضح ومتسلسل وسلس.`;
    }

    // Prepare the request body for Gemini API
    const requestBody: any = {
      contents: [
        {
          parts: [
            {
              text: analysisPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 4096,
      }
    };

    // Add image to request if provided
    if (hasImage && image) {
      const base64Image = image.split(',')[1] || image;
      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      throw new Error(data.error.message || 'خطأ في API');
    }

    const fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من معالجة طلبك";

    // Generate embedded video suggestions for the platform
    const videoSuggestions = [
      {
        title: `شرح شامل: ${message?.substring(0, 40) || 'المفهوم الأساسي'}`,
        url: `/educational-videos?topic=${encodeURIComponent(message || 'منهاج اردني')}`,
        type: 'platform'
      },
      {
        title: `تطبيقات عملية: ${message?.substring(0, 35) || 'الموضوع'}`,
        url: `/educational-videos?category=practical&topic=${encodeURIComponent(message || 'تطبيقات')}`,
        type: 'platform'
      },
      {
        title: `حلول تفاعلية: ${message?.substring(0, 30) || 'المسائل'}`,
        url: `/educational-videos?category=solutions&topic=${encodeURIComponent(message || 'حلول')}`,
        type: 'platform'
      }
    ];

    // Generate related questions
    const relatedQuestions = [
      `كيف يمكن تطبيق مفهوم ${message?.split(' ')[0] || 'هذا'} في الحياة العملية؟`,
      `ما هي التمارين العملية على ${message?.split(' ')[0] || 'هذا الموضوع'}؟`,
      `اشرح لي الأخطاء الشائعة في ${message?.split(' ')[0] || 'هذا المفهوم'}`,
      `أعطني مثال تفصيلي على ${message?.substring(0, 20) || 'الموضوع'}...`
    ];

    return new Response(
      JSON.stringify({
        answer: fullResponse,
        videoSuggestions,
        relatedQuestions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'حدث خطأ في معالجة الطلب',
        details: error?.message || 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})