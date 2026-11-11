import { supabase } from '@/integrations/supabase/client';

/**
 * Builds the request for a Gemini call.
 *
 * - If the visitor saved their own key in this browser (settings screen), call Google directly with it.
 * - Otherwise go through the `gemini-proxy` edge function, which holds the platform key on the server.
 *
 * The proxy returns Google's response unchanged, so callers parse it exactly as before.
 */
export async function geminiRequest(
  model: string,
  opts: { stream: boolean; userKey?: string },
): Promise<{ url: string; headers: Record<string, string> }> {
  const userKey = opts.userKey?.trim();
  if (userKey) {
    const method = opts.stream ? 'streamGenerateContent?alt=sse&' : 'generateContent?';
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}key=${encodeURIComponent(userKey)}`,
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const client = supabase as unknown as { supabaseUrl: string; supabaseKey: string };
  let token = client.supabaseKey;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) token = data.session.access_token;
  } catch {
    // anonymous visitor: the publishable key is enough
  }

  const params = new URLSearchParams({ model, ...(opts.stream ? { stream: '1' } : {}) });
  return {
    url: `${client.supabaseUrl}/functions/v1/gemini-proxy?${params}`,
    headers: {
      'Content-Type': 'application/json',
      apikey: client.supabaseKey,
      Authorization: `Bearer ${token}`,
    },
  };
}
