// Translates a batch of strings to the requested language through Lovable AI.
// Persists every translation in `damij_translation_cache` for instant reuse.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function lovableTranslate(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.05,
    }),
  });

  if (!response.ok) {
    const message = response.status === 429
      ? "Lovable AI rate limit exceeded"
      : response.status === 402
        ? "Lovable AI credits are required"
        : (await response.text()).slice(0, 240);
    throw new Error(message);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Lovable AI returned an empty translation");
  return content.trim();
}

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
          const content = await geminiTranslate(sys, numbered);
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
          console.warn("translate chunk error", (e as Error).message);
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
