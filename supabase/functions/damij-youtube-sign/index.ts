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

async function parseTimedText(baseUrl: string, lang: string): Promise<{ lang: string; segments: Segment[] } | null> {
  const url = baseUrl.includes("fmt=") ? baseUrl : baseUrl + "&fmt=json3";
  const json = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } }).then(r => r.json()).catch(() => null);
  if (json?.events) {
    const segments: Segment[] = [];
    for (const ev of json.events) {
      if (!ev.segs || ev.tStartMs == null) continue;
      const text = ev.segs.map((s: any) => s.utf8 || "").join("").replace(/\n/g, " ").trim();
      if (!text) continue;
      segments.push({ start: ev.tStartMs / 1000, dur: (ev.dDurationMs ?? 2000) / 1000, text });
    }
    if (segments.length) return { lang, segments };
  }
  // XML fallback
  const xml = await fetch(baseUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).then(r => r.text()).catch(() => "");
  if (!xml) return null;
  const segments: Segment[] = [];
  const re = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let mm;
  while ((mm = re.exec(xml))) {
    const text = decodeEntities(mm[3]).trim();
    if (text) segments.push({ start: +mm[1], dur: +mm[2], text });
  }
  return segments.length ? { lang, segments } : null;
}

async function tracksFromInnertube(videoId: string): Promise<any[]> {
  // Public InnerTube key (used by youtube.com web client)
  const KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
  const clients = [
    { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30 },
    { clientName: "WEB", clientVersion: "2.20240726.00.00" },
    { clientName: "IOS", clientVersion: "19.09.3" },
  ];
  for (const client of clients) {
    try {
      const r = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${KEY}&prettyPrint=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
        body: JSON.stringify({ videoId, context: { client } }),
      });
      if (!r.ok) continue;
      const d = await r.json();
      const tracks = d?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (tracks?.length) return tracks;
    } catch { /* try next */ }
  }
  return [];
}

async function fetchTranscript(videoId: string, preferredLang?: string): Promise<{ lang: string; segments: Segment[] } | null> {
  // Strategy 1: scrape watch page
  let tracks: any[] = [];
  try {
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9" },
    }).then(r => r.text()).catch(() => "");
    const m = html.match(/"captionTracks":(\[.*?\])/);
    if (m) try { tracks = JSON.parse(m[1]); } catch {}
  } catch {}

  // Strategy 2: InnerTube API
  if (!tracks.length) tracks = await tracksFromInnertube(videoId);

  if (tracks.length) {
    const pref = preferredLang?.split("-")[0];
    const pick =
      (pref && tracks.find(t => (t.languageCode || "") === pref)) ||
      (pref && tracks.find(t => (t.languageCode || "").startsWith(pref))) ||
      tracks.find(t => t.kind !== "asr") ||
      tracks[0];
    let baseUrl: string = pick.baseUrl;
    // If we have a preferred lang and the picked track differs, use auto-translate (tlang=)
    if (pref && pick.languageCode && !pick.languageCode.startsWith(pref)) {
      baseUrl += `&tlang=${pref}`;
    }
    const out = await parseTimedText(baseUrl, pick.languageCode || "und");
    if (out) return out;
  }

  // Strategy 3: direct timedtext for common languages
  for (const lang of [preferredLang, "ar", "en"].filter(Boolean) as string[]) {
    for (const extra of ["", "&kind=asr"]) {
      const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${extra}`;
      const out = await parseTimedText(url, lang);
      if (out) return out;
    }
  }
  return null;
}


async function aiTranslateBatch(segments: Segment[], targetLang: string, apiKey: string): Promise<Segment[]> {
  // Translate all segments in one call to keep latency low.
  const numbered = segments.map((s, i) => `${i + 1}. ${s.text}`).join("\n");
  const prompt = `Translate the following numbered subtitle lines into ${targetLang} (BCP-47). Output ONLY the translations, same numbering, one per line, no commentary.\n\n${numbered}`;
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) return segments;
  const d = await r.json();
  const raw: string = d?.choices?.[0]?.message?.content ?? "";
  const lines = raw.split(/\r?\n/).map(l => l.replace(/^\s*\d+[.)\-] \s*/, "").trim()).filter(Boolean);
  return segments.map((s, i) => ({ ...s, text: lines[i] || s.text }));
}

async function aiBuildSigns(segments: Segment[], signSystem: string, lang: string, apiKey: string) {
  const text = segments.map((s, i) => `[${i}] ${s.text}`).join("\n");
  const prompt = `You are a professional ${signSystem} sign-language interpreter. For each numbered subtitle line, decompose into an ordered list of signs following ${signSystem} grammar (drop articles/fillers when natural). Return ONLY minified JSON of shape: {"lines":[{"i":0,"signs":[{"word":"...","emoji":"✋","desc":"short ${lang} description"}]}]}.\n\nLines:\n${text}`;
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  const raw = d?.choices?.[0]?.message?.content ?? "";
  try { return JSON.parse(raw); } catch {
    const m = raw.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch {} }
    return null;
  }
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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    let segments = transcript.segments;
    let translated = false;

    if (body.targetLang && apiKey && body.targetLang !== transcript.lang) {
      try {
        segments = await aiTranslateBatch(segments, body.targetLang, apiKey);
        translated = true;
      } catch (e) { console.error("translate failed", e); }
    }

    let signs: any = null;
    if (body.buildSigns && apiKey) {
      try {
        signs = await aiBuildSigns(segments, body.signSystem || "ArSL", body.targetLang || transcript.lang, apiKey);
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
