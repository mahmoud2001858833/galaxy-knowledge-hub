// أدوات مشتركة لدوال الامتحانات: CORS، التحقق من المستخدم، استدعاء Gemini، تجهيز الملفات.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** يتحقق أن الطلب من مستخدم مسجّل فعلاً (وليس مفتاح anon فقط). يعيد user id أو null. */
export async function requireUser(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: auth, apikey: key } });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.id ?? null;
  } catch {
    return null;
  }
}

export interface InPage { page: number; mimeType: string; base64: string }
/** ملف: إمّا مضمّن كاملاً (base64) أو نص، أو نص + صور صفحات محددة (للملفات الكبيرة جداً). */
export interface InFile {
  name: string; mimeType?: string; base64?: string; text?: string; pages?: InPage[];
  /** للملف المقصوص: pageMap[k-1] = رقم الصفحة الأصلية للصفحة k في الملف المرفق */
  pageMap?: number[];
}

export const MAX_INLINE_BYTES = 14 * 1024 * 1024;
export const MAX_TEXT_CHARS = 600_000;
export const INLINE_MIME = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export const MAX_PAGE_IMAGES = 160; // للتحليل (مصغّرات) أو للتوليد (صفحات مختارة)

/** يعيد رسالة خطأ بالعربية أو null إذا كانت الملفات سليمة. */
export function validateFiles(files: unknown): string | null {
  if (!Array.isArray(files) || files.length === 0 || files.length > 8) return "ارفع من 1 إلى 8 ملفات";
  let inline = 0;
  for (const f of files as InFile[]) {
    if (!f || typeof f.name !== "string") return "بيانات الملف غير صالحة";
    if (f.pageMap !== undefined && (!Array.isArray(f.pageMap) || f.pageMap.length > 400 || f.pageMap.some((n) => !Number.isInteger(n) || n < 1))) return "خريطة الصفحات غير صالحة";
    if (f.base64) {
      if (!INLINE_MIME.includes(f.mimeType || "")) return `نوع الملف غير مدعوم: ${f.name}`;
      inline += Math.floor(f.base64.length * 0.75);
    } else if (Array.isArray(f.pages) && f.pages.length > 0) {
      if (f.pages.length > MAX_PAGE_IMAGES) return `عدد صفحات الصور كبير جداً في الملف: ${f.name}`;
      for (const pg of f.pages) {
        if (!pg || !Number.isInteger(pg.page) || pg.page < 1 || pg.mimeType !== "image/jpeg" || typeof pg.base64 !== "string") {
          return `صورة صفحة غير صالحة في الملف: ${f.name}`;
        }
        inline += Math.floor(pg.base64.length * 0.75);
      }
    } else if (!f.text || f.text.trim().length < 80) {
      return `لم يُستخرج نص كافٍ من الملف: ${f.name}`;
    }
  }
  if (inline > MAX_INLINE_BYTES) return "حجم الملفات كبير جداً (الحد 14 ميجابايت). اختر وحدات أقل.";
  return null;
}

/** يصف للنموذج مقابلة صفحات الملف المقصوص بصفحات الأصل (بنطاقات متتالية مضغوطة). */
export function pageMapNote(map?: number[], mode: "original" | "attached" = "original"): string {
  if (!Array.isArray(map) || !map.length) return "";
  const runs: string[] = [];
  let k = 0;
  while (k < map.length) {
    let e = k;
    while (e + 1 < map.length && map[e + 1] === map[e] + 1) e++;
    runs.push(e === k ? `${k + 1}→${map[k]}` : `${k + 1}–${e + 1}→${map[k]}–${map[e]}`);
    k = e + 1;
  }
  const tail = mode === "attached"
    ? "في حقل page اكتب رقم الصفحة داخل هذا الملف المرفق (1 = أول صفحة مرفقة) كما تراها، ولا تكتب رقم الأصل؛ سأحوّله أنا"
    : "استعمل رقم الصفحة الأصلي دائماً في location وفي أي إشارة لصفحة";
  return `\n(هذا الملف مقتطع من الأصل. مقابلة أرقام الصفحات: ${runs.join("، ")} — ${tail})`;
}

export function buildFileParts(files: InFile[], opts: { pageNumbers?: "original" | "attached" } = {}): any[] {
  const parts: any[] = [];
  files.forEach((f, i) => {
    if (f.base64) {
      parts.push({ text: `=== الملف رقم ${i}: ${f.name} ===` + pageMapNote(f.pageMap, opts.pageNumbers) });
      parts.push({ inlineData: { mimeType: f.mimeType!, data: f.base64.replace(/^data:[^;]+;base64,/, "") } });
      return;
    }
    const hasPages = Array.isArray(f.pages) && f.pages.length > 0;
    if (f.text) {
      parts.push({
        text: `=== الملف رقم ${i}: ${f.name} ===\n${f.text.slice(0, MAX_TEXT_CHARS)}\n=== نهاية نص الملف رقم ${i} ===` +
          (hasPages ? "\nالصور التالية هي صور لصفحات محددة من هذا الملف نفسه، وكل صورة معنونة برقم صفحتها الفعلي." : ""),
      });
    } else if (hasPages) {
      parts.push({ text: `=== الملف رقم ${i}: ${f.name} (صور صفحات) ===` });
    }
    if (hasPages) {
      for (const pg of f.pages!) {
        parts.push({ text: `[صورة الصفحة ${pg.page} من الملف رقم ${i}]` });
        parts.push({ inlineData: { mimeType: pg.mimeType, data: pg.base64.replace(/^data:[^;]+;base64,/, "") } });
      }
    }
  });
  return parts;
}

