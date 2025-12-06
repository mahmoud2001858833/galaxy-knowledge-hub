import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Upload file to Google using File API
async function uploadToGoogleFileAPI(
  fileUrl: string,
  apiKey: string
): Promise<string> {
  console.log('Fetching file from URL...');
  
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.status}`);
  }
  
  const fileBuffer = await fileResponse.arrayBuffer();
  const fileSize = fileBuffer.byteLength;
  console.log('File size:', fileSize);
  
  // Start resumable upload
  const startResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': fileSize.toString(),
        'X-Goog-Upload-Header-Content-Type': 'application/pdf',
      },
      body: JSON.stringify({
        file: { displayName: `textbook_${Date.now()}.pdf` }
      })
    }
  );

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    console.error('Start upload error:', errorText);
    throw new Error(`Failed to start upload: ${startResponse.status}`);
  }

  const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
  if (!uploadUrl) throw new Error('No upload URL received');

  // Upload in one go for simplicity
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': fileSize.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: new Uint8Array(fileBuffer)
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Upload error:', errorText);
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  const fileData = await uploadResponse.json();
  console.log('File uploaded, URI:', fileData.file?.uri);
  return fileData.file?.uri || '';
}

// استخراج المحتوى الكامل في طلب واحد (لتجنب Rate Limit)
async function extractFullContent(
  fileUri: string,
  apiKey: string
): Promise<any> {
  console.log('Extracting full book content in single request...');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { fileData: { mimeType: 'application/pdf', fileUri } },
            {
              text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: اقرأ هذا الكتاب كاملاً من أول صفحة لآخر صفحة واستخرج كل المحتوى.

اتبع هذه الخطوات:
1. اقرأ جدول المحتويات أولاً لفهم هيكل الكتاب
2. اقرأ كل وحدة من الوحدات بالترتيب
3. داخل كل وحدة، اقرأ كل درس بالترتيب
4. استخرج محتوى كل صفحة بالكامل

أرجع النتيجة بتنسيق JSON:
{
  "content": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة الأولى",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس الأول",
          "pages": [
            { "page_number": 1, "content": "كل محتوى الصفحة هنا..." }
          ]
        }
      ]
    },
    {
      "unit_number": 2,
      "unit_name": "اسم الوحدة الثانية",
      "lessons": [...]
    },
    {
      "unit_number": 3,
      "unit_name": "اسم الوحدة الثالثة",
      "lessons": [...]
    }
  ]
}

تعليمات مهمة جداً:
1. استخرج جميع الوحدات الموجودة في الكتاب (قد يكون 2 أو 3 أو 4 وحدات أو أكثر)
2. استخرج كل الدروس في كل وحدة
3. استخرج محتوى كل صفحة بالكامل بدون اختصار
4. لا تتوقف عند الوحدة الأولى - اكمل الكتاب كاملاً
5. تأكد من استخراج كل كلمة من كل صفحة
6. أرجع JSON فقط بدون أي نص إضافي`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Extraction error:', errorText);
    throw new Error(`Extraction failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return parseGeminiResponse(text);
}

// استخراج مباشر للكتب الصغيرة باستخدام base64
async function extractWithBase64(
  base64Data: string,
  apiKey: string
): Promise<any> {
  console.log('Extracting content from base64...');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: base64Data } },
            {
              text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: اقرأ هذا الكتاب كاملاً من أول صفحة لآخر صفحة واستخرج كل المحتوى.

اتبع هذه الخطوات:
1. اقرأ جدول المحتويات أولاً لفهم هيكل الكتاب
2. اقرأ كل وحدة من الوحدات بالترتيب
3. داخل كل وحدة، اقرأ كل درس بالترتيب
4. استخرج محتوى كل صفحة بالكامل

أرجع النتيجة بتنسيق JSON:
{
  "content": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة الأولى",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس الأول",
          "pages": [
            { "page_number": 1, "content": "كل محتوى الصفحة هنا..." }
          ]
        }
      ]
    },
    {
      "unit_number": 2,
      "unit_name": "اسم الوحدة الثانية",
      "lessons": [...]
    },
    {
      "unit_number": 3,
      "unit_name": "اسم الوحدة الثالثة",
      "lessons": [...]
    }
  ]
}

تعليمات مهمة جداً:
1. استخرج جميع الوحدات الموجودة في الكتاب (قد يكون 2 أو 3 أو 4 وحدات أو أكثر)
2. استخرج كل الدروس في كل وحدة
3. استخرج محتوى كل صفحة بالكامل بدون اختصار
4. لا تتوقف عند الوحدة الأولى - اكمل الكتاب كاملاً
5. تأكد من استخراج كل كلمة من كل صفحة
6. أرجع JSON فقط بدون أي نص إضافي`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Extraction error:', errorText);
    throw new Error(`Extraction failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return parseGeminiResponse(text);
}

function parseGeminiResponse(text: string): any {
  try {
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    
    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
      return JSON.parse(jsonStr);
    }
    return { rawText: text };
  } catch (e) {
    console.error('JSON parse error:', e);
    return { rawText: text };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { pdfBase64, pdfUrl, bookName, grade, subject, semester, fileSizeMB } = requestBody;
    
    console.log('Processing PDF:', { bookName, grade, subject, semester, fileSizeMB, hasBase64: !!pdfBase64, hasUrl: !!pdfUrl });

    if ((!pdfBase64 && !pdfUrl) || !grade || !subject || !semester) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('JORDANIAN_ASSISTANT_AI_KEY');
    if (!apiKey) {
      throw new Error('Google API Key not configured');
    }
    
    let extractedData;
    let fileUri = '';

    // For large files: upload to Google File API first, then extract in ONE request
    if (pdfUrl) {
      console.log('Processing large file via Google File API...');
      
      // Upload to Google
      fileUri = await uploadToGoogleFileAPI(pdfUrl, apiKey);
      
      // Extract ALL content in a single request (no multi-phase to avoid rate limits)
      extractedData = await extractFullContent(fileUri, apiKey);
      
    } else if (pdfBase64) {
      // For small files: direct extraction
      console.log('Processing small file directly...');
      extractedData = await extractWithBase64(pdfBase64, apiKey);
    }
    
    console.log('Extraction completed');

    if (!extractedData) {
      throw new Error('فشل استخراج النص من الملف');
    }

    // Get user for book record
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Create book record
    const { data: bookRecord, error: bookError } = await supabase
      .from('jordanian_textbooks')
      .insert({
        book_name: bookName || 'كتاب مدرسي',
        grade,
        subject,
        semester,
        file_url: pdfUrl || 'processed-inline',
        file_size_mb: fileSizeMB || 0,
        created_by: userId,
        is_active: true,
        gemini_file_uri: fileUri || null
      })
      .select()
      .single();

    if (bookError) {
      console.error('Book record error:', bookError);
      throw new Error(`فشل حفظ بيانات الكتاب: ${bookError.message}`);
    }

    console.log('Book record created:', bookRecord.id);

    // Process and save content records
    const records: any[] = [];
    let fullText = '';
    const unitsSet = new Set<number>();
    const lessonsSet = new Set<string>();
    let totalPages = 0;

    if (extractedData.content && Array.isArray(extractedData.content)) {
      for (const unit of extractedData.content) {
        const unitNum = unit.unit_number || 1;
        unitsSet.add(unitNum);
        
        if (unit.lessons && Array.isArray(unit.lessons)) {
          for (const lesson of unit.lessons) {
            const lessonKey = `${unitNum}-${lesson.lesson_number || 1}`;
            lessonsSet.add(lessonKey);
            
            if (lesson.pages && Array.isArray(lesson.pages)) {
              for (const page of lesson.pages) {
                totalPages++;
                fullText += page.content + '\n\n';
                
                records.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unitNum,
                  unit_name: unit.unit_name || `الوحدة ${unitNum}`,
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || `الدرس ${lesson.lesson_number || 1}`,
                  page_number: page.page_number || totalPages,
                  page_content: page.content || ''
                });
              }
            }
          }
        }
      }
    } else if (extractedData.rawText) {
      // Fallback: save as single page
      fullText = extractedData.rawText;
      records.push({
        grade,
        subject,
        semester,
        unit_number: 1,
        unit_name: 'الوحدة الأولى',
        lesson_number: 1,
        lesson_name: 'الدرس الأول',
        page_number: 1,
        page_content: extractedData.rawText
      });
      unitsSet.add(1);
      lessonsSet.add('1-1');
      totalPages = 1;
    }

    console.log(`Saving ${records.length} content records...`);

    // Insert in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from('jordanian_textbook_content')
        .insert(batch);
      
      if (insertError) {
        console.error('Batch insert error:', insertError);
      }
    }

    // Update book with stats
    await supabase
      .from('jordanian_textbooks')
      .update({
        page_count: totalPages,
        extracted_text: fullText.substring(0, 50000)
      })
      .eq('id', bookRecord.id);

    console.log(`Success: ${unitsSet.size} units, ${lessonsSet.size} lessons, ${totalPages} pages`);

    return new Response(JSON.stringify({
      success: true,
      message: `تم استخراج ${unitsSet.size} وحدات و ${lessonsSet.size} دروس و ${totalPages} صفحة`,
      recordsCount: records.length,
      extractedText: fullText.substring(0, 500),
      stats: {
        units: unitsSet.size,
        lessons: lessonsSet.size,
        pages: totalPages
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
