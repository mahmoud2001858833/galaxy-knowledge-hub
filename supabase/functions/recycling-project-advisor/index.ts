import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = "AIzaSyD6gX02LaRw12v7-TMX6yd3-y9SVDA7NBk";

const SYSTEM_PROMPT = `أنت خبير عالمي ومتميز في الاستدامة البيئية، وإعادة التدوير، والهندسة البسيطة، وصناعة المشاريع العلمية والفنية الإبداعية باستخدام المواد المستعملة.

🎯 مهمتك الأساسية:
تحليل المواد التي يدخلها المستخدم واقتراح أفضل وأكثر المشاريع إبداعاً وفائدة، مع تقديم شرح كامل ومفصل وعملي لكل مشروع.

📋 عند إعطائك قائمة بالمواد المتوفرة، يجب عليك:
1. تحليل المواد بعمق وفهم كل استخداماتها المحتملة
2. التفكير بطريقة إبداعية خارج الصندوق
3. اقتراح 4 إلى 7 مشاريع متنوعة ومبتكرة حسب تنوع المواد

⚡ معايير اختيار المشاريع:
- الإبداع والابتكار (فكر خارج الصندوق)
- الفائدة العملية والبيئية
- سهولة التنفيذ بالنسبة للمستوى المحدد
- القيمة التعليمية والتوعوية
- إمكانية التطوير والتحسين

📝 لكل مشروع تقدّم المعلومات بشكل منظم كالتالي (استخدم هذا التنسيق بالضبط):

---PROJECT_START---
1. اسم المشروع: [اسم إبداعي ومختصر وجذاب]

2. فكرة المشروع: [شرح الفكرة بأسلوب بسيط ومشوق - اشرح لماذا هذا المشروع مميز وما الذي يجعله فريداً]

3. المواد المطلوبة: [اختَر فقط من المواد التي أدخلها المستخدم، ويمكن إضافة مواد بسيطة ورخيصة متوفرة في كل بيت إن كانت ضرورية - اذكر الكميات التقريبية]

4. الأدوات اللازمة: [قائمة بالأدوات مثل: مقص، لاصق، أدوات حفر، إلخ - مع بدائل إن أمكن]

5. خطوات العمل بالتفصيل:
الخطوة 1: [عنوان الخطوة]
- التفاصيل: ...
- نصيحة: ...

الخطوة 2: [عنوان الخطوة]
- التفاصيل: ...
- نصيحة: ...

[أكمل جميع الخطوات بنفس التنسيق - كن مفصلاً جداً]

6. المبدأ العلمي أو البيئي للمشروع: 
- الجانب العلمي: [لماذا هذا المشروع مهم علمياً؟ ما المفاهيم العلمية المستخدمة؟]
- الجانب البيئي: [ما هي الفائدة البيئية؟ كم من النفايات يتم إعادة تدويرها؟]
- ما يتعلمه المستخدم: [المهارات والمعارف المكتسبة]

7. الزمن المتوقع للتنفيذ: [مدة تنفيذ المشروع بالتفصيل - مع تقسيم للمراحل إن أمكن]

8. مستوى الصعوبة: [سهل / متوسط / متقدم - مع توضيح لماذا هذا التصنيف]

9. الأمان والتحذيرات: 
⚠️ [إن كان هناك أي جزء خطير يجب التنبيه عليه - كن محدداً]
✅ [إجراءات السلامة المطلوبة]

10. النتائج المتوقعة: 
- الشكل النهائي: [وصف تفصيلي لما سيبدو عليه المشروع]
- الوظيفة: [ماذا يمكن أن يفعل المشروع؟]
- الفائدة: [كيف يمكن استخدامه؟]

11. كيف يمكن تطوير المشروع؟:
💡 فكرة 1: [طريقة لتحسين المشروع]
💡 فكرة 2: [إضافة ميزات جديدة]
💡 فكرة 3: [توسيع نطاق المشروع]

12. كيف يخدم الاستدامة البيئية؟:
🌍 تقليل النفايات: [كم من المواد يتم إنقاذها من المكب؟]
♻️ إعادة الاستخدام: [كيف يتم إعادة استخدام المواد؟]
🌱 التوعية: [كيف يساهم في نشر الوعي البيئي؟]
---PROJECT_END---

بعد اقتراح المشاريع، أضف قسم الأسئلة:

---QUESTIONS_START---
أسئلة إضافية للمستخدم لتخصيص أفضل:
1. [سؤال عن تفضيلات المستخدم]
2. [سؤال عن الأدوات المتوفرة]
3. [سؤال عن الغرض من المشروع]
---QUESTIONS_END---

🎨 أسلوبك المطلوب:
- ودي ومحفز ومشجع
- تعليمي وواضح
- عملي وقابل للتطبيق
- إبداعي ومبتكر
- مفصل ودقيق

💪 كن خبيراً متحمساً يلهم المستخدمين لإنقاذ البيئة من خلال مشاريع ممتعة ومفيدة!`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body));
    
    const { materials, userLevel, projectType, question, conversationHistory, imageBase64 } = body;

    // Validate materials for non-question requests
    if (!question && !imageBase64 && (!materials || materials.trim() === '')) {
      console.error("No materials provided");
      return new Response(JSON.stringify({
        success: false,
        error: 'يرجى إدخال المواد المتوفرة لديك'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let userMessage = "";
    
    if (question) {
      // Follow-up question
      userMessage = question;
    } else if (imageBase64) {
      // Image analysis request
      userMessage = `📸 تم رفع صورة للمواد المتوفرة!

قم بتحليل هذه الصورة بدقة وتحديد كل المواد المتوفرة فيها، ثم اقترح مشاريع إعادة تدوير مبتكرة ومفصلة.

👤 مستوى المستخدم: ${userLevel === 'child' ? 'طفل (6-12 سنة)' : userLevel === 'teen' ? 'مراهق (13-17 سنة)' : userLevel === 'adult' ? 'بالغ (18+ سنة)' : 'غير محدد'}
🎯 نوع المشاريع المفضل: ${projectType === 'scientific' ? 'علمي' : projectType === 'artistic' ? 'فني' : projectType === 'practical' ? 'عملي' : projectType === 'group' ? 'جماعي' : 'غير محدد'}

ابدأ بذكر المواد التي تعرفت عليها في الصورة، ثم اقترح المشاريع المناسبة.`;
    } else {
      // Initial materials request
      const levelText = userLevel === 'child' ? 'طفل (6-12 سنة)' : userLevel === 'teen' ? 'مراهق (13-17 سنة)' : userLevel === 'adult' ? 'بالغ (18+ سنة)' : 'غير محدد';
      const typeText = projectType === 'scientific' ? 'علمي' : projectType === 'artistic' ? 'فني' : projectType === 'practical' ? 'عملي' : projectType === 'group' ? 'جماعي' : 'غير محدد';
      
      console.log("Generating projects for materials:", materials);
      
      userMessage = `🔧 المواد المتوفرة: ${materials}

👤 مستوى المستخدم: ${levelText}
🎯 نوع المشاريع المفضل: ${typeText}

الرجاء اقتراح مشاريع إعادة تدوير مبتكرة ومفصلة لهذه المواد. كن إبداعياً واقترح مشاريع متنوعة!`;
    }

    const messages = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "فهمت تماماً! 🌱 أنا خبير بيئي متخصص ومتحمس في إعادة التدوير والمشاريع الإبداعية. سأقدم لك مشاريع مفصلة ومبتكرة بالتنسيق المطلوب. دعنا نحول نفاياتك إلى كنوز! ♻️" }] }
    ];

    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current message
    if (imageBase64) {
      messages.push({
        role: "user",
        parts: [
          { text: userMessage },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
            }
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        parts: [{ text: userMessage }]
      });
    }

    console.log("Calling Google AI for recycling advice with message:", userMessage.substring(0, 100) + "...");

    const requestBody = {
      contents: messages,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 16384,
      }
    };
    
    console.log("Request to Google AI:", JSON.stringify(requestBody).substring(0, 500) + "...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI Error Response:", response.status, errorText);
      throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Google AI Response received, candidates:", data.candidates?.length);
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من معالجة الطلب.";
    console.log("AI Response length:", aiResponse.length);

    // Parse the response to extract projects
    const projects = [];
    const projectMatches = aiResponse.match(/---PROJECT_START---([\s\S]*?)---PROJECT_END---/g);
    
    if (projectMatches) {
      for (const match of projectMatches) {
        const projectText = match.replace(/---PROJECT_START---|---PROJECT_END---/g, '').trim();
        const project: any = {};
        
        // Parse each field with improved regex
        const nameMatch = projectText.match(/1\. اسم المشروع:\s*(.+?)(?=\n|$)/);
        const ideaMatch = projectText.match(/2\. فكرة المشروع:\s*([\s\S]+?)(?=3\. المواد المطلوبة)/);
        const materialsMatch = projectText.match(/3\. المواد المطلوبة:\s*([\s\S]+?)(?=4\. الأدوات اللازمة)/);
        const toolsMatch = projectText.match(/4\. الأدوات اللازمة:\s*([\s\S]+?)(?=5\. خطوات العمل)/);
        const stepsMatch = projectText.match(/5\. خطوات العمل بالتفصيل:\s*([\s\S]+?)(?=6\. المبدأ العلمي)/);
        const principleMatch = projectText.match(/6\. المبدأ العلمي أو البيئي للمشروع:\s*([\s\S]+?)(?=7\. الزمن المتوقع)/);
        const timeMatch = projectText.match(/7\. الزمن المتوقع للتنفيذ:\s*([\s\S]+?)(?=8\. مستوى الصعوبة)/);
        const difficultyMatch = projectText.match(/8\. مستوى الصعوبة:\s*(.+?)(?=\n|$)/);
        const safetyMatch = projectText.match(/9\. الأمان والتحذيرات:\s*([\s\S]+?)(?=10\. النتائج المتوقعة)/);
        const resultsMatch = projectText.match(/10\. النتائج المتوقعة:\s*([\s\S]+?)(?=11\. كيف يمكن تطوير)/);
        const developMatch = projectText.match(/11\. كيف يمكن تطوير المشروع\?*:\s*([\s\S]+?)(?=12\. كيف يخدم)/);
        const sustainabilityMatch = projectText.match(/12\. كيف يخدم الاستدامة البيئية\?*:\s*([\s\S]+?)$/);

        project.name = nameMatch?.[1]?.trim() || "مشروع إعادة تدوير";
        project.idea = ideaMatch?.[1]?.trim() || "";
        project.materials = materialsMatch?.[1]?.trim() || "";
        project.tools = toolsMatch?.[1]?.trim() || "";
        project.steps = stepsMatch?.[1]?.trim() || "";
        project.principle = principleMatch?.[1]?.trim() || "";
        project.time = timeMatch?.[1]?.trim() || "";
        project.difficulty = difficultyMatch?.[1]?.trim() || "متوسط";
        project.safety = safetyMatch?.[1]?.trim() || "";
        project.results = resultsMatch?.[1]?.trim() || "";
        project.development = developMatch?.[1]?.trim() || "";
        project.sustainability = sustainabilityMatch?.[1]?.trim() || "";

        projects.push(project);
      }
    }

    // Extract follow-up questions
    let followUpQuestions: string[] = [];
    const questionsMatch = aiResponse.match(/---QUESTIONS_START---([\s\S]*?)---QUESTIONS_END---/);
    if (questionsMatch) {
      const questionsText = questionsMatch[1];
      const questionLines = questionsText.match(/\d+\.\s*(.+?)(?=\n|$)/g);
      if (questionLines) {
        followUpQuestions = questionLines.map(q => q.replace(/^\d+\.\s*/, '').trim());
      }
    }

    return new Response(JSON.stringify({
      success: true,
      projects,
      followUpQuestions,
      rawResponse: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in recycling-project-advisor:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'حدث خطأ أثناء معالجة الطلب'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
