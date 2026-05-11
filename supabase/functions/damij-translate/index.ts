// Translates a batch of strings to the requested language using Lovable AI Gateway.
// Returns an object keyed by the original strings -> translations.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { geminiFetch } from "../_shared/gemini-shim.ts";
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
    if (target === sourceLang) {
      const out: Record<string, string> = {};
      for (const t of texts) out[t] = t;
      return new Response(JSON.stringify({ translations: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = LANG_NAMES[target] || target;
    const sourceName = LANG_NAMES[sourceLang] || sourceLang;
    const apiKey = "shim-key";
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Numbered list to preserve mapping
    const numbered = texts.map((s: string, i: number) => `${i + 1}. ${s.replace(/\\n/g, " ")}`).join("\n");

    const sys =
      `You are a professional UI translator. Translate each numbered line from ${sourceName} to ${langName}. ` +
      `Keep the same numbering. Preserve placeholders, numbers, emojis, brand names. Do NOT add commentary. ` +
      `Output ONLY the numbered translations, one per line.`;


    const resp = await geminiFetch("ai-shim", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: numbered },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "ai_error", status: resp.status }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";

    const translations: Record<string, string> = {};
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s*(\d+)[\.\)\:\-]\s*(.+)$/);
      if (!m) continue;
      const idx = parseInt(m[1], 10) - 1;
      if (idx < 0 || idx >= texts.length) continue;
      translations[texts[idx]] = m[2].trim();
    }
    // fallback: keep original
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
