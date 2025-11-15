import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const questionKeys = [
  Deno.env.get('JORDANIAN_AI_QUESTION_GEN_KEY_1')!,
  Deno.env.get('JORDANIAN_AI_QUESTION_GEN_KEY_2')!,
];

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

    // Get relevant textbook
    const { data: books, error: booksError } = await supabase
      .from('jordanian_textbooks')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject)
      .eq('is_active', true)
      .limit(1);

    if (booksError) {
      console.error('Database error:', booksError);
      throw new Error('فشل الوصول إلى قاعدة البيانات');
    }

    if (!books || books.length === 0) {
      throw new Error('لم يتم العثور على كتاب مدرسي لهذه المادة والصف');
    }
    
    console.log('Found textbook:', books[0].book_name);

    // AI #1: Generate questions
    console.log('Step 1: Generating questions...');
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${questionKeys[0]}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `أنشئ ${questionCount} سؤال من نوع: ${questionTypes}\nالمادة: ${subject}\nالصف: ${grade}\nالمحتوى: ${contentRange}\n\nمتطلبات الأسئلة:\n1. متنوعة في الصعوبة\n2. تغطي المحتوى المحدد\n3. واضحة ومباشرة\n4. تتبع معايير الامتحانات الأردنية\n\nقدم الأسئلة بتنسيق واضح مع الإجابات النموذجية`
            }]
          }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4000 }
        })
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Question generation error:', errorText);
      throw new Error('فشل توليد الأسئلة');
    }

    const generateData = await generateResponse.json();
    const questions = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!questions) {
      throw new Error('لم يتم توليد أسئلة');
    }
    
    console.log('Questions generated, length:', questions.length);

    // AI #2: Format as exam paper
    console.log('Step 2: Formatting exam...');
    const formatResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${questionKeys[1]}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `نسّق هذه الأسئلة كورقة امتحانية رسمية:\n\n${questions}\n\nالتنسيق المطلوب:\n- ترويسة: المادة، الصف، التاريخ\n- تعليمات الامتحان\n- الأسئلة مرقمة ومنظمة\n- مساحات للإجابة\n- العلامات لكل سؤال\n- صفحة منفصلة للإجابات النموذجية\n\nاستخدم تنسيق Markdown للطباعة`
            }]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 3000 }
        })
      }
    );

    if (!formatResponse.ok) {
      const errorText = await formatResponse.text();
      console.error('Format error:', errorText);
      throw new Error('فشل تنسيق الورقة الامتحانية');
    }

    const formatData = await formatResponse.json();
    const examPaper = formatData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!examPaper) {
      throw new Error('لم يتم تنسيق الورقة الامتحانية');
    }

    console.log('Exam formatted successfully');
    return new Response(
      JSON.stringify({ 
        examPaper: examPaper,
        markdown: examPaper
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-exam-questions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ غير متوقع',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});