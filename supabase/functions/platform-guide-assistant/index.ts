
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// معلومات شاملة ومحسنة عن المنصة
const platformInfo = `
🌟 **منصة التعليم العلمي الذكية** 🌟
المطورة بعناية فائقة من قبل **محمود جوارنة**

## 🎓 **الأقسام الرئيسية:**

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

#### ⚛️ **الفيزياء** (/physics)
• المعامل الافتراضية التفاعلية
• محاكاة التجارب الفيزيائية
• مساعد الفيزياء الذكي
• علماء الفيزياء عبر التاريخ

#### 🧬 **الأحياء** (/biology)
• جسم الإنسان التفاعلي ثلاثي الأبعاد
• موسوعة الأمراض الشاملة
• مساعد الأحياء الذكي
• علماء الأحياء المؤثرين

### 🎮 **الألعاب التعليمية:**
• ألغاز متنوعة لجميع المواد (/subject-puzzles)
• نظام نقاط ومستويات تفاعلي
• تحديات تعليمية ممتعة

### 📺 **المكتبة التعليمية:**
• مجموعة ضخمة من الفيديوهات التعليمية (/educational-videos)
• مكتبة الصور العلمية (/visual-library)
• رفع ومشاركة المحتوى (/upload-image)

### 📖 **المجلات العلمية:**
• مجموعة نادرة من المجلات المتخصصة (/scientific-journal)
• إمكانية رفع مجلات جديدة (/upload-journal)

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
`;

// دليل التنقل المحسن
const navigationGuide = {
  // الصفحات الرئيسية
  'الصفحة الرئيسية': '/',
  'الرئيسية': '/',
  'البداية': '/',
  'home': '/',
  
  // المواد العلمية
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
  
  // أدوات الرياضيات
  'آلة حاسبة': '/mathematics/calculator',
  'حاسبة': '/mathematics/calculator',
  'calculator': '/mathematics/calculator',
  'الحاسبة': '/mathematics/calculator',
  
  'رسم المخططات': '/mathematics/graph-visualizer',
  'المخططات البيانية': '/mathematics/graph-visualizer',
  'الرسم البياني': '/mathematics/graph-visualizer',
  'graphs': '/mathematics/graph-visualizer',
  
  'علماء الرياضيات': '/mathematics/mathematicians',
  'mathematicians': '/mathematics/mathematicians',
  'العلماء': '/mathematics/mathematicians',
  
  'مساعد الرياضيات': '/mathematics/ai-assistant',
  'مساعد رياضيات': '/mathematics/ai-assistant',
  
  // الألغاز والألعاب
  'الألغاز التعليمية': '/subject-puzzles',
  'ألغاز': '/subject-puzzles',
  'puzzles': '/subject-puzzles',
  'الألعاب التعليمية': '/subject-puzzles',
  
  'ألغاز الرياضيات': '/math-puzzles',
  'ألغاز رياضيات': '/math-puzzles',
  'math puzzles': '/math-puzzles',
  
  // المكتبة والمحتوى
  'الفيديوهات التعليمية': '/educational-videos',
  'فيديوهات': '/educational-videos',
  'videos': '/educational-videos',
  'الفيديوهات': '/educational-videos',
  
  'المكتبة المرئية': '/visual-library',
  'مكتبة الصور': '/visual-library',
  'الصور': '/visual-library',
  'library': '/visual-library',
  
  'رفع الصور': '/upload-image',
  'upload': '/upload-image',
  'رفع صور': '/upload-image',
  
  'المجلات العلمية': '/scientific-journal',
  'مجلات': '/scientific-journal',
  'journals': '/scientific-journal',
  'المجلات': '/scientific-journal',
  
  'رفع المجلات': '/upload-journal',
  'رفع مجلة': '/upload-journal',
  
  // أدوات الدراسة
  'منظم الدراسة': '/study-organization',
  'التنظيم': '/study-organization',
  'study': '/study-organization',
  'الدراسة': '/study-organization',
  'بومودورو': '/study-organization',
  'pomodoro': '/study-organization',
  
  // التواصل
  'غرف المحادثة': '/chat-rooms',
  'المحادثة': '/chat-rooms',
  'chat': '/chat-rooms',
  'الدردشة': '/chat-rooms',
  
  'الملف الشخصي': '/profile',
  'البروفايل': '/profile',
  'profile': '/profile',
  'الحساب': '/profile',
  
  'التواصل': '/contact',
  'contact': '/contact',
  'اتصل بنا': '/contact',
  'الدعم': '/contact'
};

