
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// معلومات شاملة ومحدثة عن المنصة مع جميع التحديثات الحديثة
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

### 📺 **المكتبة التعليمية الشاملة:**

#### **الفيديوهات التعليمية** (/educational-videos)
**فيزياء:**
• الصف التاسع - الفصل الأول والثاني
• الصف العاشر - جميع الوحدات
• الصف الحادي عشر - فيزياء متقدمة

**كيمياء:**
• الصف التاسع - أساسيات الكيمياء (/educational-videos → تبويب كيمياء → الصف التاسع)
  - الفصل الأول: التركيب الذري
  - الفصل الثاني: الروابط الكيميائية
• الصف العاشر - كيمياء متوسطة
  - وحدة الأحماض والقواعد
  - وحدة التفاعلات الكيميائية
• الصف الحادي عشر - كيمياء متقدمة (/educational-videos → تبويب كيمياء → الصف الحادي عشر)
  - الفصل الأول: الكيمياء الكهربائية
  - وحدة أشكال الجزيئات
  - وحدة نشاط الفلزات

**أحياء:**
• الصف الحادي عشر - الفصل الأول (/educational-videos → تبويب أحياء → الصف الحادي عشر)
  - وحدة وراثة الخلايا
  - وحدة التطور والتنوع

**رياضيات:**
• جميع المراحل الدراسية
• الرياضيات التطبيقية
• الإحصاء والاحتمالات

#### **المكتبة المرئية** (/visual-library)
• مكتبة الصور العلمية المصنفة حسب المواد
• رفع ومشاركة المحتوى (/upload-image)
• صور تفاعلية عالية الدقة

### 📖 **المجلات العلمية:**
• مجموعة نادرة من المجلات المتخصصة (/scientific-journal)
• إمكانية رفع مجلات جديدة (/upload-journal)
• أرشيف المجلات العلمية العربية والعالمية

### 🎮 **الألعاب التعليمية:**
• ألغاز متنوعة لجميع المواد (/subject-puzzles)
• ألغاز الرياضيات المتخصصة (/math-puzzles)
• نظام نقاط ومستويات تفاعلي
• تحديات تعليمية ممتعة لكل مادة

### 📅 **أدوات الدراسة الذكية:**
• منظم الدراسة المتقدم (/study-organization)
• مؤقت بومودورو للتركيز
• فيديوهات الاسترخاء والتأمل
• جدولة المهام الدراسية

### 💬 **التواصل والمجتمع:**
• غرف المحادثة التفاعلية (/chat-rooms)
• محادثات خاصة وجماعية
• مجتمع تعليمي نشط
• مناقشات علمية متخصصة

### 👤 **الملف الشخصي والإحصائيات:**
• تتبع التقدم والإنجازات (/profile)
• نظام النقاط والشارات
• إحصائيات التعلم المفصلة
• سجل الأنشطة والإنجازات

### 📞 **التواصل والدعم:**
• صفحة التواصل والاستفسارات (/contact)
• دعم فني متخصص 24/7
• نظام الاقتراحات والتحسينات

