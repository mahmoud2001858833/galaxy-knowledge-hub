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

// Upload file to Google File API for large files
async function uploadToGoogleFileAPI(
  pdfBuffer: ArrayBuffer,
  accessToken: string
): Promise<{ fileUri: string; displayName: string }> {
  const pdfBytes = new Uint8Array(pdfBuffer);
  const displayName = `textbook_${Date.now()}.pdf`;
  
  console.log('Uploading to Google File API...');
  
  // Start resumable upload
  const startResponse = await fetch(
    'https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': pdfBytes.length.toString(),
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

  console.log('Upload URL obtained, uploading file...');

  // Upload the file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': pdfBytes.length.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: pdfBytes,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Upload error:', errorText);
    throw new Error(`Failed to upload file: ${uploadResponse.status}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log('File uploaded:', uploadResult);

  // Wait for file to be processed
  const fileName = uploadResult.file?.name;
  if (!fileName) throw new Error('No file name in response');

  // Poll for file status
  let fileUri = '';
  for (let i = 0; i < 30; i++) {
    const statusResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (statusResponse.ok) {
      const fileInfo = await statusResponse.json();
      if (fileInfo.state === 'ACTIVE') {
        fileUri = fileInfo.uri;
        console.log('File is active:', fileUri);
        break;
      }
    }
    
    console.log(`Waiting for file processing... attempt ${i + 1}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (!fileUri) throw new Error('File processing timeout');

  return { fileUri, displayName };
}

// Extract content using file URI (for large files)
async function extractWithFileAPI(
  fileUri: string,
  chunkInfo: string,
  accessToken: string
): Promise<any> {
  const extractionPrompt = `أنت خبير في استخراج محتوى الكتب المدرسية الأردنية.

قم بتحليل هذا الملف واستخرج كل النص بالكامل بدون أي اختصار أو تلخيص.

${chunkInfo}

التعليمات الحاسمة:
1. استخرج كل كلمة وكل جملة من الملف - لا تختصر أبداً
2. حافظ على التنسيق الأصلي قدر الإمكان
3. نظم المحتوى حسب الوحدات والدروس إذا كانت واضحة
4. إذا لم تكن الوحدات واضحة، قسم المحتوى لصفحات متتالية

أرجع JSON بالضبط بهذا الشكل:
{
  "content": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة أو عنوان القسم",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس أو عنوان فرعي",
          "pages": [
            {
              "page_number": 1,
              "content": "كل النص الكامل من هذه الصفحة بدون اختصار..."
            }
          ]
        }
      ]
    }
  ]
}

قواعد صارمة:
- لا تختصر المحتوى أبداً - انسخ كل شيء حرفياً
- إذا كانت الصفحة طويلة، انسخها كاملة
- حافظ على كل التفاصيل والأمثلة والتمارين
- أرجع JSON صالح فقط`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: extractionPrompt },
            { fileData: { mimeType: 'application/pdf', fileUri } }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000000,
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text in response');
  
  return parseGeminiResponse(text);
}

// Extract content from base64 (for smaller files)
async function extractChunk(
  base64Pdf: string, 
  chunkInfo: string,
  accessToken: string | null,
  apiKeys: string[]
): Promise<any> {
  const extractionPrompt = `أنت خبير في استخراج محتوى الكتب المدرسية الأردنية.

قم بتحليل هذا الملف واستخرج كل النص بالكامل بدون أي اختصار أو تلخيص.

${chunkInfo}

التعليمات الحاسمة:
1. استخرج كل كلمة وكل جملة من الملف - لا تختصر أبداً
2. حافظ على التنسيق الأصلي قدر الإمكان
3. نظم المحتوى حسب الوحدات والدروس إذا كانت واضحة
4. إذا لم تكن الوحدات واضحة، قسم المحتوى لصفحات متتالية

أرجع JSON بالضبط بهذا الشكل:
{
  "content": [
    {
      "unit_number": 1,
      "unit_name": "اسم الوحدة أو عنوان القسم",
      "lessons": [
        {
          "lesson_number": 1,
          "lesson_name": "اسم الدرس أو عنوان فرعي",
          "pages": [
            {
              "page_number": 1,
              "content": "كل النص الكامل من هذه الصفحة بدون اختصار..."
            }
          ]
        }
      ]
    }
  ]
}

قواعد صارمة:
- لا تختصر المحتوى أبداً - انسخ كل شيء حرفياً
- إذا كانت الصفحة طويلة، انسخها كاملة
- حافظ على كل التفاصيل والأمثلة والتمارين
- أرجع JSON صالح فقط`;

  let result = null;

  // Try with service account first
  if (accessToken) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: extractionPrompt },
                { inline_data: { mime_type: 'application/pdf', data: base64Pdf } }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1000000,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) result = parseGeminiResponse(text);
      }
    } catch (e: any) {
      console.error('Service account extraction error:', e);
    }
  }

  // Fallback to API keys
  if (!result && apiKeys.length > 0) {
    for (const apiKey of apiKeys) {
      if (result) break;
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: extractionPrompt },
                  { inline_data: { mime_type: 'application/pdf', data: base64Pdf } }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000000,
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) result = parseGeminiResponse(text);
        }
      } catch (e: any) {
        console.error('API key extraction error:', e);
      }
    }
  }

  return result;
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
  } catch (e: any) {
    console.error('JSON parse error:', e);
    return { rawText: text };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId, fileUrl, grade, subject, semester } = await req.json();
    console.log('Processing PDF:', { bookId, grade, subject, semester, fileUrl });

    if (!bookId || !fileUrl || !grade || !subject || !semester) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get service account
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    let accessToken: string | null = null;
    let serviceAccount: any = null;

    if (serviceAccountJson) {
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log('Service account loaded for:', serviceAccount.client_email);
        accessToken = await getAccessToken(serviceAccount);
        console.log('Access token obtained');
      } catch (e: any) {
        console.error('Service account error:', e);
      }
    }

    const apiKeys = [
      Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1'),
      Deno.env.get('JORDANIAN_AI_ANSWER_KEY_1'),
      Deno.env.get('GOOGLE_AI_API_KEY'),
    ].filter(Boolean) as string[];

    // Download PDF with extended timeout for large files
    console.log('Downloading PDF...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout for large files

    let pdfResponse;
    try {
      pdfResponse = await fetch(fileUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw new Error(fetchError.name === 'AbortError' ? 'تم انتهاء وقت تحميل الملف' : `فشل تحميل الملف: ${fetchError.message}`);
    }

    if (!pdfResponse.ok) throw new Error(`فشل تحميل الملف: ${pdfResponse.status}`);

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfSize = pdfBuffer.byteLength;
    const pdfSizeMB = pdfSize / 1024 / 1024;
    console.log('PDF downloaded, size:', pdfSize, 'bytes', pdfSizeMB.toFixed(2), 'MB');

    // NEW: Support up to 250MB files
    if (pdfSize > 250 * 1024 * 1024) {
      throw new Error('حجم الملف كبير جداً. الحد الأقصى 250 ميجابايت');
    }

    let extractedData: any = null;

    // For large files (> 20MB), use Google File API
    if (pdfSizeMB > 20 && accessToken) {
      console.log('Large file detected, using Google File API...');
      
      try {
        const { fileUri } = await uploadToGoogleFileAPI(pdfBuffer, accessToken);
        
        extractedData = await extractWithFileAPI(
          fileUri,
          'هذا كتاب مدرسي أردني كامل. استخرج كل المحتوى من كل الصفحات بدون أي اختصار.',
          accessToken
        );
      } catch (e: any) {
        console.error('File API error:', e);
        throw new Error(`فشل معالجة الملف الكبير: ${(e as Error).message}`);
      }
    } else {
      // For smaller files, use base64 method
      console.log('Using base64 method for smaller file...');
      
      const pdfBytes = new Uint8Array(pdfBuffer);
      let base64Pdf = '';
      const chunkSize = 32768;
      for (let i = 0; i < pdfBytes.length; i += chunkSize) {
        const chunk = pdfBytes.slice(i, i + chunkSize);
        base64Pdf += String.fromCharCode.apply(null, [...chunk]);
      }
      base64Pdf = btoa(base64Pdf);
      console.log('PDF converted to base64, length:', base64Pdf.length);

      extractedData = await extractChunk(
        base64Pdf,
        'هذا كتاب مدرسي أردني كامل. استخرج كل المحتوى من كل الصفحات بدون أي اختصار.',
        accessToken,
        apiKeys
      );
    }

    if (!extractedData) {
      throw new Error('فشل استخراج النص من الملف');
    }

    console.log('Extraction completed, processing records...');

    // Process and save records
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
                const pageContent = page.content || '';
                records.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unit.unit_number || 1,
                  unit_name: unit.unit_name || `الوحدة ${unit.unit_number || 1}`,
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || `الدرس ${lesson.lesson_number || 1}`,
                  page_number: page.page_number || records.length + 1,
                  page_content: pageContent
                });
                fullText += pageContent + '\n\n';
              }
            }
          }
        }
      }
    }

    // If no structured content, use raw text
    if (records.length === 0 && extractedData.rawText) {
      console.log('Using raw text fallback...');
      const textChunks = extractedData.rawText.match(/.{1,4000}/gs) || [];
      textChunks.forEach((chunk: string, idx: number) => {
        records.push({
          grade, subject, semester,
          unit_number: 1,
          unit_name: 'المحتوى الكامل',
          lesson_number: 1,
          lesson_name: 'النص المستخرج',
          page_number: idx + 1,
          page_content: chunk
        });
        fullText += chunk + '\n\n';
      });
      unitsSet.add(1);
      lessonsSet.add('1-1');
    }

    console.log(`Processing ${records.length} records...`);

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
          throw new Error(`فشل حفظ المحتوى: ${insertError.message}`);
        }
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
      }
    }

    // Update book record with accurate counts
    const { error: updateError } = await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: fullText.substring(0, 100000),
        page_count: records.length,
        is_active: true
      })
      .eq('id', bookId);

    if (updateError) console.error('Update error:', updateError);

    const unitsCount = unitsSet.size;
    const lessonsCount = lessonsSet.size;

    console.log('Process completed:', { records: records.length, units: unitsCount, lessons: lessonsCount });

    return new Response(JSON.stringify({
      success: true,
      message: `تم استخراج ${records.length} صفحة، ${unitsCount} وحدة، ${lessonsCount} درس`,
      recordsCount: records.length,
      unitsCount,
      lessonsCount,
      extractedText: fullText.substring(0, 500)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Process error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'حدث خطأ غير متوقع'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
