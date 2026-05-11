import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { geminiFetch } from "../_shared/gemini-shim.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, lang } = await req.json();
    const apiKey = "shim-key";
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const sys =
      `You are a sustainability advisor for the Damij inclusive education platform. ` +
      `Given a student or family carbon-footprint snapshot, return concise, actionable, ` +
      `school-friendly recommendations. Reply ONLY in language code "${lang || "ar"}". ` +
      `Output JSON: { "summary": string, "score": number (0-100, higher = greener), "tips": [{"title": string, "impact": "low"|"medium"|"high", "detail": string}] }`;

    const resp = await geminiFetch("ai-shim", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(profile) },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "carbon_advice",
              description: "Return carbon advice JSON",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  score: { type: "number" },
                  tips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        impact: { type: "string", enum: ["low", "medium", "high"] },
                        detail: { type: "string" },
                      },
                      required: ["title", "impact", "detail"],
                    },
                  },
                },
                required: ["summary", "score", "tips"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "carbon_advice" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "ai_error", status: resp.status }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: unknown = {};
    try {
      parsed = typeof args === "string" ? JSON.parse(args) : args;
    } catch {
      parsed = { summary: "", score: 0, tips: [] };
    }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("damij-carbon-advisor error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