### 🆕 **التحديثات الحديثة للمنصة:**
• تطوير واجهات المستخدم بتقنيات مستقبلية
• تحسين خوارزميات الذكاء الاصطناعي
• إضافة محتوى تعليمي جديد باستمرار
• تطوير أدوات تفاعلية متقدمة
• تحسين أداء النظام والاستجابة
• إضافة ميزات التعلم التكيفي
• تطوير نظام التقييم الذكي
`;

// دليل التنقل المتقدم والشامل
const advancedNavigationGuide = {
  // الصفحات الرئيسية
  'الصفحة الرئيسية': '/',
  'الرئيسية': '/',
  'البداية': '/',
  'home': '/',
  
  // المواد العلمية الرئيسية
  'الرياضيات': '/mathematics',
  'mathematics': '/mathematics',
  'رياضيات': '/mathematics',
  'منصة الرياضيات': '/mathematics',
  'قسم الرياضيات': '/mathematics',
  
  'الفيزياء': '/physics',
  'physics': '/physics',
  'فيزياء': '/physics',
  'منصة الفيزياء': '/physics',
  'قسم الفيزياء': '/physics',
  
  'الكيمياء': '/chemistry',
  'chemistry': '/chemistry',
  'كيمياء': '/chemistry',
  'منصة الكيمياء': '/chemistry',
  'قسم الكيمياء': '/chemistry',
  
  'الأحياء': '/biology',
  'biology': '/biology',
  'أحياء': '/biology',
  'منصة الأحياء': '/biology',
  'قسم الأحياء': '/biology',
  
  // أدوات الرياضيات المتخصصة
  'آلة حاسبة': '/mathematics/calculator',
  'حاسبة': '/mathematics/calculator',
  'calculator': '/mathematics/calculator',
  'الحاسبة': '/mathematics/calculator',
  'حاسبة الرياضيات': '/mathematics/calculator',
  
  'رسم المخططات': '/mathematics/graph-visualizer',
  'المخططات البيانية': '/mathematics/graph-visualizer',
  'الرسم البياني': '/mathematics/graph-visualizer',
  'graphs': '/mathematics/graph-visualizer',
  'رسم الدوال': '/mathematics/graph-visualizer',
  
  'علماء الرياضيات': '/mathematics/mathematicians',
  'mathematicians': '/mathematics/mathematicians',
  'العلماء': '/mathematics/mathematicians',
  'علماء رياضيات': '/mathematics/mathematicians',
  
  'مساعد الرياضيات': '/mathematics/ai-assistant',
  'مساعد رياضيات': '/mathematics/ai-assistant',
  'AI رياضيات': '/mathematics/ai-assistant',
  
  // الفيديوهات التعليمية - المسارات الفرعية المتقدمة
  'الفيديوهات التعليمية': '/educational-videos',
  'فيديوهات': '/educational-videos',
  'videos': '/educational-videos',
  'الفيديوهات': '/educational-videos',
  'فيديوهات تعليمية': '/educational-videos',
  
  // فيديوهات الكيمياء المتخصصة
  'فيديوهات الكيمياء': '/educational-videos',
  'كيمياء فيديوهات': '/educational-videos',
  'دروس الكيمياء': '/educational-videos',
  'فيديوهات كيمياء الصف التاسع': '/educational-videos',
  'كيمياء الصف التاسع': '/educational-videos',
  'فيديوهات كيمياء الصف العاشر': '/educational-videos',
  'كيمياء الصف العاشر': '/educational-videos',
  'فيديوهات كيمياء الصف الحادي عشر': '/educational-videos',
  'كيمياء الصف الحادي عشر': '/educational-videos',
  'الأحماض والقواعد': '/educational-videos',
  'وحدة الأحماض والقواعد': '/educational-videos',
  'التفاعلات الكيميائية': '/educational-videos',
  'الكيمياء الكهربائية': '/educational-videos',
  'أشكال الجزيئات': '/educational-videos',
  'نشاط الفلزات': '/educational-videos',
  
  // فيديوهات الفيزياء
  'فيديوهات الفيزياء': '/educational-videos',
  'فيزياء فيديوهات': '/educational-videos',
  'دروس الفيزياء': '/educational-videos',
  'فيزياء الصف التاسع': '/educational-videos',
  'فيزياء الصف العاشر': '/educational-videos',
  'فيزياء الصف الحادي عشر': '/educational-videos',
  
  // فيديوهات الأحياء
  'فيديوهات الأحياء': '/educational-videos',
  'أحياء فيديوهات': '/educational-videos',
  'دروس الأحياء': '/educational-videos',
  'أحياء الصف الحادي عشر': '/educational-videos',
  'وراثة الخلايا': '/educational-videos',
  'التطور والتنوع': '/educational-videos',
  
  // فيديوهات الرياضيات
  'فيديوهات الرياضيات': '/educational-videos',
  'رياضيات فيديوهات': '/educational-videos',
  'دروس الرياضيات': '/educational-videos',
  
  // الألغاز والألعاب
  'الألغاز التعليمية': '/subject-puzzles',
  'ألغاز': '/subject-puzzles',
  'puzzles': '/subject-puzzles',
  'الألعاب التعليمية': '/subject-puzzles',
  'ألغاز المواد': '/subject-puzzles',
  
  'ألغاز الرياضيات': '/math-puzzles',
  'ألغاز رياضيات': '/math-puzzles',
  'math puzzles': '/math-puzzles',
  'تحديات رياضيات': '/math-puzzles',
  
  // المكتبة والمحتوى
  'المكتبة المرئية': '/visual-library',
  'مكتبة الصور': '/visual-library',
  'الصور': '/visual-library',
  'library': '/visual-library',
  'مكتبة مرئية': '/visual-library',
  
  'رفع الصور': '/upload-image',
  'upload': '/upload-image',
  'رفع صور': '/upload-image',
  'تحميل صور': '/upload-image',
  
  'المجلات العلمية': '/scientific-journal',
  'مجلات': '/scientific-journal',
  'journals': '/scientific-journal',
  'المجلات': '/scientific-journal',
  'مجلات علمية': '/scientific-journal',
  
  'رفع المجلات': '/upload-journal',
  'رفع مجلة': '/upload-journal',
  'تحميل مجلة': '/upload-journal',
  
  // أدوات الدراسة
  'منظم الدراسة': '/study-organization',
  'التنظيم': '/study-organization',
  'study': '/study-organization',
  'الدراسة': '/study-organization',
  'بومودورو': '/study-organization',
  'pomodoro': '/study-organization',
  'تنظيم الدراسة': '/study-organization',
  
  // التواصل والملف الشخصي
  'غرف المحادثة': '/chat-rooms',
  'المحادثة': '/chat-rooms',
  'chat': '/chat-rooms',
  'الدردشة': '/chat-rooms',
  'غرف الدردشة': '/chat-rooms',
  
  'الملف الشخصي': '/profile',
  'البروفايل': '/profile',
  'profile': '/profile',
  'الحساب': '/profile',
  'حسابي': '/profile',
  
  'التواصل': '/contact',
  'contact': '/contact',
  'اتصل بنا': '/contact',
  'الدعم': '/contact',
  'المساعدة': '/contact'
};

// دالة ذكية متطورة للبحث عن الصفحة المطلوبة مع دعم المسارات الفرعية
function findAdvancedNavigationPath(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // البحث المباشر في دليل التنقل المتقدم
  for (const [keyword, path] of Object.entries(advancedNavigationGuide)) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return path;
    }
  }
  
  // البحث بالكلمات المفتاحية المتقدمة مع دعم المسارات الفرعية
  const advancedNavigationPatterns = [
    { patterns: ['انتقل', 'اذهب', 'افتح', 'خذني', 'وجهني', 'أريد', 'اريد'], keyword: 'navigation' },
    { patterns: ['حاسبة', 'calculator', 'حساب', 'آلة حاسبة'], path: '/mathematics/calculator' },
    { patterns: ['رسم', 'graph', 'مخطط', 'دالة', 'معادلة'], path: '/mathematics/graph-visualizer' },
    
    // أنماط متقدمة للفيديوهات التعليمية مع المسارات الفرعية
    { patterns: ['فيديو', 'videos', 'شرح', 'درس', 'دروس'], path: '/educational-videos' },
    { patterns: ['فيديوهات الكيمياء', 'كيمياء فيديو', 'دروس كيمياء'], path: '/educational-videos' },
    { patterns: ['فيديوهات الفيزياء', 'فيزياء فيديو', 'دروس فيزياء'], path: '/educational-videos' },
    { patterns: ['فيديوهات الأحياء', 'أحياء فيديو', 'دروس أحياء'], path: '/educational-videos' },
    { patterns: ['فيديوهات الرياضيات', 'رياضيات فيديو', 'دروس رياضيات'], path: '/educational-videos' },
    
    // أنماط للصفوف الدراسية
    { patterns: ['الصف التاسع', 'تاسع', 'grade 9'], path: '/educational-videos' },
    { patterns: ['الصف العاشر', 'عاشر', 'grade 10'], path: '/educational-videos' },
    { patterns: ['الصف الحادي عشر', 'حادي عشر', 'grade 11'], path: '/educational-videos' },
    
    // أنماط للوحدات المتخصصة
    { patterns: ['أحماض', 'قواعد', 'acids', 'bases'], path: '/educational-videos' },
    { patterns: ['تفاعلات كيميائية', 'تفاعل', 'reactions'], path: '/educational-videos' },
    { patterns: ['كيمياء كهربائية', 'electrochemistry'], path: '/educational-videos' },
    { patterns: ['أشكال جزيئات', 'molecular shapes'], path: '/educational-videos' },
    { patterns: ['نشاط الفلزات', 'metals activity'], path: '/educational-videos' },
    { patterns: ['وراثة خلايا', 'genetics'], path: '/educational-videos' },
    { patterns: ['تطور', 'تنوع', 'evolution'], path: '/educational-videos' },
    
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
      // إذا كان pattern.keyword === 'navigation'، ابحث عن الصفحة المذكورة
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
    
    // تحضير prompt محسن للحصول على إجابات منسقة ومرتبة بشكل احترافي
    let systemPrompt = `أنت **مرشد سياحي ذكي ومتقدم بتقنيات مستقبلية** للمنصة التعليمية العلمية الرائدة التي ابتكرها وطورها **محمود جوارنة** بأحدث التقنيات.

