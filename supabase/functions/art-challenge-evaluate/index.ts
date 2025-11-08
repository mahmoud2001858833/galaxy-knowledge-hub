import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageUrl } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the image and convert to base64
    console.log("Fetching image from:", imageUrl);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image");
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Image = btoa(binary);
    
    // Determine mime type from URL or default to jpeg
    const mimeType = imageUrl.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
    console.log("Image fetched and converted to base64, mime type:", mimeType);

    const systemPrompt = `أنت ناقد فني محترف متخصص في تقييم الأعمال الفنية. تم تكليف الطالب برسم أو تصميم: "${prompt}"

قيّم العمل الفني المرفق بناءً على:
1. مدى التزام العمل بالفكرة المطلوبة
2. الإبداع والأصالة في التنفيذ
3. التقنية والجودة الفنية
4. التكوين والتوازن البصري
5. استخدام الألوان والإضاءة

قدم تقييماً شاملاً يتضمن:
- التقييم العام للعمل
- نقاط القوة في العمل
- نقاط يمكن تحسينها
- نصائح محددة للتطوير
- تشجيع وتحفيز للطالب

قدم التقييم بأسلوب تشجيعي وبناء ومفصل.`;

    console.log("Sending request to Google AI with image");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", response.status, errorText);
      throw new Error("Failed to get evaluation from AI");
    }

    const data = await response.json();
    const evaluation = data.candidates?.[0]?.content?.parts?.[0]?.text || "عمل رائع! لقد أبدعت في تنفيذ الفكرة.";

    return new Response(
      JSON.stringify({ evaluation }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in art-challenge-evaluate function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
