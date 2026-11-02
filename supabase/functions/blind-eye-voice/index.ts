// Blind Eye voice: text -> speech (WAV), always the same female voice. Uses the AI gateway's speech
// model (paid, ~1-2 s); the free Gemini TTS key is only a fallback (its quota runs out quickly).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VOICE = "nova";
const STYLE: Record<string, string> = {
  ar: "تحدثي بالعربية الفصحى المبسطة بصوت أنثوي دافئ وهادئ وواضح، كصديقة تمشي بجانب شخص كفيف وترشده. لا تستعجلي.",
  en: "Speak in a warm, calm, clear female voice, like a friend walking next to a blind person and guiding them. Don't rush.",
};

// repeated phrases are served from memory while the instance is warm
const cache = new Map<string, Uint8Array>();
let geminiBlockedUntil = 0;

function wav(pcm: Uint8Array, rate = 24000): Uint8Array {
  const h = new DataView(new ArrayBuffer(44));
  const w = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); h.setUint32(4, 36 + pcm.length, true); w(8, "WAVE");
  w(12, "fmt "); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
  w(36, "data"); h.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(h.buffer), 0);
  out.set(pcm, 44);
  return out;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function viaGateway(text: string, lang: string): Promise<Uint8Array> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("no gateway key");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/gpt-4o-mini-tts", voice: VOICE, input: text, instructions: STYLE[lang] ?? STYLE.en, response_format: "wav" }),
  });
  if (!r.ok) throw new Error(`gateway ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return new Uint8Array(await r.arrayBuffer());
}

async function viaGemini(text: string, lang: string): Promise<Uint8Array> {
  if (Date.now() < geminiBlockedUntil) throw new Error("gemini quota");
  const key = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
  if (!key) throw new Error("no gemini key");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${STYLE[lang] ?? STYLE.en}\n${text}` }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sulafat" } } } },
    }),
  });
  if (r.status === 429) { geminiBlockedUntil = Date.now() + 10 * 60_000; throw new Error("gemini quota"); }
  if (!r.ok) throw new Error(`gemini ${r.status}`);
  const j = await r.json();
  const part = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
  if (!part) throw new Error("gemini: no audio");
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
  return wav(Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0)), rate);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, lang } = await req.json();
    const t = typeof text === "string" ? text.trim() : "";
    if (!t || t.length > 700) return json({ error: "text must be 1-700 characters" }, 400);
    const lg = lang === "ar" ? "ar" : "en";
    const key = `${lg}|${t}`;
    const hit = cache.get(key);
    if (hit) return new Response(hit, { headers: { ...corsHeaders, "Content-Type": "audio/wav", "X-Cache": "hit" } });

    let lastErr = "";
    for (const [name, fn] of [["gateway", viaGateway], ["gemini", viaGemini]] as const) {
      try {
        const audio = await fn(t, lg);
        if (cache.size > 400) cache.delete(cache.keys().next().value!);
        cache.set(key, audio);
        return new Response(audio, { headers: { ...corsHeaders, "Content-Type": "audio/wav", "X-Model": name } });
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }
    console.warn("blind-eye-voice failed:", lastErr);
    return json({ error: "voice unavailable", details: lastErr }, 502);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 500);
  }
});
