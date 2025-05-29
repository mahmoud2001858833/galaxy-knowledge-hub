
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// المعلومات الشاملة عن المنصة
const platformInfo = `
أهلاً وسهلاً! أنا مرشدك السياحي في منصة التعليم العلمي التي ابتكرها وطورها محمود جوارنة.

هذه المنصة هي منصة تعليمية شاملة تضم:

📚 **المواد العلمية:**
- الفيزياء: تجارب تفاعلية، معامل افتراضية، علماء الفيزياء، مساعد ذكي متخصص، ألغاز فيزيائية
- الكيمياء: الجدول الدوري الذكي، التفاعلات الكيميائية، الحسابات الكيميائية، علماء الكيمياء، مساعد ذكي متخصص
- الأحياء: جسم الإنسان التفاعلي، موسوعة الأمراض، علماء الأحياء، مساعد ذكي متخصص، ألغاز بيولوجية
- الرياضيات: آلة حاسبة متقدمة، رسم المخططات البيانية، علماء الرياضيات، مساعد ذكي متخصص

🎮 **الألغاز التعليمية:** ألغاز في جميع المواد العلمية مع نظام نقاط ومستويات

📖 **الفيديوهات التعليمية:** مكتبة ضخمة من الفيديوهات لجميع المواد والصفوف الدراسية

🖼️ **المكتبة المرئية:** مجموعة كبيرة من الصور التعليمية مع إمكانية رفع صور جديدة

📝 **المجلات العلمية:** مجموعة من المجلات العلمية مع إمكانية رفع مجلات جديدة

📅 **منظم الدراسة:** 
- جدولة المهام والواجبات
- مؤقت بومودورو للدراسة المنتجة
- فيديوهات الاسترخاء والتأمل

💬 **غرف المحادثة:**
- غرف محادثة عامة للمواد المختلفة
- محادثات خاصة مع جهات الاتصال

👤 **الملف الشخصي:** تتبع النقاط والمستوى والإنجازات

جميع هذه الميزات تم تطويرها بعناية من قبل محمود جوارنة لتوفير تجربة تعليمية متكاملة وممتعة.
`;

// دليل التنقل للصفحات
const navigationGuide = {
  'الصفحة الرئيسية': '/',
  'الفيزياء': '/physics',
  'الكيمياء': '/chemistry', 
  'الأحياء': '/biology',
  'الرياضيات': '/mathematics',
  'آلة حاسبة': '/mathematics/calculator',
  'رسم المخططات': '/mathematics/graph-visualizer',
  'علماء الرياضيات': '/mathematics/mathematicians',
  'مساعد الرياضيات': '/mathematics/ai-assistant',
  'الألغاز التعليمية': '/subject-puzzles',
  'ألغاز الرياضيات': '/math-puzzles',
  'المكتبة المرئية': '/visual-library',
  'رفع الصور': '/upload-image',
  'المجلات العلمية': '/scientific-journal',
  'رفع المجلات': '/upload-journal',
  'منظم الدراسة': '/study-organization',
  'غرف المحادثة': '/chat-rooms',
  'الفيديوهات التعليمية': '/educational-videos',
  'الملف الشخصي': '/profile',
  'التواصل': '/contact'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentPath, userName } = await req.json()
    
    const GEMINI_API_KEY = 'AIzaSyCK8DpbFQgxubul7qv5tLkerGwiRsvWUcw';
    
    // تحضير الرسالة للمساعد
    let systemPrompt = `أنت مرشد سياحي ذكي ومفيد للمنصة التعليمية التي طورها محمود جوارنة. 

${platformInfo}

أنت الآن تتحدث مع المستخدم من الصفحة: ${currentPath}

قواعد مهمة:
1. كن ودوداً ومفيداً ومبدعاً في ردودك
2. استخدم اللغة العربية الواضحة
3. اذكر محمود جوارنة كمطور المنصة عند الحاجة
4. إذا طلب المستخدم الانتقال لصفحة معينة، اعطه رابط الصفحة من دليل التنقل
5. قدم معلومات شاملة عن أي جزء في المنصة
6. كن مشجعاً للتعلم والاستكشاف
7. استخدم الإيموجي المناسبة لجعل المحادثة ممتعة

دليل التنقل:
${Object.entries(navigationGuide).map(([name, path]) => `${name}: ${path}`).join('\n')}

اجب على سؤال المستخدم بطريقة مفيدة ومبدعة.`;

    if (userName) {
      systemPrompt += `\n\nاسم المستخدم: ${userName}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nسؤال المستخدم: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الإجابة على سؤالك';
    
    // البحث عن روابط التنقل في الرد
    let navigationPath = null;
    Object.entries(navigationGuide).forEach(([name, path]) => {
      if (result.includes(path)) {
        navigationPath = path;
      }
    });

    return new Response(
      JSON.stringify({ 
        result,
        navigationPath 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in platform-guide-assistant:', error);
    
    return new Response(
      JSON.stringify({ error: `خطأ في معالجة الطلب: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
