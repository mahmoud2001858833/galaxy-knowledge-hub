// AI-powered personalized eco recommendations
// Takes user data and generates targeted, prioritized action plan with quantified savings
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EcoRequest {
  context: "carbon_calculator" | "eco_predict" | "sustainability_index";
  userData: Record<string, any>;
  currentEmissions?: number; // tons CO2 / year
  targetReduction?: number; // percent
  goals?: string[]; // e.g. ["save_money", "reduce_emissions", "health"]
  language?: "ar" | "en";
}

const callGemini = async (apiKey: string, prompt: string, schema: any) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: EcoRequest = await req.json();
    const { context, userData, currentEmissions, targetReduction = 30, goals = [], language = "ar" } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FALLBACK_KEY = Deno.env.get("GEMINI_API_KEY_NEW") || Deno.env.get("GEMINI_API_KEY");

    const langPrompt = language === "ar" ? "أجب بالعربية" : "Answer in English";

    const systemPrompt = `أنت خبير استدامة بيئية. ${langPrompt}.
السياق: ${context}.
بيانات المستخدم: ${JSON.stringify(userData)}.
${currentEmissions ? `الانبعاثات الحالية: ${currentEmissions} طن CO2/سنة.` : ""}
الهدف: تخفيض ${targetReduction}% خلال 12 شهراً.
${goals.length ? `أولويات المستخدم: ${goals.join(", ")}.` : ""}

قدّم خطة عمل مخصّصة دقيقة وقابلة للقياس.`;

    const schema = {
      type: "object",
      properties: {
        executive_summary: { type: "string", description: "ملخص تنفيذي 2-3 جمل" },
        impact_score: { type: "integer", minimum: 0, maximum: 100, description: "تأثير حالة المستخدم على البيئة" },
        priority_areas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              area: { type: "string" },
              current_impact_pct: { type: "number", description: "نسبة هذا المجال من الانبعاثات الكلية" },
              improvement_potential_pct: { type: "number" },
            },
            required: ["area", "current_impact_pct", "improvement_potential_pct"],
          },
        },
        action_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              category: { type: "string", enum: ["energy", "transport", "food", "waste", "water", "consumption", "habits"] },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
              cost: { type: "string", enum: ["free", "low", "medium", "high"] },
              co2_savings_kg_year: { type: "number" },
              money_savings_usd_year: { type: "number" },
              time_to_implement: { type: "string", description: "مثل: فوري، أسبوع، شهر" },
              priority: { type: "integer", minimum: 1, maximum: 5 },
            },
            required: ["title", "description", "category", "difficulty", "cost", "co2_savings_kg_year", "priority"],
          },
        },
        what_if_scenarios: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scenario: { type: "string" },
              co2_change_pct: { type: "number", description: "تغيير سلبي = تخفيض" },
              cost_change_usd: { type: "number" },
              feasibility: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["scenario", "co2_change_pct", "feasibility"],
          },
        },
        sdg_alignment: {
          type: "array",
          items: { type: "string" },
          description: "أهداف التنمية المستدامة المرتبطة (مثل: SDG 7, SDG 13)",
        },
        motivational_message: { type: "string" },
      },
      required: ["executive_summary", "impact_score", "priority_areas", "action_plan", "motivational_message"],
      additionalProperties: false,
    };

    // Try Lovable AI first
    if (LOVABLE_API_KEY) {
      try {
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
              { role: "user", content: "ولّد خطة شخصية بصيغة JSON المطلوبة." },
            ],
            tools: [{
              type: "function",
              function: { name: "generate_eco_plan", description: "خطة بيئية شخصية", parameters: schema },
            }],
            tool_choice: { type: "function", function: { name: "generate_eco_plan" } },
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            return new Response(JSON.stringify({ ...JSON.parse(toolCall.function.arguments), source: "lovable" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else if (resp.status !== 429 && resp.status !== 402) {
          throw new Error(`Lovable AI error ${resp.status}`);
        }
      } catch (e: any) {
        console.log("Lovable AI failed, trying fallback:", e);
      }
    }

    // Fallback to Gemini direct
    if (FALLBACK_KEY) {
      const result = await callGemini(FALLBACK_KEY, systemPrompt, schema);
      return new Response(JSON.stringify({ ...result, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("لا يوجد مفتاح AI متاح");
  } catch (e: any) {
    console.error("eco-ai-recommendations error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