function apiKeys(): string[] {
  return [Deno.env.get("GEMINI_API_KEY")].filter(Boolean) as string[];
}

export type GeminiErrCode = "rate_limited" | "timeout" | "auth" | "unavailable" | "invalid";
export class GeminiError extends Error {
  constructor(public code: GeminiErrCode, message: string, public retryAfter?: number) { super(message); }
  get status() {
    return { rate_limited: 429, timeout: 504, auth: 502, unavailable: 502, invalid: 502 }[this.code];
  }
}

export function parseRetryDelay(body: string, header?: string | null): number | undefined {
  const m = body.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
  if (m) return Math.ceil(Number(m[1]));
  const h = Number(header);
  return Number.isFinite(h) && h > 0 ? Math.ceil(h) : undefined;
}

export async function callGeminiJson(opts: {
  system: string; parts: any[]; schema: any; temperature: number; maxTokens?: number; thinking?: number;
  deadlineAt?: number; perRequestMs?: number;
}): Promise<any> {
  const keys = apiKeys();
  if (keys.length === 0) throw new GeminiError("auth", "GEMINI_API_KEY غير مضبوط في أسرار الدالة");
  const deadline = opts.deadlineAt ?? Date.now() + 100_000;
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: opts.parts }],
    generationConfig: {
      temperature: opts.temperature,
      maxOutputTokens: opts.maxTokens ?? 16000,
      responseMimeType: "application/json",
      responseSchema: opts.schema,
      thinkingConfig: { thinkingBudget: opts.thinking ?? 512 },
    },
  });
  let lastErr = "", lastCode: GeminiErrCode = "unavailable", retryAfter: number | undefined;
  for (const model of models) {
    for (const key of keys) {
      for (;;) {
        const left = deadline - Date.now();
        if (left < 4000) throw new GeminiError("timeout", lastErr || "انتهت مهلة الذكاء الاصطناعي", retryAfter);
        let r: Response;
        try {
          r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body,
            signal: AbortSignal.timeout(Math.min(left, opts.perRequestMs ?? 90_000)),
          });
        } catch (e: any) {
          lastCode = "timeout"; lastErr = `${model}: ${e?.name === "TimeoutError" || e?.name === "AbortError" ? "تأخر الرد" : e?.message}`;
          break;
        }
        if (r.ok) {
          const j = await r.json();
          const txt = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
          try { return JSON.parse(txt); } catch {
            const m = txt.match(/\{[\s\S]*\}/);
            if (m) { try { return JSON.parse(m[0]); } catch { /* fallthrough */ } }
            lastCode = "invalid"; lastErr = `${model}: رد غير صالح`;
            break;
          }
        }
        const t = await r.text();
        lastErr = `${model} ${r.status}: ${t.slice(0, 200)}`;
        if (r.status === 429) {
          lastCode = "rate_limited";
          const ra = parseRetryDelay(t, r.headers.get("retry-after"));
          retryAfter = Math.min(ra ?? 20, retryAfter ?? 999);
          break;
        }
        if (r.status === 401 || r.status === 403 || r.status === 400) {
          lastCode = r.status === 400 ? "invalid" : "auth";
          break;
        }
        lastCode = "unavailable";
        break;
      }
    }
  }
  throw new GeminiError(lastCode, `فشل الاتصال بالذكاء الاصطناعي: ${lastErr}`, retryAfter);
}
export { normText } from "./exam-normalize.ts";


export interface UnitIn { id?: string; title: string; summary?: string; fileIndex?: number; pageStart?: number | null; pageEnd?: number | null }

export function scopeText(units: UnitIn[]): string {
  if (!units.length) return "الملف كاملاً.";
  return "الوحدات التالية فقط من الملف (تجاهل بقية الملف تماماً ولا تسأل عن شيء خارجها):\n" +
    units.map((u, i) => {
      const pages = u.pageStart ? ` — الصفحات ${u.pageStart}${u.pageEnd && u.pageEnd !== u.pageStart ? `–${u.pageEnd}` : ""}` : "";
      return `${i + 1}. «${u.title}» — الملف رقم ${u.fileIndex ?? 0}${pages}${u.summary ? ` — ${u.summary}` : ""}`;
    }).join("\n");
}

export function sanitizeUnits(raw: unknown): UnitIn[] {
  return (Array.isArray(raw) ? raw : []).slice(0, 80).map((u: any) => ({
    title: String(u?.title ?? "").slice(0, 200),
    summary: String(u?.summary ?? "").slice(0, 300),
    fileIndex: Number.isInteger(u?.fileIndex) ? u.fileIndex : 0,
    pageStart: Number.isInteger(u?.pageStart) ? u.pageStart : null,
    pageEnd: Number.isInteger(u?.pageEnd) ? u.pageEnd : null,
  })).filter((u) => u.title);
}
