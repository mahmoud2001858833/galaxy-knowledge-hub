import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { projectName, projectIdea, projectMaterials } = await req.json();

    if (!projectName || !projectIdea) {
      throw new Error('Missing project details');
    }

    console.log('Generating real AI image for project:', projectName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a detailed, customized prompt for unique image generation
    const imagePrompt = `Create a stunning, professional educational illustration showing a completed recycling craft project.

PROJECT DETAILS:
- Project Name: ${projectName}
- Project Concept: ${projectIdea}
- Materials Used: ${projectMaterials || 'recycled materials like bottles, cardboard, plastic'}

VISUAL REQUIREMENTS:
1. Show the FINISHED, completed project prominently in the center
2. Display the transformation from recycled materials to the final product
3. Use vibrant, eco-friendly color palette (greens, blues, earth tones, bright accents)
4. Clean, modern illustration style suitable for educational purposes
5. Include subtle environmental elements (leaves, recycling symbols as decorations)
6. Professional quality like a children's educational book illustration
7. Bright, well-lit scene with soft shadows
8. Show the project being used or displayed in context

CRITICAL RULES:
- ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS anywhere in the image
- No watermarks or logos
- No human faces (can show hands or silhouettes if needed)
- Focus purely on the craft project and its visual beauty

Style: Modern, colorful, clean vector-like illustration with depth and dimension.`;

    // Call Lovable AI Gateway with image generation model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{
          role: "user",
          content: imagePrompt
        }],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('API credits exhausted. Please add credits.');
      }
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    // Extract the generated image (base64)
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || '';

    if (!imageData) {
      console.error('No image generated, response:', JSON.stringify(data));
      throw new Error('No image was generated');
    }

    console.log('Image generated successfully for:', projectName);

    return new Response(JSON.stringify({
      success: true,
      imageUrl: imageData, // This is the base64 data URL
      imageDescription: textResponse,
      message: 'تم إنشاء الصورة التوضيحية بنجاح'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in generate-project-image:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'حدث خطأ أثناء إنشاء الصورة'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