${platformInfo}

**📍 الصفحة الحالية:** ${currentPath}
${userName ? `**👤 المستخدم:** ${userName}` : ''}

## 📋 **القواعد والمعايير المتقدمة:**

### ✨ **أسلوب الإجابة المتطور:**
• **استخدم تنسيق Markdown الاحترافي المتقدم**
• **قسم الإجابات إلى أقسام منطقية واضحة مع ترقيم**
• **استخدم العناوين الهرمية والفقرات المنظمة بعناية**
• **أضف الأيقونات والرموز التعبيرية المناسبة بذكاء**
• **اجعل المعلومات سهلة القراءة والفهم مع تدرج منطقي**
• **استخدم خطوط منفصلة بين الأقسام الرئيسية**

### 🎯 **المحتوى المتخصص:**
• **كن ودوداً، مفيداً، ومبدعاً في ردودك**
• **قدم معلومات شاملة ودقيقة ومحدثة**
• **استخدم أمثلة توضيحية وعملية عند الحاجة**
• **كن مشجعاً للتعلم والاستكشاف والابتكار**
• **اذكر محمود جوارنة كمطور المنصة عند المناسبة**
• **قدم معلومات سياقية حسب الصفحة الحالية**

### 🧭 **التنقل المتقدم والذكي:**
• **إذا طلب المستخدم الانتقال لصفحة معينة، سأقوم بالتنقل التلقائي الفوري**
• **أدعم التنقل للمسارات الفرعية المعقدة (مثل فيديوهات كيمياء صف معين)**
• **لا تذكر الروابط في الإجابة، فقط أشر إلى أنك ستنقله فوراً**
• **اكتشف طلبات التنقل بذكاء حتى لو لم تُذكر بوضوح**

