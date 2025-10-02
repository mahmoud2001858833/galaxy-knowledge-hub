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
    const personalizedGreeting = userName ? `مرحباً ${userName}! ` : "أهلاً بك! ";
    
    let analysisPrompt = '';
    
    if (hasImage && image) {
      // Image analysis prompt
      analysisPrompt = `${personalizedGreeting}أنا مساعدك الذكي المتخصص في المنهاج الأردني. سأحلل الصورة وأقدم لك إجابة شاملة ومفصلة.

السؤال/الطلب: ${message || "تحليل الصورة المرفقة"}

قدم إجابة كاملة وشاملة بالتفصيل التالي:

الخطوة 1 - 🎯 تحليل دقيق للصورة:
- صف كل عنصر مرئي في الصورة بالتفصيل
- حدد الموضوع الرئيسي والمفاهيم المتعلقة به
- اربط المحتوى بالمنهاج الأردني والصف المناسب
- اشرح السبب والأهمية لكل نقطة تذكرها

الخطوة 2 - 🔍 شرح تفصيلي كامل:
- اشرح المفاهيم الموجودة في الصورة بتفاصيل علمية دقيقة
- قدم القوانين والمبادئ المتعلقة مع شرح مفصل لكل منها
- أضف أمثلة توضيحية وتطبيقات عملية
- فسر كل خطوة بشكل واضح ومفصل

الخطوة 3 - 💡 نصائح وإرشادات عملية:
- قدم نصائح محددة للاستفادة من هذه المعلومات
- اشرح كيفية تطبيق المفاهيم في الامتحانات
- أضف تلميحات للحفظ والفهم الأفضل
- قدم إرشادات للممارسة والتدريب

الخطوة 4 - ✨ الإجابة الكاملة النهائية:
اكتب فقرة شاملة ومفصلة (على الأقل 150 كلمة) تلخص كل شيء مع التفسير الكامل والمبررات العلمية والشرح الوافي.

تذكر: يجب أن تكون كل خطوة مفصلة جداً مع شرح كامل وليس مجرد نقاط.`;
    } else {
      // Regular question prompt
      analysisPrompt = `${personalizedGreeting}أنا مساعدك الذكي المتخصص في المنهاج الأردني. سأجيب على سؤالك بشكل شامل ومفصل.

السؤال: ${message}

قدم إجابة كاملة وشاملة بالتفصيل التالي:

الخطوة 1 - 🎯 تحليل السؤال:
- حدد المطلوب من السؤال بدقة
- اربط السؤال بالمنهاج الأردني والوحدة المناسبة
- اشرح أهمية هذا الموضوع وتطبيقاته
- وضح العلاقة بين المفاهيم المختلفة

الخطوة 2 - 🔍 شرح تفصيلي كامل:
- قدم شرحاً علمياً دقيقاً للموضوع
- اذكر القوانين والمبادئ مع شرح كل منها
- أضف أمثلة عملية وتطبيقات واقعية
- فسر كل نقطة بالتفصيل مع الأسباب والمبررات

الخطوة 3 - 💡 نصائح وإرشادات عملية:
- قدم نصائح محددة للفهم والحفظ
- اشرح كيفية استخدام المعلومات في الامتحانات
- أضف تلميحات وخدع للتذكر الأفضل
- قدم طرق للممارسة والتدريب الفعال

الخطوة 4 - ✨ الإجابة النهائية الشاملة:
اكتب فقرة شاملة ومفصلة (على الأقل 150 كلمة) تتضمن جميع المعلومات المطلوبة مع التفسير الكامل والمبررات العلمية والشرح الوافي لكل جزء.

تذكر: يجب أن تكون كل خطوة مفصلة جداً مع شرح كامل وليس مجرد نقاط.`;
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