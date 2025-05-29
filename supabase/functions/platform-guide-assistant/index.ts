
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// قاعدة معرفة شاملة ومحدثة للمنصة
const platformInfo = `
🌟 **منصة التعليم العلمي الذكية المتطورة** 🌟
المطورة بعناية فائقة وتقنيات مستقبلية من قبل **محمود جوارنة**

## 🎓 **الأقسام الرئيسية والفرعية الشاملة:**

### 📚 **المواد العلمية الأساسية:**

#### 🧮 **الرياضيات** (/mathematics)
• آلة حاسبة متقدمة (/mathematics/calculator)
• رسم المخططات البيانية التفاعلية (/mathematics/graph-visualizer)
• معرض علماء الرياضيات (/mathematics/mathematicians)
• مساعد الرياضيات الذكي (/mathematics/ai-assistant)
• ألغاز الرياضيات المثيرة (/math-puzzles)

#### ⚗️ **الكيمياء** (/chemistry)
• الجدول الدوري الذكي التفاعلي
• محرك التفاعلات الكيميائية
• حاسبة المركبات والمعادلات
• مساعد الكيمياء الذكي المتخصص
• ألغاز الكيمياء التفاعلية

#### ⚛️ **الفيزياء** (/physics)
• المعامل الافتراضية التفاعلية
• محاكاة التجارب الفيزيائية
• مساعد الفيزياء الذكي
• علماء الفيزياء عبر التاريخ
• ألغاز الفيزياء المتقدمة

#### 🧬 **الأحياء** (/biology)
• جسم الإنسان التفاعلي ثلاثي الأبعاد
• موسوعة الأمراض الشاملة
• مساعد الأحياء الذكي
• علماء الأحياء المؤثرين
• ألغاز الأحياء التعليمية

### 📺 **الفيديوهات التعليمية المتخصصة** (/educational-videos)

**📋 هيكل الفيديوهات التعليمية:**
- صفحة الفيديوهات التعليمية الرئيسية (/educational-videos)
- تبويبات منفصلة لكل مادة: كيمياء، فيزياء، أحياء، رياضيات
- أقسام فرعية حسب الصفوف الدراسية
- وحدات ودروس متخصصة

**⚗️ فيديوهات الكيمياء:**
• **الصف التاسع** - أساسيات الكيمياء
  - الفصل الأول: التركيب الذري والجدول الدوري
  - الفصل الثاني: الروابط الكيميائية والمركبات
• **الصف العاشر** - كيمياء متوسطة
  - وحدة الأحماض والقواعد وتفاعلاتها
  - وحدة التفاعلات الكيميائية والحسابات
• **الصف الحادي عشر** - كيمياء متقدمة
  - الفصل الأول: الكيمياء الكهربائية والتأكسد والاختزال
  - وحدة أشكال الجزيئات ونظرية VSEPR
  - وحدة نشاط الفلزات والسلسلة الكهروكيميائية

**⚛️ فيديوهات الفيزياء:**
• **الصف التاسع** - فيزياء أساسية
  - الفصل الأول: الحركة والقوى
  - الفصل الثاني: الطاقة والشغل
• **الصف العاشر** - فيزياء متوسطة
  - وحدة الضوء والبصريات
  - وحدة الكهربائية والمغناطيسية
• **الصف الحادي عشر** - فيزياء متقدمة
  - الموجات والاهتزازات
  - الفيزياء الحديثة والذرية

**🧬 فيديوهات الأحياء:**
• **الصف الحادي عشر** - أحياء متقدمة
  - الفصل الأول: علم الوراثة ووراثة الخلايا
  - وحدة التطور والتنوع البيولوجي
  - النظم البيئية والبيئة

**🧮 فيديوهات الرياضيات:**
• جميع المراحل الدراسية
• الجبر والهندسة
• التفاضل والتكامل
• الإحصاء والاحتمالات

### 📖 **المكتبة والمحتوى:**
• المكتبة المرئية المصنفة (/visual-library)
• رفع ومشاركة المحتوى (/upload-image)
• المجلات العلمية المتخصصة (/scientific-journal)
• رفع المجلات الجديدة (/upload-journal)

### 🎮 **الألعاب التعليمية:**
• ألغاز متنوعة لجميع المواد (/subject-puzzles)
• ألغاز الرياضيات المتخصصة (/math-puzzles)
• نظام نقاط ومستويات تفاعلي

### 📅 **أدوات الدراسة الذكية:**
• منظم الدراسة المتقدم (/study-organization)
• مؤقت بومودورو للتركيز
• فيديوهات الاسترخاء والتأمل

### 💬 **التواصل والمجتمع:**
• غرف المحادثة التفاعلية (/chat-rooms)
• محادثات خاصة وجماعية
• مجتمع تعليمي نشط

### 👤 **الملف الشخصي:**
• تتبع التقدم والإنجازات (/profile)
• نظام النقاط والشارات
• إحصائيات التعلم المفصلة

### 📞 **التواصل والدعم:**
• صفحة التواصل والاستفسارات (/contact)
• دعم فني متخصص
• نظام الاقتراحات والتحسينات
`;

