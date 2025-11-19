import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// استخدام المفاتيح الجديدة
const POSSIBLE_KEYS = [
  'JORDANIAN_NEW_AI_KEY_1',
  'JORDANIAN_NEW_AI_KEY_2',
  'JORDANIAN_NEW_AI_KEY_3',
  'JORDANIAN_NEW_AI_KEY_4',
  'JORDANIAN_NEW_AI_KEY_5',
];

function pickGeminiApiKey(): { key: string; keyName: string } {
  const availableKeysData = POSSIBLE_KEYS
    .map(keyName => ({ keyName, key: Deno.env.get(keyName) }))
    .filter(item => item.key !== undefined && item.key !== null && item.key !== '');
  
  console.log(`✅ Available API keys for image analysis: ${availableKeysData.length} out of ${POSSIBLE_KEYS.length}`);
  
  if (availableKeysData.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  
  const randomIndex = Math.floor(Math.random() * availableKeysData.length);
  const selected = availableKeysData[randomIndex];
  
  const keyPreview = selected.key!.slice(-6);
  console.log(`🔑 Selected key for image: ${selected.keyName} (ending: ...${keyPreview})`);
  
  return { key: selected.key!, keyName: selected.keyName };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, question, grade } = await req.json();
    
    console.log('🖼️ Analyzing image for grade:', grade);

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'الصورة مفقودة' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { key: GEMINI_API_KEY, keyName: SELECTED_KEY_NAME } = pickGeminiApiKey();
    console.log('🤖 Using API key:', SELECTED_KEY_NAME);

    // Prompt محسّن لتحليل الصور التعليمية
    const analysisPrompt = `أنت معلم أردني خبير في تحليل الصور التعليمية.

📸 المهمة:
${question ? `السؤال: ${question}` : 'حلل هذه الصورة التعليمية'}

الصف: ${grade}

قدم تحليلاً شاملاً يتضمن:
1. **وصف محتوى الصورة**: ماذا تحتوي الصورة؟
2. **المفهوم التعليمي**: ما المفهوم أو الموضوع الذي تشرحه؟
3. **المادة الدراسية**: ما المادة الدراسية المتعلقة؟
4. **شرح تفصيلي**: اشرح المفهوم بطريقة واضحة ومناسبة للصف ${grade}
5. **نصائح للدراسة**: كيف يمكن للطالب الاستفادة من هذا المحتوى؟

استخدم لغة واضحة وبسيطة مناسبة لمستوى الصف ${grade}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: analysisPrompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        console.error(`⚠️ Rate limit hit on key: ${SELECTED_KEY_NAME}`);
        return new Response(
          JSON.stringify({ 
            analysis: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة مرة أخرى بعد قليل.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          analysis: 'حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم أتمكن من تحليل الصورة';

    console.log('✅ Image analysis completed');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'حدث خطأ غير متوقع',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
