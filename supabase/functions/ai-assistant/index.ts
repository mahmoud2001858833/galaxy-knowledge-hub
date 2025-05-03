
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, subject } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const API_KEY = Deno.env.get('GOOGLE_API_KEY')
    
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Prepare the prompt based on the subject
    let fullPrompt = prompt
    if (subject) {
      switch (subject) {
        case 'math':
          fullPrompt = `كمساعد للرياضيات، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة: ${prompt}`
          break
        case 'chemistry':
          fullPrompt = `كمساعد للكيمياء، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة: ${prompt}`
          break
        case 'physics':
          fullPrompt = `كمساعد للفيزياء، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة: ${prompt}`
          break
        case 'biology':
          fullPrompt = `كمساعد للأحياء، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة: ${prompt}`
          break
        default:
          fullPrompt = `كمساعد علمي، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة: ${prompt}`
      }
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        }),
      }
    )

    const data = await response.json()
    
    console.log('AI API Response:', JSON.stringify(data))
    
    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Extract the text from the response
    const result = data.candidates[0]?.content?.parts[0]?.text || 'لا يوجد رد من المساعد الذكي'

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error.message)
    
    return new Response(
      JSON.stringify({ error: `Error processing request: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
