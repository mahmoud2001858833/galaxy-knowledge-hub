// Direct Gemini API helper (Lovable AI Gateway is forbidden in this project).
async function geminiGenerate(prompt: string, apiKey: string, json: boolean, signal?: AbortSignal): Promise<Response> {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: json ? 0.1 : 0.4 },
  };
  if (json) body.generationConfig.responseMimeType = "application/json";
  return await fetch(url, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
function geminiText(d: any): string {
  return d?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") ?? "";
}
// Damij YouTube → Sign Language pipeline.
// 1) Extract video ID from URL
// 2) Fetch caption tracks list from the YouTube watch page
// 3) Pick best track (preferred lang, else first, else auto-translate)
// 4) Download timedtext XML/JSON3 and return normalized timed segments
// 5) Optionally translate each segment to a target spoken language via Lovable AI
// 6) Optionally produce per-segment sign tokens (one per word) using Gemini

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  url: string;
  preferredLang?: string;     // e.g. "ar"
  targetLang?: string;        // translate captions into this BCP-47
  signSystem?: string;        // e.g. "ArSL"
  buildSigns?: boolean;       // run AI sign decomposition
}

interface Segment { start: number; dur: number; text: string }

const extractVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/(embed|shorts|v)\/([^/?#]+)/);
    if (m) return m[2];
    return null;
  } catch { return null; }
};

const decodeEntities = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
   .replace(/<[^>]+>/g, "");

function parseTTML(xml: string): Segment[] {
  const segments: Segment[] = [];
  const re = /<p\s+begin="([^"]+)"\s+end="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g;
  const t2s = (t: string) => {
    const p = t.split(":").map(Number);
    if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
    if (p.length === 2) return p[0]*60 + p[1];
    return +t || 0;
  };
  let m;
  while ((m = re.exec(xml))) {
    const text = decodeEntities(m[3]).trim();
    if (!text) continue;
    const start = t2s(m[1]); const end = t2s(m[2]);
    segments.push({ start, dur: Math.max(0.1, end - start), text });
  }
  return segments;
}

function parseSrtJson3(json: any): Segment[] {
  if (!json?.events) return [];
  const segments: Segment[] = [];
  for (const ev of json.events) {
    if (!ev.segs || ev.tStartMs == null) continue;
    const text = ev.segs.map((s: any) => s.utf8 || "").join("").replace(/\n/g, " ").trim();
    if (!text) continue;
    segments.push({ start: ev.tStartMs / 1000, dur: (ev.dDurationMs ?? 2000) / 1000, text });
  }
  return segments;
}

function parseTimedTextXml(xml: string): Segment[] {
  const segments: Segment[] = [];
  const re = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let mm;
  while ((mm = re.exec(xml))) {
    const text = decodeEntities(mm[3]).trim();
    if (text) segments.push({ start: +mm[1], dur: +mm[2], text });
  }
  return segments;
}

async function fetchSubtitleUrl(url: string): Promise<Segment[]> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return [];
    const txt = await r.text();
    if (!txt) return [];
    if (url.includes("fmt=ttml") || /<tt\s/i.test(txt)) return parseTTML(txt);
    if (url.includes("fmt=json3") || txt.trimStart().startsWith("{")) {
      try { return parseSrtJson3(JSON.parse(txt)); } catch {}
    }
    return parseTimedTextXml(txt);
  } catch { return []; }
}

const PIPED_INSTANCES = [
  "https://api.piped.private.coffee",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.smnz.de",
  "https://pipedapi.r4fo.com",
];

async function fetchTranscriptViaPiped(videoId: string, preferredLang?: string): Promise<{ lang: string; segments: Segment[] } | null> {
  for (const base of PIPED_INSTANCES) {
    try {
      const r = await fetch(`${base}/streams/${videoId}`, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) continue;
      const d = await r.json();
      const subs: any[] = d?.subtitles ?? [];
      if (!subs.length) continue;
      const pref = preferredLang?.split("-")[0];
      const pick =
        (pref && subs.find(s => (s.code || "").startsWith(pref))) ||
        subs.find(s => !s.autoGenerated) ||
        subs[0];
      if (!pick?.url) continue;
      // Force ttml or json3 if URL allows
      let url: string = pick.url;
      const segments = await fetchSubtitleUrl(url);
      if (segments.length) return { lang: pick.code || "und", segments };
    } catch { /* next */ }
  }
  return null;
}

