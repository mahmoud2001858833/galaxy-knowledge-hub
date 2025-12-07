import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, studentName, grade, image } = await req.json();
    console.log('🎓 Processing question:', { question, studentName, grade, hasImage: !!image });

    if (!question) {
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'السؤال مفقود' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'إعدادات الذكاء الاصطناعي غير مكتملة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ تحسين: بحث ذكي في المحتوى باستخدام كلمات مفتاحية
    console.log('📚 Searching textbook content...');
    
    // استخراج كلمات البحث من السؤال
    const searchKeywords = question
      .replace(/[؟،.!:]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 2)
      .slice(0, 5);
    
    console.log('🔍 Search keywords:', searchKeywords);

    // جلب كل المحتوى مع البحث
    const { data: allContent, error: contentError } = await supabase
      .from('jordanian_textbook_content')
      .select('*')
      .order('grade', { ascending: true })
      .order('unit_number', { ascending: true })
      .order('lesson_number', { ascending: true })
      .order('page_number', { ascending: true });

    if (contentError) {
      console.error('Content fetch error:', contentError);
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'فشل جلب المحتوى الدراسي' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allContent || allContent.length === 0) {
      console.log('❌ No content found in database');
      return new Response(
        JSON.stringify({
          answer: 'عذراً، لم يتم تزويد النظام بأي محتوى دراسي بعد. يرجى الانتظار والمحاولة في وقت لاحق',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📖 Total pages in database: ${allContent.length}`);

    // ✅ تحسين: ترتيب المحتوى حسب الصلة بالسؤال
    const scoredContent = allContent.map((page: any) => {
      let score = 0;
      const pageText = (page.page_content || '').toLowerCase();
      const lessonName = (page.lesson_name || '').toLowerCase();
      const unitName = (page.unit_name || '').toLowerCase();
      
      for (const keyword of searchKeywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (pageText.includes(lowerKeyword)) score += 3;
        if (lessonName.includes(lowerKeyword)) score += 5;
        if (unitName.includes(lowerKeyword)) score += 4;
      }
      
      // إعطاء أولوية لصف الطالب
      if (page.grade === grade) score += 2;
      
      return { ...page, relevanceScore: score };
    });

    // ترتيب حسب الصلة
    scoredContent.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    // أخذ أعلى 50 صفحة ذات صلة + كل المحتوى من صف الطالب
    const gradeContent = scoredContent.filter((p: any) => p.grade === grade);
    const relevantContent = scoredContent.filter((p: any) => p.relevanceScore > 0).slice(0, 30);
    
    // دمج المحتوى بدون تكرار
    const contentMap = new Map();
    [...gradeContent, ...relevantContent].forEach((p: any) => {
      contentMap.set(p.id, p);
    });
    
    const contentPages = Array.from(contentMap.values());
    
    console.log(`📊 Using ${contentPages.length} relevant pages (${gradeContent.length} from student's grade)`);

    // Build context with clear source markers
    const booksContext = contentPages
      .map((p: any) => 
        `<<<المصدر: الصف: ${p.grade} | المادة: ${p.subject} | الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}>>>\n${p.page_content}\n<<<نهاية المصدر>>>`
      )
      .join('\n\n');

    console.log(`📝 Context size: ${booksContext.length} characters`);

    const systemPrompt = `أنت معلم أردني خبير ذو خبرة 30 عاماً في تدريس المنهاج الأردني لجميع الصفوف.

لديك محتوى من الكتب المدرسية الأردنية:
${booksContext}

📚 قواعد البحث والإجابة المُحسَّنة:

1. **البحث الشامل والذكي**: 
   - ابحث في كل المحتوى المتاح بدقة
   - ابحث عن المفاهيم وليس الكلمات الحرفية فقط
   - إذا سأل الطالب "ما تعريف X" ابحث عن: "X هو/هي"، "يُعرَّف X"، "X:" إلخ

2. **المرونة اللغوية الكاملة**: 
   - "تعريف" = "معنى" = "مفهوم" = "ما هو" = "ما المقصود بـ"
   - "أسباب" = "عوامل" = "دوافع" = "لماذا"
   - "نتائج" = "آثار" = "عواقب" = "ماذا حدث"
   - تجاهل الفروق الإملائية والهمزات
   - افهم السياق العام للسؤال

3. **إذا وجدت المعلومة - صيغة الإجابة**:
   ابدأ بشرح واضح ومفصل للإجابة
   أضف أمثلة من الكتاب إذا وجدت
   
   ثم اختم بالمصدر المحدد فقط:
   📚 المصدر:
   - الكتاب: [اسم المادة]
   - الصف: [الصف]
   - الوحدة: [رقم]: [اسم الوحدة]
   - الدرس: [رقم]: [اسم الدرس]
   - الصفحة: [رقم]

4. **قاعدة المصدر الواحد**: 
   ⚠️ اذكر فقط المصدر الذي أخذت منه المعلومة فعلياً
   ⚠️ لا تسرد كل الكتب المتاحة

5. **إذا لم تجد المعلومة بعد البحث الشامل**:
   قل: "عذراً، لم أجد هذه المعلومة في الكتب المتاحة حالياً. قد تكون في كتاب لم يتم رفعه بعد."

6. اللغة: استخدم العربية الفصحى الواضحة والبسيطة

الطالب ${studentName} من الصف ${grade} يسأل. ابحث بعناية في كل المحتوى للإجابة.`;

    console.log('🤖 Calling Lovable AI Gateway...');

    // Prepare messages for Lovable AI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (image) {
      const base64Content = image.split(',')[1] || image;
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: `السؤال: ${question}` },
          { 
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Content}` }
          }
        ]
      });
    } else {
      messages.push({ role: 'user', content: `السؤال: ${question}` });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ answer: null, sources: [], error: 'تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ answer: null, sources: [], error: 'يرجى إضافة رصيد للحساب' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'فشل الحصول على إجابة من الذكاء الاصطناعي' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '';

    if (!answer) {
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'لم يتم توليد إجابة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Answer generated, length:', answer.length);

    // Extract sources from the answer text
    const sources: any[] = [];
    
    const sourceMatch = answer.match(/📚\s*المصدر[\s\S]*?(?=\n\n|$)/);
    if (sourceMatch) {
      const sourceText = sourceMatch[0];
      const subjectMatch = sourceText.match(/الكتاب:\s*([^\n]+)/);
      const gradeMatch = sourceText.match(/الصف:\s*([^\n]+)/);
      const unitMatch = sourceText.match(/الوحدة:\s*(\d+)[:\s]*([^\n]*)/);
      const lessonMatch = sourceText.match(/الدرس:\s*(\d+)[:\s]*([^\n]*)/);
      const pageMatch = sourceText.match(/الصفحة:\s*(\d+)/);

      if (subjectMatch || pageMatch) {
        sources.push({
          bookName: subjectMatch?.[1]?.trim() || 'الكتاب',
          subject: subjectMatch?.[1]?.trim() || '',
          grade: gradeMatch?.[1]?.trim() || grade,
          unitNumber: unitMatch ? parseInt(unitMatch[1]) : null,
          unitName: unitMatch?.[2]?.trim() || '',
          lessonNumber: lessonMatch ? parseInt(lessonMatch[1]) : null,
          lessonName: lessonMatch?.[2]?.trim() || '',
          pageNumber: pageMatch ? pageMatch[1] : null,
          fileUrl: null,
        });
      }
    }

    // Save to database
    if (image) {
      await supabase.from('jordanian_image_analysis').insert({
        student_name: studentName,
        grade: grade,
        question: question,
        image_url: image,
        analysis_result: answer,
      });
    }
    
    await supabase.from('student_assistant_usage').insert({
      student_name: studentName,
      grade: grade,
      question: question,
      answer: answer,
      sources: sources,
    });

    console.log('💾 Answer saved, sources:', sources.length);

    return new Response(
      JSON.stringify({ answer, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ answer: null, sources: [], error: error?.message || 'حدث خطأ غير متوقع' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
