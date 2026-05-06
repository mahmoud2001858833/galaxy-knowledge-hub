// Reverse Sensory Bridge — accepts any educational content (text/image/audio/video)
// and returns a multi-sensory representation tailored to the user's sensory profile.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ARABIC_BRAILLE: Record<string, string> = {
  "ا":"⠁","ب":"⠃","ت":"⠞","ث":"⠹","ج":"⠚","ح":"⠱","خ":"⠭","د":"⠙","ذ":"⠮",
  "ر":"⠗","ز":"⠵","س":"⠎","ش":"⠩","ص":"⠯","ض":"⠫","ط":"⠾","ظ":"⠰","ع":"⠷",
  "غ":"⠣","ف":"⠋","ق":"⠟","ك":"⠅","ل":"⠇","م":"⠍","ن":"⠝","ه":"⠓","و":"⠺",
  "ي":"⠽","ى":"⠽","ئ":"⠯","ؤ":"⠳","ء":"⠡","إ":"⠷","أ":"⠷","آ":"⠰⠁","ة":"⠡",
  " ":" ","\n":"\n",
};
const toBraille = (t: string) => [...t].map(c => ARABIC_BRAILLE[c] ?? c).join("");

// Vibration pattern: long pulse for sentence end, short for word, micro for char
function vibrationPattern(text: string): number[] {
  const pat: number[] = [];
  for (const w of text.split(/\s+/).slice(0, 60)) {
    pat.push(Math.min(40 + w.length * 8, 200), 80);
  }
  pat.push(400, 200);
  return pat;
}

interface Profile {
  vision?: "none" | "low" | "normal";
  hearing?: "none" | "low" | "normal";
  cognitive?: "autism" | "adhd" | "normal";
  preferTouch?: boolean;
}

const PROFILE_INSTRUCTIONS = (p: Profile) => {
  const lines: string[] = [];
  if (p.vision === "none") lines.push("- المستخدم كفيف: قدّم نصاً مفصّلاً قابلاً للقراءة الصوتية، مع وصف بصري ثري لأي صور.");
  if (p.vision === "low") lines.push("- ضعف بصر: استخدم جملاً قصيرة وبارزة وعناوين واضحة.");
  if (p.hearing === "none") lines.push("- المستخدم أصم: قدّم نصاً مرئياً مبسّطاً، واقترح بطاقات PECS وكلمات إشارة مفتاحية.");
  if (p.hearing === "low") lines.push("- ضعف سمع: قدّم نصاً موجزاً مع تمييز للكلمات المفتاحية.");
  if (p.cognitive === "autism") lines.push("- توحّد: لغة حرفية، جمل قصيرة، خطوات مرقّمة، بدون مجاز.");
  if (p.cognitive === "adhd") lines.push("- ADHD: نقاط مختصرة جداً، تمييز الفكرة الأساسية، إزالة المشتتات.");
  if (p.preferTouch) lines.push("- يفضّل اللمس: ركّز على بريل ونمط اهتزاز واضح.");
  return lines.join("\n") || "- مستخدم عام.";
};

async function callGemini(parts: any[], systemPrompt: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parts },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("gateway error", r.status, t);
    throw new Error(`AI gateway ${r.status}`);
  }
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const profile: Profile = body.profile ?? {};
    const text: string | undefined = body.text;
    const fileBase64: string | undefined = body.fileBase64;
    const mimeType: string | undefined = body.mimeType;

    const sys = `أنت "الجسر الحسّي العكسي" في منصة ذروة العلم. مهمتك تحويل أي محتوى تعليمي إلى صيغة متعددة الحواس مناسبة للملف الحسّي للمستخدم.

الملف الحسّي:
${PROFILE_INSTRUCTIONS(profile)}

أعد الاستجابة بصيغة JSON خالصة فقط (بدون \`\`\`) بالحقول التالية بالعربية:
{
  "summary": "ملخّص مبسّط في 2-3 جمل",
  "simplifiedText": "إعادة صياغة سهلة وواضحة (نص كامل)",
  "narration": "نص مُهيّأ للتلاوة الصوتية بإيقاع مريح",
  "visualDescription": "وصف بصري دقيق للمحتوى أو الصورة (للكفيف)",
  "keyPoints": ["نقطة 1","نقطة 2","نقطة 3"],
  "signKeywords": ["كلمة","كلمة"],
  "pecsCards": [{"label":"اسم","emoji":"🔤"}],
  "rhythm": "وصف نمط إيقاع الاهتزاز (سريع/بطيء/متدرّج)"
}`;

    const parts: any[] = [];
    if (text) parts.push({ type: "text", text: `المحتوى النصي:\n${text}` });
    if (fileBase64 && mimeType) {
      if (mimeType.startsWith("image/")) {
        parts.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${fileBase64}` } });
        parts.push({ type: "text", text: "حلّل الصورة التعليمية وحوّلها." });
      } else if (mimeType.startsWith("audio/") || mimeType.startsWith("video/")) {
        parts.push({ type: "text", text: `[تم إرفاق ملف ${mimeType.startsWith("audio/") ? "صوتي" : "فيديو"}. استخرج محتواه التعليمي.]` });
        parts.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${fileBase64}` } });
      } else {
        parts.push({ type: "text", text: `[ملف ${mimeType} مرفق]` });
      }
    }
    if (parts.length === 0) throw new Error("No content provided");

    const raw = await callGemini(parts, sys);
    let parsed: any = {};
    try {
      const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { simplifiedText: raw, summary: raw.slice(0, 200), narration: raw, visualDescription: "", keyPoints: [], signKeywords: [], pecsCards: [], rhythm: "متدرّج" };
    }

    const fullText = parsed.simplifiedText || parsed.narration || parsed.summary || "";
    parsed.braille = toBraille(fullText);
    parsed.vibration = vibrationPattern(fullText);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sensory-bridge error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
