import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY غير مهيّأ" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try Nano Banana 2 first (better quality), fall back to Nano Banana
    const models = [
      "google/gemini-3.1-flash-image-preview",
      "google/gemini-2.5-flash-image",
    ];

    let imageUrl: string | null = null;
    let lastError = "";

    for (const model of models) {
      try {
        const resp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: prompt }],
              modalities: ["image", "text"],
            }),
          }
        );

        if (!resp.ok) {
          const t = await resp.text();
          lastError = `${model} → ${resp.status}: ${t.slice(0, 200)}`;
          console.error(lastError);
          if (resp.status === 429) {
            return new Response(
              JSON.stringify({
                error: "تم تجاوز حد الاستخدام، حاول لاحقاً",
              }),
              {
                status: 429,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          if (resp.status === 402) {
            return new Response(
              JSON.stringify({
                error: "نفدت اعتمادات الذكاء الاصطناعي",
              }),
              {
                status: 402,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          continue;
        }

        const data = await resp.json();
        imageUrl =
          data?.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
        if (imageUrl) break;
      } catch (e) {
        lastError = `${model} threw: ${e instanceof Error ? e.message : "unknown"}`;
        console.error(lastError);
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: "تعذّر توليد الصورة من جميع النماذج",
          details: lastError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-city-image-gen error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
