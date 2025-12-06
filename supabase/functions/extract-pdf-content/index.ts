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

    console.log('=== PDF Extraction Started ===');
    console.log('Input:', { bookId, fileUrl, grade, subject, semester });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use Google Gemini API key
    const geminiApiKey = Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1');
    
    if (!geminiApiKey) {
      console.error('JORDANIAN_AI_SEARCH_KEY_1 not configured');
      throw new Error('مفتاح API غير مُعد. يرجى التواصل مع المسؤول.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download PDF file
    console.log('Downloading PDF from:', fileUrl);
    const pdfResponse = await fetch(fileUrl);
    
    if (!pdfResponse.ok) {
      console.error('PDF download failed:', pdfResponse.status, pdfResponse.statusText);
      throw new Error(`فشل تحميل ملف PDF: ${pdfResponse.status}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    
    console.log('PDF downloaded successfully, size:', pdfBuffer.byteLength, 'bytes');

    // Use Google Gemini to extract and structure content
    console.log('Sending to Gemini for extraction...');
    
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
1. استخرج كل النص من الكتاب بدقة عالية
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
- إذا لم تتمكن من تحديد الوحدات/الدروس بوضوح، قسم المحتوى حسب العناوين الموجودة
- أعد JSON صالح فقط بدون أي نص إضافي أو markdown`
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
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`فشل استخراج المحتوى من PDF: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    let extractedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Gemini response received, length:', extractedContent.length);

    if (!extractedContent || extractedContent.length < 50) {
      console.error('Empty or too short response from Gemini');
      throw new Error('لم يتم استخراج محتوى كافٍ من الملف');
    }

    // Parse JSON from response
    let structuredContent;
    try {
      // Clean the response - remove markdown code blocks if present
      extractedContent = extractedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      structuredContent = JSON.parse(extractedContent);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.log('Could not parse JSON, creating simple structure');
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
            } else {
              // No pages defined, create one from lesson content
              contentRecords.push({
                grade,
                subject,
                semester,
                unit_number: unit.unit_number || 1,
                unit_name: unit.unit_name || 'وحدة غير محددة',
                lesson_number: lesson.lesson_number || 1,
                lesson_name: lesson.lesson_name || 'درس غير محدد',
                page_number: 1,
                page_content: lesson.content || ''
              });
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

    console.log('Saving', contentRecords.length, 'content records to database');

    // Insert content records
    if (contentRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('jordanian_textbook_content')
        .insert(contentRecords);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`فشل حفظ المحتوى: ${insertError.message}`);
      }
      console.log('Content records saved successfully');
    }

    // Update book record with extracted text
    const fullText = structuredContent.full_text?.substring(0, 50000) || extractedContent.substring(0, 50000);
    const { error: updateError } = await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: fullText,
        page_count: contentRecords.length
      })
      .eq('id', bookId);

    if (updateError) {
      console.error('Book update error:', updateError);
    }

    console.log('=== PDF Extraction Completed Successfully ===');

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: fullText,
        recordsCount: contentRecords.length,
        units: structuredContent.units?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== PDF Extraction Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ غير متوقع',
        details: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});