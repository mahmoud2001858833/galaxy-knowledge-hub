import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const answerKeys = [
  Deno.env.get('JORDANIAN_AI_ANSWER_KEY_1')!,
  Deno.env.get('JORDANIAN_AI_ANSWER_KEY_2')!,
  Deno.env.get('JORDANIAN_AI_ANSWER_KEY_3')!,
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, searchResults, studentName, grade } = await req.json();
    
    console.log('Processing question:', { question, studentName, grade, resultsCount: searchResults?.length });

    if (!question || !searchResults || searchResults.length === 0) {
      throw new Error('السؤال أو نتائج البحث مفقودة');
    }

    // AI #1: Analyze question context
    console.log('Step 1: Analyzing context...');
    const contextResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${answerKeys[0]}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `حلل هذا السؤال وحدد: ${question}\n\n1. الموضوع الرئيسي\n2. المفاهيم المطلوبة\n3. مستوى التفصيل المناسب`
            }]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
        })
      }
    );

    if (!contextResponse.ok) {
      const errorText = await contextResponse.text();
      console.error('Context API error:', errorText);
      throw new Error('فشل تحليل السياق');
    }

    const contextData = await contextResponse.json();
    const context = contextData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Context analyzed:', context.substring(0, 100));

    // AI #2: Formulate main answer
    console.log('Step 2: Generating answer...');
    const searchContent = searchResults.map((r: any) => 
      `من كتاب ${r.bookName} (${r.subject}):\n${r.content}`
    ).join('\n\n---\n\n');

    const answerResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${answerKeys[1]}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `أنت معلم أردني متخصص. باستخدام المعلومات التالية من الكتب المدرسية، أجب على سؤال الطالب ${studentName} من الصف ${grade}.\n\nالسؤال: ${question}\n\nالسياق: ${context}\n\nالمحتوى من الكتب:\n${searchContent}\n\nقدم إجابة تفصيلية وواضحة مع:\n1. شرح المفهوم بطريقة سهلة\n2. أمثلة توضيحية\n3. ذكر المصادر وأرقام الصفحات بدقة`
            }]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 3000 }
        })
      }
    );

    if (!answerResponse.ok) {
      const errorText = await answerResponse.text();
      console.error('Answer API error:', errorText);
      throw new Error('فشل توليد الإجابة');
    }

    const answerData = await answerResponse.json();
    const mainAnswer = answerData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!mainAnswer) {
      throw new Error('لم يتم توليد إجابة');
    }
    
    console.log('Answer generated, length:', mainAnswer.length);

    // AI #3: Review and enhance
    console.log('Step 3: Enhancing answer...');
    const reviewResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${answerKeys[2]}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `راجع هذه الإجابة وحسّنها بإضافة:\n1. نصائح دراسية\n2. أسئلة تفكيرية\n3. تأكد من دقة المعلومات\n\nالإجابة:\n${mainAnswer}`
            }]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
        })
      }
    );

    if (!reviewResponse.ok) {
      console.warn('Review API error, using main answer');
    } else {
      const reviewData = await reviewResponse.json();
      const enhancedAnswer = reviewData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (enhancedAnswer) {
        console.log('Answer enhanced');
      }
    }

    const reviewData = await reviewResponse.json();
    const finalAnswer = reviewData.candidates?.[0]?.content?.parts?.[0]?.text || mainAnswer;

    // Extract sources
    const sources = searchResults.map((r: any) => ({
      bookName: r.bookName,
      subject: r.subject,
      bookId: r.bookId
    }));

    // Save to database
    console.log('Step 4: Saving to database...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      await supabase.from('student_assistant_usage').insert({
        user_id: req.headers.get('x-user-id'),
        student_name: studentName,
        grade: grade,
        question: question,
        answer: finalAnswer,
        sources: sources
      });
      console.log('Saved to database successfully');
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if DB save fails
    }

    console.log('Request completed successfully');
    return new Response(
      JSON.stringify({ 
        answer: finalAnswer,
        sources: sources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in jordanian-assistant-answer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ غير متوقع',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});