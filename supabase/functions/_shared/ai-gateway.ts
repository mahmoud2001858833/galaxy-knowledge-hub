// Shared OpenAI-compatible multi-provider chat gateway: tries each provider in order, treats a
// 429 as "wait, don't drop", skips a failed provider for a while so it never slows every later
// request, and logs the actual cost to ai_usage_log. Extracted from admin-brain so every AI
// feature on the platform gets the same resilience instead of re-implementing provider fallback.
// deno-lint-ignore-file no-explicit-any
// `service` is typed loosely on purpose: callers import createClient from different pinned
// @supabase/supabase-js versions, whose generated SupabaseClient types are not structurally
// assignable to each other even though the runtime object shape is identical.
type ServiceClient = { from: (table: string) => any };

export type Provider = { name: string; url: string; key: string; model: string };

// Approximate list prices in USD per 1M tokens [input, output].
const PRICES: [RegExp, number, number][] = [
  [/gpt-oss-120b/, 0.15, 0.6], [/gpt-oss-20b/, 0.075, 0.3], [/llama-4-scout/, 0.27, 0.85],
  [/flash-lite/, 0.1, 0.4], [/gemini.*flash/, 0.3, 2.5], [/gemini.*pro/, 1.25, 10],
];
function chatCost(model: string, tin: number, tout: number) {
  const p = PRICES.find(([re]) => re.test(model));
  return p ? (tin * p[1] + tout * p[2]) / 1e6 : 0;
}

export function logAiUsage(service: ServiceClient, fnName: string, userId: string | null, row: Record<string, unknown>) {
  // never slows or breaks an answer
  service.from("ai_usage_log").insert({ fn: fnName, user_id: userId, ...row }).then(({ error }: { error: { message: string } | null }) => {
    if (error) console.warn("ai_usage_log", error.message);
  });
}

/** The platform's standard Gemini provider: same GOOGLE_API_KEY/LOVABLE_API_KEY gateway used by ai-image-generator, falak-knowledge-ai, etc. */
export function geminiProvider(opts: { modelEnvVar?: string; defaultModel?: string } = {}): Provider | null {
  const key = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  const model = (opts.modelEnvVar && Deno.env.get(opts.modelEnvVar)) || opts.defaultModel || "gemini-3.1-flash-lite";
  return { name: "gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key, model };
}

const skipUntil = new Map<string, number>();

export async function callGateway(opts: {
  service: ServiceClient;
  providers: Provider[];
  messages: unknown[];
  tools?: unknown[];
  fnName: string;
  userId: string | null;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] }> {
  const { service, providers: list, messages, tools, fnName, userId, maxTokens = 900, temperature = 0.6 } = opts;
  if (!list.length) throw new Error("ما في أي مزوّد ذكاء اصطناعي مضبوط");
  const errors: string[] = [];
  const now = Date.now();
  // providers that failed recently go last instead of being skipped entirely
  const ordered = [...list.filter((p) => (skipUntil.get(p.name) ?? 0) <= now), ...list.filter((p) => (skipUntil.get(p.name) ?? 0) > now)];

  const call = async (p: Provider) => {
    const r = await fetch(p.url, {
      signal: AbortSignal.timeout(25_000),
      method: "POST",
      headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: p.model, messages, ...(tools ? { tools, tool_choice: "auto" } : {}), max_tokens: maxTokens, temperature,
        ...(/gpt-oss/.test(p.model) ? { reasoning_effort: "low" } : {}),
      }),
    });
    if (r.status === 429) {
      const body = await r.text();
      const secs = Number(r.headers.get("retry-after")) || Number(/try again in ([\d.]+)s/i.exec(body)?.[1]) || 10;
      return { wait: secs };
    }
    if (!r.ok) {
      const body = (await r.text()).slice(0, 140);
      return { error: r.status === 402 ? `${p.name}: الرصيد خلص (402)` : r.status === 413 ? `${p.name}: الطلب كبير (413)` : `${p.name} ${r.status}: ${body}`, status: r.status };
    }
    const j = await r.json();
    const msg = j?.choices?.[0]?.message;
    if (!msg) return { error: `${p.name}: رد فاضي` };
    const tin = Number(j?.usage?.prompt_tokens ?? 0), tout = Number(j?.usage?.completion_tokens ?? 0);
    logAiUsage(service, fnName, userId, { kind: "chat", provider: p.name, model: p.model, tokens_in: tin, tokens_out: tout, cost_usd: chatCost(p.model, tin, tout) });
    return { msg };
  };

  let soonest: { p: Provider; wait: number } | null = null;
  for (const p of ordered) {
    try {
      const res: { msg?: unknown; wait?: number; error?: string; status?: number } = await call(p);
      if (res.msg) { skipUntil.delete(p.name); return res.msg as { content?: string }; }
      if (res.wait) {
        errors.push(`${p.name}: حد الدقيقة (بعد ${Math.ceil(res.wait)}ث)`);
        skipUntil.set(p.name, Date.now() + res.wait * 1000);
        if (!soonest || res.wait < soonest.wait) soonest = { p, wait: res.wait };
        continue;
      }
      errors.push(res.error ?? `${p.name}: unknown error`);
      skipUntil.set(p.name, Date.now() + (res.status === 402 ? 30 * 60_000 : 60_000));
    } catch (e) {
      errors.push(`${p.name}: ${String(e).slice(0, 100)}`);
      skipUntil.set(p.name, Date.now() + 60_000);
    }
  }
  // all providers were only rate-limited for a few seconds: wait for the soonest one and retry once
  if (soonest && soonest.wait <= 20) {
    await new Promise((s) => setTimeout(s, soonest!.wait * 1000 + 300));
    try {
      const res: { msg?: unknown } = await call(soonest.p);
      if (res.msg) { skipUntil.delete(soonest.p.name); return res.msg as { content?: string }; }
    } catch { /* fall through */ }
  }
  console.warn(`${fnName} providers failed`, errors);
  throw new Error(errors.join(" · ") || "AI busy");
}
