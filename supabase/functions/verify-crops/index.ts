// verify-crops: يفحص الأشكال بعد قصّها (صور صغيرة) للتأكد أنها كاملة ونظيفة وتطابق وصفها.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJson, corsHeaders, jsonResponse, requireUser } from "../_shared/exam-common.ts";

const SCHEMA = {
  type: "OBJECT",
  properties: {
    results: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" }, complete: { type: "BOOLEAN" }, clean: { type: "BOOLEAN" }, matches: { type: "BOOLEAN" }, reason: { type: "STRING" },
          tight_box: { type: "ARRAY", items: { type: "INTEGER" } },
        },
        required: ["id", "complete", "clean", "matches"],
      },
    },
  },
  required: ["results"],
};

const SYSTEM = `أنت مدقق صور علمية. تُعرض عليك صور مقصوصة من كتاب، كل صورة بمعرّفها والوصف المتوقع لها. لكل صورة قرّر:
- complete: هل الشكل كامل؟ false إن قُطع أي جزء منه أو من تسمياته أو محوره من أي جهة.
- clean: هل الصورة خالية من نص فقرات مجاورة أو من شكل آخر غير مرتبط؟ تجاهل الشظايا الصغيرة جداً عند الحواف؛ false فقط إن دخل في الصورة نص أو شكل غريب ملحوظ.
- matches: هل المحتوى يطابق الوصف المتوقع؟
- tight_box: [ymin, xmin, ymax, xmax] بإحداثيات 0..1000 نسبةً إلى هذه الصورة، تحيط بالشكل نفسه فقط (الرسم مع تسمياته الداخلية) بدقة وبلا هوامش ولا فقرات مجاورة، وتستبعد عنوان الشكل المكتوب أسفله أو أعلاه (مثل «الشكل 1: ...» أو «Figure 1»). إن كانت الصورة أصلاً مقصوصة بإحكام فأعد [0,0,1000,1000].
reason: سبب مختصر بالعربية عند أي false.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const userId = await requireUser(req);
    if (!userId) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0 || items.length > 24) return jsonResponse({ error: "عدد الصور غير صالح" }, 400);
    let bytes = 0;
    const parts: any[] = [];
    for (const it of items) {
      if (!it || typeof it.id !== "string" || typeof it.base64 !== "string") return jsonResponse({ error: "بيانات صورة غير صالحة" }, 400);
      bytes += Math.floor(it.base64.length * 0.75);
      parts.push({ text: `[معرّف: ${it.id}] الوصف المتوقع: ${String(it.caption ?? "").slice(0, 300)}` });
      parts.push({ inlineData: { mimeType: "image/jpeg", data: it.base64.replace(/^data:[^;]+;base64,/, "") } });
    }
    if (bytes > 10 * 1024 * 1024) return jsonResponse({ error: "حجم الصور كبير" }, 413);

    const v = await callGeminiJson({
      system: SYSTEM, parts: [...parts, { text: "افحص كل صورة الآن." }], schema: SCHEMA, temperature: 0, maxTokens: 4000, thinking: 512,
    });
    const byId = new Map<string, any>((v.results ?? []).map((r: any) => [String(r.id), r]));
    return jsonResponse({
      results: items.map((it: any) => {
        const r = byId.get(it.id);
        // غياب الحكم عن صورة = لا نثق بها
        const ok = !!r && r.complete !== false && r.clean !== false && r.matches !== false;
        const tb = Array.isArray(r?.tight_box) && r.tight_box.length === 4 ? r.tight_box.map((n: any) => Math.max(0, Math.min(1000, Math.round(Number(n))))) : null;
        return {
          id: it.id, ok, complete: !!r && r.complete !== false, matches: !r || r.matches !== false,
          tight: tb && tb[2] > tb[0] && tb[3] > tb[1] ? tb : null, reason: r ? String(r.reason ?? "") : "لم يُفحص",
        };
      }),
    });
  } catch (e: any) {
    console.error("verify-crops error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ أثناء فحص الأشكال" }, 500);
  }
});
