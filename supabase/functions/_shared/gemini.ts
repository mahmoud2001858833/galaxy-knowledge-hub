// Shared Gemini caller for clinical edge functions with multi-key + multi-model fallback.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function geminiOnce(apiKey: string, model: string, system: string, prompt: string, schema?: any): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const sysText = schema ? `${system}\n\nأعد JSON فقط وفق المخطط:\n${JSON.stringify(schema)}` : system;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: sysText }] },
      generationConfig: schema
        ? { temperature: 0.5, responseMimeType: 'application/json' }
        : { temperature: 0.7 },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return schema ? JSON.parse(text) : text;
}

// Lovable AI fallback removed (forbidden). Gemini direct only.

export async function callGemini(system: string, prompt: string, schema?: any): Promise<any> {
  const keys = [
    Deno.env.get('GEMINI_API_KEY'),
    Deno.env.get('GEMINI_API_KEY_NEW'),
    Deno.env.get('AUTISM_GEMINI_API_KEY_V2'),
    Deno.env.get('AUTISM_GEMINI_API_KEY'),
    Deno.env.get('GOOGLE_AI_API_KEY'),
  ].filter(Boolean) as string[];
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
  let lastErr: any = null;
  for (const model of models) {
    for (const k of keys) {
      try { return await geminiOnce(k, model, system, prompt, schema); }
      catch (e) { lastErr = e; console.warn(`Gemini ${model} failed:`, (e as Error).message); }
    }
  }
  throw lastErr ?? new Error('AI unavailable');
}

export async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return null;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const r = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: authHeader, apikey: serviceKey } });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.id ?? null;
}

export function rest(path: string) {
  return `${Deno.env.get('SUPABASE_URL')!}/rest/v1${path}`;
}

export function svcHeaders(extra: Record<string, string> = {}) {
  const k = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return { apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json', ...extra };
}
