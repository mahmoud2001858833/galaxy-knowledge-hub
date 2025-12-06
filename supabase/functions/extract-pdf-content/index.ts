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

    if (!bookId || !fileUrl || !grade || !subject || !semester) {
      throw new Error('جميع الحقول مطلوبة: bookId, fileUrl, grade, subject, semester');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Try multiple API keys
    const apiKeys = [
      Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1'),
      Deno.env.get('JORDANIAN_AI_SEARCH_KEY_2'),
      Deno.env.get('JORDANIAN_AI_ANSWER_KEY_1'),
      Deno.env.get('GOOGLE_AI_API_KEY'),
    ].filter(Boolean);
    
    if (apiKeys.length === 0) {
      console.error('No API keys configured');
      throw new Error('مفاتيح API غير مُعدة. يرجى التواصل مع المسؤول.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download PDF file with timeout
    console.log('Downloading PDF from:', fileUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
    
    let pdfResponse;
    try {
      pdfResponse = await fetch(fileUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('PDF download failed:', fetchError.message);
      throw new Error(`فشل تحميل ملف PDF: ${fetchError.message}`);
    }
    
    if (!pdfResponse.ok) {
      console.error('PDF download failed:', pdfResponse.status, pdfResponse.statusText);
      throw new Error(`فشل تحميل ملف PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfSize = pdfBuffer.byteLength;
    console.log('PDF downloaded successfully, size:', pdfSize, 'bytes (', (pdfSize / 1024 / 1024).toFixed(2), 'MB)');

    // Check file size - Gemini has limits
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB
    if (pdfSize > maxSizeBytes) {
      console.error('PDF too large:', pdfSize);
      throw new Error('ملف PDF كبير جداً. الحد الأقصى هو 20 ميجابايت');
    }

    // Convert to base64
    const pdfBytes = new Uint8Array(pdfBuffer);
    let pdfBase64 = '';
    const chunkSize = 32768; // Process in chunks to avoid memory issues
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.slice(i, i + chunkSize);
      pdfBase64 += String.fromCharCode.apply(null, Array.from(chunk));
    }
    pdfBase64 = btoa(pdfBase64);
    
    console.log('PDF converted to base64, length:', pdfBase64.length);

    // Try extraction with multiple API keys
    let geminiData = null;
    let lastError = null;

    for (const apiKey of apiKeys) {
      try {
        console.log('Attempting extraction with API key...');
        
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

معلومات الكتاب:
- الصف: ${grade}
- المادة: ${subject}
- الفصل: ${semester}

المطلوب:
1. استخرج كل النص من الكتاب بدقة عالية جداً
2. حدد الوحدات (Units) وأرقامها وأسماءها
3. حدد الدروس (Lessons) داخل كل وحدة مع أسمائها
4. قسم المحتوى إلى صفحات

أعد النتيجة بصيغة JSON فقط (بدون أي نص آخر أو markdown):
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
              "content": "محتوى الصفحة كاملاً بكل التفاصيل..."
            }
          ]
        }
      ]
    }
  ],
  "total_pages": 0,
  "full_text": "النص الكامل للكتاب..."
}

تعليمات مهمة جداً:
- استخرج كل حرف ونص من الكتاب
- لا تختصر أي محتوى
- حافظ على التنسيق والتنظيم الأصلي
- أعد JSON صالح فقط بدون markdown أو أي نص إضافي`
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
          lastError = new Error(`Gemini API error: ${geminiResponse.status}`);
          continue;
        }

        geminiData = await geminiResponse.json();
        console.log('Gemini response received successfully');
        break;
      } catch (apiError: any) {
        console.error('API key failed:', apiError.message);
        lastError = apiError;
        continue;
      }
    }

    if (!geminiData) {
      throw lastError || new Error('فشل استخراج المحتوى من جميع مفاتيح API');
    }

    let extractedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Gemini response length:', extractedContent.length);

    if (!extractedContent || extractedContent.length < 50) {
      console.error('Empty or too short response from Gemini');
      throw new Error('لم يتم استخراج محتوى كافٍ من الملف. قد يكون الملف غير واضح أو محمي');
    }

    // Parse JSON from response
    let structuredContent;
    try {
      // Clean the response - remove markdown code blocks if present
      extractedContent = extractedContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      
      // Find JSON object
      const jsonStart = extractedContent.indexOf('{');
      const jsonEnd = extractedContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        extractedContent = extractedContent.substring(jsonStart, jsonEnd + 1);
      }
      
      structuredContent = JSON.parse(extractedContent);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.log('Could not parse JSON, creating simple structure. Error:', parseError);
      // If JSON parsing fails, create a simple structure with all extracted text
      structuredContent = {
        units: [{
          unit_number: 1,
          unit_name: subject || 'المحتوى',
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
    const contentRecords: any[] = [];
    const { data: { user } } = await supabase.auth.getUser();
    
    if (structuredContent.units && Array.isArray(structuredContent.units)) {
      for (const unit of structuredContent.units) {
        if (unit.lessons && Array.isArray(unit.lessons)) {
          for (const lesson of unit.lessons) {
            if (lesson.pages && Array.isArray(lesson.pages)) {
              for (const page of lesson.pages) {
                if (page.content && page.content.trim()) {
                  contentRecords.push({
                    grade,
                    subject,
                    semester,
                    unit_number: Number(unit.unit_number) || 1,
                    unit_name: String(unit.unit_name || 'وحدة غير محددة'),
                    lesson_number: Number(lesson.lesson_number) || 1,
                    lesson_name: String(lesson.lesson_name || 'درس غير محدد'),
                    page_number: Number(page.page_number) || contentRecords.length + 1,
                    page_content: String(page.content),
                    created_by: user?.id
                  });
                }
              }
            } else if (lesson.content && lesson.content.trim()) {
              // No pages defined, create one from lesson content
              contentRecords.push({
                grade,
                subject,
                semester,
                unit_number: Number(unit.unit_number) || 1,
                unit_name: String(unit.unit_name || 'وحدة غير محددة'),
                lesson_number: Number(lesson.lesson_number) || 1,
                lesson_name: String(lesson.lesson_name || 'درس غير محدد'),
                page_number: 1,
                page_content: String(lesson.content),
                created_by: user?.id
              });
            }
          }
        } else if (unit.content && unit.content.trim()) {
          // No lessons, create from unit content
          contentRecords.push({
            grade,
            subject,
            semester,
            unit_number: Number(unit.unit_number) || 1,
            unit_name: String(unit.unit_name || 'وحدة'),
            lesson_number: 1,
            lesson_name: 'المحتوى',
            page_number: 1,
            page_content: String(unit.content),
            created_by: user?.id
          });
        }
      }
    }

    // If no structured content was extracted, save full text
    if (contentRecords.length === 0) {
      const fullText = structuredContent.full_text || extractedContent;
      if (fullText && fullText.trim()) {
        // Split long text into multiple pages
        const pageSize = 5000; // characters per page
        const textPages = [];
        for (let i = 0; i < fullText.length; i += pageSize) {
          textPages.push(fullText.substring(i, i + pageSize));
        }
        
        textPages.forEach((pageContent, index) => {
          contentRecords.push({
            grade,
            subject,
            semester,
            unit_number: 1,
            unit_name: subject || 'المحتوى',
            lesson_number: 1,
            lesson_name: 'المحتوى الكامل',
            page_number: index + 1,
            page_content: pageContent,
            created_by: user?.id
          });
        });
      }
    }

    console.log('Prepared', contentRecords.length, 'content records for database');

    if (contentRecords.length === 0) {
      throw new Error('لم يتم استخراج أي محتوى نصي من الملف');
    }

    // Insert content records in batches
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < contentRecords.length; i += batchSize) {
      const batch = contentRecords.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('jordanian_textbook_content')
        .insert(batch);

      if (insertError) {
        console.error('Database insert error for batch:', insertError);
        throw new Error(`فشل حفظ المحتوى: ${insertError.message}`);
      }
      insertedCount += batch.length;
      console.log('Inserted batch:', insertedCount, '/', contentRecords.length);
    }
    
    console.log('All content records saved successfully');

    // Update book record with extracted text summary
    const fullText = structuredContent.full_text?.substring(0, 50000) || extractedContent.substring(0, 50000);
    const { error: updateError } = await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: fullText,
        page_count: contentRecords.length,
        is_active: true
      })
      .eq('id', bookId);

    if (updateError) {
      console.error('Book update error:', updateError);
    }

    console.log('=== PDF Extraction Completed Successfully ===');
    console.log('Total pages extracted:', contentRecords.length);
    console.log('Total units:', structuredContent.units?.length || 1);

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: fullText.substring(0, 1000) + '...',
        recordsCount: contentRecords.length,
        units: structuredContent.units?.length || 1,
        message: `تم استخراج ${contentRecords.length} صفحة من الكتاب بنجاح`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('=== PDF Extraction Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ غير متوقع',
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
