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
    
    const GEMINI_API_KEY = "AIzaSyBbk808sXI4HXye9V97annZy8RikeahG3E"
    
    // Personalized greeting with user name
    const personalizedGreeting = userName ? `مرحباً ${userName}، ` : "مرحباً، ";
    
    let analysisPrompt = '';
    
    if (hasImage && image) {
      // Image analysis prompt
      analysisPrompt = `${personalizedGreeting}سأقوم بتحليل هذه الصورة بالتفصيل وربطها بالمنهاج الأردني.

أنا مساعد ذكي متقدم متخصص في دعم المنهاج الأردني. سأقدم إجابة مفصلة مع خطوات واضحة وتفسيرات شاملة:

🎯 أولاً - تحليل السؤال والصورة:
قم بتحليل دقيق للصورة مع شرح تفصيلي لكل عنصر مرئي وربطه بالمنهاج الأردني. اذكر الأسباب والمبررات والشرح الكامل لكل نقطة.

🔍 ثانياً - الشرح التفصيلي الكامل:
اشرح الموضوع بتفاصيل علمية دقيقة مع التبرير والتفسير لكل نقطة. قدم معلومات شاملة وربطها بالمنهاج الأردني مع أمثلة وتوضيحات كافية. لا تكتفي بذكر الخطوات فقط، بل اشرح كل خطوة بشكل مفصل.

💡 ثالثاً - النصائح والإرشادات العملية:
قدم نصائح عملية محددة مع شرح لماذا هذه النصائح مفيدة. اذكر كيفية الاستفادة من هذه المعلومات في الدراسة والامتحانات مع أمثلة تطبيقية واضحة.

✨ أخيراً - الإجابة الكاملة الشاملة:
قدم إجابة نهائية شاملة ومفصلة في فقرة واحدة تتضمن جميع المعلومات المطلوبة مع التفسير الكامل والمبررات العلمية والشرح الوافي لكل جزء من الموضوع.

السؤال أو الطلب: ${message || "تحليل الصورة المرفقة"}

قم بالتحليل والشرح التفصيلي الكامل وفقاً للعملية المحددة أعلاه. تذكر: يجب شرح كل نقطة وليس ذكرها فقط.`;
    } else {
      // Regular question prompt
      analysisPrompt = `${personalizedGreeting}سأجيب على سؤالك بشكل شامل ومتخصص وفقاً للمنهاج الأردني.

أنا مساعد ذكي متقدم متخصص في دعم المنهاج الأردني. سأقدم إجابة مفصلة مع خطوات واضحة وتفسيرات شاملة:

🎯 أولاً - تحليل السؤال الدقيق:
قم بتحليل السؤال بعمق وحدد المطلوب بدقة مع شرح كامل للسبب. اربط السؤال بالمنهاج الأردني واشرح أهمية هذا الموضوع مع التبرير الكامل والتفصيلي.

🔍 ثانياً - الشرح التفصيلي الكامل:
قدم شرحاً تفصيلياً وكاملاً للموضوع مع ذكر القوانين والمبادئ العلمية وشرحها. اذكر الأمثلة والتطبيقات العملية مع شرح واف لكل نقطة وأسبابها والتفسير المنطقي لها. لا تكتفي بذكر الخطوات فقط، بل اشرح كل خطوة بالتفصيل.

💡 ثالثاً - النصائح والإرشادات العملية:
قدم نصائح عملية محددة مع شرح تفصيلي لماذا هذه النصائح مفيدة ومهمة. اذكر إرشادات تطبيقية واضحة مع شرح كيفية استخدام هذه المعلومات في الدراسة والامتحانات مع أمثلة واقعية.

✨ أخيراً - الإجابة النهائية الشاملة:
قدم إجابة نهائية شاملة ومفصلة في فقرة واحدة تتضمن جميع المعلومات المطلوبة مع التفسير الكامل والمبررات العلمية والشرح الوافي لكل جزء من الإجابة.

السؤال: ${message}

قم بالإجابة والشرح التفصيلي الكامل وفقاً للعملية المحددة أعلاه. تذكر: يجب شرح وتفسير كل نقطة بالتفصيل وليس ذكرها فقط.`;
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
        temperature: 0.8,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 3000,
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

    // Parse the response into structured format according to new structure
    const parts = fullResponse.split('\n\n');
    const steps: string[] = [];
    let finalAnswer = '';
    
    // Extract analysis step (🎯)
    const analysisSection = parts.find((part: string) => 
      part.includes('🎯') || part.includes('تحليل السؤال') || part.includes('أولاً')
    );
    if (analysisSection) {
      steps.push(`🎯 تحليل السؤال:\n${analysisSection.replace(/🎯.*?:\s*/, '')}`);
    }
    
    // Extract examination step (🔍)
    const examinationSection = parts.find((part: string) => 
      part.includes('🔍') || part.includes('فحص تفصيلي') || part.includes('ثانياً')
    );
    if (examinationSection) {
      steps.push(`🔍 فحص تفصيلي:\n${examinationSection.replace(/🔍.*?:\s*/, '')}`);
    }
    
    // Extract advice step (💡)
    const adviceSection = parts.find((part: string) => 
      part.includes('💡') || part.includes('نصائح') || part.includes('ثالثاً')
    );
    if (adviceSection) {
      steps.push(`💡 نصائح وإرشادات:\n${adviceSection.replace(/💡.*?:\s*/, '')}`);
    }
    
    // Generate final answer as one paragraph (✨)
    const finalSection = parts.find((part: string) => 
      part.includes('✨') || part.includes('الإجابة الكاملة') || part.includes('أخيراً')
    );
    
    if (finalSection) {
      finalAnswer = `✨ الإجابة الكاملة:\n\n${finalSection.replace(/✨.*?:\s*/, '').trim()}`;
    } else {
      finalAnswer = `✨ الإجابة الكاملة:\n\n${fullResponse.replace(/\n\n/g, ' ').trim()}`;
    }
    
    // If no structured steps found, create default structure
    if (steps.length === 0) {
      steps.push(
        `🎯 تحليل السؤال: تم فهم السؤال وتحديد المتطلبات الأساسية للإجابة وفقاً للمنهاج الأردني.`,
        `🔍 فحص تفصيلي: تم مراجعة المصادر الموثوقة والمنهاج الأردني ذي الصلة بالموضوع.`,
        `💡 نصائح وإرشادات: يُنصح بالتركيز على الجوانب العملية والتطبيقية للموضوع وربطه بالحياة اليومية.`
      );
    }

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
        steps,
        finalAnswer: finalAnswer || "تم تحليل طلبك بنجاح. إليك المعلومات المطلوبة.",
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