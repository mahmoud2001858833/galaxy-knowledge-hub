import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = "AIzaSyD6gX02LaRw12v7-TMX6yd3-y9SVDA7NBk";

const SYSTEM_PROMPT = `أنت خبير عالمي في الاستدامة البيئية، وإعادة التدوير، والهندسة البسيطة، وصناعة المشاريع العلمية والفنية باستخدام المواد المستعملة.

مهمتك: تحليل المواد التي يدخلها المستخدم واقتراح أفضل المشاريع الممكن تنفيذها منها، مع تقديم شرح كامل ومفصل لكل مشروع.

عند إعطائك قائمة بالمواد المتوفرة، يجب عليك:
1. تحليل المواد وفهم استخدامها المحتمل.
2. اقتراح 3 إلى 7 مشاريع حسب تنوع المواد.

لكل مشروع تقدّم المعلومات بشكل منظم كالتالي (استخدم هذا التنسيق بالضبط):

---PROJECT_START---
1. اسم المشروع: [اسم مختصر وواضح]

2. فكرة المشروع: [شرح الفكرة بأسلوب بسيط]

3. المواد المطلوبة: [اختَر فقط من المواد التي أدخلها المستخدم، ويمكن إضافة مواد بسيطة مسموح بشرائها إن كانت ضرورية]

4. الأدوات اللازمة: [مثل مقص، لاصق، أدوات حفر، إلخ]

5. خطوات العمل بالتفصيل:
- الخطوة 1: ...
- الخطوة 2: ...
- الخطوة 3: ...
[يجب أن تكون الخطوات مرتبة، واضحة، ويمكن تطبيقها بسهولة]

6. المبدأ العلمي أو البيئي للمشروع: [لماذا هذا المشروع مهم بيئياً أو علمياً؟ ما الذي يتعلمه المستخدم منه؟]

7. الزمن المتوقع للتنفيذ: [مدة تنفيذ المشروع]

8. مستوى الصعوبة: [سهل / متوسط / متقدم - حدّد المستوى بناءً على عمر المستخدم إن تم توفيره]

9. الأمان والتحذيرات: [إن كان هناك أي جزء خطير يجب التنبيه عليه]

10. النتائج المتوقعة: [ماذا سيحصل المستخدم بعد الانتهاء؟ كيف سيبدو المشروع؟]

11. كيف يمكن تطوير المشروع؟: [أفكار إضافية لتطويره وزيادة فائدته]

12. كيف يخدم الاستدامة البيئية؟: [شرح واضح لدوره في حماية البيئة وتقليل النفايات]
---PROJECT_END---

بعد اقتراح المشاريع، يجب عليك إضافة قسم:

---QUESTIONS_START---
أسئلة إضافية للمستخدم:
1. [سؤال 1]
2. [سؤال 2]
3. [سؤال 3]
---QUESTIONS_END---

إن سأل المستخدم أي سؤال بعد ذلك، أجب بصفتك خبيراً بيئياً ومهندساً يشرح أي تفصيلة يريدها عن المشروع، المواد، الاستدامة، أو أي شيء مرتبط به.

أسلوبك: ودي، تعليمي، محفز، واضح، عملي.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materials, userLevel, projectType, question, conversationHistory, imageBase64 } = await req.json();

    let userMessage = "";
    
    if (question) {
      // Follow-up question
      userMessage = question;
    } else if (imageBase64) {
      // Image analysis request
      userMessage = `قم بتحليل هذه الصورة وتحديد المواد المتوفرة فيها، ثم اقترح مشاريع إعادة تدوير مناسبة.
مستوى المستخدم: ${userLevel || 'غير محدد'}
نوع المشاريع المفضل: ${projectType || 'غير محدد'}`;
    } else {
      // Initial materials request
      userMessage = `المواد المتوفرة: ${materials}
مستوى المستخدم: ${userLevel || 'غير محدد'}
نوع المشاريع المفضل: ${projectType || 'غير محدد'}

الرجاء اقتراح مشاريع إعادة تدوير مناسبة لهذه المواد.`;
    }

    const messages = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "فهمت. أنا خبير بيئي متخصص في إعادة التدوير. سأقدم مشاريع مفصلة بالتنسيق المطلوب." }] }
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

    console.log("Calling Google AI for recycling advice...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI Error:", errorText);
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من معالجة الطلب.";

    // Parse the response to extract projects
    const projects = [];
    const projectMatches = aiResponse.match(/---PROJECT_START---([\s\S]*?)---PROJECT_END---/g);
    
    if (projectMatches) {
      for (const match of projectMatches) {
        const projectText = match.replace(/---PROJECT_START---|---PROJECT_END---/g, '').trim();
        const project: any = {};
        
        // Parse each field
        const nameMatch = projectText.match(/1\. اسم المشروع:\s*(.+?)(?=\n|$)/);
        const ideaMatch = projectText.match(/2\. فكرة المشروع:\s*([\s\S]+?)(?=3\. المواد المطلوبة)/);
        const materialsMatch = projectText.match(/3\. المواد المطلوبة:\s*([\s\S]+?)(?=4\. الأدوات اللازمة)/);
        const toolsMatch = projectText.match(/4\. الأدوات اللازمة:\s*([\s\S]+?)(?=5\. خطوات العمل)/);
        const stepsMatch = projectText.match(/5\. خطوات العمل بالتفصيل:\s*([\s\S]+?)(?=6\. المبدأ العلمي)/);
        const principleMatch = projectText.match(/6\. المبدأ العلمي أو البيئي للمشروع:\s*([\s\S]+?)(?=7\. الزمن المتوقع)/);
        const timeMatch = projectText.match(/7\. الزمن المتوقع للتنفيذ:\s*(.+?)(?=\n|$)/);
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
