import { geminiFetch } from "../_shared/gemini-shim.ts";
// Sensory Bridge: Image → audio description + tactile (printable) model
// Robust multi-key + multi-model fallback with Lovable Gateway as last resort.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT = `أنت محلّل صور تعليمي للمكفوفين. حلّل الصورة المرفقة وأعد JSON فقط بهذا الشكل بدون أي نص خارجي:
{
  "title": "عنوان قصير",
  "audioDescription": "وصف صوتي تفصيلي ومنظم باللغة العربية الفصحى يبدأ بنظرة عامة ثم العناصر من اليسار لليمين ومن الأعلى للأسفل، يصلح ليُقرأ بصوت عالٍ للمكفوف (200-400 كلمة)",
  "shortDescription": "ملخّص في جملة واحدة",
  "tactileRegions": [
    { "label": "اسم الجزء", "shape": "circle|rect|polygon", "x": 0-100, "y": 0-100, "w": 0-100, "h": 0-100, "texture": "smooth|bumpy|lined|dotted|cross", "elevation": 1-5, "description": "وصف الملمس المقترح" }
  ],
  "hapticPattern": [
    { "region": "اسم الجزء", "intensity": 1-10, "duration": 50-500, "pattern": "pulse|continuous|rhythm" }
  ],
  "printingNotes": "إرشادات لطباعة النموذج اللمسي بطابعة بريل/3D"
}
الإحداثيات بالنسبة المئوية للصورة. اجعل tactileRegions بين 4 و 10 مناطق رئيسية.`;

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const KEY_NAMES = [
  'SENSORY_TACTILE_GEMINI_KEY',
  'GEMINI_API_KEY',
  'GEMINI_API_KEY_NEW',
  'GOOGLE_AI_API_KEY',
  'BRAILLE_GEMINI_API_KEY',
  'MEDICAL_AI_KEY',
  'ROBOTICS_AI_KEY',
];

async function fetchWithTimeout(url: string, init: RequestInit, ms = 45000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

function extractJson(raw: string): any | null {
  if (!raw) return null;
  const tryParse = (s: string) => { try { return JSON.parse(s); } catch { return null; } };
  let p = tryParse(raw);
  if (p) return p;
  // strip code fences
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    p = tryParse(fence[1].trim());
    if (p) return p;
  }
  // first {...} block
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) {
    p = tryParse(m[0]);
    if (p) return p;
  }
  return null;
}

async function callGeminiDirect(apiKey: string, model: string, imageBase64: string, mimeType: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const resp = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
        ],
      }],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    }),
  });
  if (!resp.ok) {
    const txt = (await resp.text()).slice(0, 300);
    throw new Error(`gemini ${model} ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = extractJson(text);
  if (!parsed) throw new Error(`gemini ${model} returned non-JSON`);
  return parsed;
}

async function callLovableGateway(imageBase64: string, mimeType: string) {
  const key = "shim-key";
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
  const resp = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You return ONLY valid JSON, no prose.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!resp.ok) {
    const txt = (await resp.text()).slice(0, 300);
    throw new Error(`gateway ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || '';
  const parsed = extractJson(text);
  if (!parsed) throw new Error('gateway returned non-JSON');
  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 مطلوب' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Size guard (~6MB base64 ≈ 4.5MB binary)
    if (imageBase64.length > 6_000_000) {
      return new Response(JSON.stringify({ error: 'الصورة كبيرة جداً. الرجاء استخدام صورة أصغر من 4MB.' }), {
        status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keys = KEY_NAMES
      .map(n => ({ name: n, value: Deno.env.get(n) }))
      .filter(k => !!k.value) as { name: string; value: string }[];

    const errors: string[] = [];
    let parsed: any = null;
    let usedVia = '';

    outer: for (const model of GEMINI_MODELS) {
      for (const k of keys) {
        try {
          parsed = await callGeminiDirect(k.value, model, imageBase64, mimeType);
          usedVia = `gemini:${model}:${k.name}`;
          break outer;
        } catch (e) {
          const msg = (e as Error).message;
          errors.push(`${model}/${k.name}: ${msg.slice(0, 140)}`);
          console.warn(`[sensory-image-tactile] ${model}/${k.name} failed:`, msg.slice(0, 200));
        }
      }
    }

    if (!parsed) {
      try {
        parsed = await callLovableGateway(imageBase64, mimeType);
        usedVia = 'lovable-gateway';
      } catch (e) {
        const msg = (e as Error).message;
        errors.push(`gateway: ${msg.slice(0, 200)}`);
        console.error('[sensory-image-tactile] gateway failed:', msg);
      }
    }

    if (!parsed) {
      const allQuota = errors.every(e => /429|quota|rate/i.test(e));
      const friendly = allQuota
        ? 'تم تجاوز حصة الذكاء الاصطناعي مؤقتاً. حاول مجدداً بعد دقيقة.'
        : 'تعذّر تحليل الصورة بعد عدة محاولات. تأكد من وضوح الصورة وحاول مجدداً.';
      return new Response(JSON.stringify({ error: friendly, attempts: errors.slice(-5) }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[sensory-image-tactile] success via ${usedVia}`);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[sensory-image-tactile] fatal:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'خطأ غير متوقع' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
