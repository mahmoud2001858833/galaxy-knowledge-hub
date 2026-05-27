// Shared helper: call Gemini directly with key rotation; fallback to Lovable AI only on failure.
const GEMINI_KEY_NAMES = [
  "SIGN_TRANSLATE_GEMINI_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_AI_API_KEY",
  "GEMINI_API_KEY_NEW",
  "JORDANIAN_AI_QUESTION_GEN_KEY_1",
  "JORDANIAN_AI_QUESTION_GEN_KEY_2",
  "JORDANIAN_AI_QUESTION_GEN_KEY_3",
  "JORDANIAN_AI_QUESTION_GEN_KEY_4",
  "JORDANIAN_AI_QUESTION_GEN_KEY_5",
  "JORDANIAN_AI_QUESTION_GEN_KEY_6",
  "JORDANIAN_AI_QUESTION_GEN_KEY_7",
  "JORDANIAN_AI_QUESTION_GEN_KEY_8",
  "JORDANIAN_AI_QUESTION_GEN_KEY_9",
  "JORDANIAN_AI_QUESTION_GEN_KEY_10",
  "JORDANIAN_AI_ANSWER_KEY_1",
  "JORDANIAN_AI_ANSWER_KEY_2",
  "JORDANIAN_AI_ANSWER_KEY_3",
  "JORDANIAN_AI_SEARCH_KEY_1",
  "JORDANIAN_AI_SEARCH_KEY_2",
  "JORDANIAN_AI_SEARCH_KEY_3",
  "JORDANIAN_AI_SEARCH_KEY_4",
  "JORDANIAN_AI_SEARCH_KEY_5",
  "JORDANIAN_NEW_AI_KEY_1",
  "JORDANIAN_NEW_AI_KEY_2",
  "JORDANIAN_NEW_AI_KEY_3",
  "JORDANIAN_NEW_AI_KEY_4",
  "JORDANIAN_NEW_AI_KEY_5",
  "JORDANIAN_ASSISTANT_AI_KEY",
  "JORDAN_TWIN_AI_KEY",
  "GJU_AI_API_KEY",
  "MEDICAL_AI_KEY",
  "ROBOTICS_AI_KEY",
  "ISLAMIC_ERAS_AI_KEY",
  "ISLAMIC_HIJRI_AI_KEY",
  "JORDANIAN_AI_IMAGE_KEY",
  "PLATFORM_BUILDER_AI_KEY",
  "IMAGE_GENERATOR_API_KEY",
  "AUTISM_GEMINI_API_KEY",
  "AUTISM_GEMINI_API_KEY_V2",
  "BRAILLE_GEMINI_API_KEY",
  "BRAILLE_LEARN_GEMINI_KEY",
  "BRAILLE_TACTILE_GEMINI_API_KEY",
  "SENSORY_TACTILE_GEMINI_KEY",
];

const GEMINI_KEYS = GEMINI_KEY_NAMES
  .map((n) => Deno.env.get(n))
  .filter((k): k is string => !!k && k.length > 10);

const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

async function callGeminiDirect(prompt: string, json: boolean): Promise<string | null> {
  for (const model of MODELS) {
    for (const key of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const body: any = {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        };
        if (json) body.generationConfig.responseMimeType = "application/json";
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          await r.text().catch(() => "");
          continue;
        }
        const data = await r.json();
        const txt: string = data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p?.text || "").join("").trim() ?? "";
        if (txt) return txt;
      } catch (e) {
        console.warn("gemini key failed", e instanceof Error ? e.message : e);
      }
    }
  }
  return null;
}

async function callLovableFallback(prompt: string, json: boolean): Promise<string | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!r.ok) {
      console.error("lovable fallback failed", r.status, await r.text().catch(() => ""));
      return null;
    }
    const data = await r.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (e) {
    console.error("lovable fallback error", e);
    return null;
  }
}

export async function aiCallWithFallback(prompt: string, json = true): Promise<string | null> {
  const direct = await callGeminiDirect(prompt, json);
  if (direct) return direct;
  console.warn("All Gemini keys failed — using Lovable AI fallback");
  return await callLovableFallback(prompt, json);
}

export function parseJson(raw: string): any | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch {}
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}
