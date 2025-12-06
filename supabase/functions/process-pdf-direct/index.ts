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
  
  // Fetch the file as a stream
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.status}`);
  }
  
  const contentLength = fileResponse.headers.get('content-length');
  const fileSize = contentLength ? parseInt(contentLength) : 0;
  
  console.log('File size from header:', fileSize);
  
  // Start resumable upload session
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

  // Read the file in chunks and upload
  const reader = fileResponse.body?.getReader();
  if (!reader) throw new Error('Cannot read file stream');
  
  const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
  let buffer = new Uint8Array(0);
  let offset = 0;
  let done = false;

  while (!done) {
    // Read data into buffer until we have enough for a chunk or file ends
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

    // Determine chunk to send
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

// Extract content using File API reference
async function extractWithFileAPI(
  fileUri: string,
  apiKey: string
): Promise<any> {
  console.log('Extracting content from file URI:', fileUri);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              fileData: {
                mimeType: 'application/pdf',
                fileUri: fileUri
              }
            },
            {
              text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: استخرج كل محتوى هذا الكتاب وقم بتنظيمه على شكل وحدات ودروس وصفحات.

الرجاء إرجاع النتيجة بتنسيق JSON التالي بالضبط:
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
            {
              "page_number": 1,
              "content": "محتوى الصفحة كاملاً..."
            }
          ]
        }
      ]
    }
  ]
}

مهم جداً:
1. استخرج كل النص من كل صفحة بدون اختصار
2. حافظ على ترتيب الوحدات والدروس
3. إذا لم تجد تقسيماً واضحاً، أنشئ وحدة واحدة ودرساً واحداً مع كل الصفحات
4. أرجع JSON فقط بدون أي نص إضافي`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100000,
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

// Extract content using inline base64 (for small files only)
async function extractWithBase64(
  base64Data: string,
  apiKey: string
): Promise<any> {
  console.log('Extracting content from inline base64...');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data
              }
            },
            {
              text: `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: استخرج كل محتوى هذا الكتاب وقم بتنظيمه على شكل وحدات ودروس وصفحات.

الرجاء إرجاع النتيجة بتنسيق JSON التالي بالضبط:
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
            {
              "page_number": 1,
              "content": "محتوى الصفحة كاملاً..."
            }
          ]
        }
      ]
    }
  ]
}

مهم جداً:
1. استخرج كل النص من كل صفحة بدون اختصار
2. حافظ على ترتيب الوحدات والدروس
3. إذا لم تجد تقسيماً واضحاً، أنشئ وحدة واحدة ودرساً واحداً مع كل الصفحات
4. أرجع JSON فقط بدون أي نص إضافي`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100000,
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

    // Use API key
    const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!apiKey) {
      throw new Error('Google API Key not configured');
    }
    
    let extractedData;
    let fileUri = '';

    // For large files: use URL and stream to Google
    if (pdfUrl) {
      console.log('Using URL streaming for large file...');
      fileUri = await uploadToGoogleFileAPIFromUrl(pdfUrl, apiKey);
      console.log('File uploaded to Google, URI:', fileUri);
      extractedData = await extractWithFileAPI(fileUri, apiKey);
    } 
    // For small files: use inline base64
    else if (pdfBase64) {
      const estimatedSizeMB = (pdfBase64.length * 0.75) / (1024 * 1024);
      console.log('Estimated file size:', estimatedSizeMB.toFixed(2), 'MB');
      
      // Small files can use inline base64 (< 10MB)
      if (estimatedSizeMB < 10) {
        console.log('Using inline base64 for small file...');
        extractedData = await extractWithBase64(pdfBase64, apiKey);
      } else {
        // This shouldn't happen if frontend properly routes large files
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

    if (extractedData.content && Array.isArray(extractedData.content)) {
      for (const unit of extractedData.content) {
        unitsSet.add(unit.unit_number || 1);
        
        if (unit.lessons && Array.isArray(unit.lessons)) {
          for (const lesson of unit.lessons) {
            lessonsSet.add(`${unit.unit_number}-${lesson.lesson_number}`);
            
            if (lesson.pages && Array.isArray(lesson.pages)) {
              for (const page of lesson.pages) {
                const content = page.content || '';
                fullText += content + '\n\n';
                
                records.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unit.unit_number || 1,
                  unit_name: unit.unit_name || 'الوحدة',
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || 'الدرس',
                  page_number: page.page_number || records.length + 1,
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

    console.log('Records to insert:', records.length);

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
        }
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
      }
    }

    // Update book record
    await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: fullText.substring(0, 50000),
        page_count: records.length,
        is_active: true
      })
      .eq('id', bookRecord.id);

    return new Response(JSON.stringify({
      success: true,
      message: `تم استخراج ${records.length} صفحة من ${unitsSet.size} وحدات و ${lessonsSet.size} درس`,
      bookId: bookRecord.id,
      recordsCount: records.length,
      unitsCount: unitsSet.size,
      lessonsCount: lessonsSet.size,
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
