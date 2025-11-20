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
    const { question, studentName, grade } = await req.json();

    console.log('Processing question:', { question, studentName, grade });

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

    // Get textbooks for this grade that have extracted text
    console.log('Step 1: Fetching uploaded textbooks for grade:', grade);
    const { data: textbooks, error: textbooksError } = await supabase
      .from('jordanian_textbooks')
      .select('id, book_name, subject, extracted_text')
      .eq('grade', grade)
      .eq('is_active', true)
      .not('extracted_text', 'is', null);

    if (textbooksError) {
      console.error('Error fetching textbooks:', textbooksError);
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'فشل جلب الكتب المدرسية',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!textbooks || textbooks.length === 0) {
      console.log('No textbooks with extracted text found for grade:', grade);
      return new Response(
        JSON.stringify({
          answer: 'عذراً، لم يتم استخراج نصوص الكتب بعد. يرجى الانتظار حتى يتم معالجة الكتب.',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(
      `Found ${textbooks.length} textbooks with extracted text for grade ${grade}:`,
      textbooks.map((b) => b.book_name),
    );

    // Build context from extracted textbook content (limit to prevent token overflow)
    const booksContext = textbooks
      .map((book) => {
        const textPreview = book.extracted_text?.substring(0, 8000) || 'لا يوجد نص مستخرج';
        return `### الكتاب: ${book.book_name} (${book.subject})\nالمحتوى:\n${textPreview}\n`;
      })
      .join('\n\n---\n\n');

    // Create the prompt with actual textbook content
    const systemPrompt = `أنت معلم أردني متخصص في المنهاج الأردني للصف ${grade}. 

لديك محتوى الكتب التالية:
${booksContext}

قواعد مهمة جداً:
1. أجب فقط بناءً على محتوى الكتب المرفقة أعلاه - لا تخترع معلومات
2. إذا لم تجد الإجابة في محتوى الكتب، قل بوضوح: "عذراً، لم أجد هذه المعلومة في الكتب المتاحة حالياً"
3. اذكر اسم الكتاب والمادة عند الإجابة
4. اشرح المفهوم بطريقة واضحة ومبسطة
5. أضف أمثلة من الكتاب نفسه عند الإمكان
6. استخدم اللغة العربية الفصحى`;


    // Call Lovable AI
    console.log('Step 2: Calling Lovable AI...');

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
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `السؤال: ${question}` },
          ],
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

    console.log('Answer generated from uploaded books, length:', answer.length);

    // Prepare sources
    const sources = textbooks.map((book: any) => ({
      bookName: book.book_name,
      subject: book.subject,
      fileUrl: book.file_url,
      pageNumber: null,
    }));

    // Save to database
    console.log('Step 3: Saving to database...');
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
