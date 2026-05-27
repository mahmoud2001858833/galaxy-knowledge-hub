// Translates a batch of strings to the requested language directly via Gemini,
// rotating across many API keys so one quota-exhausted key falls back to the next.
// Persists every translation in `damij_translation_cache` for instant reuse.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const KEY_NAMES = [
  "GEMINI_API_KEY", "GEMINI_API_KEY_NEW", "GOOGLE_AI_API_KEY",
  "AUTISM_GEMINI_API_KEY", "AUTISM_GEMINI_API_KEY_V2",
  "GJU_AI_API_KEY", "ISLAMIC_HIJRI_AI_KEY", "ISLAMIC_ERAS_AI_KEY",
  "ROBOTICS_AI_KEY", "MEDICAL_AI_KEY", "PLATFORM_BUILDER_AI_KEY",
  "IMAGE_GENERATOR_API_KEY", "BRAILLE_LEARN_GEMINI_KEY",
  "BRAILLE_GEMINI_API_KEY", "BRAILLE_TACTILE_GEMINI_API_KEY",
  "SENSORY_TACTILE_GEMINI_KEY", "SIGN_TRANSLATE_GEMINI_KEY",
  "JORDAN_TWIN_AI_KEY", "JORDANIAN_ASSISTANT_AI_KEY",
  "JORDANIAN_AI_IMAGE_KEY",
  "JORDANIAN_NEW_AI_KEY_1", "JORDANIAN_NEW_AI_KEY_2",
  "JORDANIAN_NEW_AI_KEY_3", "JORDANIAN_NEW_AI_KEY_4", "JORDANIAN_NEW_AI_KEY_5",
  "JORDANIAN_AI_ANSWER_KEY_1", "JORDANIAN_AI_ANSWER_KEY_2", "JORDANIAN_AI_ANSWER_KEY_3",
  "JORDANIAN_AI_QUESTION_GEN_KEY_1", "JORDANIAN_AI_QUESTION_GEN_KEY_2",
  "JORDANIAN_AI_QUESTION_GEN_KEY_3", "JORDANIAN_AI_QUESTION_GEN_KEY_4",
  "JORDANIAN_AI_QUESTION_GEN_KEY_5", "JORDANIAN_AI_QUESTION_GEN_KEY_6",
  "JORDANIAN_AI_QUESTION_GEN_KEY_7", "JORDANIAN_AI_QUESTION_GEN_KEY_8",
  "JORDANIAN_AI_QUESTION_GEN_KEY_9", "JORDANIAN_AI_QUESTION_GEN_KEY_10",
  "JORDANIAN_AI_SEARCH_KEY_1", "JORDANIAN_AI_SEARCH_KEY_2",
  "JORDANIAN_AI_SEARCH_KEY_3", "JORDANIAN_AI_SEARCH_KEY_4", "JORDANIAN_AI_SEARCH_KEY_5",
];
const KEYS = Array.from(new Set(KEY_NAMES.map((n) => Deno.env.get(n)).filter((v): v is string => !!v)));
let keyCursor = Math.floor(Math.random() * Math.max(1, KEYS.length));
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

