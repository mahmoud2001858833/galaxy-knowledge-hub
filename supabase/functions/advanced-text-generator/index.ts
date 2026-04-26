
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
    const { topic, description, style, difficulty, wordCount, language } = await req.json();
    
    console.log('Text generation request:', { topic, style, difficulty, wordCount, language });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Build style prompt based on requirements
    let stylePrompt = "";
    switch (style) {
      case 'poetic':
        stylePrompt = "Use a poetic style with metaphors and similes";
        break;
      case 'exaggerated':
        stylePrompt = "Use an exaggerated and dramatic style with powerful words";
        break;
      case 'advanced':
        stylePrompt = "Use advanced academic style with complex vocabulary";
        break;
      case 'simple':
        stylePrompt = "Use simple and clear style with easy words";
        break;
      case 'formal':
        stylePrompt = "Use formal and professional style";
        break;
      case 'narrative':
        stylePrompt = "Use engaging narrative style";
        break;
      default:
        stylePrompt = "Use clear and appropriate style";
    }

    let difficultyPrompt = "";
    switch (difficulty) {
      case 'easy':
        difficultyPrompt = "Easy level with simple vocabulary and short sentences";
        break;
      case 'medium':
        difficultyPrompt = "Medium level with varied vocabulary and sentence structures";
        break;
      case 'hard':
        difficultyPrompt = "Advanced level with complex vocabulary and intricate structures";
        break;
      default:
        difficultyPrompt = "Medium level";
    }

    const englishPrompt = `Write a comprehensive English text about "${topic}".

${description ? `Topic details: ${description}` : ''}

Requirements:
- Style: ${stylePrompt}
- Difficulty: ${difficultyPrompt}
- Word count: approximately ${wordCount} words
- Create an engaging, well-structured text that covers the topic thoroughly
- Use proper grammar and punctuation

Please write only the English text, no explanations or headers.`;

    // Use Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert English text writer. Write high-quality, engaging content based on the given requirements." },
          { role: "user", content: englishPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    let generatedText = data.choices?.[0]?.message?.content || '';
    
    if (!generatedText) {
      throw new Error('No text generated');
    }
    
    // Clean up the text
    generatedText = generatedText.trim();
    
    // If translation to Arabic is requested, translate
    let arabicTranslation = '';
    if (language === 'both') {
      const translationPrompt = `Translate the following English text to Arabic. Maintain the same style and tone. Provide only the Arabic translation, no explanations:

"${generatedText}"`;

      const translationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert translator from English to Arabic. Provide accurate and natural translations." },
            { role: "user", content: translationPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        })
      });

      if (translationResponse.ok) {
        const translationData = await translationResponse.json();
        arabicTranslation = translationData.choices?.[0]?.message?.content?.trim() || '';
      }
    }

    console.log('Text generation completed, length:', generatedText.length);

    return new Response(
      JSON.stringify({
        englishText: generatedText,
        arabicTranslation: arabicTranslation,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in text generator function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        englishText: '',
        arabicTranslation: '',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