// دليل التنقل الدقيق والمتقدم
const advancedNavigationGuide = {
  // الصفحات الرئيسية
  'الصفحة الرئيسية': '/',
  'الرئيسية': '/',
  'البداية': '/',
  'home': '/',
  
  // الفيديوهات التعليمية - التنقل الدقيق
  'الفيديوهات التعليمية': '/educational-videos',
  'فيديوهات': '/educational-videos',
  'videos': '/educational-videos',
  'فيديوهات تعليمية': '/educational-videos',
  'دروس': '/educational-videos',
  'شروحات': '/educational-videos',
  
  // فيديوهات الكيمياء المتخصصة والدقيقة
  'فيديوهات الكيمياء': '/educational-videos',
  'كيمياء فيديوهات': '/educational-videos',
  'دروس الكيمياء': '/educational-videos',
  'شروحات الكيمياء': '/educational-videos',
  'فيديوهات كيمياء الصف التاسع': '/educational-videos',
  'كيمياء الصف التاسع': '/educational-videos',
  'كيمياء تاسع': '/educational-videos',
  'فيديوهات كيمياء الصف العاشر': '/educational-videos',
  'كيمياء الصف العاشر': '/educational-videos',
  'كيمياء عاشر': '/educational-videos',
  'فيديوهات كيمياء الصف الحادي عشر': '/educational-videos',
  'كيمياء الصف الحادي عشر': '/educational-videos',
  'كيمياء حادي عشر': '/educational-videos',
  
  // وحدات الكيمياء المتخصصة
  'الأحماض والقواعد': '/educational-videos',
  'وحدة الأحماض والقواعد': '/educational-videos',
  'أحماض وقواعد': '/educational-videos',
  'التفاعلات الكيميائية': '/educational-videos',
  'الكيمياء الكهربائية': '/educational-videos',
  'أشكال الجزيئات': '/educational-videos',
  'نشاط الفلزات': '/educational-videos',
  'التركيب الذري': '/educational-videos',
  'الروابط الكيميائية': '/educational-videos',
  'VSEPR': '/educational-videos',
  
  // فيديوهات الفيزياء
  'فيديوهات الفيزياء': '/educational-videos',
  'فيزياء فيديوهات': '/educational-videos',
  'دروس الفيزياء': '/educational-videos',
  'فيزياء الصف التاسع': '/educational-videos',
  'فيزياء تاسع': '/educational-videos',
  'فيزياء الصف العاشر': '/educational-videos',
  'فيزياء عاشر': '/educational-videos',
  'فيزياء الصف الحادي عشر': '/educational-videos',
  'فيزياء حادي عشر': '/educational-videos',
  
  // فيديوهات الأحياء
  'فيديوهات الأحياء': '/educational-videos',
  'أحياء فيديوهات': '/educational-videos',
  'دروس الأحياء': '/educational-videos',
  'أحياء الصف الحادي عشر': '/educational-videos',
  'أحياء حادي عشر': '/educational-videos',
  'وراثة الخلايا': '/educational-videos',
  'التطور والتنوع': '/educational-videos',
  'علم الوراثة': '/educational-videos',
  
  // فيديوهات الرياضيات
  'فيديوهات الرياضيات': '/educational-videos',
  'رياضيات فيديوهات': '/educational-videos',
  'دروس الرياضيات': '/educational-videos',
  
  // المواد العلمية الرئيسية
  'الرياضيات': '/mathematics',
  'منصة الرياضيات': '/mathematics',
  'الفيزياء': '/physics',
  'منصة الفيزياء': '/physics',
  'الكيمياء': '/chemistry',
  'منصة الكيمياء': '/chemistry',
  'الأحياء': '/biology',
  'منصة الأحياء': '/biology',
  
  // أدوات الرياضيات
  'آلة حاسبة': '/mathematics/calculator',
  'حاسبة': '/mathematics/calculator',
  'calculator': '/mathematics/calculator',
  'رسم المخططات': '/mathematics/graph-visualizer',
  'المخططات البيانية': '/mathematics/graph-visualizer',
  'علماء الرياضيات': '/mathematics/mathematicians',
  'مساعد الرياضيات': '/mathematics/ai-assistant',
  
  // الألغاز والألعاب
  'الألغاز التعليمية': '/subject-puzzles',
  'ألغاز': '/subject-puzzles',
  'ألغاز الرياضيات': '/math-puzzles',
  'تحديات رياضيات': '/math-puzzles',
  
  // المكتبة والمحتوى
  'المكتبة المرئية': '/visual-library',
  'مكتبة الصور': '/visual-library',
  'رفع الصور': '/upload-image',
  'المجلات العلمية': '/scientific-journal',
  'رفع المجلات': '/upload-journal',
  
  // أدوات الدراسة
  'منظم الدراسة': '/study-organization',
  'بومودورو': '/study-organization',
  'تنظيم الدراسة': '/study-organization',
  
  // التواصل والملف الشخصي
  'غرف المحادثة': '/chat-rooms',
  'المحادثة': '/chat-rooms',
  'الملف الشخصي': '/profile',
  'البروفايل': '/profile',
  'التواصل': '/contact',
  'اتصل بنا': '/contact'
};

