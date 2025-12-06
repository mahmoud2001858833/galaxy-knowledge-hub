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

    // Get ALL textbook content
    console.log('📚 Fetching textbook content...');
    const { data: contentPages, error: contentError } = await supabase
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

    if (!contentPages || contentPages.length === 0) {
      return new Response(
        JSON.stringify({
          answer: 'عذراً، لم يتم تزويد النظام بأي محتوى دراسي بعد. يرجى الانتظار والمحاولة في وقت لاحق',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📖 Found ${contentPages.length} pages across all grades`);

    // Build context with clear source markers
    const booksContext = contentPages
      .map((p: any) => 
        `<<<المصدر: الصف: ${p.grade} | المادة: ${p.subject} | الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}>>>\n${p.page_content}\n<<<نهاية المصدر>>>`
      )
      .join('\n\n');

    const systemPrompt = `أنت معلم أردني خبير متخصص في المنهاج الأردني لجميع الصفوف.

لديك محتوى كامل من الكتب الدراسية:
${booksContext}

📚 قواعد البحث والإجابة:

1. **البحث الشامل**: ابحث في كل المحتوى من جميع الصفوف والمواد

2. **المرونة اللغوية**: 
   - "تعريف" = "معنى" = "مفهوم" = "ما هو"
   - تجاهل الفروق الإملائية
   - افهم السياق وليس النص الحرفي فقط

3. **صيغة الإجابة الإلزامية**:
   - ابدأ بشرح واضح ومفصل للإجابة
   - أضف أمثلة إذا وجدت
   - **اختم بالمصدر المحدد فقط** بهذا الشكل:
   
   📚 المصدر:
   - الكتاب: [اسم الكتاب/المادة]
   - الصف: [الصف]
   - الوحدة: [رقم]: [اسم الوحدة]
   - الدرس: [رقم]: [اسم الدرس]
   - الصفحة: [رقم]

4. **قاعدة المصدر الواحد**: 
   ⚠️ اذكر فقط الكتاب والصفحة التي أخذت منها المعلومة فعلياً
   ⚠️ لا تذكر كل الكتب المتاحة - فقط المصدر الذي استخدمته للإجابة
   ⚠️ إذا استخدمت أكثر من مصدر، اذكر كل مصدر بجانب المعلومة التي أخذتها منه

5. إذا لم تجد المعلومة بعد البحث الشامل، قل:
   "عذراً، لم أجد هذه المعلومة في الكتب المتاحة حالياً"

6. اللغة: استخدم العربية الفصحى الواضحة

طالب الصف ${grade} يسأل: ابحث في كل الكتب للإجابة`;

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
