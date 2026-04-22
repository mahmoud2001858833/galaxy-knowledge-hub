// Cancer Detection AI — analyzes a medical image (X-ray, photo) and/or symptoms
// using Google Gemini (MEDICAL_AI_KEY) and returns a structured JSON report.
//
// IMPORTANT: This is an EDUCATIONAL screening tool. It is NOT a medical diagnosis.
// The system prompt and the response always include a strong disclaimer.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت مساعد طبي تعليمي متخصص في فحص أوّلي مبدئي لمؤشرات السرطان (Educational Screening Assistant).
أنت لست طبيباً ولا تشخّص. مهمتك:
1) تحليل الصورة (إن وُجدت): قد تكون أشعة سينية، تصوير مقطعي، صورة جلدية، أو صورة لمنطقة من الجسم.
2) تحليل الأعراض النصية (إن وُجدت).
3) إخراج تقرير منظم تعليمياً يقدّر مستوى الخطر.

⚠️ قواعد صارمة:
- لا تذكر أبداً أن المستخدم "مصاب بالسرطان". استخدم لغة احتمالية فقط.
- إذا الصورة غير طبية أو غير واضحة، اذكر ذلك في image_quality.
- إذا لا توجد بيانات كافية، أعد risk_level: "غير محدد".
- يجب أن تنتهي كل استجابة بتذكير: "هذا تقييم تعليمي وليس تشخيصاً طبياً. راجع طبيباً مختصاً."

أعد JSON فقط بالشكل التالي بالعربية:
{
  "risk_level": "منخفض" | "متوسط" | "عالي" | "غير محدد",
  "risk_score": رقم 0-100,
  "suspected_type": "اسم النوع المحتمل أو 'لا يوجد مؤشر واضح'",
  "confidence": رقم 0-100,
  "image_quality": "جيدة" | "متوسطة" | "ضعيفة" | "لا توجد صورة",
  "key_findings": ["ملاحظة1", "ملاحظة2", ...],
  "matching_symptoms": ["عرض مطابق1", ...],
  "recommendations": ["توصية1", "توصية2", ...],
  "urgency": "روتيني" | "خلال أسابيع" | "خلال أيام" | "عاجل",
  "next_steps": ["فحص مقترح1", "فحص مقترح2", ...],
  "disclaimer": "هذا تقييم تعليمي وليس تشخيصاً طبياً. راجع طبيباً مختصاً."
}`;

interface RequestBody {
  imageBase64?: string;
  imageMimeType?: string;
  symptoms?: string;
  patientAge?: string;
  patientGender?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    const { imageBase64, imageMimeType, symptoms, patientAge, patientGender } = body;

    if (!imageBase64 && !symptoms?.trim()) {
      return new Response(
        JSON.stringify({ error: "يجب إدخال صورة أو وصف للأعراض على الأقل." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const MEDICAL_AI_KEY = Deno.env.get("MEDICAL_AI_KEY");
    if (!MEDICAL_AI_KEY) {
      return new Response(
        JSON.stringify({ error: "MEDICAL_AI_KEY غير مُعدّ على الخادم." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build user content
    const userParts: any[] = [];
    let textBlock = "بيانات المريض:\n";
    if (patientAge) textBlock += `- العمر: ${patientAge}\n`;
    if (patientGender) textBlock += `- الجنس: ${patientGender}\n`;
    if (symptoms?.trim()) {
      textBlock += `\nالأعراض الموصوفة من المستخدم:\n${symptoms.trim()}\n`;
    } else {
      textBlock += "\nلم يُدخل المستخدم أعراضاً مكتوبة.\n";
    }
    textBlock += imageBase64
      ? "\nيرجى تحليل الصورة المرفقة وربطها بالأعراض إن وُجدت."
      : "\nلا توجد صورة. اعتمد على وصف الأعراض فقط.";
    textBlock += "\n\nأعد JSON صالحاً فقط بدون أي نص خارجي.";

    userParts.push({ text: textBlock });
    if (imageBase64) {
      userParts.push({
        inline_data: {
          mime_type: imageMimeType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${MEDICAL_AI_KEY}`;

    const geminiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: userParts }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error("Gemini error:", geminiResp.status, errText);
      return new Response(
        JSON.stringify({
          error: "تعذّر تحليل البيانات حالياً. حاول لاحقاً.",
          details: errText.slice(0, 300),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResp.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: any;
    try {
      // Strip code fences if any
      const clean = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        risk_level: "غير محدد",
        risk_score: 0,
        suspected_type: "تعذّر التحليل",
        confidence: 0,
        image_quality: imageBase64 ? "متوسطة" : "لا توجد صورة",
        key_findings: [],
        matching_symptoms: [],
        recommendations: ["يرجى مراجعة طبيب مختص."],
        urgency: "روتيني",
        next_steps: ["استشارة طبية"],
        disclaimer:
          "هذا تقييم تعليمي وليس تشخيصاً طبياً. راجع طبيباً مختصاً.",
        raw: rawText,
      };
    }

    // Always enforce disclaimer
    parsed.disclaimer =
      "هذا تقييم تعليمي وليس تشخيصاً طبياً. راجع طبيباً مختصاً.";

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cancer-detection-ai error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
