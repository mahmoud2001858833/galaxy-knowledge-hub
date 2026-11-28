// Shared text-to-speech with automatic provider fallback (OpenAI gpt-4o-mini-tts "nova" -> Groq
// Orpheus Arabic -> Gemini TTS "Sulafat"), extracted from admin-brain so every voice feature on
// the platform shares one resilient implementation instead of re-copying the provider list.
import { logAiUsage } from "./ai-gateway.ts";

// Loosely typed on purpose, see ai-gateway.ts: callers pin different supabase-js versions.
// deno-lint-ignore no-explicit-any
type ServiceClient = { from: (table: string) => any };

const VOICE = "nova";
const VOICE_STYLE = "تحدثي بالعربية الفصحى المبسطة بصوت أنثوي دافئ وهادئ وواضح، كصديقة قريبة تتكلم بثقة. لا تستعجلي.";
const TTS_PER_CHAR: Record<string, number> = { openai: 0.000015, groq: 0.00002, gemini: 0.00002 };

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

async function speakGemini(text: string): Promise<Uint8Array> {
  const key = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("ADMIN_BRAIN_GEMINI_KEY") || Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
  if (!key) throw new Error("no gemini key");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    signal: AbortSignal.timeout(20_000),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${VOICE_STYLE}\n${text}` }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sulafat" } } } },
    }),
  });
  if (!r.ok) throw new Error(`gemini tts ${r.status}`);
  const j = await r.json();
  const part = j?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData?.data);
  if (!part) throw new Error("gemini tts: no audio");
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
  return wav(Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0)), rate);
}

// Groq's Arabic voice (needs its terms accepted once in the Groq console)
async function speakGroq(text: string): Promise<Uint8Array> {
  const key = Deno.env.get("ADMIN_BRAIN_LLM_KEY");
  if (!key || !Deno.env.get("ADMIN_BRAIN_LLM_URL")?.includes("groq.com")) throw new Error("no groq");
  let voice = Deno.env.get("ADMIN_BRAIN_TTS_VOICE") || "noura"; // women: noura, lulwa, aisha
  for (let i = 0; i < 2; i++) {
    const r = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      signal: AbortSignal.timeout(20_000),
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "canopylabs/orpheus-arabic-saudi", voice, input: text.slice(0, 1000), response_format: "wav" }),
    });
    if (r.ok) return new Uint8Array(await r.arrayBuffer());
    const err = await r.text();
    // unknown voice: the error lists the valid ones, take the first
    const valid = /voice[^\[]*\[([^\]]+)\]/i.exec(err)?.[1]?.split(",")[0]?.replace(/["'\s]/g, "");
    if (i === 0 && valid && valid !== voice) { voice = valid; continue; }
    throw new Error(`groq tts ${r.status}: ${err.slice(0, 120)}`);
  }
  throw new Error("groq tts failed");
}

// OpenAI's own gpt-4o-mini-tts "nova", paid by a direct OpenAI key instead of the Gemini gateway.
async function speakOpenAI(text: string): Promise<Uint8Array> {
  const key = Deno.env.get("ADMIN_BRAIN_OPENAI_KEY");
  if (!key) throw new Error("no openai key");
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    signal: AbortSignal.timeout(20_000),
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: VOICE, input: text, instructions: VOICE_STYLE, response_format: "wav" }),
  });
  if (!r.ok) throw new Error(`openai tts ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return new Uint8Array(await r.arrayBuffer());
}

const ttsSkip = new Map<string, number>();

/** Text -> wav audio, trying OpenAI, then Groq, then Gemini, and logging the real cost. */
export async function speak(text: string, opts: { service: ServiceClient; fnName: string; userId: string | null }): Promise<Uint8Array> {
  const errors: string[] = [];
  for (const [name, fn] of [["openai", speakOpenAI], ["groq", speakGroq], ["gemini", speakGemini]] as const) {
    if ((ttsSkip.get(name) ?? 0) > Date.now()) continue;
    try {
      const audio = await fn(text);
      logAiUsage(opts.service, opts.fnName, opts.userId, { kind: "tts", provider: name, chars: text.length, cost_usd: text.length * (TTS_PER_CHAR[name] ?? 0) });
      return audio;
    } catch (e) {
      errors.push(`${name}: ${String(e).slice(0, 120)}`);
      ttsSkip.set(name, Date.now() + (/402|terms|quota|429/.test(String(e)) ? 15 * 60_000 : 30_000));
    }
  }
  console.warn(`${opts.fnName} voice failed`, errors);
  throw new Error(errors.join(" · ") || "no voice available");
}
