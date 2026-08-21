import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { geminiFetch } from "../_shared/gemini-shim.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BASE_PERSONA = `أنت "مرشد التجارب الذكي" داخل منصة ذروة العلم — مساعد يراقب طالباً وهو يجري تجربة علمية تفاعلية ثلاثية الأبعاد.
تتكلم بالعربية الفصحى المبسّطة، بنبرة مشجّعة وودّية، وتخاطب الطالب مباشرة.
مهمتك التدخّل اللحظي: إن أخطأ الطالب أو ضبط قيمة غير منطقية أو توقف عن التفاعل، وجّهه بخطوة عملية محدّدة ("جرّب أن ترفع الزاوية إلى 45°") لا بكلام عام.
ممنوع إعطاء الإجابة النهائية للتحدي مباشرة؛ وجّه بدل ذلك.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode: string = body.mode || "coach";
    const sim = body.sim || {};
    const state = body.state || {};
    const events = Array.isArray(body.events) ? body.events.slice(-25) : [];
    const trigger = body.trigger || {};

    let userPrompt = "";
    let schemaHint = "";

    if (mode === "report") {
      userPrompt = `الطالب أنهى جلسة في تجربة "${sim.title || sim.id}".
مدة الجلسة: ${body.durationSeconds ?? 0} ثانية.
عدد التفاعلات: ${body.eventsCount ?? events.length}، عدد الأخطاء: ${body.mistakes ?? 0}، عدد التلميحات: ${body.hints ?? 0}.
أهداف التجربة: ${(sim.objectives || []).join(" | ")}
آخر حالة للتجربة: ${JSON.stringify(state)}
سجل التفاعل: ${JSON.stringify(events)}

اكتب تقريراً موجزاً لأداء الطالب.`;
      schemaHint = `أعد JSON فقط بهذا الشكل:
{"summary":"فقرة من 3-4 جمل عن أداء الطالب","strengths":["نقطة قوة","..."],"gaps":["فجوة أو مفهوم يحتاج مراجعة","..."],"nextSteps":["خطوة عملية تالية","..."],"score":0-100}`;
    } else {
      userPrompt = `التجربة: "${sim.title || sim.id}" — ${sim.description || ""}
أهداف التعلّم: ${(sim.objectives || []).join(" | ")}
قواعد صحّة القيم والأخطاء الشائعة: ${(sim.rules || []).join(" | ")}
الحالة الحالية للمتغيّرات والقراءات: ${JSON.stringify(state)}
سبب استدعائك الآن: ${JSON.stringify(trigger)}
آخر تفاعلات الطالب بالترتيب: ${JSON.stringify(events)}

حلّل ما يفعله الطالب وأعطه ملاحظة واحدة قصيرة الآن.`;
      schemaHint = `أعد JSON فقط بهذا الشكل:
{"message":"جملة أو جملتان بحد أقصى 220 حرفاً، موجّهة للطالب","tone":"praise|hint|warning|error","focus":"اسم المتغيّر أو العنصر الذي يجب أن ينتبه له أو null","action":"إجراء عملي مقترح بكلمات قليلة أو null"}`;
    }

    const res = await geminiFetch("ai-shim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        messages: [
          { role: "system", content: `${BASE_PERSONA}\n\n${schemaHint}\nلا تكتب أي نص خارج كائن JSON.` },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("sim-ai-coach gemini error", res.status, t);
      return json({ error: "تعذّر الاتصال بالمرشد الذكي" }, res.status === 429 ? 429 : 502);
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: any = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      parsed = mode === "report"
        ? { summary: cleaned.slice(0, 800), strengths: [], gaps: [], nextSteps: [], score: null }
        : { message: cleaned.slice(0, 220), tone: "hint", focus: null, action: null };
    }

    return json(parsed);
  } catch (e) {
    console.error("sim-ai-coach error", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
