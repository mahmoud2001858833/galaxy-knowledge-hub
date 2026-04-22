// Medical Condition Checker — checks if user's symptoms match a specific condition
// Returns structured JSON: probability, verdict, matched/missing symptoms, advice.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conditionName, knownSymptoms, userSymptoms } = await req.json();

    if (!conditionName || !userSymptoms || typeof userSymptoms !== "string") {
      return new Response(
        JSON.stringify({ error: "conditionName و userSymptoms مطلوبان" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `أنت مساعد طبي متخصص في الفحص الأولي للأعراض. مهمتك تحليل ما إذا كانت أعراض المستخدم تتطابق مع حالة طبية محددة.
- لا تُعطي تشخيصاً نهائياً، أنت أداة فحص أولي تعليمية فقط.
- كن دقيقاً وعملياً وقصيراً في الردود.
- أعد الإجابة دائماً عبر استدعاء الأداة المرفقة فقط، بدون نص خارجها.`;

    const userMsg = `الحالة المراد التحقق منها: "${conditionName}"
الأعراض النموذجية لهذه الحالة:
${(knownSymptoms || []).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

ما يصفه المستخدم عن حالته الآن:
"${userSymptoms}"

حلّل التطابق وأعد النتيجة عبر استدعاء الأداة assess_condition.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "assess_condition",
          description: "تقييم تطابق أعراض المستخدم مع الحالة المحددة",
          parameters: {
            type: "object",
            properties: {
              probability: {
                type: "integer",
                minimum: 0,
                maximum: 100,
                description: "نسبة احتمال إصابة المستخدم بهذه الحالة (0-100)",
              },
              verdict: {
                type: "string",
                enum: ["likely", "possible", "unlikely"],
                description:
                  "likely=مرجّح جداً (>=70%), possible=محتمل (35-69%), unlikely=غير مرجّح (<35%)",
              },
              severity: {
                type: "string",
                enum: ["low", "medium", "high", "emergency"],
                description: "مستوى خطورة الوضع الحالي",
              },
              matched_symptoms: {
                type: "array",
                items: { type: "string" },
                description: "الأعراض التي ذكرها المستخدم وتنطبق على الحالة",
              },
              missing_symptoms: {
                type: "array",
                items: { type: "string" },
                description: "أعراض رئيسية للحالة لم يذكرها المستخدم",
              },
              red_flags: {
                type: "array",
                items: { type: "string" },
                description: "علامات خطر تستدعي التوجه للطوارئ فوراً",
              },
              recommendation: {
                type: "string",
                description: "توصية مختصرة بسطرين كحد أقصى عمّا يجب فعله الآن",
              },
              alternative_conditions: {
                type: "array",
                items: { type: "string" },
                description: "حالات أخرى محتملة قد تفسّر الأعراض",
              },
            },
            required: [
              "probability",
              "verdict",
              "severity",
              "matched_symptoms",
              "missing_symptoms",
              "recommendation",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "assess_condition" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "تم تجاوز الحد، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "نفدت الاعتمادات، أضف رصيداً" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "خطأ من خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "لم يُرجِع النموذج تحليلاً منظماً" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("medical-condition-checker error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
