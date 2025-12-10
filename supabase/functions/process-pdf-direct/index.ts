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
async function uploadToGoogleFileAPI(pdfBase64: string, apiKeys: string[]): Promise<{ fileUri: string; usedKeyIndex: number }> {
  console.log('📤 Uploading PDF to Google File API...');
  
  // Convert base64 to Uint8Array
  const binaryString = atob(pdfBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const fileSize = bytes.length;
  console.log('📊 File size:', (fileSize / 1024 / 1024).toFixed(2), 'MB');
  
  // Try each key until one works
  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];
    
    try {
      console.log(`🔑 Trying upload with key ${keyIndex + 1}/${apiKeys.length}...`);
      
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
        console.log(`❌ Key ${keyIndex + 1} start upload failed:`, errorText.substring(0, 100));
        if (startResponse.status === 429) await delay(3000);
        continue;
      }

      const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
      if (!uploadUrl) continue;

      // Upload file in chunks for large files
      const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
      let offset = 0;
      
      while (offset < fileSize) {
        const chunk = bytes.slice(offset, Math.min(offset + CHUNK_SIZE, fileSize));
        const isLast = offset + chunk.length >= fileSize;
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Length': chunk.length.toString(),
            'X-Goog-Upload-Offset': offset.toString(),
            'X-Goog-Upload-Command': isLast ? 'upload, finalize' : 'upload',
          },
          body: chunk
        });

        if (!uploadResponse.ok && !isLast) {
          console.log(`❌ Chunk upload failed at offset ${offset}`);
          break;
        }

        if (isLast) {
          const fileData = await uploadResponse.json();
          const fileUri = fileData.file?.uri;
          
          if (fileUri) {
            console.log('✅ File uploaded to Google, URI:', fileUri);
            return { fileUri, usedKeyIndex: keyIndex };
          }
        }

        offset += chunk.length;
        console.log(`📤 Uploaded ${(offset / 1024 / 1024).toFixed(2)}MB / ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
      }
    } catch (error) {
      console.log(`❌ Key ${keyIndex + 1} error:`, error);
      await delay(2000);
      continue;
    }
  }
  
  throw new Error('فشل رفع الملف بجميع المفاتيح المتاحة');
}

// ✅ جديد: استخراج تكراري للصفحات - يستخرج كل الكتاب على مراحل
async function iterativeExtraction(
  fileUri: string,
  apiKeys: string[],
  startKeyIndex: number
): Promise<any[]> {
  console.log('🔄 Starting iterative extraction...');
  
  const allContent: any[] = [];
  let currentPage = 1;
  const PAGES_PER_REQUEST = 40; // استخراج 40 صفحة في كل طلب
  let hasMoreContent = true;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  let keyIndex = startKeyIndex;
  
  while (hasMoreContent && retryCount < MAX_RETRIES) {
    const endPage = currentPage + PAGES_PER_REQUEST - 1;
    console.log(`📖 Extracting pages ${currentPage} to ${endPage}...`);
    
    const prompt = `أنت خبير في استخراج المحتوى من الكتب المدرسية الأردنية.

مهمتك: استخراج الصفحات من ${currentPage} إلى ${endPage} فقط من هذا الكتاب.

⚠️ تعليمات حاسمة:
1. اقرأ الصفحات المطلوبة فقط (${currentPage} إلى ${endPage})
2. استخرج كل النص الموجود في كل صفحة بالكامل
3. حافظ على أرقام الصفحات الحقيقية كما في الكتاب
4. إذا انتهى الكتاب قبل الصفحة ${endPage}، أرجع ما وجدته فقط
5. إذا لم تجد محتوى في هذا النطاق، أرجع: {"content": [], "hasMore": false}

أرجع JSON بالشكل التالي:
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
            { "page_number": ${currentPage}, "content": "النص الكامل للصفحة" }
          ]
        }
      ]
    }
  ],
  "hasMore": true,
  "lastPageExtracted": ${endPage}
}

