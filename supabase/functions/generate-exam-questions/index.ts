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

    // AI #1: Generate questions using Lovable AI
    console.log('Step 1: Generating questions...');
    const generateResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: 'أنت خبير في إنشاء الأسئلة الامتحانية للمنهاج الأردني وتلتزم بالاعتماد على الكتب المدرسية الرسمية فقط.'
          }, {
            role: 'user',
            content: `أنشئ ${questionCount} سؤالاً من نوع: ${questionTypes}\nالمادة: ${subject}\nالصف: ${grade}\nنطاق المحتوى (الوحدات/الدروس): ${contentRange}\n\nقيود صارمة:\n- اعتمد فقط على كتاب: ${books[0].book_name} الخاص بهذه المادة والصف\n- لا تستخدم أي معرفة خارج الكتاب\n- اذكر رقم الصفحة لكل سؤال إن أمكن بصيغة (ص: 12)\n- ابدأ مباشرة بكتابة الأسئلة دون أي مقدمات أو شرح إضافي\n- تنوّع بالمستوى وغطِّ النطاق المطلوب فقط\n\nأخرج الناتج كسرد منسق للأسئلة متبوعاً بإجابات نموذجية مختصرة لكل سؤال`
          }],
          temperature: 0.4,
          max_tokens: 4000
        })
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Question generation error:', errorText);
      throw new Error('فشل توليد الأسئلة');
    }

    const generateData = await generateResponse.json();
    const questions = generateData.choices?.[0]?.message?.content || '';
    
    if (!questions) {
      throw new Error('لم يتم توليد أسئلة');
    }
    
    console.log('Questions generated, length:', questions.length);

    // AI #2: Format as exam paper using Lovable AI
    console.log('Step 2: Formatting exam...');
    const formatResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `حوّل هذه الأسئلة إلى قائمة منظمة فقط بدون أي ترويسة أو مقدمة أو تعليمات أو صفحات إجابات منفصلة.\n\n${questions}\n\nالتنسيق المطلوب: أرقام متسلسلة للأسئلة، وكل سؤال تحته مسافة قصيرة للإجابة. لا تضف أي عناصر غير مطلوبة.`
          }],
          temperature: 0.2,
          max_tokens: 3000
        })
      }
    );

    if (!formatResponse.ok) {
      const errorText = await formatResponse.text();
      console.error('Format error:', errorText);
      throw new Error('فشل تنسيق الورقة الامتحانية');
    }

    const formatData = await formatResponse.json();
    const examPaper = formatData.choices?.[0]?.message?.content || '';
    
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