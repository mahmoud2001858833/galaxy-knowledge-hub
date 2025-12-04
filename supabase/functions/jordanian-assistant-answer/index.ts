import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// استخدام مفتاح Google AI المخصص
const GOOGLE_AI_KEY = Deno.env.get('JORDANIAN_ASSISTANT_AI_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, studentName, grade, image } = await req.json();

    console.log('Processing question:', { question, studentName, grade, hasImage: !!image });

    if (!question) {
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'السؤال مفقود',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!GOOGLE_AI_KEY) {
      console.error('JORDANIAN_ASSISTANT_AI_KEY not configured');
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'إعدادات الذكاء الاصطناعي غير مكتملة. يرجى التواصل مع المطوّر.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log('Using Google Gemini AI for answer generation');

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ALL textbook content from all grades - search comprehensively
    console.log('Step 1: Fetching ALL textbook content (comprehensive search)');
    const { data: contentPages, error: contentError } = await supabase
      .from('jordanian_textbook_content')
      .select('*')
      .order('grade', { ascending: true })
      .order('unit_number', { ascending: true })
      .order('lesson_number', { ascending: true })
      .order('page_number', { ascending: true });

    if (contentError) {
      console.error('Error fetching content:', contentError);
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'فشل جلب المحتوى الدراسي',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!contentPages || contentPages.length === 0) {
      console.log('No content found in system');
      return new Response(
        JSON.stringify({
          answer: 'عذراً، لم يتم تزويد النظام بأي محتوى دراسي بعد. يرجى الانتظار والمحاولة في وقت لاحق',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`Found ${contentPages.length} total pages across all grades`);

    // Build context from ALL textbook content - comprehensive search
    const contentByGradeSubject = contentPages.reduce((acc: any, page: any) => {
      const key = `${page.grade}|||${page.subject}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(page);
      return acc;
    }, {});

    // Create comprehensive context
    const booksContext = Object.entries(contentByGradeSubject)
      .map(([key, pages]: [string, any[]]) => {
        const [gradeKey, subject] = key.split('|||');
        const pagesText = pages
          .slice(0, 40)
          .map((p: any) => 
            `[الصف: ${p.grade} | المادة: ${p.subject} | الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}]\n${p.page_content}`
          )
          .join('\n\n');
        
        return `### الصف ${gradeKey} - المادة: ${subject}\n${pagesText}`;
      })
      .join('\n\n---\n\n');

    // Create the prompt with actual textbook content
    const systemPrompt = `أنت معلم أردني خبير متخصص في المنهاج الأردني لجميع الصفوف. لديك قدرة استثنائية على:
• فهم الأسئلة بصيغ مختلفة وربط المعاني والمفاهيم المتشابهة
• البحث الشامل في جميع الكتب المتاحة بغض النظر عن الصف
• فهم المرادفات واللهجات المختلفة

لديك محتوى كامل من جميع الكتب الدراسية:
${booksContext}

📚 قواعد البحث والإجابة الذكية:

1. **البحث الشامل**: ابحث في كل المحتوى المتاح من جميع الصفوف والمواد - لا تقتصر على صف الطالب فقط

2. **المرونة اللغوية الكاملة**: 
   - "تعريف" = "معنى" = "مفهوم" = "شرح" = "ما هو"
   - "القتل" = "قتل" = "جريمة القتل" = "جرائم القتل"
   - "الإسلامية" = "اسلاميه" = "الإسلامية" = "الاسلامية"
   - تجاهل الفروق الإملائية البسيطة والتشكيل
   - افهم السياق وليس النص الحرفي فقط

3. **صيغ الأسئلة المتنوعة** (كلها تطلب نفس الشيء):
   - "عرف القتل" = "ما هو القتل" = "ما معنى القتل" = "اشرح مفهوم القتل" = "وضح القتل"

4. **البحث الذكي**:
   - ابحث عن الموضوع بكل صيغه وأشكاله
   - إذا لم تجد الكلمة بالضبط، ابحث عن مرادفاتها
   - ابحث في المحتوى بالمعنى وليس بالنص فقط

5. **إذا وجدت معلومات ذات صلة**: قدمها للطالب حتى لو لم تكن مطابقة 100%

6. **إذا لم تجد حقاً بعد البحث الشامل**: قل "عذراً، لم أجد هذه المعلومة في الكتب المتاحة حالياً"

7. **تنسيق الإجابة**:
   - ابدأ بشرح واضح ومبسط وشامل
   - أضف أمثلة من الكتاب
   - اختم بالمصدر: 📚 المصدر: [الصف] - [المادة] - الوحدة [رقم]: [اسم] - الدرس [رقم]: [اسم] - صفحة [رقم]

8. **اللغة**: استخدم العربية الفصحى الواضحة

9. **الصور**: إذا أرفقت صورة، حللها واربطها بالمنهاج ثم أجب

⚠️ مهم جداً: طالب الصف ${grade} يسألك الآن، لكن ابحث في كل الكتب المتاحة لأن المعلومة قد تكون في أي صف!`;

    // Call Google Gemini API directly
    console.log('Step 2: Calling Google Gemini AI...');

    // Prepare content parts for Gemini
    let contentParts: any[] = [{ text: `${systemPrompt}\n\nالسؤال: ${question}` }];
    
    if (image) {
      // Extract base64 content
      const base64Content = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      
      contentParts = [
        { text: systemPrompt },
        { 
          inlineData: {
            mimeType: mimeType,
            data: base64Content
          }
        },
        { text: `السؤال: ${question}` }
      ];
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: contentParts
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 6000,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Google Gemini error response:', geminiResponse.status, errorText);

      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'فشل الحصول على إجابة من الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const geminiData = await geminiResponse.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!answer) {
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'لم يتم توليد إجابة',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log('Answer generated from textbook content, length:', answer.length);

    // Extract source information from the content pages used
    const uniqueSources = Array.from(
      new Set(contentPages.map((p: any) => `${p.subject}|${p.unit_number}|${p.unit_name}|${p.lesson_number}|${p.lesson_name}`))
    ).map(key => {
      const [subject, unitNum, unitName, lessonNum, lessonName] = key.split('|');
      const relevantPages = contentPages.filter((p: any) => 
        p.subject === subject && 
        p.unit_number === parseInt(unitNum) && 
        p.lesson_number === parseInt(lessonNum)
      );
      return {
        subject,
        unitNumber: parseInt(unitNum),
        unitName,
        lessonNumber: parseInt(lessonNum),
        lessonName,
        pageNumbers: relevantPages.map((p: any) => p.page_number).sort((a: number, b: number) => a - b)
      };
    });

    const sources = uniqueSources.map((source: any) => ({
      bookName: `${source.subject} - الوحدة ${source.unitNumber}: ${source.unitName}`,
      subject: source.subject,
      unitNumber: source.unitNumber,
      unitName: source.unitName,
      lessonNumber: source.lessonNumber,
      lessonName: source.lessonName,
      pageNumber: source.pageNumbers.join(', '),
      fileUrl: null,
    }));

    // Save to database
    console.log('Step 3: Saving to database...');
    
    if (image) {
      const { error: imageInsertError } = await supabase
        .from('jordanian_image_analysis')
        .insert({
          student_name: studentName,
          grade: grade,
          question: question,
          image_url: image,
          analysis_result: answer,
        });
      
      if (imageInsertError) {
        console.error('Image analysis insert error:', imageInsertError);
      }
    }
    
    const { error: insertError } = await supabase
      .from('student_assistant_usage')
      .insert({
        student_name: studentName,
        grade: grade,
        question: question,
        answer: answer,
        sources: sources,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    console.log('Process completed successfully');

    return new Response(
      JSON.stringify({
        answer: answer,
        sources: sources,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error('Error in jordanian-assistant-answer:', error);
    return new Response(
      JSON.stringify({
        answer: null,
        sources: [],
        error: error?.message || 'حدث خطأ غير متوقع في الخادم',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
