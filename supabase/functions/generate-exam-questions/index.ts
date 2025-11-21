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
    const { subject, grade, contentRange, questionTypes, questionCount } = await req.json();
    
    console.log('Generating exam:', { subject, grade, contentRange, questionTypes, questionCount });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Normalize subject coming from UI (Arabic) to stored subject values
    const subjectMappings: Record<string, string> = {
      'اللغه العربيه': 'Arabic',
      'اللغة العربية': 'Arabic',
      'اللغة الانجليزية': 'English',
      'الانجليزيه': 'English',
      'الرياضيات': 'Math',
      'الفيزياء': 'Physics',
      'الكيمياء': 'Chemistry',
      'الأحياء': 'Biology',
      'الاحياء': 'Biology',
    };

    const normalizedSubject = subjectMappings[subject] ?? subject;

    // Get relevant textbook content from the new text-based system
    const { data: contentPages, error: contentError } = await supabase
      .from('jordanian_textbook_content')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject)
      .order('unit_number', { ascending: true })
      .order('lesson_number', { ascending: true })
      .order('page_number', { ascending: true });

    if (contentError) {
      console.error('Database error:', contentError);
      throw new Error('فشل الوصول إلى قاعدة البيانات');
    }

    if (!contentPages || contentPages.length === 0) {
      console.log('No content found for this subject/grade when generating exam:', { subject, grade });
      const examPaper = 'لم يتوفر الكتاب';
      return new Response(
        JSON.stringify({
          examPaper,
          markdown: examPaper,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${contentPages.length} pages of content for ${subject} - ${grade}`);
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    console.log('Using Lovable AI for exam generation');

    // Generate questions using Lovable AI
    console.log('Step 1: Generating questions with Lovable AI...');
    
    // Build content context from pages
    const contentContext = contentPages
      .map((p: any) => 
        `[الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}]\n${p.page_content}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `أنت معلم أردني متخصص في إنشاء الامتحانات للمنهاج الأردني.

المعلومات:
- المادة: ${subject}
- الصف: ${grade}
- نوع الأسئلة: ${questionTypes}
- نطاق المحتوى: ${contentRange}
- عدد الأسئلة: ${questionCount}

محتوى الكتاب المتاح:
${contentContext}

يجب عليك:
1. إنشاء ${questionCount} سؤالاً امتحانياً احترافياً بناءً على المحتوى المتاح أعلاه فقط
2. التنوع بمستوى الصعوبة (سهل، متوسط، صعب)
3. تغطية النطاق المطلوب من المحتوى
4. كتابة الأسئلة بطريقة واضحة ومباشرة
5. بعد كل سؤال، اذكر المصدر: (الوحدة [رقم] - الدرس [رقم] - صفحة [رقم])
6. إضافة الإجابات النموذجية في النهاية مع ذكر المصادر

صيغة الإخراج:
- اكتب عنوان الامتحان أولاً (المادة والصف)
- رقّم الأسئلة بشكل متسلسل
- اكتب المصدر بعد كل سؤال
- اترك مساحة بعد كل سؤال
- اكتب الإجابات النموذجية في نهاية الامتحان مع المصادر`;

    const generateResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'أنشئ الامتحان الآن' },
          ],
          temperature: 0.5,
          max_tokens: 8192,
        }),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Question generation error:', generateResponse.status, errorText);
      
      if (generateResponse.status === 429) {
        console.error('⚠️ Rate limit hit');
        const examPaper = 'تم تجاوز الحد المسموح لاستخدام الذكاء الاصطناعي حالياً. يرجى المحاولة بعد دقيقة.';
        return new Response(
          JSON.stringify({
            examPaper,
            markdown: examPaper,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (generateResponse.status === 402) {
        const examPaper = 'يرجى إضافة رصيد لحساب Lovable AI.';
        return new Response(
          JSON.stringify({
            examPaper,
            markdown: examPaper,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`فشل توليد الأسئلة: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    const examPaper = generateData.choices?.[0]?.message?.content || '';
    
    if (!examPaper) {
      console.error('No questions generated');
      throw new Error('لم يتم توليد أسئلة');
    }
    
    console.log('Exam generated, length:', examPaper.length);

    console.log('Exam generation completed successfully');

    return new Response(
      JSON.stringify({ 
        examPaper,
        markdown: examPaper 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-exam-questions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ أثناء إنشاء الامتحان'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