// دالة ذكية للبحث عن الصفحة المطلوبة
function findNavigationPath(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // البحث المباشر في دليل التنقل
  for (const [keyword, path] of Object.entries(navigationGuide)) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return path;
    }
  }
  
  // البحث بالكلمات المفتاحية المتقدمة
  const navigationPatterns = [
    { patterns: ['انتقل', 'اذهب', 'افتح', 'خذني', 'وجهني', 'أريد'], keyword: 'navigation' },
    { patterns: ['حاسبة', 'calculator', 'حساب'], path: '/mathematics/calculator' },
    { patterns: ['رسم', 'graph', 'مخطط'], path: '/mathematics/graph-visualizer' },
    { patterns: ['فيديو', 'videos', 'شرح'], path: '/educational-videos' },
    { patterns: ['صور', 'images', 'مكتبة'], path: '/visual-library' },
    { patterns: ['دردشة', 'chat', 'محادثة'], path: '/chat-rooms' },
    { patterns: ['ملف', 'profile', 'حساب'], path: '/profile' },
    { patterns: ['مجلة', 'journal', 'مقال'], path: '/scientific-journal' },
    { patterns: ['دراسة', 'study', 'تنظيم'], path: '/study-organization' },
    { patterns: ['لغز', 'puzzle', 'لعبة'], path: '/subject-puzzles' }
  ];
  
  for (const pattern of navigationPatterns) {
    if (pattern.patterns.some(p => lowerMessage.includes(p))) {
      if (pattern.path) return pattern.path;
      // إذا كان pattern.keyword === 'navigation'، ابحث عن الصفحة المذكورة
      if (pattern.keyword === 'navigation') {
        for (const [keyword, path] of Object.entries(navigationGuide)) {
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
    
    // البحث عن طلب التنقل
    const navigationPath = findNavigationPath(message);
    
    // تحضير prompt محسن للحصول على إجابات منسقة
    let systemPrompt = `أنت **مرشد سياحي ذكي ومتقدم** للمنصة التعليمية العلمية الرائدة التي ابتكرها وطورها **محمود جوارنة**.

${platformInfo}

**الصفحة الحالية:** ${currentPath}
${userName ? `**المستخدم:** ${userName}` : ''}

## 📋 **القواعد المهمة:**

### ✨ **أسلوب الإجابة:**
• **استخدم تنسيق Markdown الاحترافي**
• **قسم الإجابات إلى أقسام منطقية واضحة**
• **استخدم العناوين والفقرات المنظمة**
• **أضف الأيقونات والرموز التعبيرية المناسبة**
• **اجعل المعلومات سهلة القراءة والفهم**

### 🎯 **المحتوى:**
• **كن ودوداً، مفيداً، ومبدعاً في ردودك**
• **قدم معلومات شاملة ودقيقة**
• **استخدم أمثلة توضيحية عند الحاجة**
• **كن مشجعاً للتعلم والاستكشاف**
• **اذكر محمود جوارنة كمطور المنصة عند المناسبة**

### 🧭 **التنقل:**
• **إذا طلب المستخدم الانتقال لصفحة معينة، سأقوم بالتنقل التلقائي**
• **لا تذكر الروابط في الإجابة، فقط أشر إلى أنك ستنقله**

### 📝 **تنسيق الإجابة المثالي:**
\`\`\`
# 🎯 **العنوان الرئيسي**

## 📍 **القسم الأول**
• نقطة مهمة
• نقطة أخرى

## ⚡ **القسم الثاني**
معلومات مفصلة ومنسقة...

## 🔗 **خطوات العمل** (إن وجدت)
1. الخطوة الأولى
2. الخطوة الثانية

---
💡 **نصيحة:** نصيحة مفيدة للمستخدم
\`\`\`

**سؤال المستخدم:** ${message}`;

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
    
    // إضافة رسالة التنقل إذا تم اكتشاف طلب التنقل
    if (navigationPath) {
      result += `\n\n🚀 **جاري نقلك إلى الصفحة المطلوبة...**`;
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