### 📝 **تنسيق الإجابة المثالي والمتطور:**
\`\`\`
# 🎯 **العنوان الرئيسي المختصر**

## 📍 **القسم الأول - [اسم القسم]**
• نقطة مهمة بتفصيل مناسب
• نقطة أخرى مع شرح موجز

---

## ⚡ **القسم الثاني - [اسم القسم]**
معلومات مفصلة ومنسقة مع:
- تفاصيل مرتبة
- معلومات سياقية
- أمثلة عملية

---

## 🔗 **خطوات العمل** (إن وجدت)
1. **الخطوة الأولى:** شرح مفصل
2. **الخطوة الثانية:** تفاصيل واضحة
3. **الخطوة الثالثة:** معلومات إضافية

---

## 💡 **نصائح وتوصيات:**
• نصيحة مفيدة للمستخدم
• اقتراحات لتحسين التجربة
• معلومات إضافية قيمة

---
🌟 **ملاحظة:** معلومة ختامية مهمة أو تشجيعية
\`\`\`

### 🎨 **التحسينات الخاصة:**
• **اجعل كل إجابة منظمة وجذابة بصرياً**
• **استخدم المسافات والفواصل بذكاء**
• **قدم المعلومات بتسلسل منطقي**
• **اربط المعلومات بالصفحة الحالية عند الإمكان**

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
            maxOutputTokens: 4096,
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
    
    // إضافة رسالة التنقل المحسنة إذا تم اكتشاف طلب التنقل
    if (navigationPath) {
      result += `\n\n---\n\n🚀 **جاري نقلك إلى الصفحة المطلوبة فوراً...** ✨`;
    }

    return new Response(
      JSON.stringify({ 
        result,
        navigationPath,
        autoNavigate: !!navigationPath // للتنقل التلقائي الفوري
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
