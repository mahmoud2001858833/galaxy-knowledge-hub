import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// استخدام مفتاح API واحد فقط
const GEMINI_API_KEY = Deno.env.get('JORDANIAN_NEW_AI_KEY_1');

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

    if (!GEMINI_API_KEY) {
      throw new Error('JORDANIAN_NEW_AI_KEY_1 not configured in Supabase secrets');
    }
    
    console.log('🤖 Using JORDANIAN_NEW_AI_KEY_1 for image analysis');

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
        console.error('⚠️ Rate limit hit on API key');
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