📌 ملاحظات:
- hasMore = true إذا كان هناك المزيد من الصفحات بعد ${endPage}
- hasMore = false إذا انتهى الكتاب
- استخرج كل النص بدون اختصار`;

    try {
      const apiKey = apiKeys[keyIndex % apiKeys.length];
      
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
        console.log(`❌ Extraction failed:`, errorText.substring(0, 200));
        
        if (response.status === 429) {
          console.log('⏳ Rate limited, waiting and switching key...');
          await delay(5000);
          keyIndex++;
          retryCount++;
          continue;
        }
        
        keyIndex++;
        retryCount++;
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text || text.length < 50) {
        console.log('⚠️ Empty response, assuming end of book');
        hasMoreContent = false;
        break;
      }

      // Parse the response
      const parsed = parseGeminiResponse(text);
      
      if (parsed.content && Array.isArray(parsed.content)) {
        allContent.push(...parsed.content);
        console.log(`✅ Extracted ${parsed.content.length} units from pages ${currentPage}-${endPage}`);
        
        hasMoreContent = parsed.hasMore !== false;
        currentPage = (parsed.lastPageExtracted || endPage) + 1;
      } else if (parsed.rawText) {
        // Handle raw text response
        allContent.push({
          unit_number: Math.ceil(currentPage / 20),
          unit_name: `الوحدة ${Math.ceil(currentPage / 20)}`,
          lessons: [{
            lesson_number: 1,
            lesson_name: `صفحات ${currentPage}-${endPage}`,
            pages: [{ page_number: currentPage, content: parsed.rawText }]
          }]
        });
        currentPage = endPage + 1;
        
        // Check if content is short (end of book)
        if (parsed.rawText.length < 500) {
          hasMoreContent = false;
        }
      } else {
        console.log('⚠️ Could not parse response, trying next batch');
        currentPage = endPage + 1;
      }
      
      retryCount = 0; // Reset retry count on success
      await delay(2000); // Rate limiting protection
      
    } catch (error) {
      console.error(`❌ Error in extraction:`, error);
      keyIndex++;
      retryCount++;
      await delay(3000);
    }
  }

  console.log(`📊 Total units extracted: ${allContent.length}`);
  return allContent;
}

// ✅ استخراج مباشر من base64 مع تكرار للملفات الكبيرة
async function extractFromBase64Iterative(
  base64Data: string,
  apiKeys: string[]
): Promise<any[]> {
  console.log('📄 Extracting content from base64 PDF...');
  
  const allContent: any[] = [];
  let currentPage = 1;
  const PAGES_PER_REQUEST = 30;
  let hasMoreContent = true;
  let retryCount = 0;
  const MAX_RETRIES = 5;
  let keyIndex = 0;
  
  while (hasMoreContent && retryCount < MAX_RETRIES) {
    const endPage = currentPage + PAGES_PER_REQUEST - 1;
    console.log(`📖 Extracting pages ${currentPage} to ${endPage}...`);
    
    const prompt = `استخرج محتوى الصفحات من ${currentPage} إلى ${endPage} من هذا الكتاب المدرسي.

⚠️ مهم جداً:
1. اقرأ الصفحات ${currentPage} إلى ${endPage} فقط
2. استخرج كل النص الموجود بالكامل - لا تختصر أي شيء
3. حافظ على أرقام الصفحات الحقيقية
4. إذا لم توجد صفحات في هذا النطاق، أرجع: {"content": [], "hasMore": false}

أرجع JSON:
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
            { "page_number": ${currentPage}, "content": "النص الكامل" }
          ]
        }
      ]
    }
  ],
  "hasMore": true,
  "lastPageExtracted": ${endPage}
}`;

    try {
      const apiKey = apiKeys[keyIndex % apiKeys.length];
      
      const response = await fetch(
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
                    data: base64Data 
                  } 
                },
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
        console.log(`❌ Key ${keyIndex + 1} failed:`, errorText.substring(0, 100));
        
        if (response.status === 429) {
          await delay(5000);
          keyIndex++;
          retryCount++;
          continue;
        }
        keyIndex++;
        retryCount++;
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text || text.length < 50) {
        console.log('⚠️ Empty response, end of book');
        hasMoreContent = false;
        break;
      }

      const parsed = parseGeminiResponse(text);
      
      if (parsed.content && Array.isArray(parsed.content)) {
        allContent.push(...parsed.content);
        console.log(`✅ Extracted ${parsed.content.length} units`);
        
        hasMoreContent = parsed.hasMore !== false;
        currentPage = (parsed.lastPageExtracted || endPage) + 1;
      } else if (parsed.rawText) {
        allContent.push({
          unit_number: Math.ceil(currentPage / 20),
          unit_name: `الوحدة ${Math.ceil(currentPage / 20)}`,
          lessons: [{
            lesson_number: 1,
            lesson_name: `صفحات ${currentPage}-${endPage}`,
            pages: [{ page_number: currentPage, content: parsed.rawText }]
          }]
        });
        currentPage = endPage + 1;
        
        if (parsed.rawText.length < 500) {
          hasMoreContent = false;
        }
      } else {
        currentPage = endPage + 1;
      }
      
      retryCount = 0;
      await delay(2000);
      
    } catch (error) {
      console.error(`❌ Error:`, error);
      keyIndex++;
      retryCount++;
      await delay(3000);
    }
  }

  return allContent;
}

// Fallback to Lovable AI Gateway
async function extractContentWithLovableAI(
  pdfBase64: string,
  lovableApiKey: string
): Promise<any[]> {
  console.log('🤖 Using Lovable AI for extraction...');
  
  const allContent: any[] = [];
  let currentPage = 1;
  const PAGES_PER_REQUEST = 25;
  let hasMoreContent = true;
  let retryCount = 0;
  
  while (hasMoreContent && retryCount < 5) {
    const endPage = currentPage + PAGES_PER_REQUEST - 1;
    
    const prompt = `استخرج محتوى الصفحات من ${currentPage} إلى ${endPage} من هذا الكتاب.

