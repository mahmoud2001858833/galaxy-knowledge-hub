
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
    const { prompt, subject, useGemini = false } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (useGemini) {
      // Use Gemini API with environment variable
      const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
      if (!GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Prepare the prompt based on the subject with enhanced instructions
      let fullPrompt = prompt;
      if (subject) {
        switch (subject) {
          case 'math':
            fullPrompt = `كمساعد للرياضيات متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة. استخدم أمثلة وشروحات بسيطة. قدم الحلول خطوة بخطوة مع شرح المفاهيم الرياضية ذات الصلة: ${prompt}`;
            break;
          case 'chemistry':
            fullPrompt = `كمساعد للكيمياء متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة. قدم معلومات دقيقة عن العناصر والتفاعلات والمركبات الكيميائية. استخدم أمثلة محددة وشروحات مبسطة مع رسم المعادلات الكيميائية إذا لزم الأمر. قدم المعرفة الأكثر تطوراً في مجال الكيمياء عن: ${prompt}`;
            break;
          case 'physics':
            fullPrompt = `كمساعد للفيزياء متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة مع الأخذ في الاعتبار أن المستخدم قد يكون طالباً في المدرسة أو الجامعة. استخدم أمثلة وشروحات بسيطة مع توضيح القوانين والمعادلات الفيزيائية ذات الصلة. اكتب المعادلات الفيزيائية بشكل واضح ودقيق، وقم بتوضيح معنى الرموز المستخدمة. اشرح التطبيقات العملية للمفاهيم الفيزيائية في حياتنا اليومية. السؤال هو: ${prompt}`;
            break;
          case 'biology':
            fullPrompt = `كمساعد للأحياء متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة مع الأخذ في الاعتبار أن المستخدم قد يكون طالباً في المدرسة أو الجامعة. استخدم أمثلة وشروحات بسيطة مع توضيح العمليات الحيوية والتكوينات والوظائف بطريقة مبسطة. اشرح العلاقات بين مختلف الأنظمة البيولوجية وكيف تعمل معاً. قدم معلومات دقيقة وحديثة في مجال الأحياء. السؤال هو: ${prompt}`;
            break;
          default:
            fullPrompt = `كمساعد علمي متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة. استخدم أمثلة وشروحات بسيطة: ${prompt}`;
        }
      }

      // Call Gemini API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      const data = await response.json();
      
      console.log('Gemini API Response:', JSON.stringify(data));
      
      if (data.error) {
        return new Response(
          JSON.stringify({ error: data.error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Extract the text from the response
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لا يوجد رد من المساعد الذكي';

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Use environment variable for API key
      const API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
      
      if (!API_KEY) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Prepare the prompt based on the subject with enhanced instructions
      let fullPrompt = prompt;
      if (subject) {
        switch (subject) {
          case 'math':
            fullPrompt = `كمساعد للرياضيات متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة. استخدم أمثلة وشروحات بسيطة. قدم الحلول خطوة بخطوة مع شرح المفاهيم الرياضية ذات الصلة: ${prompt}`;
            break;
          case 'chemistry':
            fullPrompt = `كمساعد للكيمياء متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة. قدم معلومات دقيقة عن العناصر والتفاعلات والمركبات الكيميائية. استخدم أمثلة محددة وشروحات مبسطة مع رسم المعادلات الكيميائية إذا لزم الأمر. قدم المعرفة الأكثر تطوراً في مجال الكيمياء عن: ${prompt}`;
            break;
          case 'physics':
            fullPrompt = `كمساعد للفيزياء متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة مع الأخذ في الاعتبار أن المستخدم قد يكون طالباً في المدرسة أو الجامعة. استخدم أمثلة وشروحات بسيطة مع توضيح القوانين والمعادلات الفيزيائية ذات الصلة. اكتب المعادلات الفيزيائية بشكل واضح ودقيق، وقم بتوضيح معنى الرموز المستخدمة. اشرح التطبيقات العملية للمفاهيم الفيزيائية في حياتنا اليومية. السؤال هو: ${prompt}`;
            break;
          case 'biology':
            fullPrompt = `كمساعد للأحياء متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة مع الأخذ في الاعتبار أن المستخدم قد يكون طالباً في المدرسة أو الجامعة. استخدم أمثلة وشروحات بسيطة مع توضيح العمليات الحيوية والتكوينات والوظائف بطريقة مبسطة. اشرح العلاقات بين مختلف الأنظمة البيولوجية وكيف تعمل معاً. قدم معلومات دقيقة وحديثة في مجال الأحياء. السؤال هو: ${prompt}`;
            break;
          default:
            fullPrompt = `كمساعد علمي متخصص ومتقدم، قم بالإجابة على السؤال التالي بطريقة تعليمية واضحة ومفصلة. استخدم أمثلة وشروحات بسيطة: ${prompt}`;
        }
      }

      // For biology specifically, try to use gemini-2.0-flash model
      if (subject === 'biology') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        const data = await response.json();
        
        if (!data.error) {
          const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لا يوجد رد من المساعد الذكي';
          
          return new Response(
            JSON.stringify({ result }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // If there's an error, fall back to the standard approach below
      }

      // Use Gemini API for other subjects - with enhanced model and configuration
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
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
              maxOutputTokens: 2048,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH"
              }
            ]
          }),
        }
      );

      const data = await response.json();
      
      console.log('AI API Response:', JSON.stringify(data));
      
      if (data.error) {
        return new Response(
          JSON.stringify({ error: data.error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Extract the text from the response
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لا يوجد رد من المساعد الذكي';

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error processing request:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: `Error processing request: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
