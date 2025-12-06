import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Upload to Google File API using resumable upload (streaming from URL)
async function uploadToGoogleFileAPIFromUrl(
  fileUrl: string,
  apiKey: string
): Promise<string> {
  const displayName = `textbook_${Date.now()}.pdf`;
  
  console.log('Fetching file from URL for streaming upload...');
  
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.status}`);
  }
  
  const contentLength = fileResponse.headers.get('content-length');
  const fileSize = contentLength ? parseInt(contentLength) : 0;
  
  console.log('File size from header:', fileSize);
  
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
        file: { displayName }
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

  console.log('Upload URL obtained, streaming file in chunks...');

  const reader = fileResponse.body?.getReader();
  if (!reader) throw new Error('Cannot read file stream');
  
  const CHUNK_SIZE = 8 * 1024 * 1024;
  let buffer = new Uint8Array(0);
  let offset = 0;
  let done = false;

  while (!done) {
    while (buffer.length < CHUNK_SIZE && !done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const newBuffer = new Uint8Array(buffer.length + value.length);
        newBuffer.set(buffer);
        newBuffer.set(value, buffer.length);
        buffer = newBuffer;
      }
    }

    if (buffer.length === 0) break;

    const chunkSize = done ? buffer.length : Math.min(buffer.length, CHUNK_SIZE);
    const chunk = buffer.slice(0, chunkSize);
    buffer = buffer.slice(chunkSize);
    
    const isLast = done && buffer.length === 0;
    const uploadCommand = isLast ? 'upload, finalize' : 'upload';
    
    console.log(`Uploading chunk: offset=${offset}, size=${chunk.length}, isLast=${isLast}`);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': chunk.length.toString(),
        'X-Goog-Upload-Offset': offset.toString(),
        'X-Goog-Upload-Command': uploadCommand,
      },
      body: chunk
    });

    if (isLast) {
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Final chunk error:', errorText);
        throw new Error(`Final chunk failed: ${uploadResponse.status}`);
      }
      const fileData = await uploadResponse.json();
      console.log('File uploaded successfully:', fileData.file?.name);
      return fileData.file?.uri || '';
    }
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Chunk upload error:', errorText);
      throw new Error(`Chunk upload failed: ${uploadResponse.status}`);
    }
    
    offset += chunk.length;
  }

  throw new Error('Upload failed - no final response');
}

// المرحلة 1: استخراج هيكل الكتاب (الوحدات والدروس فقط)
async function extractBookStructure(
  fileUri: string,
  apiKey: string
): Promise<{ units: Array<{ number: number; name: string; lessons: Array<{ number: number; name: string; startPage: number; endPage: number }> }> }> {
  console.log('Phase 1: Extracting book structure...');
  
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
              text: `أنت خبير في تحليل الكتب المدرسية الأردنية.

مهمتك الأولى: استخرج هيكل الكتاب كاملاً (جميع الوحدات والدروس مع أرقام صفحاتها).

اقرأ جدول المحتويات وكل صفحات الكتاب لتحديد:
1. جميع الوحدات (Units) مع أسمائها
2. جميع الدروس داخل كل وحدة مع أسمائها
3. أرقام صفحات بداية ونهاية كل درس

أرجع النتيجة بتنسيق JSON بالضبط:
{
  "units": [
    {
      "number": 1,
      "name": "اسم الوحدة الأولى",
      "lessons": [
        { "number": 1, "name": "اسم الدرس", "startPage": 5, "endPage": 15 },
        { "number": 2, "name": "اسم الدرس الثاني", "startPage": 16, "endPage": 25 }
      ]
    },
    {
      "number": 2,
      "name": "اسم الوحدة الثانية",
      "lessons": [...]
    }
  ]
}

مهم جداً:
- استخرج جميع الوحدات بدون استثناء
- تأكد من ذكر كل درس في كل وحدة
- أرجع JSON فقط بدون أي نص إضافي`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Structure extraction error:', errorText);
    throw new Error(`Structure extraction failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return parseGeminiResponse(text);
}

