import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // Upload file
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

// المرحلة 1: استخراج هيكل الكتاب الكامل
async function extractBookStructure(
  fileUri: string,
  apiKey: string
): Promise<{ totalUnits: number; units: Array<{ number: number; name: string; startPage: number; endPage: number }> }> {
  console.log('Phase 1: Extracting complete book structure...');
  
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

مهمتك: اقرأ جدول المحتويات وتصفح الكتاب كاملاً لتحديد هيكله بدقة.

اقرأ الكتاب من أوله لآخره واستخرج:
1. العدد الإجمالي للوحدات في الكتاب
2. اسم كل وحدة
3. رقم صفحة بداية ونهاية كل وحدة

أرجع النتيجة بتنسيق JSON:
{
  "totalUnits": 3,
  "units": [
    { "number": 1, "name": "اسم الوحدة الأولى", "startPage": 5, "endPage": 50 },
    { "number": 2, "name": "اسم الوحدة الثانية", "startPage": 51, "endPage": 100 },
    { "number": 3, "name": "اسم الوحدة الثالثة", "startPage": 101, "endPage": 150 }
  ]
}

تعليمات مهمة:
- احسب عدد الوحدات بدقة من جدول المحتويات
- لا تفوت أي وحدة
- تأكد من تضمين جميع الوحدات حتى آخر صفحة
- أرجع JSON فقط`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
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
  startPage: number,
  endPage: number,
  retryCount: number = 0
): Promise<any> {
  console.log(`Phase 2: Extracting Unit ${unitNumber} (${unitName}), pages ${startPage}-${endPage}`);
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { fileData: { mimeType: 'application/pdf', fileUri } },
              {
                text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: استخرج المحتوى الكامل للوحدة رقم ${unitNumber} فقط.
اسم الوحدة: ${unitName}
من صفحة ${startPage} إلى صفحة ${endPage}

اقرأ كل صفحة في هذا النطاق واستخرج:
1. جميع الدروس في هذه الوحدة
2. محتوى كل صفحة بالكامل

أرجع النتيجة بتنسيق JSON:
{
  "unit_number": ${unitNumber},
  "unit_name": "${unitName}",
  "lessons": [
    {
      "lesson_number": 1,
      "lesson_name": "اسم الدرس الأول",
      "pages": [
        { "page_number": ${startPage}, "content": "كل النص في هذه الصفحة..." },
        { "page_number": ${startPage + 1}, "content": "..." }
      ]
    }
  ]
}

تعليمات مهمة:
- استخرج كل كلمة من كل صفحة بدون اختصار
- حافظ على أرقام الصفحات الحقيقية
- اذكر جميع الدروس في هذه الوحدة
- أرجع JSON فقط`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 32768,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle rate limit with retry
      if (response.status === 429 && retryCount < 3) {
        const waitTime = Math.pow(2, retryCount + 1) * 5000; // 10s, 20s, 40s
        console.log(`Rate limited, waiting ${waitTime/1000}s before retry ${retryCount + 1}...`);
        await delay(waitTime);
        return extractUnitContent(fileUri, apiKey, unitNumber, unitName, startPage, endPage, retryCount + 1);
      }
      
      throw new Error(`Unit extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return parseGeminiResponse(text);
  } catch (error) {
    if (retryCount < 3) {
      console.log(`Error extracting unit ${unitNumber}, retrying in 10s...`);
      await delay(10000);
      return extractUnitContent(fileUri, apiKey, unitNumber, unitName, startPage, endPage, retryCount + 1);
    }
    throw error;
  }
}

// استخراج مباشر للكتب الصغيرة باستخدام base64
async function extractWithBase64(
  base64Data: string,
  apiKey: string
): Promise<any> {
  console.log('Extracting content from base64 with enhanced prompt...');
  
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

خطوات العمل:
1. اقرأ جدول المحتويات لمعرفة عدد الوحدات الإجمالي
2. اقرأ كل وحدة بالترتيب من الأولى للأخيرة
3. داخل كل وحدة، اقرأ كل درس
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

تعليمات حاسمة:
1. استخرج جميع الوحدات (قد يكون 2 أو 3 أو 4 أو أكثر)
2. لا تتوقف عند الوحدة الأولى - أكمل حتى آخر وحدة
3. استخرج كل النص من كل صفحة بدون اختصار
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

    // Get API keys - use multiple keys for better rate limit handling
    const apiKeys = [
      Deno.env.get('JORDANIAN_NEW_AI_KEY_1'),
      Deno.env.get('JORDANIAN_NEW_AI_KEY_2'),
      Deno.env.get('JORDANIAN_NEW_AI_KEY_3'),
      Deno.env.get('JORDANIAN_NEW_AI_KEY_4'),
      Deno.env.get('JORDANIAN_NEW_AI_KEY_5'),
      Deno.env.get('GOOGLE_AI_API_KEY'),
      Deno.env.get('JORDANIAN_ASSISTANT_AI_KEY'),
    ].filter(Boolean) as string[];
    
    if (apiKeys.length === 0) {
      throw new Error('No Google API Keys configured');
    }
    
    const primaryKey = apiKeys[0];
    console.log(`Using ${apiKeys.length} API keys for rotation`);
    
    let extractedData: any = null;
    let fileUri = '';

    // For large files: use multi-phase extraction with API key rotation
    if (pdfUrl) {
      console.log('Processing large file via multi-phase extraction...');
      
      // Upload to Google
      fileUri = await uploadToGoogleFileAPI(pdfUrl, primaryKey);
      console.log('File uploaded, waiting for processing...');
      await delay(3000); // Wait for file to be processed
      
      // Phase 1: Get book structure
      const structure = await extractBookStructure(fileUri, primaryKey);
      console.log('Book structure:', JSON.stringify(structure, null, 2));
      
      if (!structure.units || structure.units.length === 0) {
        throw new Error('لم يتم العثور على وحدات في الكتاب');
      }
      
      console.log(`Found ${structure.units.length} units (total expected: ${structure.totalUnits || structure.units.length})`);
      
      // Phase 2: Extract content for each unit with delays and key rotation
      const allUnits: any[] = [];
      
      for (let i = 0; i < structure.units.length; i++) {
        const unit = structure.units[i];
        const apiKey = apiKeys[i % apiKeys.length]; // Rotate keys
        
        console.log(`Extracting unit ${unit.number} using key ${(i % apiKeys.length) + 1}...`);
        
        try {
          // Wait between units to avoid rate limits
          if (i > 0) {
            const waitTime = 5000 + (i * 2000); // 5s + 2s per unit
            console.log(`Waiting ${waitTime/1000}s before next unit...`);
            await delay(waitTime);
          }
          
          const unitContent = await extractUnitContent(
            fileUri, 
            apiKey, 
            unit.number, 
            unit.name,
            unit.startPage || 1,
            unit.endPage || 100
          );
          
          if (unitContent && !unitContent.rawText) {
            allUnits.push(unitContent);
            console.log(`✓ Unit ${unit.number} extracted successfully`);
          } else {
            console.log(`⚠ Unit ${unit.number} returned raw text, adding as fallback`);
            allUnits.push({
              unit_number: unit.number,
              unit_name: unit.name,
              lessons: [{
                lesson_number: 1,
                lesson_name: 'الدرس الأول',
                pages: [{ page_number: unit.startPage || 1, content: unitContent?.rawText || '' }]
              }]
            });
          }
        } catch (error) {
          console.error(`Error extracting unit ${unit.number}:`, error);
          // Add placeholder for failed unit
          allUnits.push({
            unit_number: unit.number,
            unit_name: unit.name,
            lessons: [{
              lesson_number: 1,
              lesson_name: 'فشل استخراج هذه الوحدة',
              pages: [{ page_number: unit.startPage || 1, content: 'حدث خطأ أثناء استخراج هذه الوحدة. يرجى المحاولة مرة أخرى.' }]
            }]
          });
        }
      }
      
      extractedData = { content: allUnits };
      console.log(`Extracted ${allUnits.length} units total`);
      
    } else if (pdfBase64) {
      // For small files: direct extraction
      console.log('Processing small file directly with enhanced prompt...');
      extractedData = await extractWithBase64(pdfBase64, primaryKey);
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
