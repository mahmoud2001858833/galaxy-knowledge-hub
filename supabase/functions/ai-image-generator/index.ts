import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, action, imageBase64, style, subject, gradeLevel } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // بناء البرومبت المحسن للصور التعليمية
    const noTextInstruction = "IMPORTANT: Do not include any text, labels, words, letters, numbers, or writing on the image. The image should be purely visual without any textual elements.";
    
    // إضافة السياق التعليمي
    let educationalContext = "";
    if (subject) {
      const subjectMap: Record<string, string> = {
        'physics': 'physics educational diagram',
        'chemistry': 'chemistry scientific illustration',
        'biology': 'biology anatomical or cellular diagram',
        'math': 'mathematical geometric illustration',
        'arabic': 'Arabic calligraphy artistic illustration',
        'english': 'English language learning illustration',
        'geography': 'geographical map or landscape illustration',
        'history': 'historical scene illustration',
        'islamic': 'Islamic art and architecture illustration',
      };
      educationalContext = subjectMap[subject] || 'educational illustration';
    }

    // إضافة نمط الصورة
    let styleContext = "";
    if (style) {
      const styleMap: Record<string, string> = {
        'realistic': 'photorealistic, detailed, high quality',
        'cartoon': 'cartoon style, colorful, kid-friendly',
        'diagram': 'scientific diagram, clean lines, educational',
        'sketch': 'hand-drawn sketch, pencil style',
        'infographic': 'infographic style, clean, organized',
        '3d': '3D rendered, three-dimensional, modern',
      };
      styleContext = styleMap[style] || '';
    }

    // تجميع البرومبت النهائي
    const enhancedPrompt = `${noTextInstruction}\n\nCreate a ${educationalContext} ${styleContext}: ${prompt}. Ultra high resolution, professional quality.`;

    console.log('Calling Lovable AI Gateway for image generation...');
    console.log('Enhanced prompt:', enhancedPrompt);

    let requestBody: any;

    if (action === 'edit' && imageBase64) {
      // تعديل صورة موجودة
      requestBody = {
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Edit this image based on the following instructions. ${noTextInstruction}\n\nEdit instructions: ${prompt}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }],
        modalities: ["image", "text"]
      };
    } else {
      // إنشاء صورة جديدة
      requestBody = {
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{
          role: "user",
          content: enhancedPrompt
        }],
        modalities: ["image", "text"]
      };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'يرجى إضافة رصيد لحسابك' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Lovable AI Gateway response received');

    // استخراج الصورة من الرد
    let imageData = null;
    let textResponse = null;

    if (result.choices && result.choices[0]?.message) {
      const message = result.choices[0].message;
      
      // استخراج النص
      if (message.content) {
        textResponse = message.content;
      }
      
      // استخراج الصورة
      if (message.images && message.images[0]?.image_url?.url) {
        imageData = message.images[0].image_url.url;
      }
    }

    if (!imageData) {
      console.error('No image data in response:', JSON.stringify(result));
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'لم يتم إنشاء الصورة. جرب وصفاً مختلفاً.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imageData,
        textResponse,
        prompt: enhancedPrompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-image-generator:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