// المرحلة 2: استخراج محتوى وحدة واحدة بالتفصيل
async function extractUnitContent(
  fileUri: string,
  apiKey: string,
  unitNumber: number,
  unitName: string,
  lessons: Array<{ number: number; name: string; startPage: number; endPage: number }>
): Promise<any> {
  console.log(`Phase 2: Extracting content for Unit ${unitNumber}: ${unitName}`);
  
  const lessonsList = lessons.map(l => `- الدرس ${l.number}: ${l.name} (صفحات ${l.startPage}-${l.endPage})`).join('\n');
  
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

مهمتك: استخرج المحتوى الكامل للوحدة رقم ${unitNumber} (${unitName}) بالتفصيل.

الدروس في هذه الوحدة:
${lessonsList}

استخرج كل النص من كل صفحة في هذه الوحدة. لا تختصر أي شيء!

أرجع النتيجة بتنسيق JSON:
{
  "unit_number": ${unitNumber},
  "unit_name": "${unitName}",
  "lessons": [
    {
      "lesson_number": 1,
      "lesson_name": "اسم الدرس",
      "pages": [
        { "page_number": 5, "content": "كل النص الموجود في هذه الصفحة..." },
        { "page_number": 6, "content": "..." }
      ]
    }
  ]
}

مهم جداً:
1. استخرج كل كلمة من كل صفحة بالكامل
2. حافظ على أرقام الصفحات الحقيقية
3. لا تختصر أي محتوى
4. أرجع JSON فقط`
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
    console.error(`Unit ${unitNumber} extraction error:`, errorText);
    throw new Error(`Unit ${unitNumber} extraction failed`);
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
  console.log('Extracting content from inline base64 with enhanced prompt...');
  
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
1. ابدأ من جدول المحتويات لفهم هيكل الكتاب
2. اقرأ كل وحدة بالترتيب
3. داخل كل وحدة، اقرأ كل درس
4. داخل كل درس، استخرج محتوى كل صفحة

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
    }
  ]
}

تعليمات حاسمة:
- استخرج جميع الوحدات (قد يكون هناك 3 وحدات أو أكثر)
- استخرج كل النص من كل صفحة بالكامل بدون اختصار
- لا تتوقف عند الوحدة الأولى! أكمل الكتاب كاملاً
- إذا وجدت وحدة ثانية أو ثالثة، أضفها للنتيجة
- أرجع JSON فقط بدون أي نص إضافي`
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
    console.error('Extraction API error:', errorText);
    throw new Error(`Extraction failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return parseGeminiResponse(text);
}

function parseGeminiResponse(text: string): any {
  try {
    let jsonStr = text;
    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    
    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
      return JSON.parse(jsonStr);
    }
    return { rawText: text };
  } catch (e) {
    console.error('JSON parse error:', e);
    console.log('Raw text (first 500 chars):', text.substring(0, 500));
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
    let isMultiPhase = false;

    // For large files: use multi-phase extraction
    if (pdfUrl) {
      console.log('Using multi-phase extraction for large file...');
      isMultiPhase = true;
      
      // Upload to Google File API
      fileUri = await uploadToGoogleFileAPIFromUrl(pdfUrl, apiKey);
      console.log('File uploaded to Google, URI:', fileUri);
      
      // Phase 1: Get book structure
      const structure = await extractBookStructure(fileUri, apiKey);
      console.log('Book structure:', JSON.stringify(structure, null, 2));
      
      if (!structure.units || structure.units.length === 0) {
        throw new Error('لم يتم العثور على وحدات في الكتاب');
      }
      
      console.log(`Found ${structure.units.length} units in the book`);
      
      // Phase 2: Extract content for each unit
      const allUnits: any[] = [];
      for (const unit of structure.units) {
        try {
          console.log(`Extracting unit ${unit.number}...`);
          const unitContent = await extractUnitContent(fileUri, apiKey, unit.number, unit.name, unit.lessons);
          if (unitContent) {
            allUnits.push(unitContent);
          }
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error extracting unit ${unit.number}:`, error);
          // Continue with other units even if one fails
        }
      }
      
      extractedData = { content: allUnits };
      console.log(`Extracted ${allUnits.length} units total`);
      
    } else if (pdfBase64) {
      // For small files: use direct extraction with enhanced prompt
      const estimatedSizeMB = (pdfBase64.length * 0.75) / (1024 * 1024);
      console.log('Estimated file size:', estimatedSizeMB.toFixed(2), 'MB');
      
      if (estimatedSizeMB < 10) {
        console.log('Using enhanced direct extraction for small file...');
        extractedData = await extractWithBase64(pdfBase64, apiKey);
      } else {
        throw new Error('الملف كبير جداً للمعالجة المباشرة. يرجى المحاولة مرة أخرى.');
      }
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
                const content = page.content || '';
                fullText += content + '\n\n';
                totalPages++;
                
                records.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unitNum,
                  unit_name: unit.unit_name || `الوحدة ${unitNum}`,
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || 'الدرس',
                  page_number: page.page_number || totalPages,
                  page_content: content,
                  created_by: userId
                });
              }
            } else {
              // Lesson without pages - create one record with lesson content
              const content = lesson.content || '';
              if (content) {
                fullText += content + '\n\n';
                totalPages++;
                records.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unitNum,
                  unit_name: unit.unit_name || `الوحدة ${unitNum}`,
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || 'الدرس',
                  page_number: totalPages,
                  page_content: content,
                  created_by: userId
                });
              }
            }
          }
        }
      }
    } else if (extractedData.rawText) {
      fullText = extractedData.rawText;
      totalPages = 1;
      records.push({
        grade,
        subject,
        semester,
        unit_number: 1,
        unit_name: 'الوحدة الأولى',
        lesson_number: 1,
        lesson_name: 'الدرس الأول',
        page_number: 1,
        page_content: extractedData.rawText,
        created_by: userId
      });
    }

    console.log(`Total records to insert: ${records.length}, Units: ${unitsSet.size}, Lessons: ${lessonsSet.size}`);

    // Insert records in batches
    if (records.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('jordanian_textbook_content')
          .insert(batch);
        
        if (insertError) {
          console.error('Insert error:', insertError);
        } else {
          console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
        }
      }
    }

    // Update book record with accurate counts
    await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: fullText.substring(0, 50000),
        page_count: totalPages,
        is_active: true
      })
      .eq('id', bookRecord.id);

    const successMessage = isMultiPhase 
      ? `تم استخراج ${totalPages} صفحة من ${unitsSet.size} وحدات و ${lessonsSet.size} درس (معالجة متعددة المراحل)`
      : `تم استخراج ${totalPages} صفحة من ${unitsSet.size} وحدات و ${lessonsSet.size} درس`;

    return new Response(JSON.stringify({
      success: true,
      message: successMessage,
      bookId: bookRecord.id,
      recordsCount: records.length,
      unitsCount: unitsSet.size,
      lessonsCount: lessonsSet.size,
      pagesCount: totalPages,
      extractedText: fullText.substring(0, 500)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'حدث خطأ أثناء المعالجة'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
