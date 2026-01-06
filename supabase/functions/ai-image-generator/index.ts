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

    const API_KEY = Deno.env.get('IMAGE_GENERATOR_API_KEY');
    if (!API_KEY) {
      throw new Error('IMAGE_GENERATOR_API_KEY is not configured');
    }

    // بناء البرومبت المحسن للصور التعليمية
    let enhancedPrompt = prompt;
    
    // إضافة تعليمات لعدم وجود نص على الصورة
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
    enhancedPrompt = `${noTextInstruction}\n\nCreate a ${educationalContext} ${styleContext}: ${prompt}`;

    let requestBody: any;
    let endpoint: string;

    if (action === 'edit' && imageBase64) {
      // تعديل صورة موجودة
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
      requestBody = {
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
              }
            },
            {
              text: `Edit this image based on the following instructions. ${noTextInstruction}\n\nEdit instructions: ${prompt}`
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["image", "text"],
          responseMimeType: "text/plain"
        }
      };
    } else {
      // إنشاء صورة جديدة
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
      requestBody = {
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          responseModalities: ["image", "text"],
          responseMimeType: "text/plain"
        }
      };
    }

    console.log('Calling Gemini API for image generation...');
    console.log('Enhanced prompt:', enhancedPrompt);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Gemini API response received');

    // استخراج الصورة من الرد
    let imageData = null;
    let textResponse = null;

    if (result.candidates && result.candidates[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageData) {
      // إذا لم تنجح الطريقة الأولى، جرب Imagen
      console.log('Trying alternative image generation...');
      
      const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;
      const imagenBody = {
        instances: [{
          prompt: enhancedPrompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
          personGeneration: "ALLOW_ADULT"
        }
      };

      const imagenResponse = await fetch(imagenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imagenBody),
      });

      if (imagenResponse.ok) {
        const imagenResult = await imagenResponse.json();
        if (imagenResult.predictions && imagenResult.predictions[0]?.bytesBase64Encoded) {
          imageData = `data:image/png;base64,${imagenResult.predictions[0].bytesBase64Encoded}`;
        }
      }
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
