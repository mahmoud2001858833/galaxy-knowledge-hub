import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// استخدام المفاتيح الجديدة من المشروع الجديد
const POSSIBLE_KEYS = [
  'JORDANIAN_NEW_AI_KEY_1',
  'JORDANIAN_NEW_AI_KEY_2',
  'JORDANIAN_NEW_AI_KEY_3',
  'JORDANIAN_NEW_AI_KEY_4',
  'JORDANIAN_NEW_AI_KEY_5',
] as const;

// اختر مفتاحاً عشوائياً من المتوفرين لتوزيع الحمل بين أكثر من مشروع/مفتاح
function pickGeminiApiKey(): { key: string; keyName: string } | null {
  const availableKeysData = POSSIBLE_KEYS
    .map(keyName => ({ keyName, key: Deno.env.get(keyName) }))
    .filter(item => item.key !== undefined && item.key !== null && item.key !== '');

  console.log(`Available API keys for answers: ${availableKeysData.length} out of ${POSSIBLE_KEYS.length}`);

  if (availableKeysData.length === 0) return null;

  const index = Math.floor(Math.random() * availableKeysData.length);
  const selected = availableKeysData[index];
  
  // Log last 6 characters for tracking (without exposing full key)
  const keyPreview = selected.key!.slice(-6);
  console.log(`Selected answer key: ${selected.keyName} (ending: ...${keyPreview})`);
  
  return { key: selected.key!, keyName: selected.keyName };
}

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

    const apiKeyResult = pickGeminiApiKey();

    if (!apiKeyResult) {
      console.error('No Gemini API keys configured in Supabase secrets');
      return new Response(
        JSON.stringify({
          answer: null,
          sources: [],
          error: 'إعدادات الذكاء الاصطناعي غير مكتملة. يرجى التواصل مع المطوّر.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { key: GEMINI_API_KEY, keyName: SELECTED_KEY_NAME } = apiKeyResult;

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get textbooks for this grade that have been uploaded to Gemini
    console.log('Step 1: Fetching uploaded textbooks for grade:', grade);
    const { data: textbooks, error: textbooksError } = await supabase
      .from('jordanian_textbooks')
      .select('*')
      .eq('grade', grade)
      .eq('is_active', true)
      .not('gemini_file_uri', 'is', null);

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
      console.log('No textbooks found for grade:', grade);
      return new Response(
        JSON.stringify({
          answer: 'لم يتوفر الكتاب',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(
      `Found ${textbooks.length} uploaded textbooks for grade ${grade}:`,
      textbooks.map((b) => b.book_name),
    );

    // Prepare file parts for Gemini API
    const fileParts = textbooks.map((book) => ({
      fileData: {
        mimeType: 'application/pdf',
        fileUri: book.gemini_file_uri,
      },
    }));

    // Create the prompt with file context
    const prompt = `أنت معلم أردني متخصص. استخدم الكتب المرفقة للإجابة على سؤال الطالب ${studentName} من الصف ${grade}.

السؤال: ${question}

يجب عليك:
1. قراءة الكتب المرفقة بعناية
2. الإجابة فقط من محتوى الكتب المرفقة - لا تستخدم معلومات خارجية
3. ذكر اسم الكتاب ورقم الصفحة بدقة لكل معلومة
4. شرح المفهوم بطريقة واضحة ومبسطة
5. إضافة أمثلة توضيحية من الكتاب
6. إذا لم تجد الإجابة في الكتب المرفقة، قل: "عذراً، لم أجد هذه المعلومة في الكتب المتاحة"

الكتب المتاحة:
${textbooks.map((b) => `- ${b.book_name} (${b.subject})`).join('\n')}`;

    // Call Gemini API with files
    console.log('Step 2: Calling Gemini API with uploaded files...');
    console.log('File parts:', JSON.stringify(fileParts, null, 2));
    console.log('Prompt:', prompt);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                ...fileParts,
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API error response [${SELECTED_KEY_NAME}]:`, geminiResponse.status, errorText);

      // Rate limit / quota exceeded → أعد رسالة مفهومة بدون 500
      if (geminiResponse.status === 429) {
        console.error(`Rate limit hit on answer key: ${SELECTED_KEY_NAME}`);
        return new Response(
          JSON.stringify({
            answer: null,
            sources: [],
            error: 'تم تجاوز الحد المسموح لاستخدام الذكاء الاصطناعي حالياً. يرجى المحاولة بعد دقيقة.',
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

    const geminiData = await geminiResponse.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
