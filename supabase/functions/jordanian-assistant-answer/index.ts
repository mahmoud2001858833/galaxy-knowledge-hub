import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'إعدادات الذكاء الاصطناعي غير مكتملة. يرجى التواصل مع المطوّر.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log('Using Lovable AI for answer generation');

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get textbook content for this grade from the new text-based system
    console.log('Step 1: Fetching textbook content for grade:', grade);
    const { data: contentPages, error: contentError } = await supabase
      .from('jordanian_textbook_content')
      .select('*')
      .eq('grade', grade)
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
      console.log('No content found for grade:', grade);
      return new Response(
        JSON.stringify({
          answer: 'عذراً، لم يتم تزويد النظام بهذا المصدر بعد. يرجى الانتظار والمحاولة في وقت لاحق',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`Found ${contentPages.length} pages of content for grade ${grade}`);

    // Build context from textbook content (group by subject for better organization)
    const contentBySubject = contentPages.reduce((acc: any, page: any) => {
      if (!acc[page.subject]) {
        acc[page.subject] = [];
      }
      acc[page.subject].push(page);
      return acc;
    }, {});

    // Create context with proper structure
    const booksContext = Object.entries(contentBySubject)
      .map(([subject, pages]: [string, any[]]) => {
        const pagesText = pages
          .slice(0, 20) // Limit pages to prevent token overflow
          .map((p: any) => 
            `[الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}]\n${p.page_content}`
          )
          .join('\n\n');
        
        return `### المادة: ${subject}\n${pagesText}`;
      })
      .join('\n\n---\n\n');

    // Create the prompt with actual textbook content
    const systemPrompt = `أنت معلم أردني متخصص في المنهاج الأردني للصف ${grade}. لديك قدرة عالية على فهم الأسئلة المختلفة والربط بين المعاني والمفاهيم المتشابهة.

لديك محتوى الكتب التالية:
${booksContext}

قواعد مهمة جداً:
1. أجب فقط بناءً على محتوى الكتب المرفقة أعلاه - لا تخترع معلومات
2. كن مرناً في فهم الأسئلة: إذا سأل الطالب عن "تعريف" شيء والمحتوى يذكر "معنى" أو "مفهوم" نفس الشيء، فهي نفس المعلومة. تعامل مع الكلمات المترادفة والمفاهيم المتشابهة بذكاء.
3. افهم السؤال بصيغ مختلفة: "ما هو"، "عرف"، "اشرح"، "وضح"، "ما معنى"، "ما المقصود بـ" - كلها تطلب نفس المعلومة
4. ابحث في كل المحتوى المتاح بعناية قبل أن تقول أنك لم تجد المعلومة
5. إذا لم تجد الإجابة الدقيقة ولكن وجدت معلومات ذات صلة، قدمها للطالب
6. إذا لم تجد المعلومة حقاً بعد البحث الشامل، قل بوضوح: "عذراً، لم أجد هذه المعلومة في الكتب المتاحة حالياً"
7. عند الإجابة، اذكر:
   - رقم الوحدة واسمها
   - رقم الدرس واسمه
   - رقم الصفحة
   - المادة
8. اشرح المفهوم بطريقة واضحة ومبسطة وشاملة
9. أضف أمثلة من الكتاب نفسه عند الإمكان
10. استخدم اللغة العربية الفصحى
11. في نهاية الإجابة، اكتب المصدر بهذا الشكل:
    📚 المصدر: [المادة] - الوحدة [رقم]: [اسم الوحدة] - الدرس [رقم]: [اسم الدرس] - صفحة [رقم]
12. إذا تم إرفاق صورة مع السؤال، قم بتحليل محتواها واربطها بالمنهاج المدرسي، ثم أجب على السؤال`;


    // Call Lovable AI
    console.log('Step 2: Calling Lovable AI...');

    // Prepare messages - if there's an image, use multimodal format
    let messages;
    if (image) {
      // Extract base64 content (remove data:image/...;base64, prefix)
      const base64Content = image.split(',')[1];
      const imageType = image.split(';')[0].split('/')[1]; // e.g., 'jpeg', 'png'
      
      messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: `السؤال: ${question}` },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:image/${imageType};base64,${base64Content}`
              } 
            }
          ]
        },
      ];
    } else {
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `السؤال: ${question}` },
      ];
    }

    const aiResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.4,
          max_tokens: 4096,
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error response:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        console.error('⚠️ Rate limit hit');
        return new Response(
          JSON.stringify({
            answer: null,
            sources: [],
            error: 'تم تجاوز الحد المسموح لاستخدام الذكاء الاصطناعي حالياً. يرجى المحاولة بعد دقيقة.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (aiResponse.status === 402) {
        console.error('⚠️ Payment required');
        return new Response(
          JSON.stringify({
            answer: null,
            sources: [],
            error: 'يرجى إضافة رصيد لحساب Lovable AI.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'فشل الحصول على إجابة من الذكاء الاصطناعي',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || '';

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
    
    // If image analysis was performed, save to jordanian_image_analysis table
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
    
    // Also save to regular usage table
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
