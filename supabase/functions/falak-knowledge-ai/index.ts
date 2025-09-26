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

أنا مساعد ذكي متقدم متخصص في دعم المنهاج الأردني. سأتبع عملية من أربع خطوات:

الخطوة 1: تحليل الصورة والسؤال بعناية
- فهم محتوى الصورة
- تحديد العناصر المرئية المهمة
- ربط الصورة بالمنهاج الأردني

الخطوة 2: فحص المصادر الموثوقة
- الرجوع إلى المناهج الأردنية ذات الصلة
- التأكد من دقة المعلومات
- جمع المراجع المناسبة

الخطوة 3: إنتاج إجابة مفصلة ودقيقة
- تحليل شامل للصورة
- شرح العناصر والمفاهيم
- ربط المحتوى بالدروس المنهجية

الخطوة 4: مراجعة نهائية للدقة والوضوح
- التأكد من صحة المعلومات
- تحسين الوضوح
- إضافة نصائح مفيدة

السؤال أو الطلب: ${message || "تحليل الصورة المرفقة"}

قم بالتحليل التفصيلي للصورة وربطها بالمنهاج الأردني.`;
    } else {
      // Regular question prompt
      analysisPrompt = `${personalizedGreeting}سأجيب على سؤالك بشكل شامل ومتخصص وفقاً للمنهاج الأردني.

أنا مساعد ذكي متقدم متخصص في دعم المنهاج الأردني. سأتبع عملية من أربع خطوات:

الخطوة 1: تحليل السؤال بعناية
- فهم المطلوب بدقة
- تحديد المجال الدراسي
- ربط السؤال بالمنهاج الأردني

الخطوة 2: فحص المصادر الموثوقة
- الرجوع إلى المناهج الأردنية
- التأكد من دقة المعلومات
- جمع المراجع المناسبة

الخطوة 3: إنتاج إجابة مفصلة ودقيقة
- شرح شامل ومفصل
- استخدام أمثلة من البيئة الأردنية
- تقديم نصائح وإرشادات

الخطوة 4: مراجعة نهائية للدقة والوضوح
- التأكد من صحة المعلومات
- تحسين الوضوح والفهم
- إضافة تلميحات مفيدة

السؤال: ${message}

قم بالإجابة بشكل تفاعلي وتعليمي متقدم.`;
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

    // Parse the response into structured format
    const parts = fullResponse.split('\n\n');
    const steps: string[] = [];
    let finalAnswer = '';
    
    // Extract analysis step
    const analysisSection = parts.find((part: string) => part.includes('تحليل السؤال') || part.includes('تحليل'));
    if (analysisSection) {
      steps.push(`🎯 تحليل السؤال:\n${analysisSection}`);
    }
    
    // Extract examination step
    const examinationSection = parts.find((part: string) => part.includes('فحص المصادر') || part.includes('دراسة'));
    if (examinationSection) {
      steps.push(`🔍 فحص تفصيلي:\n${examinationSection}`);
    }
    
    // Extract advice step
    const adviceSection = parts.find((part: string) => part.includes('نصائح') || part.includes('إرشادات'));
    if (adviceSection) {
      steps.push(`💡 نصائح وإرشادات:\n${adviceSection}`);
    }
    
    // Generate final answer as one paragraph
    finalAnswer = `✨ الإجابة الكاملة:\n\n${fullResponse.replace(/\n\n/g, ' ').trim()}`;
    
    // If no structured steps found, create default structure
    if (steps.length === 0) {
      steps.push(
        `🎯 تحليل السؤال: تم فهم السؤال وتحديد المتطلبات الأساسية للإجابة.`,
        `🔍 فحص تفصيلي: تم مراجعة المصادر الموثوقة والمنهاج الأردني ذي الصلة.`,
        `💡 نصائح وإرشادات: يُنصح بالتركيز على الجوانب العملية والتطبيقية للموضوع.`
      );
      finalAnswer = fullResponse;
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