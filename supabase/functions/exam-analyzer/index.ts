import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_KEY = "AIzaSyABqat_3N9lZNurPyi90pb94e88ihh2oUA";
const GEMINI_MODEL = "gemini-2.0-flash";

async function callGemini(images: string[], retryCount = 0): Promise<any> {
  const imageParts = images.map((base64: string) => ({
    inline_data: { mime_type: "image/jpeg", data: base64 },
  }));

  const prompt = `أنت معلم خبير. حلل صور الامتحان التالية واستخرج جميع الأسئلة الموجودة فيها.

لكل سؤال قدم:
1. نص السؤال كاملاً
2. الخيارات إن وجدت (كمصفوفة)
3. الإجابة الصحيحة
4. شرح مفصل وعلمي لسبب صحة هذه الإجابة

أجب بصيغة JSON فقط بهذا الشكل:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
      "answer": "الإجابة الصحيحة",
      "explanation": "شرح مفصل لماذا هذه الإجابة صحيحة..."
    }
  ]
}

إذا لم تكن هناك خيارات، اترك options كمصفوفة فارغة وقدم الإجابة المباشرة.
أجب بالعربية دائماً. أرجع JSON فقط بدون أي نص إضافي.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [...imageParts, { text: prompt }] }],
        generationConfig: { 
          temperature: 0.2, 
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Gemini API error (attempt ${retryCount + 1}):`, response.status, errText);
    
    // Retry up to 2 times on server errors
    if (retryCount < 2 && (response.status >= 500 || response.status === 429)) {
      const delay = (retryCount + 1) * 2000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return callGemini(images, retryCount + 1);
    }
    
    throw new Error("فشل في الاتصال بالذكاء الاصطناعي. حاول مرة أخرى.");
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  if (!text) {
    console.error("Empty response from Gemini:", JSON.stringify(result));
    throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
  }

  return text;
}

function parseResponse(text: string): any {
  // Try direct parse first (responseMimeType should give clean JSON)
  try {
    const parsed = JSON.parse(text);
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
  } catch {}

  // Extract JSON block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("لم يتم الحصول على نتائج صالحة من التحليل");
  }

  let jsonStr = jsonMatch[0];
  // Fix trailing commas
  jsonStr = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
  // Fix unescaped newlines inside strings
  jsonStr = jsonStr.replace(/\n/g, '\\n');
  // Fix unescaped quotes inside strings (common AI mistake)
  jsonStr = jsonStr.replace(/(?<=:\s*"[^"]*)"(?=[^"]*"[,}\]])/g, '\\"');
  
  try {
    return JSON.parse(jsonStr);
  } catch (parseErr) {
    console.error("JSON parse failed:", parseErr, "Raw:", jsonStr.substring(0, 500));
    
    // Last resort: extract questions array
    const questionsMatch = jsonStr.match(/"questions"\s*:\s*\[([\s\S]*)\]/);
    if (questionsMatch) {
      try {
        const rawQuestions = '[' + questionsMatch[1] + ']';
        const cleaned = rawQuestions.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}').replace(/\n/g, '\\n');
        const questions = JSON.parse(cleaned);
        return { questions };
      } catch {}
    }
    
    throw new Error("فشل في تحليل نتائج الذكاء الاصطناعي. حاول تصوير الورقة بشكل أوضح.");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "يرجى إرسال صورة واحدة على الأقل" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analyzing ${images.length} images, sizes: ${images.map((i: string) => Math.round(i.length / 1024) + 'KB').join(', ')}`);

    const text = await callGemini(images);
    const parsed = parseResponse(text);

    console.log(`Successfully extracted ${parsed.questions?.length || 0} questions`);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("exam-analyzer error:", e);
    return new Response(JSON.stringify({ 
      error: e.message || "حدث خطأ غير متوقع",
      questions: [] 
    }), {
      status: 200, // Return 200 so supabase client doesn't treat it as network error
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
