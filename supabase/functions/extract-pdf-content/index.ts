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
    const { bookId, fileUrl, grade, subject, semester } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing PDF:', { bookId, fileUrl, grade, subject, semester });

    // Download PDF file
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error('Failed to download PDF');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    console.log('PDF downloaded, size:', pdfBuffer.byteLength);

    // Use Gemini to extract and structure content
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: pdfBase64
                }
              },
              {
                text: `أنت خبير في تحليل الكتب المدرسية الأردنية. قم بتحليل هذا الكتاب واستخراج محتواه بشكل منظم.

المطلوب:
1. استخرج كل النص من الكتاب
2. حدد الوحدات (Units) وأرقامها وأسماءها
3. حدد الدروس (Lessons) داخل كل وحدة
4. قسم المحتوى إلى صفحات منطقية

أعد النتيجة بصيغة JSON كالتالي:
{
  "units": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس",
          "pages": [
            {
              "page_number": 1,
              "content": "محتوى الصفحة كاملاً..."
            }
          ]
        }
      ]
    }
  ],
  "full_text": "النص الكامل للكتاب..."
}

مهم جداً:
- استخرج كل المحتوى النصي بدقة
- حافظ على التنظيم الأصلي للكتاب
- إذا لم تتمكن من تحديد الوحدات/الدروس، ضع المحتوى في وحدة واحدة ودرس واحد
- أعد JSON صالح فقط بدون أي نص إضافي`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100000
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to extract content from PDF');
    }

    const geminiData = await geminiResponse.json();
    let extractedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Gemini response received, length:', extractedContent.length);

    // Try to parse JSON from response
    let structuredContent;
    try {
      // Clean the response - remove markdown code blocks if present
      extractedContent = extractedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      structuredContent = JSON.parse(extractedContent);
    } catch (parseError) {
      console.log('Could not parse JSON, using raw text');
      // If JSON parsing fails, create a simple structure
      structuredContent = {
        units: [{
          unit_number: 1,
          unit_name: 'المحتوى الكامل',
          lessons: [{
            lesson_number: 1,
            lesson_name: 'الدرس الأول',
            pages: [{
              page_number: 1,
              content: extractedContent
            }]
          }]
        }],
        full_text: extractedContent
      };
    }

    // Save structured content to database
    const contentRecords = [];
    
    if (structuredContent.units && Array.isArray(structuredContent.units)) {
      for (const unit of structuredContent.units) {
        if (unit.lessons && Array.isArray(unit.lessons)) {
          for (const lesson of unit.lessons) {
            if (lesson.pages && Array.isArray(lesson.pages)) {
              for (const page of lesson.pages) {
                contentRecords.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unit.unit_number || 1,
                  unit_name: unit.unit_name || 'وحدة غير محددة',
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || 'درس غير محدد',
                  page_number: page.page_number || 1,
                  page_content: page.content || ''
                });
              }
            }
          }
        }
      }
    }

    // If no structured content, save full text
    if (contentRecords.length === 0 && structuredContent.full_text) {
      contentRecords.push({
        grade,
        subject,
        semester,
        unit_number: 1,
        unit_name: 'المحتوى الكامل',
        lesson_number: 1,
        lesson_name: 'المحتوى',
        page_number: 1,
        page_content: structuredContent.full_text
      });
    }

    console.log('Saving', contentRecords.length, 'content records');

    // Insert content records
    if (contentRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('jordanian_textbook_content')
        .insert(contentRecords);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Failed to save content');
      }
    }

    // Update book record with extracted text
    await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: structuredContent.full_text?.substring(0, 50000) || extractedContent.substring(0, 50000),
        page_count: contentRecords.length
      })
      .eq('id', bookId);

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: structuredContent.full_text || extractedContent,
        recordsCount: contentRecords.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
