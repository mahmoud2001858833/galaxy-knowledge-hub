// Blind Eye natural voice: text -> speech (WAV) with Gemini TTS. The app falls back to the phone's
// built-in voice when this is slow or unavailable.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODELS = ["gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"];
const VOICES: Record<string, string> = { calm: "Sulafat", clear: "Kore", warm: "Achird" };

// repeated phrases ("استدر إلى اليمين") are served from memory while the instance is warm
const cache = new Map<string, Uint8Array>();

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, lang, voice } = await req.json();
    const t = typeof text === "string" ? text.trim() : "";
    if (!t || t.length > 700) return json({ error: "text must be 1-700 characters" }, 400);
    const voiceName = VOICES[voice as string] ?? VOICES.calm;
    const key = `${voiceName}|${t}`;
    const hit = cache.get(key);
    if (hit) return new Response(hit, { headers: { ...corsHeaders, "Content-Type": "audio/wav", "X-Cache": "hit" } });

    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) return json({ error: "voice not configured" }, 503);
    const style = lang === "ar"
      ? "اقرأ بصوت هادئ وواضح وودود، بسرعة طبيعية، كمرافق يرشد شخصاً كفيفاً:"
      : "Read calmly, clearly and warmly, at a natural pace, like a companion guiding a blind person:";

    let lastErr = "";
    for (const model of MODELS) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${style}\n${t}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          },
        }),
      });
      if (!r.ok) { lastErr = `${model} ${r.status}: ${(await r.text()).slice(0, 200)}`; continue; }
      const j = await r.json();
      const part = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
      if (!part) { lastErr = `${model}: no audio`; continue; }
      const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
      const pcm = Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0));
      const out = wav(pcm, rate);
      if (cache.size > 300) cache.delete(cache.keys().next().value!);
      cache.set(key, out);
      return new Response(out, { headers: { ...corsHeaders, "Content-Type": "audio/wav", "X-Model": model } });
    }
    console.warn("blind-eye-voice failed:", lastErr);
    return json({ error: "voice unavailable", details: lastErr }, 502);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 500);
  }
});
