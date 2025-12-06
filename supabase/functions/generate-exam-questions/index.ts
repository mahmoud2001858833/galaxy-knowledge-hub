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
    const { 
      subject, 
      grade, 
      contentRange, 
      contentType,
      selectedUnits,
      selectedLessons,
      contentDescription,
      questionTypes, 
      questionCount 
    } = await req.json();
    
    console.log('📝 Generating exam:', { subject, grade, contentRange, contentType, contentDescription, questionTypes, questionCount });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY غير مكون');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query based on content type
    let query = supabase
      .from('jordanian_textbook_content')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject);

    // Filter by units or lessons if specified
    if (contentType === 'unit' && selectedUnits && selectedUnits.length > 0) {
      const unitNumbers = selectedUnits.map((u: string) => {
        const match = u.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      }).filter((n: number | null) => n !== null);
      
      if (unitNumbers.length > 0) {
        query = query.in('unit_number', unitNumbers);
      }
    } else if (contentType === 'lesson' && selectedLessons && selectedLessons.length > 0) {
      const lessonFilters = selectedLessons.map((l: string) => {
        const unitMatch = l.match(/الوحدة (\d+)/);
        const lessonMatch = l.match(/الدرس (\d+)/);
        if (unitMatch && lessonMatch) {
          return { unit: parseInt(unitMatch[1]), lesson: parseInt(lessonMatch[1]) };
        }
        return null;
      }).filter((f: any) => f !== null);

      if (lessonFilters.length > 0) {
        query = query.or(
          lessonFilters.map((f: any) => 
            `and(unit_number.eq.${f.unit},lesson_number.eq.${f.lesson})`
          ).join(',')
        );
      }
    }

    query = query
      .order('unit_number', { ascending: true })
      .order('lesson_number', { ascending: true })
      .order('page_number', { ascending: true });

    const { data: contentPages, error: contentError } = await query;

    if (contentError) {
      console.error('Database error:', contentError);
      throw new Error('فشل الوصول إلى قاعدة البيانات');
    }

    if (!contentPages || contentPages.length === 0) {
      console.log('No content found:', { subject, grade });
      return new Response(
        JSON.stringify({ examPaper: 'لم يتوفر الكتاب', markdown: 'لم يتوفر الكتاب' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📚 Found ${contentPages.length} pages for ${subject} - ${grade}`);

    // Build content context from pages
    const contentContext = contentPages
      .map((p: any) => 
        `[الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}]\n${p.page_content}`
      )
      .join('\n\n---\n\n');

    // Merge content range with description
    const fullContentScope = contentDescription?.trim() 
      ? `${contentRange} - ${contentDescription.trim()}`
      : contentRange;

    const systemPrompt = `أنت معلم أردني متخصص في إنشاء الامتحانات للمنهاج الأردني.

المعلومات:
- المادة: ${subject}
- الصف: ${grade}
- نوع الأسئلة المطلوبة: ${questionTypes}
- نطاق المحتوى: ${fullContentScope}
- عدد الأسئلة المطلوب: ${questionCount}

محتوى الكتاب المتاح:
${contentContext}

🚨 تعليمات صارمة:
1. يجب إنشاء ${questionCount} سؤالاً بالضبط - لا أكثر ولا أقل!
2. كل سؤال يجب أن يكون من المحتوى أعلاه حصراً
3. نوّع في مستوى الصعوبة (سهل 30%، متوسط 50%، صعب 20%)
4. نص عادي فقط - بدون ** أو ## أو أي تنسيق markdown
5. بعد كل سؤال اكتب المصدر بالضبط: (الوحدة X: اسمها - الدرس Y: اسمه - صفحة Z)
6. في النهاية اكتب "الإجابات النموذجية" ثم إجابة كل سؤال مع مصدرها

صيغة الإخراج المطلوبة:
امتحان ${subject} - ${grade}
${fullContentScope}

السؤال الأول: [نص السؤال]
(الوحدة X: اسم الوحدة - الدرس Y: اسم الدرس - صفحة Z)

السؤال الثاني: [نص السؤال]
(الوحدة X: اسم الوحدة - الدرس Y: اسم الدرس - صفحة Z)

... وهكذا حتى السؤال رقم ${questionCount}

الإجابات النموذجية:

1. [الإجابة] - المصدر: (الوحدة X - الدرس Y - صفحة Z)
2. [الإجابة] - المصدر: (الوحدة X - الدرس Y - صفحة Z)
...`;

    console.log('🤖 Calling Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'أنشئ الامتحان الآن' }
        ],
        temperature: 0.5,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً');
      }
      if (response.status === 402) {
        throw new Error('يرجى إضافة رصيد للحساب');
      }
      
      throw new Error(`فشل توليد الأسئلة: ${response.status}`);
    }

    const data = await response.json();
    const examPaper = data.choices?.[0]?.message?.content || '';
    
    if (!examPaper) {
      throw new Error('لم يتم توليد أسئلة');
    }
    
    console.log('✅ Exam generated successfully, length:', examPaper.length);

    return new Response(
      JSON.stringify({ examPaper, markdown: examPaper }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ أثناء إنشاء الامتحان' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
