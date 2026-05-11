// Medical Condition Checker — Advanced contextual analysis
// Accepts richer inputs: age, sex, duration, severity, chronic conditions, medications, additional symptoms
// Returns structured JSON: probability, verdict, severity, matched/missing symptoms, red flags, recommendations, differential diagnosis
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { geminiFetch } from "../_shared/gemini-shim.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckRequest {
  conditionName: string;
  knownSymptoms?: string[];
  userSymptoms: string;
  // New optional contextual fields
  age?: number | string;
  sex?: "male" | "female" | "other" | "";
  durationHours?: number | string;
  painLevel?: number; // 0-10
  temperature?: number; // Celsius
  chronicConditions?: string[];
  medications?: string;
  additionalContext?: string;
}

const callGateway = async (apiKey: string, body: object) => {
  return await geminiFetch("ai-shim", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

// Direct call to Google AI Studio as a fallback when Lovable AI is rate-limited / out of credits
const callGeminiDirect = async (apiKey: string, prompt: string, schema: any) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3,
      },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gemini direct error ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: CheckRequest = await req.json();
    const {
      conditionName,
      knownSymptoms = [],
      userSymptoms,
      age,
      sex,
      durationHours,
      painLevel,
      temperature,
      chronicConditions = [],
      medications,
      additionalContext,
    } = body;

    if (!conditionName || !userSymptoms || typeof userSymptoms !== "string") {
      return new Response(
        JSON.stringify({ error: "conditionName و userSymptoms مطلوبان" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = "shim-key";
    const FALLBACK_KEY = Deno.env.get("GEMINI_API_KEY_NEW") || Deno.env.get("GEMINI_API_KEY");

    if (!LOVABLE_API_KEY && !FALLBACK_KEY) throw new Error("لا يوجد مفتاح AI متاح");

    const systemPrompt = `أنت مساعد طبي متقدم متخصص في الفحص الأولي. مهمتك تحليل ما إذا كانت أعراض المستخدم تتطابق مع حالة طبية محددة، مع مراعاة السياق الكامل (العمر، الجنس، المدة، الشدة، الحالات المزمنة، الأدوية).
- لست بديلاً عن الطبيب، بل أداة فحص تعليمية أولية.
- كن دقيقاً، عملياً، وقصير الردود.
- اعتمد فقط على الأعراض الفعلية المُذكورة، لا تخمّن.
- إذا وُجدت علامات خطر (red flags) ضعها بوضوح.
- أعد الإجابة دائماً بتنسيق JSON المطلوب.`;

    const contextLines: string[] = [];
    if (age) contextLines.push(`العمر: ${age} سنة`);
    if (sex) contextLines.push(`الجنس: ${sex === "male" ? "ذكر" : sex === "female" ? "أنثى" : "آخر"}`);
    if (durationHours) contextLines.push(`مدة الأعراض: ${durationHours} ساعة`);
    if (painLevel !== undefined && painLevel !== null) contextLines.push(`مستوى الألم: ${painLevel}/10`);
    if (temperature) contextLines.push(`الحرارة: ${temperature}°C`);
    if (chronicConditions.length) contextLines.push(`حالات مزمنة: ${chronicConditions.join(", ")}`);
    if (medications) contextLines.push(`الأدوية الحالية: ${medications}`);
    if (additionalContext) contextLines.push(`ملاحظات إضافية: ${additionalContext}`);

    const userMsg = `الحالة المراد التحقق منها: "${conditionName}"

الأعراض النموذجية لهذه الحالة:
${knownSymptoms.map((s, i) => `${i + 1}. ${s}`).join("\n")}

ما يصفه المستخدم عن أعراضه الآن:
"${userSymptoms}"

${contextLines.length ? `السياق الإضافي:\n${contextLines.join("\n")}` : ""}

حلّل التطابق بدقة مع مراعاة كل المعطيات أعلاه.`;

    const schema = {
      type: "object",
      properties: {
        probability: { type: "integer", minimum: 0, maximum: 100 },
        verdict: { type: "string", enum: ["likely", "possible", "unlikely"] },
        severity: { type: "string", enum: ["low", "medium", "high", "emergency"] },
        confidence_score: { type: "integer", minimum: 0, maximum: 100, description: "ثقة التحليل بناءً على اكتمال المعلومات" },
        matched_symptoms: { type: "array", items: { type: "string" } },
        missing_symptoms: { type: "array", items: { type: "string" } },
        red_flags: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" },
        immediate_actions: { type: "array", items: { type: "string" }, description: "خطوات فورية محددة" },
        when_to_see_doctor: { type: "string", description: "متى يجب مراجعة الطبيب" },
        alternative_conditions: { type: "array", items: { type: "string" } },
        risk_factors: { type: "array", items: { type: "string" }, description: "عوامل خطر متعلقة بالمستخدم" },
        ai_summary: { type: "string", description: "خلاصة تنفيذية في 2-3 جمل" },
      },
      required: [
        "probability", "verdict", "severity", "confidence_score",
        "matched_symptoms", "missing_symptoms", "recommendation",
        "immediate_actions", "when_to_see_doctor", "ai_summary",
      ],
      additionalProperties: false,
    };

    // Try Lovable AI Gateway first
    if (LOVABLE_API_KEY) {
      const tools = [{
        type: "function",
        function: {
          name: "assess_condition",
          description: "تقييم تطابق أعراض المستخدم مع الحالة",
          parameters: schema,
        },
      }];

      const resp = await callGateway(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "assess_condition" } },
      });

      if (resp.ok) {
        const data = await resp.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const args = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({ ...args, source: "lovable" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if ((resp.status === 429 || resp.status === 402) && FALLBACK_KEY) {
        console.log("Lovable AI exhausted, falling back to Gemini direct");
        // fall through to fallback
      } else if (!FALLBACK_KEY) {
        if (resp.status === 429)
          return new Response(JSON.stringify({ error: "تم تجاوز الحد، حاول لاحقاً" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        if (resp.status === 402)
          return new Response(JSON.stringify({ error: "نفدت الاعتمادات" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        const t = await resp.text();
        console.error("AI error", resp.status, t);
        return new Response(JSON.stringify({ error: "خطأ من خدمة الذكاء الاصطناعي" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback to direct Gemini
    if (FALLBACK_KEY) {
      const fullPrompt = `${systemPrompt}\n\n${userMsg}`;
      const result = await callGeminiDirect(FALLBACK_KEY, fullPrompt, schema);
      return new Response(JSON.stringify({ ...result, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "تعذّر التحليل" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("medical-condition-checker error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