async function geminiTranslate(systemPrompt: string, userPrompt: string): Promise<string> {
  if (KEYS.length === 0) throw new Error("No Gemini API keys configured");
  const body = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.1 },
  };
  let lastErr = "";
  // Try every key with each model; rotate starting cursor so load spreads.
  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = KEYS[(keyCursor + attempt) % KEYS.length];
    for (const model of MODELS) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
        );
        if (r.ok) {
          const j = await r.json();
          const text = (j?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");
          keyCursor = (keyCursor + attempt) % KEYS.length;
          return text;
        }
        const t = await r.text();
        lastErr = `${r.status}: ${t.slice(0, 160)}`;
        if (r.status !== 429 && r.status < 500) break; // permanent for this key
      } catch (e) {
        lastErr = (e as Error).message;
      }
    }
  }
  throw new Error(`All keys exhausted: ${lastErr}`);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  ar: "Arabic", en: "English", fr: "French", es: "Spanish", de: "German",
  tr: "Turkish", ur: "Urdu", hi: "Hindi", fa: "Persian (Farsi)",
  he: "Hebrew", ru: "Russian", zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)", yue: "Cantonese",
  ja: "Japanese", ko: "Korean", pt: "Portuguese",
  it: "Italian", nl: "Dutch", pl: "Polish", sv: "Swedish", no: "Norwegian",
  da: "Danish", fi: "Finnish", is: "Icelandic", el: "Greek", cs: "Czech",
  sk: "Slovak", hu: "Hungarian", ro: "Romanian", bg: "Bulgarian",
  sr: "Serbian", hr: "Croatian", bs: "Bosnian", sl: "Slovenian",
  mk: "Macedonian", sq: "Albanian", uk: "Ukrainian", be: "Belarusian",
  lt: "Lithuanian", lv: "Latvian", et: "Estonian", mt: "Maltese",
  ga: "Irish", cy: "Welsh", gd: "Scottish Gaelic", eu: "Basque",
  ca: "Catalan", gl: "Galician", lb: "Luxembourgish", fo: "Faroese",
  la: "Latin", eo: "Esperanto",
  ku: "Kurdish (Kurmanji)", ckb: "Central Kurdish (Sorani)",
  ps: "Pashto", sd: "Sindhi", ug: "Uyghur",
  az: "Azerbaijani", ka: "Georgian", hy: "Armenian", kk: "Kazakh",
  ky: "Kyrgyz", uz: "Uzbek", tk: "Turkmen", tg: "Tajik", mn: "Mongolian",
  bn: "Bengali", pa: "Punjabi", ta: "Tamil", te: "Telugu", ml: "Malayalam",
  kn: "Kannada", gu: "Gujarati", mr: "Marathi", or: "Odia", as: "Assamese",
  ne: "Nepali", si: "Sinhala", dv: "Dhivehi",
  th: "Thai", vi: "Vietnamese", id: "Indonesian", ms: "Malay",
  tl: "Filipino (Tagalog)", my: "Burmese", km: "Khmer", lo: "Lao",
  jv: "Javanese", su: "Sundanese",
  sw: "Swahili", am: "Amharic", ti: "Tigrinya", so: "Somali",
  ha: "Hausa", yo: "Yoruba", ig: "Igbo", zu: "Zulu", xh: "Xhosa",
  st: "Sesotho", tn: "Tswana", sn: "Shona", ny: "Chichewa",
  rw: "Kinyarwanda", mg: "Malagasy", af: "Afrikaans",
  ht: "Haitian Creole", qu: "Quechua", gn: "Guarani", ay: "Aymara",
  haw: "Hawaiian", mi: "Maori", sm: "Samoan", to: "Tongan", fj: "Fijian",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, target, source } = await req.json();
    if (!Array.isArray(texts) || !target) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sourceLang: string = (source || "ar").toString();
    const translations: Record<string, string> = {};

    if (target === sourceLang) {
      for (const t of texts) translations[t] = t;
      return new Response(JSON.stringify({ translations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Lookup persistent cache first
    const unique = Array.from(new Set(texts.filter((s: unknown) => typeof s === "string" && s.length > 0)));
    if (unique.length > 0) {
      const { data: cached } = await admin
        .from("damij_translation_cache")
        .select("source_text, translated")
        .eq("lang", target)
        .in("source_text", unique);
      for (const row of cached ?? []) translations[row.source_text as string] = row.translated as string;
    }

    const missing = unique.filter((s) => !translations[s as string]) as string[];

    // 2) Translate missing in parallel chunks via AI
    if (missing.length > 0) {
      const langName = LANG_NAMES[target] || target;
      const sourceName = LANG_NAMES[sourceLang] || sourceLang;
      const sys =
        `You are a professional UI translator. Translate each numbered line from ${sourceName} to ${langName}. ` +
        `Keep the same numbering. Preserve placeholders, numbers, emojis, brand names. Do NOT add commentary. ` +
        `Output ONLY the numbered translations, one per line.`;

      const CHUNK = 25;
      const chunks: string[][] = [];
      for (let i = 0; i < missing.length; i += CHUNK) chunks.push(missing.slice(i, i + CHUNK));

      const results = await Promise.all(chunks.map(async (chunk) => {
        const numbered = chunk.map((s, i) => `${i + 1}. ${s.replace(/\n/g, " ")}`).join("\n");
        try {
          const resp = await geminiFetch("ai-shim", {
            method: "POST",
            headers: { Authorization: `Bearer shim-key`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: sys },
                { role: "user", content: numbered },
              ],
            }),
          });
          if (!resp.ok) return { chunk, out: {} as Record<string, string> };
          const data = await resp.json();
          const content: string = data?.choices?.[0]?.message?.content ?? "";
          const out: Record<string, string> = {};
          for (const line of content.split(/\r?\n/)) {
            const m = line.match(/^\s*(\d+)[\.\)\:\-]\s*(.+)$/);
            if (!m) continue;
            const idx = parseInt(m[1], 10) - 1;
            if (idx < 0 || idx >= chunk.length) continue;
            out[chunk[idx]] = m[2].trim();
          }
          return { chunk, out };
        } catch (e) {
          console.warn("translate chunk error", e);
          return { chunk, out: {} as Record<string, string> };
        }
      }));

      const rowsToInsert: { source_text: string; lang: string; translated: string }[] = [];
      for (const { chunk, out } of results) {
        for (const src of chunk) {
          const tr = out[src] || src;
          translations[src] = tr;
          if (out[src]) rowsToInsert.push({ source_text: src, lang: target, translated: tr });
        }
      }

      // Persist new translations to shared cache (best-effort)
      if (rowsToInsert.length > 0) {
        admin.from("damij_translation_cache")
          .upsert(rowsToInsert, { onConflict: "source_text,lang" })
          .then(({ error }) => { if (error) console.warn("cache upsert error", error.message); });
      }
    }

    // Final fallback: ensure every requested text has an entry
    for (const t of texts) if (!translations[t]) translations[t] = t;

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("damij-translate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
