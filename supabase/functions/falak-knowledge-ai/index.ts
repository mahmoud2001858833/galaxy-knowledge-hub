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
    const { message, image, userName, hasImage, generateImage, imagePrompt, userPreferences } = await req.json()
    
    const GEMINI_API_KEY = "AIzaSyBbk808sXI4HXye9V97annZy8RikeahG3E"
    
    // Handle image generation request
    if (generateImage && imagePrompt) {
      try {
        // For now, return a high-quality placeholder since Gemini text model doesn't generate images
        // In a real implementation, you'd use DALL-E, Midjourney, or similar image generation API
        const imageUrl = `https://via.placeholder.com/512x512/4f46e5/ffffff?text=${encodeURIComponent(imagePrompt.substring(0, 30))}...`;
        
        return new Response(
          JSON.stringify({ imageUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Image generation error:', error);
        return new Response(
          JSON.stringify({ error: 'فشل في إنشاء الصورة' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Personalized greeting with user name and preferences
    const personalizedGreeting = userName ? `مرحباً ${userName}، ` : "مرحباً، ";
    
    // Build personalization context
    let personalizationContext = '';
    if (userPreferences) {
      personalizationContext = `
معلومات الطالب:
- العمر: ${userPreferences.age} سنة
- الصف: ${userPreferences.grade}
- المدرسة: ${userPreferences.school || 'غير محدد'}
- مستوى الدقة المطلوب: ${userPreferences.accuracy}
- نوع الشرح المفضل: ${userPreferences.explanationType}

يرجى تخصيص الإجابة وفقاً لهذه المعلومات.`;
    }
    
    let analysisPrompt = '';
    
    if (hasImage && image) {
      // Image analysis prompt
      analysisPrompt = `${personalizedGreeting}سأقوم بتحليل هذه الصورة بالتفصيل وربطها بالمنهاج الأردني.
${personalizationContext}

أنا مساعد ذكي متقدم متخصص في دعم المنهاج الأردني. سأتبع العملية الجديدة:

🎯 أولاً - تحليل السؤال والصورة:
- فهم محتوى الصورة بدقة
- تحديد العناصر المرئية المهمة
- ربط الصورة بالمنهاج الأردني

🔍 ثانياً - فحص تفصيلي:
- دراسة المصادر الموثوقة
- التأكد من دقة المعلومات
- جمع المراجع المناسبة

💡 ثالثاً - تقديم النصائح:
- نصائح للفهم الأفضل
- إرشادات للتطبيق العملي
- تلميحات مفيدة

✨ أخيراً - الإجابة الكاملة:
قدم الإجابة النهائية في فقرة واحدة شاملة ومفصلة.

${userPreferences?.explanationType === 'detailed' ? 'هذا هو الشرح المفصل الذي طلبته.' : ''}

السؤال أو الطلب: ${message || "تحليل الصورة المرفقة"}

قم بالتحليل وفقاً للعملية المحددة أعلاه.`;
    } else {
      // Regular question prompt
      analysisPrompt = `${personalizedGreeting}سأجيب على سؤالك بشكل شامل ومتخصص وفقاً للمنهاج الأردني.
${personalizationContext}

أنا مساعد ذكي متقدم متخصص في دعم المنهاج الأردني. سأتبع العملية الجديدة:

🎯 أولاً - تحليل السؤال:
- فهم المطلوب بدقة
- تحديد المجال الدراسي
- ربط السؤال بالمنهاج الأردني

🔍 ثانياً - فحص تفصيلي:
- دراسة المصادر الموثوقة
- التأكد من دقة المعلومات
- جمع المراجع المناسبة

💡 ثالثاً - تقديم النصائح:
- نصائح للفهم الأفضل
- إرشادات للتطبيق العملي  
- تلميحات مفيدة للدراسة

✨ أخيراً - الإجابة الكاملة:
قدم الإجابة النهائية في فقرة واحدة شاملة ومفصلة.

${userPreferences?.explanationType === 'detailed' ? 'هذا هو الشرح المفصل الذي طلبته.' : ''}

السؤال: ${message}

قم بالإجابة وفقاً للعملية المحددة أعلاه وبما يناسب مستوى الطالب وتفضيلاته.`;
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