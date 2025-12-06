import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get ALL available API keys for maximum rotation
function getAllApiKeys(): string[] {
  const keyNames = [
    'JORDANIAN_NEW_AI_KEY_1',
    'JORDANIAN_NEW_AI_KEY_2', 
    'JORDANIAN_NEW_AI_KEY_3',
    'JORDANIAN_NEW_AI_KEY_4',
    'JORDANIAN_NEW_AI_KEY_5',
    'JORDANIAN_AI_QUESTION_GEN_KEY_1',
    'JORDANIAN_AI_QUESTION_GEN_KEY_2',
    'JORDANIAN_AI_QUESTION_GEN_KEY_3',
    'JORDANIAN_AI_QUESTION_GEN_KEY_4',
    'JORDANIAN_AI_QUESTION_GEN_KEY_5',
    'JORDANIAN_AI_QUESTION_GEN_KEY_6',
    'JORDANIAN_AI_QUESTION_GEN_KEY_7',
    'JORDANIAN_AI_QUESTION_GEN_KEY_8',
    'JORDANIAN_AI_QUESTION_GEN_KEY_9',
    'JORDANIAN_AI_QUESTION_GEN_KEY_10',
    'JORDANIAN_AI_SEARCH_KEY_1',
    'JORDANIAN_AI_SEARCH_KEY_2',
    'JORDANIAN_AI_SEARCH_KEY_3',
    'JORDANIAN_AI_SEARCH_KEY_4',
    'JORDANIAN_AI_SEARCH_KEY_5',
    'JORDANIAN_AI_ANSWER_KEY_1',
    'JORDANIAN_AI_ANSWER_KEY_2',
    'JORDANIAN_AI_ANSWER_KEY_3',
    'GOOGLE_AI_API_KEY',
    'JORDANIAN_ASSISTANT_AI_KEY',
    'PLATFORM_BUILDER_AI_KEY',
    'JORDANIAN_AI_IMAGE_KEY',
  ];
  
  return keyNames.map(name => Deno.env.get(name)).filter(Boolean) as string[];
}

// Smart API call with automatic key rotation on rate limit
async function callGeminiWithRetry(
  endpoint: string,
  body: any,
  apiKeys: string[],
  startKeyIndex: number = 0,
  maxRetries: number = 5
): Promise<{ data: any; usedKeyIndex: number }> {
  let keyIndex = startKeyIndex;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = apiKeys[keyIndex % apiKeys.length];
    
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries} using key ${(keyIndex % apiKeys.length) + 1}/${apiKeys.length}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { data, usedKeyIndex: keyIndex };
      }

      const errorText = await response.text();
      console.log(`API response ${response.status}: ${errorText.substring(0, 200)}`);

      // Rate limit - switch key immediately
      if (response.status === 429) {
        console.log(`Rate limit hit, switching to next key...`);
        keyIndex = (keyIndex + 1) % apiKeys.length;
        
        // Wait before retrying with new key
        const waitTime = 5000 + (attempt * 5000); // 5s, 10s, 15s...
        console.log(`Waiting ${waitTime/1000}s before retry...`);
        await delay(waitTime);
        continue;
      }

      // Other errors - try next key
      if (response.status >= 500 || response.status === 400) {
        keyIndex = (keyIndex + 1) % apiKeys.length;
        await delay(2000);
        continue;
      }

      throw new Error(`API error: ${response.status} - ${errorText}`);
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      keyIndex = (keyIndex + 1) % apiKeys.length;
      await delay(3000);
    }
  }

  throw lastError || new Error('All API attempts failed');
}

// Upload file to Google File API
async function uploadToGoogleFileAPI(fileUrl: string, apiKey: string): Promise<string> {
  console.log('Downloading file from URL...');
  
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
  console.log('File uploaded to Google, URI:', fileData.file?.uri);
  return fileData.file?.uri || '';
}

