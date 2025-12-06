import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = "AIzaSyBMqKjLqlQGEFQNok0_Cf9uOQqhzb0FAnA";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectName, projectIdea, projectMaterials } = await req.json();

    if (!projectName || !projectIdea) {
      throw new Error('Missing project details');
    }

    console.log('Generating image for project:', projectName);

    // Create a detailed prompt for image generation
    const imagePrompt = `Create a clean, professional illustration showing a recycling craft project.
    
Project: ${projectName}
Concept: ${projectIdea}
Materials: ${projectMaterials || 'recycled materials'}

Requirements:
- NO TEXT, NO WORDS, NO LETTERS in the image
- Clean, educational illustration style
- Show the finished project clearly
- Use bright, eco-friendly colors (greens, blues, earth tones)
- Simple, clear composition
- Suitable for educational purposes
- Show recycled materials being transformed into something useful
- Professional quality, like an educational poster`;

    // Use Gemini to generate image (via Imagen integration)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert at describing images for recycling projects. Create a detailed visual description of what an illustration of this recycling project would look like:

Project Name: ${projectName}
Project Idea: ${projectIdea}
Materials: ${projectMaterials || 'recycled materials'}

Describe the image in detail, including:
1. The main elements and composition
2. Colors and visual style
3. How the recycled materials are shown
4. The finished product appearance
5. Any decorative elements

Remember: The image should have NO TEXT whatsoever.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI Error:', errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Since direct image generation may not be available, we'll create a placeholder
    // that describes what the image should look like
    // In a real implementation, you would use DALL-E, Imagen, or another image generation API

    return new Response(JSON.stringify({
      success: true,
      imageDescription,
      // Placeholder image using a recycling-themed placeholder
      imageUrl: `https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop&q=80`,
      message: 'تم إنشاء وصف الصورة بنجاح'
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
