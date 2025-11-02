import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = "AIzaSyDQlwmyH9zhAOlUmxn9S7Ywae9EpkYaumM";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `أنت خبير في تصحيح الأكواد البرمجية. قم بتحليل الكود التالي واكتشف الأخطاء وصححها.\n\nالكود:\n${code}\n\nأعطني:\n1. الكود المصحح\n2. شرح تفصيلي للأخطاء وكيفية إصلاحها بالعربية\n\nاستخدم هذا التنسيق:\n===FIXED_CODE===\n[الكود المصحح هنا]\n===EXPLANATION===\n[الشرح هنا]`
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      }),
    });

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text;
    
    const parts = result.split('===EXPLANATION===');
    const fixedCode = parts[0].replace('===FIXED_CODE===', '').replace(/```[\w]*\n?/g, '').trim();
    const explanation = parts[1] ? parts[1].trim() : 'تم تصحيح الكود بنجاح';

    return new Response(JSON.stringify({ fixed_code: fixedCode, explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
