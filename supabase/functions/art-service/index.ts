// art-service — unified Art group endpoint (replaces 5 functions)
// Actions: ai-assistant | challenge-prompt | challenge-evaluate | drawing-prompt | rate-art
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

async function callAI(body: any) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", ...body }),
  });
  if (r.status === 429) return { _err: json({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }, 429) };
  if (r.status === 402) return { _err: json({ error: "يرجى إضافة رصيد إلى Lovable AI" }, 402) };
  if (!r.ok) {
    console.error("AI gateway error", r.status, await r.text());
    return { _err: json({ error: "AI gateway error" }, 500) };
  }
  const data = await r.json();
  return { text: data?.choices?.[0]?.message?.content ?? "" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const action: string = payload.action;
    if (!action) return json({ error: "missing action" }, 400);

    if (action === "ai-assistant") {
      const { question } = payload;
      if (!question) return json({ error: "missing question" }, 400);
      const sys = `أنت مساعد ذكاء اصطناعي متخصص في الفن والتصميم. أجب عن أسئلة الطلاب حول تاريخ الفن، الحركات الفنية، الفنانين، تقنيات الرسم والتلوين، ونصائح تطوير المهارات. قدّم إجابات تعليمية ممتعة بأمثلة عملية.`;
      const r = await callAI({ messages: [{ role: "system", content: sys }, { role: "user", content: question }], temperature: 0.7, max_tokens: 1024 });
      if ((r as any)._err) return (r as any)._err;
      return json({ answer: r.text || "عذراً، لم أتمكن من الإجابة." });
    }

    if (action === "challenge-prompt") {
      const sys = "أنت مساعد ذكي متخصص في إنشاء أفكار إبداعية للتحديات الفنية. اقترح فكرة واحدة واضحة وملهمة يمكن للطالب رسمها أو تصميمها. قدّم الفكرة فقط في جملة أو جملتين بدون مقدمات.";
      const r = await callAI({ messages: [{ role: "system", content: sys }, { role: "user", content: "أعطني فكرة إبداعية لتحدي فني" }], temperature: 0.9, max_tokens: 200 });
      if ((r as any)._err) return (r as any)._err;
      return json({ prompt: r.text || "ارسم منظراً طبيعياً يعبر عن الهدوء والسكينة" });
    }

    if (action === "drawing-prompt") {
      const sys = `أنت مساعد ذكي لتحديات الرسم. اقترح فكرة واحدة واضحة، مناسبة للمبتدئين والمتوسطين، قابلة للتنفيذ في 30 دقيقة. قدّم الفكرة في جملة أو جملتين فقط بدون مقدمات.`;
      const r = await callAI({ messages: [{ role: "system", content: sys }, { role: "user", content: "اقترح تحدّياً للرسم" }], temperature: 0.9, max_tokens: 200 });
      if ((r as any)._err) return (r as any)._err;
      return json({ prompt: r.text || "ارسم منظراً طبيعياً جميلاً يحتوي على شجرة وجبل" });
    }

    if (action === "challenge-evaluate") {
      const { prompt, imageUrl } = payload;
      if (!imageUrl) return json({ error: "missing imageUrl" }, 400);
      const sys = `أنت ناقد فني محترف. تم تكليف الطالب برسم/تصميم: "${prompt ?? "—"}". قيّم العمل المرفق من حيث الالتزام بالفكرة، الإبداع، التقنية، التكوين، والألوان. قدّم: تقييماً عاماً، نقاط القوة، نقاط للتحسين، نصائح محددة، وتشجيعاً.`;
      const r = await callAI({
        messages: [{ role: "user", content: [{ type: "text", text: sys }, { type: "image_url", image_url: { url: imageUrl } }] }],
        temperature: 0.7, max_tokens: 1024,
      });
      if ((r as any)._err) return (r as any)._err;
      return json({ evaluation: r.text || "عمل رائع! لقد أبدعت في تنفيذ الفكرة." });
    }

    if (action === "rate-art") {
      const { imageUrl, description } = payload;
      if (!imageUrl) return json({ error: "missing imageUrl" }, 400);
      const sys = `أنت ناقد فني ومعلم فنون. ${description ? `وصف الطالب: "${description}"` : ""} قيّم العمل المرفق بشكل مفصل وفق الأقسام:\n**📊 التقييم العام:**\n**✨ نقاط القوة:** (3-4 نقاط)\n**📈 نقاط التحسين:** (2-3 نقاط)\n**💡 نصائح للتطوير:**\n**🎯 التشجيع:**\nاكتب بالعربية بأسلوب بنّاء.`;
      const r = await callAI({
        messages: [{ role: "user", content: [{ type: "text", text: sys }, { type: "image_url", image_url: { url: imageUrl } }] }],
        temperature: 0.7, max_tokens: 1500,
      });
      if ((r as any)._err) return (r as any)._err;
      return json({ evaluation: r.text || "عمل فني رائع! استمر في التطوير والإبداع." });
    }

    return json({ error: `unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error("art-service error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
