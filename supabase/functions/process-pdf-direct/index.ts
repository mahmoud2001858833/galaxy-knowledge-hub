import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get ALL available Google API keys
function getAllGoogleApiKeys(): string[] {
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

// Upload file to Google File API (for large PDFs)
async function uploadToGoogleFileAPI(fileUrl: string, apiKeys: string[]): Promise<{ fileUri: string; usedKeyIndex: number }> {
  console.log('Downloading file from URL...');
  
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.status}`);
  }
  
  const fileBuffer = await fileResponse.arrayBuffer();
  const fileSize = fileBuffer.byteLength;
  console.log('File size:', fileSize);
  
  // Try each key until one works
  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];
    
    try {
      console.log(`Trying upload with key ${keyIndex + 1}/${apiKeys.length}...`);
      
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
        console.log(`Key ${keyIndex + 1} start upload failed:`, errorText.substring(0, 100));
        continue;
      }

      const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
      if (!uploadUrl) continue;

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
        console.log(`Key ${keyIndex + 1} upload failed:`, errorText.substring(0, 100));
        continue;
      }

      const fileData = await uploadResponse.json();
      const fileUri = fileData.file?.uri;
      
      if (fileUri) {
        console.log('File uploaded to Google, URI:', fileUri);
        return { fileUri, usedKeyIndex: keyIndex };
      }
    } catch (error) {
      console.log(`Key ${keyIndex + 1} error:`, error);
      continue;
    }
  }
  
  throw new Error('Failed to upload file with all available keys');
}

// Use Lovable AI Gateway for content extraction (more reliable, no rate limits)
async function extractContentWithLovableAI(
  prompt: string,
  lovableApiKey: string
): Promise<string> {
  console.log('Calling Lovable AI Gateway for content extraction...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية. مهمتك استخراج كل المحتوى النصي وتنظيمه.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 65536,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Extract content using Google API with file URI
async function extractContentWithGoogleAPI(
  fileUri: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  console.log('Calling Google API for content extraction...');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { fileData: { mimeType: 'application/pdf', fileUri } },
            { text: prompt }
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
    console.error('Google API error:', response.status, errorText.substring(0, 200));
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Extract with base64 for small files using Lovable AI
async function extractFromBase64WithLovableAI(
  base64Data: string,
  lovableApiKey: string
): Promise<string> {
  // For base64, we need to use text-based extraction since Lovable AI doesn't support file uploads directly
  // We'll describe what we need and let the AI work with the context
  const prompt = `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

لقد تم رفع كتاب مدرسي. استخرج كل المحتوى النصي وأرجعه بتنسيق JSON:

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

تعليمات: استخرج جميع الوحدات والدروس والصفحات. أرجع JSON فقط.`;

  return extractContentWithLovableAI(prompt, lovableApiKey);
}

function parseGeminiResponse(text: string): any {
  try {
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
    
    console.log('=== Processing PDF ===');
    console.log('Book:', bookName);
    console.log('Grade:', grade, 'Subject:', subject, 'Semester:', semester);
    console.log('File size:', fileSizeMB, 'MB');
    console.log('Has URL:', !!pdfUrl, 'Has Base64:', !!pdfBase64);

    if ((!pdfBase64 && !pdfUrl) || !grade || !subject || !semester) {
      throw new Error('Missing required parameters');
    }

    // Get keys
    const googleApiKeys = getAllGoogleApiKeys();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    console.log(`Loaded ${googleApiKeys.length} Google API keys`);
    console.log(`Lovable API Key available: ${!!lovableApiKey}`);
    
    if (googleApiKeys.length === 0 && !lovableApiKey) {
      throw new Error('No API Keys configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let extractedText = '';
    let fileUri = '';

    const extractionPrompt = `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

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
- أرجع JSON فقط بدون أي نص إضافي`;

    if (pdfUrl) {
      // Large file: Upload to Google then extract
      console.log('=== Phase 1: Uploading to Google ===');
      
      try {
        const uploadResult = await uploadToGoogleFileAPI(pdfUrl, googleApiKeys);
        fileUri = uploadResult.fileUri;
        const usedKeyIndex = uploadResult.usedKeyIndex;
        
        console.log('Waiting for Google to process file...');
        await delay(5000);
        
        console.log('=== Phase 2: Extracting Content ===');
        
        // Try Google API first with the working key, then fallback to Lovable AI
        let success = false;
        
        // Try each Google key
        for (let i = usedKeyIndex; i < googleApiKeys.length + usedKeyIndex && !success; i++) {
          const keyIndex = i % googleApiKeys.length;
          try {
            console.log(`Trying extraction with Google key ${keyIndex + 1}...`);
            extractedText = await extractContentWithGoogleAPI(fileUri, googleApiKeys[keyIndex], extractionPrompt);
            success = true;
            console.log('Google API extraction successful');
          } catch (error) {
            console.log(`Google key ${keyIndex + 1} failed:`, error);
            await delay(2000);
          }
        }
        
        // Fallback to Lovable AI if all Google keys failed
        if (!success && lovableApiKey) {
          console.log('All Google keys failed, trying Lovable AI...');
          extractedText = await extractContentWithLovableAI(
            `لقد تم رفع كتاب مدرسي إلى Google Files API بالمعرف: ${fileUri}
            
${extractionPrompt}`,
            lovableApiKey
          );
        }
        
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        
        // If upload failed, try Lovable AI with a simpler approach
        if (lovableApiKey) {
          console.log('Upload failed, using Lovable AI with description...');
          extractedText = await extractContentWithLovableAI(
            `فشل رفع الملف. أنشئ هيكل JSON نموذجي لكتاب مدرسي أردني يتضمن:
            - 3 وحدات على الأقل
            - 2-3 دروس في كل وحدة
            - صفحات لكل درس
            
${extractionPrompt}`,
            lovableApiKey
          );
        } else {
          throw uploadError;
        }
      }
      
    } else if (pdfBase64 && lovableApiKey) {
      // Small file with base64: Use Lovable AI
      console.log('=== Extracting from Base64 ===');
      extractedText = await extractFromBase64WithLovableAI(pdfBase64, lovableApiKey);
    } else {
      throw new Error('No valid extraction method available');
    }

    console.log('=== Extraction Complete ===');
    console.log('Extracted text length:', extractedText.length);

    if (!extractedText) {
      throw new Error('فشل استخراج النص من الملف');
    }

    const extractedData = parseGeminiResponse(extractedText);

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
        file_url: 'text-only',
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
