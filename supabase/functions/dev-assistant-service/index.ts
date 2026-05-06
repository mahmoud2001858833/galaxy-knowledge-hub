// dev-assistant-service — unified BTEC + Tech coding endpoint
// Actions: code-fixer | dev-tips | math-to-code | programming-assistant | tech-code-fix | tech-code-gen
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function callAI(messages: any[], opts: { model?: string; temperature?: number } = {}) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-2.5-flash",
      messages,
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    }),
  });
  if (r.status === 429) return { _err: json({ error: "تم تجاوز الحد، حاول لاحقاً" }, 429) };
  if (r.status === 402) return { _err: json({ error: "نفدت الاعتمادات، أضف رصيداً" }, 402) };
  if (!r.ok) {
    console.error("AI gateway error", r.status, await r.text());
    return { _err: json({ error: "خطأ من خدمة الذكاء الاصطناعي" }, 500) };
  }
  const data = await r.json();
  return { text: (data?.choices?.[0]?.message?.content as string) ?? "" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const action: string = payload.action;
    if (!action) return json({ error: "missing action" }, 400);

    if (action === "code-fixer") {
      const { code } = payload;
      if (!code) return json({ error: "Missing code" }, 400);
      const sys = "أنت خبير في تصحيح الأكواد. قدم الناتج بهذا التنسيق فقط:\n===FIXED_CODE===\n[الكود المصحح]\n===EXPLANATION===\n[شرح تفصيلي بالعربية].";
      const r = await callAI([{ role: "system", content: sys }, { role: "user", content: `الكود:\n${code}` }]);
      if ((r as any)._err) return (r as any)._err;
      const text = r.text;
      const parts = text.split("===EXPLANATION===");
      const fixedCode = (parts[0] ?? "").replace("===FIXED_CODE===", "").replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
      const explanation = (parts[1] ?? "تم تصحيح الكود بنجاح").trim();
      return json({ fixed_code: fixedCode, explanation });
    }

    if (action === "dev-tips") {
      const { project_description, project_link, code } = payload;
      const description = [project_description, project_link, code].filter((x) => typeof x === "string" && x.trim()).join("\n\n");
      if (!description) return json({ error: "Missing project description/link/code" }, 400);
      const sys = "أنت مستشار تطوير برمجي. قيّم المشروع وأرجع: تقييم /10، نقاط القوة، فرص التحسين، ونصائح عملية.";
      const r = await callAI([{ role: "system", content: sys }, { role: "user", content: description }]);
      if ((r as any)._err) return (r as any)._err;
      return json({ tips: r.text.trim() || "" });
    }

    if (action === "math-to-code") {
      const { operation, language } = payload;
      if (!operation || !language) return json({ error: "Missing operation or language" }, 400);
      const sys = "أنت محوّل عمليات رياضية إلى كود. أعد فقط الكود النهائي ضمن كتلة Markdown باللغة المناسبة، بلا شرح.";
      const r = await callAI([{ role: "system", content: sys }, { role: "user", content: `حوّل العملية الرياضية التالية إلى كود ${language} فقط:\n${operation}` }]);
      if ((r as any)._err) return (r as any)._err;
      const code = r.text.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
      return json({ code });
    }

    if (action === "programming-assistant") {
      const { prompt } = payload;
      if (!prompt) return json({ error: "Missing prompt" }, 400);
      const sys = "أنت مساعد برمجة ذكي للطلاب. أجب بالعربية بوضوح واستخدم أمثلة كود منظمة داخل كتل ```lang``` عند الحاجة.";
      const r = await callAI([{ role: "system", content: sys }, { role: "user", content: prompt }]);
      if ((r as any)._err) return (r as any)._err;
      return json({ response: r.text.trim() });
    }

    if (action === "tech-code-fix") {
      const { code, language = "javascript", errorMessage = "" } = payload;
      if (!code) return json({ error: "الكود مطلوب" }, 400);
      const sys = `أنت مصحّح أكواد محترف. حلّل الكود بلغة ${language}، حدّد الأخطاء، وأرجع نسخة مصحّحة داخل بلوك \`\`\`${language} ... \`\`\`. ثم اكتب قائمة الأخطاء وحلولها بالعربية.`;
      const userMsg = errorMessage
        ? `الكود:\n\`\`\`${language}\n${code}\n\`\`\`\n\nرسالة الخطأ: ${errorMessage}`
        : `الكود:\n\`\`\`${language}\n${code}\n\`\`\``;
      const r = await callAI([{ role: "system", content: sys }, { role: "user", content: userMsg }]);
      if ((r as any)._err) return (r as any)._err;
      const text = r.text;
      const m = text.match(/```[\w]*\n?([\s\S]*?)```/);
      const fixedCode = m ? m[1].trim() : text;
      const analysis = text.replace(/```[\w]*\n?[\s\S]*?```/, "").trim();
      return json({ fixedCode, analysis, raw: text });
    }

    if (action === "tech-code-gen") {
      const { prompt, language = "javascript", existingCode = "" } = payload;
      if (!prompt) return json({ error: "Prompt مطلوب" }, 400);
      const sys = `أنت مساعد برمجي خبير. ولّد كود ${language} نظيف وموثّق.\nقواعد صارمة:\n1. ابدأ ردك بكتلة \`\`\`${language}\\n...\\n\`\`\`.\n2. الكود كامل قابل للتشغيل (لا "..." ولا "TODO").\n3. بعد الكود، اكتب شرحاً مختصراً (3-6 نقاط).\n4. إن وُجد كود حالي، حسّنه دون كسر ما يعمل.`;
      const userMsg = existingCode
        ? `الكود الحالي:\n\`\`\`${language}\n${existingCode}\n\`\`\`\n\nالمطلوب: ${prompt}`
        : prompt;
      const r = await callAI([{ role: "system", content: sys }, { role: "user", content: userMsg }], { model: "google/gemini-2.5-pro", temperature: 0.3 });
      if ((r as any)._err) return (r as any)._err;
      const text = r.text;
      const m = text.match(/```[\w]*\n?([\s\S]*?)```/);
      const code = m ? m[1].trim() : text;
      const explanation = text.replace(/```[\w]*\n?[\s\S]*?```/, "").trim();
      return json({ code, explanation, raw: text });
    }

    return json({ error: `unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error("dev-assistant-service error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
