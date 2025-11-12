import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const platformRoutes = {
  // العلوم
  'فيزياء': '/physics',
  'كيمياء': '/chemistry',
  'أحياء': '/biology',
  'رياضيات': '/mathematics',
  'جدول دوري': '/chemistry',
  'معادلات': '/mathematics',
  'حسابات فيزيائية': '/physics',
  
  // اللغات
  'لغة عربية': '/arabic-language',
  'لغة انجليزية': '/english-language',
  'انجليزي': '/english-language',
  'عربي': '/arabic-language',
  'قواعد': '/arabic-language',
  'نحو': '/arabic-language',
  'صرف': '/arabic-language',
  'grammar': '/english-language',
  
  // BTEC
  'بتك': '/btec',
  'btec': '/btec',
  'برمجة': '/btec/it/programming',
  'تكنولوجيا معلومات': '/btec',
  'كود': '/btec/it/code-fixer',
  
  // الفن
  'فن': '/art-design',
  'رسم': '/art-design',
  'تصميم': '/art-design',
  
  // البيئة
  'بيئة': '/environmental-sustainability',
  'استدامة': '/environmental-sustainability',
  'كربون': '/carbon-calculator',
  
  // الإدارة
  'جسر التواصل': '/communication-bridge',
  'مشرفين': '/admin-teachers',
  'معلمين': '/admin-teachers',
  'أولياء أمور': '/communication-bridge',
  
  // الذكاء الاصطناعي
  'مساعد ذكي': '/falak-knowledge-ai',
  'ذكاء اصطناعي': '/ai-assistant-section',
  'فلك': '/falak-knowledge-ai',
  'مرشد نفسي': '/psychological-guide',
  
  // أخرى
  'ألغاز': '/subject-puzzles',
  'مجلة علمية': '/scientific-journal',
  'مكتبة بصرية': '/visual-library',
  'فيديوهات': '/educational-videos',
  'محاكاة': '/scientific-simulations',
  'دروس مسجلة': '/educational-videos',
  'غرف دردشة': '/chat-rooms',
  'دردشة': '/class-chat',
  'ملفي': '/profile',
  'مركز التحكم': '/control-center',
  'تواصل معنا': '/contact',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userName = 'صديقي', allMessages = [] } = await req.json();

    // Build conversation history
    const conversationHistory = allMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `أنت مرشد ذكي لمنصة "ذروة العلم" التعليمية. مهمتك مساعدة ${userName} في التنقل واستخدام المنصة.

## أقسام المنصة الرئيسية:

### 1. قسم الإدارة
- **جسر التواصل**: للتواصل بين المعلمين وأولياء الأمور، رفع الواجبات والملاحظات
- **المشرفين والمعلمين**: إدارة الوصول والصلاحيات

### 2. قسم التعليم
- **المنصات العلمية**: 
  - الفيزياء: حسابات، ألغاز، علماء، مساعد ذكي، فيديوهات تعليمية
  - الكيمياء: جدول دوري تفاعلي، حسابات، ألغاز، علماء، مساعد ذكي
  - الأحياء: جسم الإنسان التفاعلي، حسابات، ألغاز، علماء، مساعد ذكي، موسوعة الأمراض
  - الرياضيات: آلة حاسبة متقدمة، رسم بياني، مساعد ذكي، ألغاز، علماء الرياضيات

- **المنصات الأدبية**:
  - اللغة العربية: قواعد النحو، الصرف، العروض، الشعراء، العلماء، مساعد كتابة المقالات، بنك الأسئلة
  - اللغة الإنجليزية: قواعد، مساعد كتابة، مترجم ذكي، مساعد النطق، بنك الأسئلة، علماء اللغة

- **الاستدامة البيئية**: حاسبة البصمة الكربونية، مشاريع بيئية مدرسية ومنزلية

- **BTEC**: 
  - تكنولوجيا المعلومات: البرمجة، مصلح الأكواد، نصائح التطوير، مشاريع الطلبة
  - الفن والتصميم: تحديات فنية، معرض الفنانين، تقييم الأعمال الفنية

### 3. قسم المساعد الذكي
- **فلك - المساعد الذكي الشامل**: يجيب على جميع الأسئلة في كل المواد
- **المرشد النفسي**: استشارات نفسية وإرشاد

### ميزات إضافية:
- **المجلة العلمية**: رفع وعرض الأبحاث العلمية
- **المكتبة البصرية**: صور تعليمية لجميع المواد
- **الألغاز التعليمية**: ألغاز في جميع المواد مع لوحة المتصدرين
- **الفيديوهات التعليمية**: دروس مسجلة لجميع المواد
- **المحاكاة العلمية**: محاكاة ذرة، إشعاع الجسم الأسود
- **غرف الدردشة**: دردشة جماعية وخاصة
- **مركز التحكم**: لإدارة المنصة (للمشرفين فقط)

## إرشادات الإجابة:
1. استخدم أسلوباً ودوداً ومشجعاً
2. اشرح الميزات بوضوح وبساطة
3. إذا طلب المستخدم الانتقال لقسم معين، أخبره أنك ستوجهه وقدم مسار التنقل
4. إذا لم تفهم السؤال، اطلب التوضيح
5. قدم نصائح عملية لاستخدام المنصة بفعالية
6. تذكر السياق من المحادثات السابقة

أجب باللغة العربية دائماً بأسلوب محترف ومفيد.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }]
            },
            ...conversationHistory,
            {
              role: 'user',
              parts: [{ text: question }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from AI');
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   'عذراً، لم أتمكن من فهم سؤالك. هل يمكنك إعادة صياغته؟';

    // Detect navigation intent
    let navigationPath = null;
    const lowerQuestion = question.toLowerCase();
    
    for (const [keyword, path] of Object.entries(platformRoutes)) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        navigationPath = path;
        break;
      }
    }

    return new Response(
      JSON.stringify({ answer, navigationPath }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in platform-guide-assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        answer: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
