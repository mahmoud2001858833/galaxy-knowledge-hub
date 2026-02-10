import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const apiKey = "AIzaSyABqat_3N9lZNurPyi90pb94e88ihh2oUA";

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [...imageParts, { text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      throw new Error("فشل في تحليل الصور");
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("لم يتم الحصول على نتائج صالحة");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("exam-analyzer error:", e);
    return new Response(JSON.stringify({ error: e.message || "حدث خطأ غير متوقع", questions: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
