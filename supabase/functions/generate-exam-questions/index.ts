import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get relevant textbook
    const { data: books, error: booksError } = await supabase
      .from('jordanian_textbooks')
      .select('*')
      .eq('grade', grade)
      .eq('subject', normalizedSubject)
      .eq('is_active', true)
      .not('gemini_file_uri', 'is', null)
      .limit(1);

    if (booksError) {
      console.error('Database error:', booksError);
      throw new Error('فشل الوصول إلى قاعدة البيانات');
    }

    if (!books || books.length === 0) {
      console.log('No textbooks found for this subject/grade when generating exam:', { subject, normalizedSubject, grade });
      const examPaper = 'لم يتوفر الكتاب';
      return new Response(
        JSON.stringify({
          examPaper,
          markdown: examPaper,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found textbook:', books[0].book_name, 'with Gemini URI:', books[0].gemini_file_uri);
    
    // Use Gemini API directly with the uploaded file
    const GEMINI_API_KEY = Deno.env.get('JORDANIAN_AI_QUESTION_GEN_KEY_1')!;
    
    const filePart = {
      fileData: {
        mimeType: 'application/pdf',
        fileUri: books[0].gemini_file_uri
      }
    };

    // AI #1: Generate questions using Gemini with the uploaded file
    console.log('Step 1: Generating questions with Gemini...');
    
    const questionPrompt = `استخدم الكتاب المرفق لإنشاء ${questionCount} سؤالاً امتحانياً.

المواصفات:
- نوع الأسئلة: ${questionTypes}
- المادة: ${subject}
- الصف: ${grade}
- نطاق المحتوى: ${contentRange}

قيود صارمة:
- اقرأ الكتاب المرفق جيداً
- اعتمد فقط على محتوى الكتاب المرفق - لا تستخدم أي معرفة خارجية
- اذكر رقم الصفحة لكل سؤال بدقة بصيغة (ص: XX)
- ابدأ مباشرة بكتابة الأسئلة دون مقدمات
- تنوّع بالمستوى (سهل، متوسط، صعب)
- غطِّ فقط النطاق المطلوب من المحتوى

صيغة الإخراج:
السؤال 1: [نص السؤال] (ص: XX)
السؤال 2: [نص السؤال] (ص: XX)
...

ثم اكتب الإجابات النموذجية:
الإجابة 1: [نص مختصر]
الإجابة 2: [نص مختصر]
...`;

    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              filePart,
              { text: questionPrompt }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Question generation error:', generateResponse.status, errorText);
      throw new Error(`فشل توليد الأسئلة: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    const questions = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!questions) {
      console.error('No questions generated from Gemini');
      throw new Error('لم يتم توليد أسئلة');
    }
    
    console.log('Questions generated, length:', questions.length);

    // AI #2: Format as exam paper using Gemini
    console.log('Step 2: Formatting exam...');
    
    const formatPrompt = `نسّق الأسئلة التالية على شكل ورقة امتحانية احترافية ومنظمة:

${questions}

متطلبات التنسيق:
- عنوان واضح للامتحان يتضمن المادة والصف
- ترقيم منظم ومتسلسل
- مساحات كافية بعد كل سؤال للإجابة
- الحفاظ على أرقام الصفحات كما هي
- إزالة أي نصوص إضافية غير ضرورية
- تنسيق نظيف وسهل القراءة`;

    const formatResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: formatPrompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!formatResponse.ok) {
      const errorText = await formatResponse.text();
      console.error('Formatting error:', formatResponse.status, errorText);
      console.log('Using unformatted questions as fallback');
      const examPaper = questions; // Fallback to unformatted
      return new Response(
        JSON.stringify({ examPaper, markdown: examPaper }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formatData = await formatResponse.json();
    const examPaper = formatData.candidates?.[0]?.content?.parts?.[0]?.text || questions;

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
