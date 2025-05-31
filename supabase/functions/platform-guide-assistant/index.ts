
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
    
    // معالجة طلبات التنقل المباشر والفوري
    if (lowerMessage.includes('انتقل') || lowerMessage.includes('اذهب') || lowerMessage.includes('افتح') || lowerMessage.includes('خذني') || lowerMessage.includes('روح')) {
      
      // تنقل فوري للفيديوهات التعليمية حسب المادة والصف
      if (lowerMessage.includes('فيديو') || lowerMessage.includes('تعليمي') || lowerMessage.includes('فيدو')) {
        if (lowerMessage.includes('كيمياء')) {
          navigationPath = "/educational-videos?subject=chemistry"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى فيديوهات الكيمياء بنجاح!** 🧪`
          
        } else if (lowerMessage.includes('فيزياء')) {
          navigationPath = "/educational-videos?subject=physics"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى فيديوهات الفيزياء بنجاح!** ⚛️`
          
        } else if (lowerMessage.includes('أحياء') || lowerMessage.includes('بيولوجي')) {
          navigationPath = "/educational-videos?subject=biology"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى فيديوهات الأحياء بنجاح!** 🧬`
          
        } else if (lowerMessage.includes('رياضيات')) {
          navigationPath = "/educational-videos?subject=math"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى فيديوهات الرياضيات بنجاح!** 📊`
        } else {
          navigationPath = "/educational-videos"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى الفيديوهات التعليمية بنجاح!** 🎥`
        }
        
      } else if (lowerMessage.includes('محاكاة') || lowerMessage.includes('تجارب') || lowerMessage.includes('محاكي') || lowerMessage.includes('علمية')) {
        if (lowerMessage.includes('اشعاع') || lowerMessage.includes('جسم اسود') || lowerMessage.includes('بلانك') || lowerMessage.includes('فين') || lowerMessage.includes('اسود')) {
          navigationPath = "/simulation/blackbody-radiation"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى محاكاة إشعاع الجسم الأسود المتطورة بنجاح!** ⚛️🌟 
          
المحاكاة تتضمن:
🔬 الطيف المرئي الملون
🔍 أدوات تكبير وتصغير متطورة  
🧮 حاسبات فيزيائية للطول الموجي والتردد
🤖 مساعد ذكي للفيزياء
📊 رسوم بيانية تفاعلية متقدمة`
        } else {
          navigationPath = "/scientific-simulations"
          autoNavigate = true
          responseText = `✅ **تم الانتقال إلى محاكاة التجارب العلمية بنجاح!** 🔬⚗️`
        }
        
      } else if (lowerMessage.includes('اشعاع') || lowerMessage.includes('جسم اسود') || lowerMessage.includes('بلانك') || lowerMessage.includes('فين') || lowerMessage.includes('اسود') || lowerMessage.includes('طيف')) {
        navigationPath = "/simulation/blackbody-radiation"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى محاكاة إشعاع الجسم الأسود المتطورة بنجاح!** ⚛️🌟

هذه المحاكاة المتطورة تشمل:
🌈 **الطيف المرئي الملون** - شاهد الألوان الحقيقية للطيف
🔍 **أدوات التكبير والتصغير** - تحليل دقيق للمنحنيات  
🧮 **حاسبات فيزيائية متقدمة** - حساب التردد والطول الموجي والطاقة
🤖 **مساعد ذكي** - للإجابة على جميع أسئلتك الفيزيائية
📊 **رسوم بيانية تفاعلية** - مع شبكة ومحاور واضحة
⚙️ **إعدادات مسبقة** - من الشمس إلى جسم الإنسان
🎛️ **لوحة تحكم متطورة** - تحكم كامل في جميع المعاملات`
        
      } else if (lowerMessage.includes('حاسب') || lowerMessage.includes('آلة') || lowerMessage.includes('كالكوليتر')) {
        navigationPath = "/mathematics/calculator"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى آلة الحاسبة المتقدمة بنجاح!** 🧮`
        
      } else if (lowerMessage.includes('مكتب') || lowerMessage.includes('مرئي') || lowerMessage.includes('صور')) {
        navigationPath = "/visual-library"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى المكتبة المرئية بنجاح!** 📸`
        
      } else if (lowerMessage.includes('إنجليزي') || lowerMessage.includes('انجليزي') || lowerMessage.includes('english')) {
        navigationPath = "/english-language"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى منصة اللغة الإنجليزية بنجاح!** 🇬🇧`
        
      } else if (lowerMessage.includes('عرب') || lowerMessage.includes('لغة عربية') || lowerMessage.includes('arabic')) {
        navigationPath = "/arabic-language"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى منصة اللغة العربية بنجاح!** 📚`
        
      } else if (lowerMessage.includes('كيمياء')) {
        navigationPath = "/chemistry"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى منصة الكيمياء بنجاح!** 🧪`
        
      } else if (lowerMessage.includes('فيزياء')) {
        navigationPath = "/physics"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى منصة الفيزياء بنجاح!** ⚛️`
        
      } else if (lowerMessage.includes('أحياء') || lowerMessage.includes('بيولوجي')) {
        navigationPath = "/biology"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى منصة الأحياء بنجاح!** 🧬`
        
      } else if (lowerMessage.includes('رياضيات')) {
        navigationPath = "/mathematics"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى منصة الرياضيات بنجاح!** 📊`
        
      } else if (lowerMessage.includes('أدبي') || lowerMessage.includes('لغات')) {
        navigationPath = "/literary-platforms"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى المنصات الأدبية بنجاح!** 📖`
        
      } else if (lowerMessage.includes('علمي') || lowerMessage.includes('علوم')) {
        navigationPath = "/scientific-platforms"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى المنصات العلمية بنجاح!** 🔬`
        
      } else if (lowerMessage.includes('محادث') || lowerMessage.includes('دردش')) {
        navigationPath = "/chat-rooms"
        autoNavigate = true
        responseText = `✅ **تم الانتقال إلى غرف المحادثة بنجاح!** 💬`
      }
    }
    
    // إذا لم يكن هناك تنقل محدد، استخدم Gemini للإجابة
    if (!responseText) {
      const prompt = `أنت مرشد ذكي لمنصة تعليمية شاملة. عندما يطلب المستخدم الانتقال إلى أي قسم، اشرح له المحتوى وقدم إجابة مفيدة. المنصة تحتوي على:

**المنصات الأدبية:**
- منصة اللغة العربية المحسنة (المساعد الذكي، شعراء العرب، علماء اللغة، مساعد الإعراب)
- منصة اللغة الإنجليزية المتطورة (المساعد الذكي الإنجليزي، المترجم الذكي، مولد النصوص)

**المنصات العلمية:**
- الفيزياء (حسابات، ألغاز، علماء، مساعد ذكي، فيديوهات)
- الكيمياء (الجدول الدوري، حسابات، ألغاز، علماء، فيديوهات)
- الأحياء (جسم الإنسان، حسابات، ألغاز، علماء، موسوعة الأمراض، فيديوهات)
- الرياضيات (آلة حاسبة متقدمة، رسوم بيانية، ألغاز، علماء، فيديوهات)

**محاكاة التجارب العلمية المتطورة:**
- محاكاة إشعاع الجسم الأسود المتقدمة (مع الطيف المرئي، أدوات التكبير، حاسبات فيزيائية، مساعد ذكي)

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
