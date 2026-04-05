import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keyword → route mapping
const platformRoutes: Record<string, string> = {
  // العلوم
  "فيزياء": "/physics",
  "كيمياء": "/chemistry",
  "أحياء": "/biology",
  "رياضيات": "/mathematics",
  "جدول دوري": "/chemistry",
  "معادلات": "/mathematics",
  "حسابات فيزيائية": "/physics",

  // اللغات
  "لغة عربية": "/arabic-language",
  "لغة انجليزية": "/english-language",
  "انجليزي": "/english-language",
  "عربي": "/arabic-language",
  "قواعد": "/arabic-language",
  "نحو": "/arabic-language",
  "صرف": "/arabic-language",
  "grammar": "/english-language",

  // BTEC
  "بتك": "/btec",
  "btec": "/btec",
  "برمجة": "/btec/it/programming",
  "تكنولوجيا معلومات": "/btec",
  "كود": "/btec/it/code-fixer",

  // الفن
  "فن": "/art-design",
  "رسم": "/art-design",
  "تصميم": "/art-design",

  // البيئة
  "بيئة": "/environmental-sustainability",
  "استدامة": "/environmental-sustainability",
  "كربون": "/carbon-calculator",

  // الإدارة
  "جسر التواصل": "/communication-bridge",
  "مشرفين": "/administrators-teachers",
  "معلمين": "/administrators-teachers",
  "المشرفون والمعلمون": "/administrators-teachers",
  "المشرفين والمعلمين": "/administrators-teachers",
  "مشرفون": "/administrators-teachers",
  "معلمون": "/administrators-teachers",
  "أولياء أمور": "/communication-bridge",

  // الذكاء الاصطناعي
  "مساعد ذكي": "/falak-knowledge-ai",
  "ذكاء اصطناعي": "/ai-assistant-section",
  "فلك": "/falak-knowledge-ai",
  "مرشد نفسي": "/psychological-guide",

  // الألغاز التعليمية - المحدثة
  "ألغاز": "/subject-puzzles",
  "الألغاز": "/subject-puzzles",
  "ألغاز تعليمية": "/subject-puzzles",
  "الألغاز التعليمية": "/subject-puzzles",
  "لغز": "/subject-puzzles",
  "المتصدرين": "/subject-puzzles",
  "قائمة المتصدرين": "/subject-puzzles",
  "ترتيب اللاعبين": "/subject-puzzles",
  "تنافس": "/subject-puzzles",
  "مسابقة": "/subject-puzzles",
  "اختبار معلومات": "/subject-puzzles",
  
  // ماسح الامتحانات
  "ماسح": "/exam-scanner",
  "ماسح الامتحانات": "/exam-scanner",
  "تصحيح امتحان": "/exam-scanner",
  "فحص امتحان": "/exam-scanner",
  "مسح امتحان": "/exam-scanner",
  "تصحيح": "/exam-scanner",
  "امتحان": "/exam-scanner",

  // لغة الإشارة
  "لغة الإشارة": "/sign-language",
  "لغة اشارة": "/sign-language",
  "مترجم لغة الإشارة": "/sign-language",
  "اشارة": "/sign-language",
  "إشارة": "/sign-language",
  "ترجمة إشارة": "/sign-language",
  "صم": "/sign-language",

  // التوثيق
  "توثيق المنصة": "/platform-documentation",
  "توثيق": "/platform-documentation",
  "وثائق": "/platform-documentation",

  // المساعد الأردني
  "المساعد الأردني": "/jordanian-assistant",
  "مساعد أردني": "/jordanian-assistant",
  "منهاج أردني": "/jordanian-assistant",
  "توجيهي": "/jordanian-assistant",

  // التكرار المتباعد
  "تكرار متباعد": "/spaced-repetition",
  "مراجعة": "/spaced-repetition",
  "جدول مراجعة": "/spaced-repetition",

  // أخبار المدرسة
  "أخبار": "/school-news",
  "أخبار المدرسة": "/school-news",

  // جدول الدراسة
  "جدول دراسة": "/study-calendar",
  "تقويم": "/study-calendar",

  // أخرى
  "مجلة علمية": "/scientific-journal",
  "مكتبة بصرية": "/visual-library",
  "مكتبة مرئية": "/visual-library",
  "مكتبة التعلم المرئي": "/visual-library",
  "التعلم المرئي": "/visual-library",
  "فيديوهات": "/educational-videos",
  "محاكاة": "/scientific-simulations",
  "دروس مسجلة": "/educational-videos",
  "غرف دردشة": "/chat-rooms",
  "دردشة": "/class-chat",
  "ملفي": "/profile",
  "مركز التحكم": "/control-center",
  "تواصل معنا": "/contact",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userName = "صديقي", allMessages = [] } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("platform-guide-assistant: LOVABLE_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Server is not configured for AI access." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

### 4. أدوات متقدمة:
- **🔍 ماسح الامتحانات**: مسح وتصحيح الامتحانات تلقائياً باستخدام الكاميرا والذكاء الاصطناعي
- **🤟 مترجم لغة الإشارة**: ترجمة فورية من لغة الإشارة للعربية باستخدام الكاميرا، مع قاموس يحتوي 200+ كلمة ودعم تحويل النص إلى إشارة
- **📋 توثيق المنصة**: وثائق شاملة عن المنصة وميزاتها وإحصائياتها
- **🇯🇴 المساعد الأردني**: مساعد ذكي متخصص بالمنهاج الأردني (التوجيهي) مع دعم تحليل الصور
- **📅 التكرار المتباعد**: نظام مراجعة ذكي يعتمد على منحنى النسيان لتحسين الحفظ
- **📰 أخبار المدرسة**: نشر ومتابعة أخبار المدرسة مع نظام إعجابات وتعليقات
- **📆 جدول الدراسة**: تقويم دراسي لتنظيم مواعيد المذاكرة

### ميزات إضافية:
- **المجلة العلمية**: رفع وعرض الأبحاث العلمية
- **المكتبة البصرية**: صور تعليمية لجميع المواد
- **🎯 الألغاز التعليمية**: ألغاز متنوعة في جميع المواد مع نظام نقاط تنافسي وقائمة المتصدرين
- **الفيديوهات التعليمية**: دروس مسجلة لجميع المواد
- **المحاكاة العلمية**: محاكاة ذرة، إشعاع الجسم الأسود (49+ محاكاة)
- **غرف الدردشة**: دردشة جماعية وخاصة
- **مركز التحكم**: لإدارة المنصة (للمشرفين فقط)

## معلومات مهمة عن المنصة:
- **مصمم ومطور المنصة**: محمود محمد عبدالله جوارنة تاج راسكم 👑
- إذا سأل أي شخص "من صمم المنصة" أو "من مصمم المنصة" أو "من عمل المنصة" أو "من طور المنصة" أو "من برمج المنصة" أو "مين سوى المنصة" أو أي سؤال مشابه عن مُنشئ أو مطور أو مصمم المنصة، أجب دائماً: "مصمم ومطور المنصة هو **محمود محمد عبدالله جوارنة** تاج راسكم 👑"

## إرشادات الإجابة:
1. استخدم أسلوباً ودوداً ومشجعاً
2. اشرح الميزات بوضوح وبساطة
3. إذا طلب المستخدم الانتقال لقسم معين، أخبره أنك ستوجهه وقدم مسار التنقل
4. إذا لم تفهم السؤال، اطلب التوضيح
5. قدم نصائح عملية لاستخدام المنصة بفعالية
6. تذكر السياق من المحادثات السابقة

أجب باللغة العربية دائماً بأسلوب محترف ومفيد.`;

    // Build chat messages for Lovable AI (OpenAI-compatible format)
    const messages = [
      { role: "system", content: systemPrompt },
      ...allMessages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: question },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error("AI gateway error: ", aiResp.status, text);

      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({
            answer:
              "لقد وصلت إلى الحد الأقصى للطلبات مؤقتاً. برجاء المحاولة بعد قليل أو تقليل عدد الطلبات المتتابعة.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            answer:
              "الخدمة غير متاحة حالياً بسبب نفاد الرصيد. يرجى إعادة المحاولة لاحقاً.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ answer: "عذراً، حدث خطأ في خدمة الذكاء الاصطناعي." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiResp.json();
    const answer: string = aiJson?.choices?.[0]?.message?.content ??
      "عذراً، لم أتمكن من فهم سؤالك. هل يمكنك إعادة صياغته؟";

    // Detect navigation intent from the user's question
    let navigationPath: string | null = null;
    const lowerQuestion = String(question || "").toLowerCase();
    for (const [keyword, path] of Object.entries(platformRoutes)) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        navigationPath = path;
        break;
      }
    }

    return new Response(
      JSON.stringify({ answer, navigationPath }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in platform-guide-assistant:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message, answer: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});