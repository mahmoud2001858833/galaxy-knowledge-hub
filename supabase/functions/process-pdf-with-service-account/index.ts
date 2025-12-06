import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create JWT token from service account
async function createJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

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

  // Parse the private key
  const pemContents = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signatureB64}`;
}

// Get access token using service account
async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwt = await createJWT(serviceAccount);

  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange failed:', errorText);
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId, fileUrl, grade, subject, semester } = await req.json();

    console.log('Processing PDF:', { bookId, grade, subject, semester });
    console.log('File URL:', fileUrl);

    if (!bookId || !fileUrl || !grade || !subject || !semester) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get service account JSON
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    
    let accessToken: string | null = null;
    let serviceAccount: any = null;

    if (serviceAccountJson) {
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log('Service account loaded for:', serviceAccount.client_email);
        accessToken = await getAccessToken(serviceAccount);
        console.log('Access token obtained successfully');
      } catch (e) {
        console.error('Failed to parse service account or get token:', e);
      }
    }

    // Fallback to API keys if service account fails
    const apiKeys = [
      Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1'),
      Deno.env.get('JORDANIAN_AI_ANSWER_KEY_1'),
      Deno.env.get('GOOGLE_AI_API_KEY'),
    ].filter(Boolean);

    // Download PDF
    console.log('Downloading PDF...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    let pdfResponse;
    try {
      pdfResponse = await fetch(fileUrl, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/pdf',
        }
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('تم انتهاء وقت تحميل الملف');
      }
      throw new Error(`فشل تحميل الملف: ${fetchError.message}`);
    }

    if (!pdfResponse.ok) {
      throw new Error(`فشل تحميل الملف: ${pdfResponse.status}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfSize = pdfBuffer.byteLength;
    console.log('PDF downloaded, size:', pdfSize, 'bytes');

    if (pdfSize > 25 * 1024 * 1024) {
      throw new Error('حجم الملف كبير جداً. الحد الأقصى 25 ميجابايت');
    }

    // Convert to base64
    const pdfBytes = new Uint8Array(pdfBuffer);
    let base64Pdf = '';
    const chunkSize = 32768;
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.slice(i, i + chunkSize);
      base64Pdf += String.fromCharCode.apply(null, [...chunk]);
    }
    base64Pdf = btoa(base64Pdf);
    console.log('PDF converted to base64, length:', base64Pdf.length);

    // Prepare the prompt
    const extractionPrompt = `أنت خبير في استخراج وتنظيم محتوى الكتب المدرسية الأردنية.

قم بتحليل هذا الكتاب المدرسي واستخرج محتواه بالكامل بالتنسيق التالي:

المطلوب:
1. استخرج كل النص من الكتاب
2. نظم المحتوى حسب الوحدات والدروس
3. حدد رقم الصفحة لكل جزء من المحتوى

أرجع البيانات بصيغة JSON فقط بالشكل التالي:
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
              "content": "محتوى الصفحة هنا..."
            }
          ]
        }
      ]
    }
  ]
}

مهم جداً:
- استخرج كل النص بدقة
- حافظ على ترتيب الوحدات والدروس
- لا تترك أي محتوى
- أرجع JSON صالح فقط بدون أي نص إضافي`;

    let extractedData: any = null;
    let lastError: string = '';

    // Try with service account first if available
    if (accessToken) {
      try {
        console.log('Trying extraction with service account...');
        
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
                  {
                    inline_data: {
                      mime_type: 'application/pdf',
                      data: base64Pdf
                    }
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

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log('Extraction successful with service account');
            extractedData = parseGeminiResponse(text);
          }
        } else {
          const errorText = await response.text();
          console.error('Service account API error:', errorText);
          lastError = errorText;
        }
      } catch (e: any) {
        console.error('Service account extraction failed:', e);
        lastError = e.message;
      }
    }

    // Fallback to API keys
    if (!extractedData && apiKeys.length > 0) {
      for (const apiKey of apiKeys) {
        if (extractedData) break;
        
        try {
          console.log('Trying extraction with API key...');
          
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
                    { text: extractionPrompt },
                    {
                      inline_data: {
                        mime_type: 'application/pdf',
                        data: base64Pdf
                      }
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

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              console.log('Extraction successful with API key');
              extractedData = parseGeminiResponse(text);
            }
          } else {
            const errorText = await response.text();
            console.error('API key error:', errorText);
            lastError = errorText;
          }
        } catch (e: any) {
          console.error('API key extraction failed:', e);
          lastError = e.message;
        }
      }
    }

    if (!extractedData) {
      throw new Error(`فشل استخراج النص من الملف: ${lastError}`);
    }

    // Save to database
    console.log('Saving extracted content to database...');
    const records: any[] = [];
    let totalPages = 0;
    let fullText = '';

    if (extractedData.content && Array.isArray(extractedData.content)) {
      for (const unit of extractedData.content) {
        if (unit.lessons && Array.isArray(unit.lessons)) {
          for (const lesson of unit.lessons) {
            if (lesson.pages && Array.isArray(lesson.pages)) {
              for (const page of lesson.pages) {
                records.push({
                  grade,
                  subject,
                  semester,
                  unit_number: unit.unit_number || 1,
                  unit_name: unit.unit_name || `الوحدة ${unit.unit_number || 1}`,
                  lesson_number: lesson.lesson_number || 1,
                  lesson_name: lesson.lesson_name || `الدرس ${lesson.lesson_number || 1}`,
                  page_number: page.page_number || totalPages + 1,
                  page_content: page.content || ''
                });
                fullText += (page.content || '') + '\n\n';
                totalPages++;
              }
            }
          }
        }
      }
    }

    // If no structured content, create simple records
    if (records.length === 0 && extractedData.rawText) {
      const textChunks = extractedData.rawText.match(/.{1,5000}/gs) || [];
      textChunks.forEach((chunk: string, idx: number) => {
        records.push({
          grade,
          subject,
          semester,
          unit_number: 1,
          unit_name: 'المحتوى الكامل',
          lesson_number: 1,
          lesson_name: 'النص المستخرج',
          page_number: idx + 1,
          page_content: chunk
        });
        fullText += chunk + '\n\n';
        totalPages++;
      });
    }

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
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
      }
    }

    // Update book record
    const { error: updateError } = await supabase
      .from('jordanian_textbooks')
      .update({
        extracted_text: fullText.substring(0, 50000),
        page_count: totalPages,
        is_active: true
      })
      .eq('id', bookId);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    console.log('Process completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: `تم استخراج ${records.length} صفحة بنجاح`,
      recordsCount: records.length,
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

function parseGeminiResponse(text: string): any {
  try {
    // Try to extract JSON from the response
    let jsonStr = text;
    
    // Remove markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Clean up
    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
      return JSON.parse(jsonStr);
    }
    
    // If not valid JSON, return as raw text
    return { rawText: text };
  } catch (e) {
    console.error('JSON parse error:', e);
    return { rawText: text };
  }
}
