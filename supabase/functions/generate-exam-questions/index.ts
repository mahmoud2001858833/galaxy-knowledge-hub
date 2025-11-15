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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get relevant textbook
    const { data: books } = await supabase
      .from('jordanian_textbooks')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject)
      .eq('is_active', true)
      .limit(1);

    if (!books || books.length === 0) {
      throw new Error('No textbook found');
    }

    // AI #1: Generate questions
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

    const generateData = await generateResponse.json();
    const questions = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // AI #2: Format as exam paper
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

    const formatData = await formatResponse.json();
    const examPaper = formatData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ 
        examPaper: examPaper,
        markdown: examPaper
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});