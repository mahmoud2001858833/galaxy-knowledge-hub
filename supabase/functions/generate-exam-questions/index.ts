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
    const { 
      subject, 
      grade, 
      contentRange, 
      contentType,
      selectedUnits,
      selectedLessons,
      contentDescription, // صندوق الوصف الجديد
      questionTypes, 
      questionCount 
    } = await req.json();
    
    console.log('Generating exam:', { subject, grade, contentRange, contentType, contentDescription, questionTypes, questionCount });

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
    
    if (!GOOGLE_AI_KEY) {
      throw new Error('JORDANIAN_ASSISTANT_AI_KEY not configured');
    }
    
    console.log('Using Google Gemini AI for exam generation');

    // Build content context from pages
    const contentContext = contentPages
      .map((p: any) => 
        `[الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}]\n${p.page_content}`
      )
      .join('\n\n---\n\n');

    // إضافة وصف المحتوى إذا كان موجوداً
    const descriptionSection = contentDescription 
      ? `\n- وصف إضافي من المستخدم: ${contentDescription}` 
      : '';

    const systemPrompt = `أنت معلم أردني متخصص في إنشاء الامتحانات للمنهاج الأردني.

المعلومات:
- المادة: ${subject}
- الصف: ${grade}
- نوع الأسئلة: ${questionTypes}
- نطاق المحتوى: ${contentRange}${descriptionSection}
- عدد الأسئلة المطلوب: ${questionCount}

محتوى الكتاب المتاح:
${contentContext}

CRITICAL: يجب إنشاء ${questionCount} سؤالاً بالضبط - لا أكثر ولا أقل!

التعليمات:
1. اكتب ${questionCount} سؤالاً امتحانياً بناءً على المحتوى أعلاه فقط
2. التنوع بمستوى الصعوبة (سهل، متوسط، صعب)
3. نص عادي بدون markdown (لا ** ولا ##)
4. بعد كل سؤال: (الوحدة X - الدرس Y - صفحة Z)
5. في النهاية: "الإجابات النموذجية" ثم اكتب إجابة كل سؤال

صيغة الإخراج (نص عادي):
امتحان [المادة] - [الصف]

1. السؤال الأول...
(الوحدة X - الدرس Y - صفحة Z)

2. السؤال الثاني...
(الوحدة X - الدرس Y - صفحة Z)

الإجابات النموذجية

1. الإجابة الأولى...
2. الإجابة الثانية...`;

    // Call Google Gemini API directly
    console.log('Step 1: Generating questions with Google Gemini AI...');

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nأنشئ الامتحان الآن` }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Google Gemini error:', geminiResponse.status, errorText);
      
      throw new Error(`فشل توليد الأسئلة: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const examPaper = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
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