// Simplified single-pass extraction for entire book
async function extractAllContent(
  fileUri: string,
  apiKeys: string[],
  keyIndex: number
): Promise<{ data: any; usedKeyIndex: number }> {
  console.log('Extracting all content in single pass...');
  
  const body = {
    contents: [{
      parts: [
        { fileData: { mimeType: 'application/pdf', fileUri } },
        {
          text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: اقرأ هذا الكتاب كاملاً واستخرج كل المحتوى النصي.

خطوات العمل:
1. اقرأ جدول المحتويات لمعرفة هيكل الكتاب
2. استخرج كل وحدة بالترتيب
3. داخل كل وحدة استخرج كل درس
4. استخرج محتوى كل صفحة

أرجع النتيجة بتنسيق JSON:
{
  "content": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس",
          "pages": [
            { "page_number": 1, "content": "النص الكامل للصفحة" }
          ]
        }
      ]
    }
  ]
}

تعليمات مهمة:
- استخرج جميع الوحدات بدون استثناء
- استخرج كل النص من كل صفحة
- حافظ على أرقام الصفحات الحقيقية
- أرجع JSON فقط بدون أي نص إضافي`
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 65536,
    }
  };

  return callGeminiWithRetry('generateContent', body, apiKeys, keyIndex);
}

// Extract with base64 for small files
async function extractWithBase64(
  base64Data: string,
  apiKeys: string[],
  keyIndex: number
): Promise<{ data: any; usedKeyIndex: number }> {
  console.log('Extracting from base64 data...');
  
  const body = {
    contents: [{
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        {
          text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: اقرأ هذا الكتاب كاملاً واستخرج كل المحتوى النصي.

أرجع النتيجة بتنسيق JSON:
{
  "content": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس",
          "pages": [
            { "page_number": 1, "content": "النص الكامل للصفحة" }
          ]
        }
      ]
    }
  ]
}

تعليمات: استخرج جميع الوحدات والدروس والصفحات. أرجع JSON فقط.`
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 65536,
    }
  };

  return callGeminiWithRetry('generateContent', body, apiKeys, keyIndex);
}

function parseGeminiResponse(data: any): any {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let jsonStr = text;
    
    // Extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    
    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
      return JSON.parse(jsonStr);
    }
    return { rawText: text };
  } catch (e) {
    console.error('JSON parse error:', e);
    return { rawText: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { pdfBase64, pdfUrl, bookName, grade, subject, semester, fileSizeMB } = requestBody;
    
    console.log('=== Processing PDF ===');
    console.log('Book:', bookName);
    console.log('Grade:', grade, 'Subject:', subject, 'Semester:', semester);
    console.log('File size:', fileSizeMB, 'MB');
    console.log('Has URL:', !!pdfUrl, 'Has Base64:', !!pdfBase64);

    if ((!pdfBase64 && !pdfUrl) || !grade || !subject || !semester) {
      throw new Error('Missing required parameters');
    }

    // Get all API keys
    const apiKeys = getAllApiKeys();
    console.log(`Loaded ${apiKeys.length} API keys for rotation`);
    
    if (apiKeys.length === 0) {
      throw new Error('No Google API Keys configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let extractedData: any = null;
    let fileUri = '';
    let currentKeyIndex = 0;

    if (pdfUrl) {
      // Large file: Upload to Google then extract
      console.log('=== Phase 1: Uploading to Google ===');
      fileUri = await uploadToGoogleFileAPI(pdfUrl, apiKeys[0]);
      
      console.log('Waiting for Google to process file...');
      await delay(5000);
      
      console.log('=== Phase 2: Extracting Content ===');
      const result = await extractAllContent(fileUri, apiKeys, currentKeyIndex);
      extractedData = parseGeminiResponse(result.data);
      currentKeyIndex = result.usedKeyIndex;
      
    } else if (pdfBase64) {
      // Small file: Direct extraction
      console.log('=== Extracting from Base64 ===');
      const result = await extractWithBase64(pdfBase64, apiKeys, currentKeyIndex);
      extractedData = parseGeminiResponse(result.data);
      currentKeyIndex = result.usedKeyIndex;
    }

    console.log('=== Extraction Complete ===');

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

    // Create book record (no file stored, only text)
    const { data: bookRecord, error: bookError } = await supabase
      .from('jordanian_textbooks')
      .insert({
        book_name: bookName || 'كتاب مدرسي',
        grade,
        subject,
        semester,
        file_url: 'text-only', // We only store text, not files
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
      } else {
        console.log(`Inserted batch ${Math.floor(i/BATCH_SIZE) + 1}`);
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

    console.log(`=== SUCCESS ===`);
    console.log(`Units: ${unitsSet.size}, Lessons: ${lessonsSet.size}, Pages: ${totalPages}`);

    return new Response(JSON.stringify({
      success: true,
      message: `تم استخراج ${unitsSet.size} وحدات و ${lessonsSet.size} دروس و ${totalPages} صفحة بنجاح`,
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
    console.error('=== ERROR ===', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'حدث خطأ غير متوقع'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