أرجع JSON:
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
            { "page_number": ${currentPage}, "content": "النص الكامل" }
          ]
        }
      ]
    }
  ],
  "hasMore": true
}`;

    try {
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
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url',
                  image_url: { url: `data:application/pdf;base64,${pdfBase64}` }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 65536,
        })
      });

      if (!response.ok) {
        console.log('❌ Lovable AI error:', response.status);
        retryCount++;
        await delay(3000);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      
      const parsed = parseGeminiResponse(text);
      
      if (parsed.content && Array.isArray(parsed.content)) {
        allContent.push(...parsed.content);
        hasMoreContent = parsed.hasMore !== false;
        currentPage = endPage + 1;
      } else {
        hasMoreContent = false;
      }
      
      retryCount = 0;
      await delay(2000);
      
    } catch (error) {
      console.error('❌ Lovable AI error:', error);
      retryCount++;
      await delay(3000);
    }
  }

  return allContent;
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
    let { pdfBase64, pdfUrl, bookName, grade, subject, semester, fileSizeMB } = requestBody;
    
    console.log('=== 🚀 Processing PDF - Enhanced System ===');
    console.log('📚 Book:', bookName);
    console.log('📖 Grade:', grade, 'Subject:', subject, 'Semester:', semester);
    console.log('📊 File size:', fileSizeMB, 'MB');
    console.log('Has Base64:', !!pdfBase64, 'Length:', pdfBase64?.length || 0);

    // Check if we have either pdfBase64 or pdfUrl
    if ((!pdfBase64 && !pdfUrl) || !grade || !subject || !semester) {
      console.error('Missing data - pdfBase64:', !!pdfBase64, 'pdfUrl:', !!pdfUrl, 'grade:', grade, 'subject:', subject, 'semester:', semester);
      throw new Error('البيانات المطلوبة غير مكتملة');
    }
    
    console.log('📥 Has pdfBase64:', !!pdfBase64, 'Has pdfUrl:', !!pdfUrl);

    // Get keys
    const googleApiKeys = getAllGoogleApiKeys();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    console.log(`🔑 Loaded ${googleApiKeys.length} Google API keys`);
    console.log(`🔑 Lovable API Key available: ${!!lovableApiKey}`);
    
    if (googleApiKeys.length === 0 && !lovableApiKey) {
      throw new Error('لا توجد مفاتيح API متاحة');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let allContent: any[] = [];
    let fileUri = '';

    // ✅ تحديد طريقة الاستخراج بناءً على المدخلات
    let fileSizeMBCalculated = fileSizeMB || 0;
    
    if (pdfBase64) {
      const fileSizeBytes = (pdfBase64.length * 3) / 4;
      fileSizeMBCalculated = fileSizeBytes / (1024 * 1024);
    }
    
    console.log(`📊 Calculated file size: ${fileSizeMBCalculated.toFixed(2)} MB`);
    console.log(`📥 Processing mode: ${pdfUrl ? 'URL-based' : 'Base64-based'}`);

    // ✅ إذا كان لدينا URL، نحتاج تحميل الملف أولاً
    if (pdfUrl && !pdfBase64) {
      console.log('=== 📥 Downloading file from URL ===');
      console.log('URL:', pdfUrl);
      
      try {
        const downloadResponse = await fetch(pdfUrl);
        if (!downloadResponse.ok) {
          throw new Error(`فشل تحميل الملف: ${downloadResponse.status}`);
        }
        
        const arrayBuffer = await downloadResponse.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to base64
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        pdfBase64 = btoa(binary);
        
        fileSizeMBCalculated = uint8Array.length / (1024 * 1024);
        console.log(`✅ Downloaded and converted, size: ${fileSizeMBCalculated.toFixed(2)} MB`);
        
      } catch (downloadError) {
        console.error('❌ Download failed:', downloadError);
        throw new Error('فشل تحميل الملف من الرابط');
      }
    }

    // Now we should have pdfBase64
    if (!pdfBase64) {
      throw new Error('فشل الحصول على محتوى الملف');
    }

    if (fileSizeMBCalculated > 15) {
      // ✅ ملف كبير: رفع لـ Google File API ثم استخراج تكراري
      console.log('=== 📤 Large file: Using Google File API ===');
      
      try {
        const uploadResult = await uploadToGoogleFileAPI(pdfBase64, googleApiKeys);
        fileUri = uploadResult.fileUri;
        
        console.log('⏳ Waiting for Google to process file...');
        await delay(8000);
        
        // استخراج تكراري
        allContent = await iterativeExtraction(fileUri, googleApiKeys, uploadResult.usedKeyIndex);
        
      } catch (uploadError) {
        console.error('❌ Upload failed:', uploadError);
        
        // Fallback to direct base64 extraction
        if (googleApiKeys.length > 0) {
          console.log('🔄 Falling back to direct base64 extraction...');
          allContent = await extractFromBase64Iterative(pdfBase64, googleApiKeys);
        }
        
        // Final fallback to Lovable AI
        if (allContent.length === 0 && lovableApiKey) {
          console.log('🔄 Falling back to Lovable AI...');
          allContent = await extractContentWithLovableAI(pdfBase64, lovableApiKey);
        }
      }
      
    } else {
      // ✅ ملف صغير/متوسط: استخراج مباشر من base64
      console.log('=== 📄 Direct base64 extraction ===');
      
      if (googleApiKeys.length > 0) {
        allContent = await extractFromBase64Iterative(pdfBase64, googleApiKeys);
      }
      
      // Fallback to Lovable AI
      if (allContent.length === 0 && lovableApiKey) {
        console.log('🔄 Falling back to Lovable AI...');
        allContent = await extractContentWithLovableAI(pdfBase64, lovableApiKey);
      }
    }

    console.log(`=== 📊 Extraction Complete ===`);
    console.log(`Total units extracted: ${allContent.length}`);

    if (allContent.length === 0) {
      throw new Error('فشل استخراج المحتوى - لم يتم العثور على أي محتوى');
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
        file_url: 'text-only',
        file_size_mb: fileSizeMB || fileSizeMBCalculated,
        created_by: userId,
        is_active: true,
        gemini_file_uri: fileUri || null
      })
      .select()
      .single();

    if (bookError) {
      console.error('❌ Book record error:', bookError);
      throw new Error(`فشل حفظ بيانات الكتاب: ${bookError.message}`);
    }

    console.log('✅ Book record created:', bookRecord.id);

    // Process and save content records
    const records: any[] = [];
    let fullText = '';
    const unitsSet = new Set<number>();
    const lessonsSet = new Set<string>();
    let totalPages = 0;

    for (const unit of allContent) {
      const unitNum = unit.unit_number || 1;
      unitsSet.add(unitNum);
      
      if (unit.lessons && Array.isArray(unit.lessons)) {
        for (const lesson of unit.lessons) {
          const lessonKey = `${unitNum}-${lesson.lesson_number || 1}`;
          lessonsSet.add(lessonKey);
          
          if (lesson.pages && Array.isArray(lesson.pages)) {
            for (const page of lesson.pages) {
              if (page.content && page.content.trim().length > 10) {
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
                  page_content: page.content
                });
              }
            }
          }
        }
      }
    }

    console.log(`📊 Saving ${records.length} content records...`);

    // Insert in batches
    const BATCH_SIZE = 50;
    let successfulBatches = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from('jordanian_textbook_content')
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, insertError);
      } else {
        successfulBatches++;
        console.log(`✅ Inserted batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(records.length/BATCH_SIZE)}`);
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

    console.log(`=== ✅ SUCCESS ===`);
    console.log(`📊 Units: ${unitsSet.size}, Lessons: ${lessonsSet.size}, Pages: ${totalPages}`);

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
    console.error('=== ❌ ERROR ===', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'حدث خطأ غير متوقع'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
