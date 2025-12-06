import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create JWT token from service account
async function createJWT(serviceAccount: any): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://generativelanguage.googleapis.com/',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/generative-language https://www.googleapis.com/auth/cloud-platform',
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${headerB64}.${payloadB64}`;

  const pemContents = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signatureInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signatureInput}.${signatureB64}`;
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwt = await createJWT(serviceAccount);
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) throw new Error('Failed to get access token');
  const data = await response.json();
  return data.access_token;
}

// Stream upload file to Google File API
async function uploadToGoogleFileAPIFromUrl(
  fileUrl: string,
  fileSize: number,
  accessToken: string
): Promise<{ fileUri: string; displayName: string }> {
  const displayName = `textbook_${Date.now()}.pdf`;
  
  console.log('Starting resumable upload to Google File API, size:', fileSize);
  
  // Start resumable upload session
  const startResponse = await fetch(
    'https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

  console.log('Upload URL obtained, downloading and uploading file in chunks...');

  // Download file and upload in chunks
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok || !fileResponse.body) {
    throw new Error('Failed to download file');
  }

  const reader = fileResponse.body.getReader();
  const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
  let buffer = new Uint8Array(0);
  let offset = 0;

  while (true) {
    const { done, value } = await reader.read();
    
    if (value) {
      // Append to buffer
      const newBuffer = new Uint8Array(buffer.length + value.length);
      newBuffer.set(buffer);
      newBuffer.set(value, buffer.length);
      buffer = newBuffer;
    }
    
    // Upload when we have enough data or reached the end
    while (buffer.length >= CHUNK_SIZE || (done && buffer.length > 0)) {
      const chunkSize = Math.min(CHUNK_SIZE, buffer.length);
      const chunk = buffer.slice(0, chunkSize);
      buffer = buffer.slice(chunkSize);
      
      const isLast = done && buffer.length === 0;
      const uploadCommand = isLast ? 'upload, finalize' : 'upload';
      
      console.log(`Uploading chunk: ${offset}-${offset + chunk.length} of ${fileSize} (${isLast ? 'final' : 'partial'})`);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Length': chunk.length.toString(),
          'X-Goog-Upload-Offset': offset.toString(),
          'X-Goog-Upload-Command': uploadCommand,
        },
        body: chunk
      });

      if (!uploadResponse.ok && !isLast) {
        const errorText = await uploadResponse.text();
        console.error('Chunk upload error:', errorText);
        throw new Error(`Chunk upload failed: ${uploadResponse.status}`);
      }
      
      if (isLast) {
        const fileData = await uploadResponse.json();
        console.log('File uploaded successfully:', fileData.file?.name);
        return {
          fileUri: fileData.file?.uri || '',
          displayName: fileData.file?.displayName || displayName
        };
      }
      
      offset += chunk.length;
    }
    
    if (done) break;
  }

  throw new Error('Upload failed - no final response');
}

// Extract content using File API
async function extractWithFileAPI(
  fileUri: string,
  accessToken: string
): Promise<any> {
  console.log('Extracting content from file:', fileUri);
  
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    // Accept file URL instead of base64
    const { fileUrl, bookName, grade, subject, semester, fileSizeMB } = await req.json();
    
    console.log('Processing PDF from URL:', { bookName, grade, subject, semester, fileSizeMB });

    if (!fileUrl || !grade || !subject || !semester) {
      throw new Error('Missing required parameters');
    }

    const fileSizeBytes = (fileSizeMB || 50) * 1024 * 1024;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get service account for Google File API
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('Google Service Account not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log('Service account loaded for:', serviceAccount.client_email);
    
    const accessToken = await getAccessToken(serviceAccount);
    console.log('Access token obtained');

    // Upload to Google File API by streaming from URL
    const { fileUri } = await uploadToGoogleFileAPIFromUrl(fileUrl, fileSizeBytes, accessToken);
    console.log('File uploaded to Google, URI:', fileUri);

    // Extract content from file
    const extractedData = await extractWithFileAPI(fileUri, accessToken);
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
        file_url: fileUrl,
        file_size_mb: fileSizeMB || 0,
        created_by: userId,
        is_active: true,
        gemini_file_uri: fileUri
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
