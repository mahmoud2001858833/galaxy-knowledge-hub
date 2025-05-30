
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
    const { message, currentPath, userName } = await req.json()
    
    if (!message || typeof message !== 'string') {
      throw new Error('رسالة غير صالحة')
    }
    
    const GEMINI_API_KEY = "AIzaSyDevT37iCVPLQAQ-dsenv1cDgbh86-Ftro"
    
    let responseText = ""
    let navigationPath = ""
    let autoNavigate = false
    
    const lowerMessage = message.toLowerCase()
    
    // معالجة طلبات التنقل المباشر والدقيق
    if (lowerMessage.includes('انتقل') || lowerMessage.includes('اذهب') || lowerMessage.includes('افتح')) {
      
      // تنقل دقيق للفيديوهات التعليمية حسب المادة
      if (lowerMessage.includes('فيديو') || lowerMessage.includes('تعليمي')) {
        if (lowerMessage.includes('كيمياء')) {
          if (lowerMessage.includes('تاسع') || lowerMessage.includes('9')) {
            navigationPath = "/chemistry?grade=9&section=videos"
          } else if (lowerMessage.includes('عاشر') || lowerMessage.includes('10')) {
            navigationPath = "/chemistry?grade=10&section=videos"
          } else if (lowerMessage.includes('حادي عشر') || lowerMessage.includes('11')) {
            navigationPath = "/chemistry?grade=11&section=videos"
          } else {
            navigationPath = "/chemistry"
          }
          autoNavigate = true
          responseText = `🧪 **جاري الانتقال إلى فيديوهات الكيمياء...**

✨ **تم التنقل بنجاح!**`
          
        } else if (lowerMessage.includes('فيزياء')) {
          if (lowerMessage.includes('تاسع') || lowerMessage.includes('9')) {
            navigationPath = "/physics?grade=9&section=videos"
          } else if (lowerMessage.includes('عاشر') || lowerMessage.includes('10')) {
            navigationPath = "/physics?grade=10&section=videos"
          } else if (lowerMessage.includes('حادي عشر') || lowerMessage.includes('11')) {
            navigationPath = "/physics?grade=11&section=videos"
          } else {
            navigationPath = "/physics"
          }
          autoNavigate = true
          responseText = `⚛️ **جاري الانتقال إلى فيديوهات الفيزياء...**

✨ **تم التنقل بنجاح!**`
          
        } else if (lowerMessage.includes('أحياء') || lowerMessage.includes('بيولوجي')) {
          if (lowerMessage.includes('حادي عشر') || lowerMessage.includes('11')) {
            navigationPath = "/biology?grade=11&section=videos"
          } else {
            navigationPath = "/biology"
          }
          autoNavigate = true
          responseText = `🧬 **جاري الانتقال إلى فيديوهات الأحياء...**

✨ **تم التنقل بنجاح!**`
          
        } else if (lowerMessage.includes('رياضيات')) {
          navigationPath = "/educational-videos?subject=math"
          autoNavigate = true
          responseText = `📊 **جاري الانتقال إلى فيديوهات الرياضيات...**

✨ **تم التنقل بنجاح!**`
        } else {
          navigationPath = "/educational-videos"
          autoNavigate = true
          responseText = `🎥 **جاري الانتقال إلى الفيديوهات التعليمية...**

✨ **تم التنقل بنجاح!**`
        }
        
      } else if (lowerMessage.includes('حاسب') || lowerMessage.includes('آلة')) {
        navigationPath = "/calculator"
        autoNavigate = true
        responseText = `🧮 **جاري الانتقال إلى آلة الحاسبة...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('مكتب') || lowerMessage.includes('مرئي')) {
        navigationPath = "/visual-library"
        autoNavigate = true
        responseText = `📸 **جاري الانتقال إلى المكتبة المرئية...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('إنجليزي') || lowerMessage.includes('انجليزي')) {
        navigationPath = "/english-language"
        autoNavigate = true
        responseText = `🇬🇧 **جاري الانتقال إلى منصة اللغة الإنجليزية...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('عرب') || lowerMessage.includes('لغة عربية')) {
        navigationPath = "/arabic-language"
        autoNavigate = true
        responseText = `📚 **جاري الانتقال إلى منصة اللغة العربية...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('كيمياء')) {
        navigationPath = "/chemistry"
        autoNavigate = true
        responseText = `🧪 **جاري الانتقال إلى منصة الكيمياء...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('فيزياء')) {
        navigationPath = "/physics"
        autoNavigate = true
        responseText = `⚛️ **جاري الانتقال إلى منصة الفيزياء...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('أحياء') || lowerMessage.includes('بيولوجي')) {
        navigationPath = "/biology"
        autoNavigate = true
        responseText = `🧬 **جاري الانتقال إلى منصة الأحياء...**

✨ **تم التنقل بنجاح!**`
        
      } else if (lowerMessage.includes('رياضيات')) {
        navigationPath = "/mathematics"
        autoNavigate = true
        responseText = `📊 **جاري الانتقال إلى منصة الرياضيات...**

✨ **تم التنقل بنجاح!**`
      }
    }
    
    // إذا لم يكن هناك تنقل محدد، استخدم Gemini للإجابة
    if (!responseText) {
      const prompt = `أنت مرشد ذكي لمنصة تعليمية شاملة. المنصة تحتوي على:

**المنصات الأدبية:**
- منصة اللغة العربية المحسنة (المساعد الذكي، شعراء العرب، علماء اللغة، مساعد الإعراب)
- منصة اللغة الإنجليزية المتطورة (المساعد الذكي الإنجليزي، المترجم الذكي مع ترجمة الصور، مولد النصوص)

**المنصات العلمية:**
- الفيزياء (حسابات، ألغاز، علماء، مساعد ذكي، فيديوهات)
- الكيمياء (الجدول الدوري، حسابات، ألغاز، علماء، فيديوهات)
- الأحياء (جسم الإنسان، حسابات، ألغاز، علماء، موسوعة الأمراض، فيديوهات)
- الرياضيات (آلة حاسبة متقدمة، رسوم بيانية، ألغاز، علماء، فيديوهات)

**أقسام أخرى:**
- المكتبة المرئية (صور تعليمية)
- المجلة العلمية (مقالات وأبحاث)
- الفيديوهات التعليمية
- غرف الدردشة
- تنظيم الدراسة

السؤال: ${message}

قدم إجابة مفيدة وودودة وأرشد المستخدم للقسم المناسب. استخدم العربية دائماً.`

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
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من فهم السؤال. يمكنك السؤال عن أي قسم في المنصة وسأوجهك إليه!"
    }

    return new Response(
      JSON.stringify({ 
        result: responseText,
        navigationPath: navigationPath || "",
        autoNavigate: autoNavigate
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        result: 'عذراً، حدث خطأ في معالجة الطلب. يرجى المحاولة مرة أخرى.',
        navigationPath: "",
        autoNavigate: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
