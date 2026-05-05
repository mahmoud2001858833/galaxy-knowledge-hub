import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { mode, prompt, context } = await req.json();
    const apiKey = Deno.env.get("BRAILLE_LEARN_GEMINI_KEY");
    if (!apiKey) throw new Error("BRAILLE_LEARN_GEMINI_KEY is not configured");

    let systemPrompt = "أنت مدرس متخصص في تعليم لغة بريل العربية. أجب باللغة العربية، باختصار وبأسلوب تشجيعي مبسّط.";
    let userPrompt = prompt || "";

    if (mode === "explain_lesson") {
      userPrompt = `اشرح بأسلوب بسيط للمتعلم المبتدئ المحتوى التالي من درس بريل: \n\n${context}\n\nاجعل الشرح في 3 إلى 5 جمل قصيرة وبأمثلة عملية.`;
    } else if (mode === "hint") {
      userPrompt = `المتعلم حاول كتابة الحرف "${context?.target}" لكنه أدخل النقاط ${JSON.stringify(context?.attempted)}. النقاط الصحيحة هي ${JSON.stringify(context?.correct)}. أعطه ملاحظة قصيرة ومحفّزة (جملة واحدة) لتصحيح خطأه.`;
    } else if (mode === "test_feedback") {
      userPrompt = `بعد اختبار قراءة بريل، حقق المتعلم: السرعة ${context?.cpm} حرف/دقيقة، الدقة ${context?.accuracy}%، الأخطاء ${context?.errors}. أعطه تقييماً موجزاً (3 جمل) مع نصيحة عملية لتحسين أدائه.`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
          ],
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("gemini error", response.status, t);
      // fallback to Lovable AI Gateway
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (lovableKey) {
        const fb = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });
        const j = await fb.json();
        const text = j.choices?.[0]?.message?.content || "";
        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`gemini ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("braille-tutor-ai error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
