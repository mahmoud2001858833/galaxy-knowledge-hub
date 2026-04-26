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
    const { symptoms, image, type } = await req.json();
    
    const MEDICAL_AI_KEY = Deno.env.get('MEDICAL_AI_KEY');
    if (!MEDICAL_AI_KEY) {
      throw new Error('Medical AI key not configured');
    }

    let prompt = '';
    let content: any[] = [];

    if (type === 'symptoms') {
      prompt = `أنت طبيب متخصص في الإسعافات الأولية في المدارس. 
      
المستخدم يصف الأعراض التالية: "${symptoms}"

قدم:
1. التشخيص المحتمل (أو قائمة احتمالات)
2. خطوات الإسعافات الأولية الفورية
3. متى يجب استدعاء الطوارئ
4. نصائح للوقاية

أجب باللغة العربية بشكل واضح ومنظم. كن دقيقاً وعملياً.

تنويه: وضح دائماً أن هذا للإرشاد فقط وليس بديلاً عن الفحص الطبي.`;

      content = [{ type: 'text', text: prompt }];
    } else if (type === 'image' && image) {
      prompt = `أنت طبيب متخصص في الإسعافات الأولية. انظر لهذه الصورة وقدم:

1. وصف ما تراه في الصورة
2. التشخيص المحتمل
3. خطوات الإسعافات الأولية المناسبة
4. متى يجب طلب المساعدة الطبية

أجب باللغة العربية. كن عملياً ودقيقاً.

تنويه: هذا تحليل مبدئي وليس تشخيصاً طبياً نهائياً.`;

      content = [
        { type: 'text', text: prompt },
        { 
          type: 'image_url', 
          image_url: { url: image }
        }
      ];
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'user', 
            content 
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const diagnosis = data.choices?.[0]?.message?.content || 'لم أتمكن من التحليل';

    return new Response(
      JSON.stringify({ diagnosis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in medical-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
