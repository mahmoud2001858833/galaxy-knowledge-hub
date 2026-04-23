import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// تجميع HTML + JS بدون استدعاء AI (للسرعة والاستقرار)
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { html, js, analysis } = await req.json();
    if (!html || !js) {
      return new Response(JSON.stringify({ error: "html و js مطلوبان" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scriptTag = `\n<script>\n${js}\n</script>\n`;
    let final = html;
    if (final.includes("</body>")) {
      final = final.replace("</body>", `${scriptTag}</body>`);
    } else {
      final = final + scriptTag;
    }

    // ضمان الـ meta و Cairo و Tailwind
    if (!/cdn\.tailwindcss\.com/.test(final)) {
      final = final.replace("</head>", `<script src="https://cdn.tailwindcss.com"></script></head>`);
    }
    if (!/Cairo/.test(final)) {
      final = final.replace("</head>", `<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet"><style>body{font-family:'Cairo',sans-serif;}</style></head>`);
    }
    if (!/<title>/.test(final)) {
      const title = analysis?.platformName || "منصة ذكية";
      final = final.replace("</head>", `<title>${title}</title></head>`);
    }

    return new Response(JSON.stringify({ html: final }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("assemble fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
