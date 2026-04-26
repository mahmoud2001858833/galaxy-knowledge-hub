import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, essayType } = await req.json()
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const essayTypeEnglish = {
      essay: 'Essay',
      story: 'Story',
      descriptive: 'Descriptive',
      argumentative: 'Argumentative',
      narrative: 'Narrative'
    }[essayType] || essayType;
    
    const prompt = `You are a professional language and literary corrector specialized in English. Perform a complete and comprehensive correction of the following text.

Text:
"${text}"

Essay Type: ${essayTypeEnglish}

Required:

**📊 Overall Score:**
[Write here a comprehensive essay evaluation out of 100 with a general note]

**1️⃣ Spelling Correction:**
- [List spelling errors with corrections]
- [Explanation of spelling rules]

**2️⃣ Grammar Correction:**
- [List grammatical errors with corrections]
- [Explanation of applied grammar rules]

**3️⃣ Essay Type Consistency:**
- [Evaluation of consistency with essay type]
- [Strengths and weaknesses]
- [Specific suggestions for improvement]

**4️⃣ Final Corrected Text:**
[Write the text after complete correction]

---
Please ensure the correction is accurate, detailed, and comprehensive covering all aspects of English writing.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }]
        })
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Please add credits to Lovable AI' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from AI API')
    }
    
    const correction = data.choices[0].message.content

    return new Response(
      JSON.stringify({ correction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing the request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})