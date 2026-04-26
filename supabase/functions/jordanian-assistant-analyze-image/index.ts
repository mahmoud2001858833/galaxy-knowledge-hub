import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    console.log('🤖 Using Lovable AI for image analysis');

    const systemPrompt = `أنت معلم أردني خبير في تحليل الصور التعليمية للصف ${grade}.

قدم تحليلاً شاملاً يتضمن:
1. **وصف محتوى الصورة**: ماذا تحتوي الصورة؟
2. **المفهوم التعليمي**: ما المفهوم أو الموضوع الذي تشرحه؟
3. **المادة الدراسية**: ما المادة الدراسية المتعلقة؟
4. **شرح تفصيلي**: اشرح المفهوم بطريقة واضحة ومناسبة للصف ${grade}
5. **نصائح للدراسة**: كيف يمكن للطالب الاستفادة من هذا المحتوى؟

استخدم لغة واضحة وبسيطة مناسبة لمستوى الصف ${grade}.`;

    const userMessage = question || 'حلل هذه الصورة التعليمية';

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: [
                { type: 'text', text: userMessage },
                { 
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.4,
          max_tokens: 2048
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Lovable AI error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        console.error('⚠️ Rate limit hit');
        return new Response(
          JSON.stringify({ 
            analysis: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة مرة أخرى بعد قليل.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            analysis: 'يرجى إضافة رصيد لحساب Lovable AI.' 
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
    const analysis = data.choices?.[0]?.message?.content || 'لم أتمكن من تحليل الصورة';

    console.log('✅ Image analysis completed');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
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