async function fetchTranscript(videoId: string, preferredLang?: string): Promise<{ lang: string; segments: Segment[] } | null> {
  // Primary: Piped API (works server-side reliably)
  const piped = await fetchTranscriptViaPiped(videoId, preferredLang);
  if (piped) return piped;

  // Fallback: try YouTube watch page
  try {
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9" },
    }).then(r => r.text());
    const m = html.match(/"captionTracks":(\[.*?\])/);
    if (m) {
      const tracks: any[] = JSON.parse(m[1].replace(/\\u0026/g, "&"));
      const pref = preferredLang?.split("-")[0];
      const pick =
        (pref && tracks.find(t => (t.languageCode || "").startsWith(pref))) ||
        tracks.find(t => t.kind !== "asr") || tracks[0];
      if (pick?.baseUrl) {
        const segments = await fetchSubtitleUrl(pick.baseUrl + "&fmt=json3");
        if (segments.length) return { lang: pick.languageCode || "und", segments };
      }
    }
  } catch {}
  return null;
}


async function aiTranslateBatch(segments: Segment[], targetLang: string, apiKey: string): Promise<Segment[]> {
  // Translate in chunks to avoid timeouts
  const CHUNK = 40;
  const out: Segment[] = [];
  for (let i = 0; i < segments.length; i += CHUNK) {
    const slice = segments.slice(i, i + CHUNK);
    const numbered = slice.map((s, j) => `${j + 1}. ${s.text}`).join("\n");
    const prompt = `Translate the following numbered subtitle lines into ${targetLang} (BCP-47). Output ONLY the translations, same numbering, one per line, no commentary.\n\n${numbered}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30000);
    try {
      const r = await geminiGenerate(prompt, apiKey, false, ctrl.signal);
      if (!r.ok) { out.push(...slice); continue; }
      const d = await r.json();
      const raw: string = geminiText(d);
      const lines = raw.split(/\r?\n/).map(l => l.replace(/^\s*\d+[.)\-]\s*/, "").trim()).filter(Boolean);
      out.push(...slice.map((s, j) => ({ ...s, text: lines[j] || s.text })));
    } catch (e) {
      console.error("translate chunk failed", e);
      out.push(...slice);
    } finally { clearTimeout(t); }
  }
  return out;
}

async function aiBuildSignsChunk(slice: { i: number; text: string }[], signSystem: string, lang: string, apiKey: string) {
  const text = slice.map(s => `[${s.i}] ${s.text}`).join("\n");
  const HANDSHAPES = "open_palm, flat_hand, flat_hand_down, fist, thumbs_up, thumbs_down, point, point_up, point_down, point_right, point_left, victory, three, four, five, one, two, ok, love, call_me, rock, pinch, claw, bent_hand, spread_hand, prayer, wave, finger_gun, crossed_fingers";
  const MOVEMENTS = "none, tap, wave_h, wave_v, circle, push, pull, up, down";
  const prompt = `You are a professional ${signSystem} sign-language interpreter. For each numbered subtitle line, decompose into an ordered list of REAL signs in ${signSystem} grammar (drop articles/fillers when natural).

ABSOLUTE RULES:
- Use ONLY authentic native signs of "${signSystem}". Never mix systems.
- All textual fields must be in ${lang} ONLY.
- NEVER use emojis as a stand-in for a sign. NEVER spell words letter by letter.
- If you don't know a real attested sign for a token, set "known": false and write a short note in "desc" — do NOT invent.

For each sign output:
- "word": gloss in ${lang}.
- "handshape_id": EXACTLY ONE of: ${HANDSHAPES}.
- "movement": EXACTLY ONE of: ${MOVEMENTS}.
- "two_handed": boolean.
- "desc": one short ${lang} sentence: handshape + location + movement.
- "known": boolean.
- "t": fractional time within the line where this sign STARTS (0.0–1.0). Distribute proportionally to the spoken word's position in the original text. Be MONOTONICALLY INCREASING.
- "d": fractional duration of this sign within the line (0.0–1.0). Sum of d's per line should be ≤ 1.0.

Return ONLY minified JSON of shape: {"lines":[{"i":0,"signs":[{"word":"...","handshape_id":"...","movement":"...","two_handed":false,"desc":"...","known":true,"t":0.0,"d":0.2}]}]}.

Lines:
${text}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45000);
  let r: Response;
  try {
    r = await geminiFetch("ai-shim", {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } finally { clearTimeout(t); }
  if (!r.ok) { console.error("signs ai non-ok", r.status, await r.text().catch(()=>"")); return null; }
  const d = await r.json();
  const raw = d?.choices?.[0]?.message?.content ?? "";
  try { return JSON.parse(raw); } catch {
    const m = raw.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch {} }
    return null;
  }
}

// Fast, deterministic sign tokenization (no AI) — the frontend dictionary
// (3000+ entries) fills in handshape/movement per word. This avoids edge-function
// timeouts on long videos and produces results instantly.
function tokenizeSigns(segments: Segment[]) {
  const STOP = new Set([
    // Arabic fillers / particles
    "في","من","الى","إلى","على","عن","يا","ما","لا","و","أو","او","ثم","قد","هل","كان","كانت",
    "هذا","هذه","ذلك","تلك","هنا","هناك","انا","أنا","انت","أنت","هو","هي","نحن","هم",
    // English fillers
    "the","a","an","of","to","in","on","at","is","are","was","were","be","and","or","so","if","it","this","that","these","those","i","you","he","she","we","they","me","my","your",
    // Music / brackets noise
    "موسيقى","صراخ","تصفيق",
  ]);
  const lines = segments.map((seg, i) => {
    // strip bracketed sound cues and the YouTube ">>" speaker markers
    const cleaned = seg.text
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/[>]{2,}/g, " ")
      .replace(/[«»“”"'`،,.;:!?()]/g, " ")
      .trim();
    const words = cleaned.split(/\s+/).filter(w => w && !STOP.has(w.toLowerCase()));
    const n = words.length;
    const signs = words.map((w, k) => ({
      word: w,
      handshape_id: undefined as string | undefined,
      movement: undefined as string | undefined,
      two_handed: false,
      desc: "",
      known: false,
      t: n ? k / n : 0,
      d: n ? 1 / n : 1,
    }));
    return { i, signs };
  });
  return { lines };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const videoId = extractVideoId(body.url || "");
    if (!videoId) {
      return new Response(JSON.stringify({ error: "رابط يوتيوب غير صالح" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = await fetchTranscript(videoId, body.preferredLang);
    if (!transcript || !transcript.segments.length) {
      return new Response(JSON.stringify({
        error: "لا توجد ترجمة نصية متاحة لهذا الفيديو. جرّب فيديو يحتوي على CC.",
        videoId,
      }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = "shim-key";
    let segments = transcript.segments;
    let translated = false;

    const baseLang = (s?: string) => (s || "").split("-")[0].toLowerCase();
    if (body.targetLang && baseLang(body.targetLang) !== baseLang(transcript.lang)) {
      try {
        segments = await aiTranslateBatch(segments, body.targetLang, apiKey);
        translated = true;
      } catch (e) { console.error("translate failed", e); }
    }

    let signs: any = null;
    if (body.buildSigns) {
      try {
        signs = tokenizeSigns(segments);
      } catch (e) { console.error("signs failed", e); }
    }

    return new Response(JSON.stringify({
      videoId,
      sourceLang: transcript.lang,
      translated,
      targetLang: body.targetLang ?? transcript.lang,
      signSystem: body.signSystem ?? null,
      segments,
      signs,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
