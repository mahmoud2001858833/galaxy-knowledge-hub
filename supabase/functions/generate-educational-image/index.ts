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
    const { prompt, subject, grade } = await req.json();
    
    console.log('Generating educational image with Lovable AI');
    console.log('Prompt:', prompt);
    console.log('Subject:', subject, 'Grade:', grade);
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create detailed educational prompt without text on image
    const educationalPrompt = `Create a high-quality educational illustration: ${prompt}

Subject: ${subject}
Grade: ${grade}

Image Requirements:
- Clear, simple, and suitable for students
- Educational and informative
- Colorful, attractive, and easy to understand
- Professional illustration
- NO TEXT, NO LABELS, NO WORDS on the image
- ONLY pure visual representation

IMPORTANT: Generate ONLY the visual image without any text or writing on it. The image should speak for itself visually.`;

    // Generate educational image using Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: educationalPrompt
        }],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Failed to generate image: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');
    
    // Extract base64 image from response
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url || '';
    
    if (!imageBase64) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ imageBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating educational image:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate image' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});