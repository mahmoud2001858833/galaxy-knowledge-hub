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

    // Multi-key fallback to avoid 429/quota failures
    const KEY_NAMES = [
      "MEDICAL_AI_KEY",
      "GEMINI_API_KEY_NEW",
      "GEMINI_API_KEY",
      "GOOGLE_AI_API_KEY",
      "JORDANIAN_NEW_AI_KEY_1",
      "JORDANIAN_NEW_AI_KEY_2",
      "JORDANIAN_NEW_AI_KEY_3",
      "JORDANIAN_NEW_AI_KEY_4",
      "JORDANIAN_NEW_AI_KEY_5",
    ];
    const apiKeys = KEY_NAMES
      .map((n) => ({ name: n, key: Deno.env.get(n) }))
      .filter((k) => !!k.key) as { name: string; key: string }[];

    if (apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "لا يوجد أي مفتاح Gemini مُعدّ على الخادم." }),
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

    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: userParts }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    // Try Lovable AI Gateway first (Gemini via gateway), then direct Gemini API.
    let geminiResp: Response | null = null;
    let lastErrText = "";
    let lastStatus = 0;

    // 1) Lovable AI Gateway attempt (uses LOVABLE_API_KEY automatically if available)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      const gatewayModels = ["google/gemini-2.5-flash", "google/gemini-2.5-pro", "google/gemini-2.5-flash-lite"];
      for (const gm of gatewayModels) {
        try {
          // Build OpenAI-compatible message with image (data URL) if present
          const userContent: any[] = [{ type: "text", text: textBlock }];
          if (imageBase64) {
            userContent.push({
              type: "image_url",
              image_url: { url: `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}` },
            });
          }
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: gm,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userContent },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (resp.ok) {
            const j = await resp.json();
            const content: string = j?.choices?.[0]?.message?.content ?? "";
            console.log(`cancer-detection-ai: success via Lovable Gateway ${gm}`);
            // Synthesize a Gemini-shaped response so downstream parsing works
            geminiResp = new Response(
              JSON.stringify({ candidates: [{ content: { parts: [{ text: content }] } }] }),
              { status: 200 }
            );
            break;
          }
          lastStatus = resp.status;
          lastErrText = await resp.text();
          console.warn(`cancer-detection-ai: gateway ${gm} failed (${resp.status})`);
          if (resp.status === 402) break; // out of credits — stop gateway attempts
        } catch (e: any) {
          lastErrText = e instanceof Error ? e.message : String(e);
          console.warn(`cancer-detection-ai: gateway ${gm} threw`, lastErrText);
        }
      }
    }

    // 2) Direct Gemini API fallback with currently-supported models
    const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

    outer: for (const model of MODELS) {
      if (geminiResp) break;
      for (const { name, key } of apiKeys) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        try {
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody,
          });
          if (resp.ok) {
            geminiResp = resp;
            console.log(`cancer-detection-ai: success with ${name} on ${model}`);
            break outer;
          }
          lastStatus = resp.status;
          lastErrText = await resp.text();
          console.warn(`cancer-detection-ai: ${name}/${model} failed (${resp.status})`);
          if (resp.status === 400) break outer; // bad input — won't help to retry
        } catch (e: any) {
          lastErrText = e instanceof Error ? e.message : String(e);
          console.warn(`cancer-detection-ai: ${name}/${model} threw`, lastErrText);
        }
      }
    }

    if (!geminiResp) {
      return new Response(
        JSON.stringify({
          error: "تعذّر تحليل البيانات حالياً. جميع المفاتيح مشغولة. حاول بعد دقائق.",
          details: lastErrText.slice(0, 300),
          status: lastStatus,
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
  } catch (e: any) {
    console.error("cancer-detection-ai error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