// دالة ذكية متطورة للبحث عن الصفحة المطلوبة
function findAdvancedNavigationPath(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // البحث المباشر في دليل التنقل
  for (const [keyword, path] of Object.entries(advancedNavigationGuide)) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return path;
    }
  }
  
  // أنماط التنقل المتقدمة والدقيقة
  const advancedNavigationPatterns = [
    { patterns: ['انتقل', 'اذهب', 'افتح', 'خذني', 'وجهني', 'أريد', 'اريد'], keyword: 'navigation' },
    
    // الفيديوهات التعليمية - أنماط دقيقة ومتخصصة
    { patterns: ['فيديو', 'videos', 'شرح', 'درس', 'دروس', 'شروحات', 'تعليمية'], path: '/educational-videos' },
    
    // كيمياء - أنماط شاملة ودقيقة
    { patterns: ['فيديوهات الكيمياء', 'كيمياء فيديو', 'دروس كيمياء', 'شروحات كيمياء'], path: '/educational-videos' },
    { patterns: ['كيمياء الصف التاسع', 'كيمياء تاسع', 'تاسع كيمياء'], path: '/educational-videos' },
    { patterns: ['كيمياء الصف العاشر', 'كيمياء عاشر', 'عاشر كيمياء'], path: '/educational-videos' },
    { patterns: ['كيمياء الصف الحادي عشر', 'كيمياء حادي عشر', 'حادي عشر كيمياء'], path: '/educational-videos' },
    
    // وحدات كيمياء متخصصة
    { patterns: ['أحماض', 'قواعد', 'أحماض وقواعد', 'الأحماض والقواعد'], path: '/educational-videos' },
    { patterns: ['تفاعلات كيميائية', 'تفاعل', 'تفاعلات'], path: '/educational-videos' },
    { patterns: ['كيمياء كهربائية', 'كهروكيمياء', 'electrochemistry'], path: '/educational-videos' },
    { patterns: ['أشكال جزيئات', 'أشكال الجزيئات', 'molecular shapes', 'vsepr'], path: '/educational-videos' },
    { patterns: ['نشاط الفلزات', 'نشاط فلزات', 'metals activity'], path: '/educational-videos' },
    { patterns: ['تركيب ذري', 'التركيب الذري', 'atomic structure'], path: '/educational-videos' },
    { patterns: ['روابط كيميائية', 'الروابط الكيميائية', 'chemical bonds'], path: '/educational-videos' },
    
    // فيزياء - أنماط شاملة
    { patterns: ['فيديوهات الفيزياء', 'فيزياء فيديو', 'دروس فيزياء', 'شروحات فيزياء'], path: '/educational-videos' },
    { patterns: ['فيزياء الصف التاسع', 'فيزياء تاسع', 'تاسع فيزياء'], path: '/educational-videos' },
    { patterns: ['فيزياء الصف العاشر', 'فيزياء عاشر', 'عاشر فيزياء'], path: '/educational-videos' },
    { patterns: ['فيزياء الصف الحادي عشر', 'فيزياء حادي عشر', 'حادي عشر فيزياء'], path: '/educational-videos' },
    
    // أحياء - أنماط شاملة
    { patterns: ['فيديوهات الأحياء', 'أحياء فيديو', 'دروس أحياء', 'شروحات أحياء'], path: '/educational-videos' },
    { patterns: ['أحياء الصف الحادي عشر', 'أحياء حادي عشر', 'حادي عشر أحياء'], path: '/educational-videos' },
    { patterns: ['وراثة خلايا', 'وراثة الخلايا', 'علم الوراثة', 'genetics'], path: '/educational-videos' },
    { patterns: ['تطور', 'تنوع', 'التطور والتنوع', 'evolution'], path: '/educational-videos' },
    
    // رياضيات
    { patterns: ['فيديوهات الرياضيات', 'رياضيات فيديو', 'دروس رياضيات'], path: '/educational-videos' },
    
    // أدوات أخرى
    { patterns: ['حاسبة', 'calculator', 'حساب', 'آلة حاسبة'], path: '/mathematics/calculator' },
    { patterns: ['رسم', 'graph', 'مخطط', 'دالة'], path: '/mathematics/graph-visualizer' },
    { patterns: ['صور', 'images', 'مكتبة', 'مرئية'], path: '/visual-library' },
    { patterns: ['دردشة', 'chat', 'محادثة', 'غرف'], path: '/chat-rooms' },
    { patterns: ['ملف', 'profile', 'حساب', 'بروفايل'], path: '/profile' },
    { patterns: ['مجلة', 'journal', 'مقال', 'بحث'], path: '/scientific-journal' },
    { patterns: ['دراسة', 'study', 'تنظيم', 'بومودورو'], path: '/study-organization' },
    { patterns: ['لغز', 'puzzle', 'لعبة', 'تحدي'], path: '/subject-puzzles' },
    { patterns: ['ألغاز رياضيات', 'math puzzle'], path: '/math-puzzles' }
  ];
  
  for (const pattern of advancedNavigationPatterns) {
    if (pattern.patterns.some(p => lowerMessage.includes(p))) {
      if (pattern.path) return pattern.path;
      if (pattern.keyword === 'navigation') {
        for (const [keyword, path] of Object.entries(advancedNavigationGuide)) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            return path;
          }
        }
      }
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentPath, userName } = await req.json()
    
    const GEMINI_API_KEY = 'AIzaSyCK8DpbFQgxubul7qv5tLkerGwiRsvWUcw';
    
    // البحث المتقدم عن طلب التنقل
    const navigationPath = findAdvancedNavigationPath(message);
    
    // prompt محسن للحصول على إجابات دقيقة ومنسقة
    let systemPrompt = `أنت **مرشد سياحي ذكي ومتقدم** للمنصة التعليمية العلمية الرائدة التي ابتكرها وطورها **محمود جوارنة**.

${platformInfo}

**📍 الصفحة الحالية:** ${currentPath}
${userName ? `**👤 المستخدم:** ${userName}` : ''}

## 📋 **القواعد والمعايير المتقدمة:**

### ✨ **أسلوب الإجابة المتطور:**
• **استخدم تنسيق Markdown الاحترافي المتقدم**
• **قسم الإجابات إلى أقسام منطقية واضحة**
• **استخدم العناوين الهرمية والفقرات المنظمة**
• **أضف الأيقونات والرموز التعبيرية المناسبة**
• **اجعل المعلومات سهلة القراءة والفهم**

### 🎯 **المحتوى المتخصص:**
• **كن ودوداً، مفيداً، ومبدعاً في ردودك**
• **قدم معلومات شاملة ودقيقة ومحدثة**
• **استخدم أمثلة توضيحية عند الحاجة**
• **كن مشجعاً للتعلم والاستكشاف**
• **اذكر محمود جوارنة كمطور المنصة عند المناسبة**

### 🧭 **التنقل المتقدم والدقيق:**
• **عند طلب "فيديوهات الكيمياء" أو "فيديوهات كيمياء الصف العاشر" انقل للفيديوهات التعليمية وليس منصة الكيمياء**
• **انقل للفيديوهات التعليمية (/educational-videos) عند طلب أي فيديوهات تعليمية**
• **دعم التنقل الدقيق للأقسام الفرعية والوحدات المتخصصة**
• **لا تذكر الروابط في الإجابة، فقط أشر إلى التنقل الفوري**

### 📝 **تنسيق الإجابة المثالي:**
استخدم العناوين مع الأيقونات والفقرات المنظمة والمسافات المناسبة

**🔍 سؤال المستخدم:** ${message}`;

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
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 3072,
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

    let result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الإجابة على سؤالك';
    
    // إضافة رسالة التنقل المحسنة
    if (navigationPath) {
      result += `\n\n---\n\n🚀 **جاري نقلك إلى الصفحة المطلوبة فوراً...** ✨`;
    }

    return new Response(
      JSON.stringify({ 
        result,
        navigationPath,
        autoNavigate: !!navigationPath
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
