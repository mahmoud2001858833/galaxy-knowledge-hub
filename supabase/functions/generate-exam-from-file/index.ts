// generate-exam-from-file
// يولّد امتحاناً من الملف/الملفات المرفوعة فقط (لا يستخدم أي معرفة خارجية)،
// ثم يتحقق من كل سؤال مقابل الملف نفسه ويحذف أي سؤال غير مدعوم بالنص.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type QType = "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank";
const QTYPES: QType[] = ["multiple_choice", "true_false", "short_answer", "essay", "fill_blank"];
const TYPE_LABEL: Record<QType, string> = {
  multiple_choice: "اختيار من متعدد (4 خيارات، إجابة صحيحة واحدة فقط)",
  true_false: "صح أو خطأ (الإجابة بالضبط: صح أو خطأ)",
  short_answer: "إجابة قصيرة (جملة أو جملتان)",
  essay: "سؤال مقالي (يحتاج شرحاً أو تعليلاً)",
  fill_blank: "أكمل الفراغ (ضع ______ مكان الكلمة المحذوفة)",
};
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "سهل", medium: "متوسط", hard: "صعب",
  mixed: "متنوع (سهل 30% ، متوسط 50% ، صعب 20%)",
};

const MAX_TOTAL_QUESTIONS = 50;
const MAX_INLINE_BYTES = 14 * 1024 * 1024; // مجموع الملفات المضمّنة (base64 المفكوك)
const MAX_TEXT_CHARS = 600_000;
const INLINE_MIME = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

interface InFile { name: string; mimeType?: string; base64?: string; text?: string }

// ───────────────────────── Gemini ─────────────────────────
function apiKeys(): string[] {
  return [
    Deno.env.get("GEMINI_API_KEY"),
    Deno.env.get("GEMINI_API_KEY_NEW"),
    Deno.env.get("GOOGLE_AI_API_KEY"),
  ].filter(Boolean) as string[];
}

async function callGemini(opts: {
  system: string; parts: any[]; schema: any; temperature: number; maxTokens?: number;
}): Promise<any> {
  const keys = apiKeys();
  if (keys.length === 0) throw new Error("GEMINI_API_KEY غير مضبوط في أسرار الدالة");
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  let lastErr = "";
  for (const model of models) {
    for (const key of keys) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: opts.system }] },
              contents: [{ role: "user", parts: opts.parts }],
              generationConfig: {
                temperature: opts.temperature,
                maxOutputTokens: opts.maxTokens ?? 24000,
                responseMimeType: "application/json",
                responseSchema: opts.schema,
                thinkingConfig: { thinkingBudget: 1024 },
              },
            }),
          },
        );
        if (r.ok) {
          const j = await r.json();
          const txt = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
          try {
            return JSON.parse(txt);
          } catch {
            const m = txt.match(/\{[\s\S]*\}/);
            if (m) { try { return JSON.parse(m[0]); } catch { /* fallthrough */ } }
            lastErr = "رد غير صالح من النموذج";
            continue;
          }
        }
        const t = await r.text();
        lastErr = `${model} ${r.status}: ${t.slice(0, 200)}`;
        if (r.status === 429 || r.status >= 500) {
          await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
          continue;
        }
        break; // أخطاء 4xx الأخرى: جرّب المفتاح/النموذج التالي
      }
    }
  }
  throw new Error(`فشل الاتصال بالذكاء الاصطناعي: ${lastErr}`);
}

// ───────────────────────── Schemas ─────────────────────────
const GEN_SCHEMA = {
  type: "OBJECT",
  properties: {
    insufficient_content: { type: "BOOLEAN" },
    note: { type: "STRING" },
    title: { type: "STRING" },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: QTYPES },
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          answer: { type: "STRING" },
          explanation: { type: "STRING" },
          evidence: { type: "STRING" },
          location: { type: "STRING" },
          difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] },
        },
        required: ["type", "question", "answer", "evidence", "difficulty"],
      },
    },
  },
  required: ["questions"],
};

const VERIFY_SCHEMA = {
  type: "OBJECT",
  properties: {
    results: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          index: { type: "INTEGER" },
          valid: { type: "BOOLEAN" },
          reason: { type: "STRING" },
        },
        required: ["index", "valid"],
      },
    },
  },
  required: ["results"],
};

// ───────────────────────── Prompts ─────────────────────────
function generationSystem(p: {
  counts: Partial<Record<QType, number>>; difficulty: string; language: string;
  grade?: string; subject?: string; notes?: string; avoid: string[];
}): string {
  const typesList = QTYPES.filter((t) => (p.counts[t] ?? 0) > 0)
    .map((t) => `- ${p.counts[t]} سؤال من نوع: ${TYPE_LABEL[t]}`).join("\n");
  const total = QTYPES.reduce((s, t) => s + (p.counts[t] ?? 0), 0);
  return `أنت معلم خبير في إعداد الامتحانات. مهمتك: إعداد امتحان من "الملف المرفق" حصراً.

المطلوب (المجموع ${total} سؤالاً):
${typesList}
- مستوى الصعوبة: ${DIFFICULTY_LABEL[p.difficulty] ?? DIFFICULTY_LABEL.mixed}
- لغة الامتحان: ${p.language === "auto" ? "نفس لغة الملف" : p.language}
${p.grade ? `- الصف: ${p.grade}\n` : ""}${p.subject ? `- المادة: ${p.subject}\n` : ""}${p.notes ? `- ملاحظات المعلم: ${p.notes}\n` : ""}
قواعد صارمة لا يجوز كسرها:
1. المصدر الوحيد للأسئلة والإجابات هو الملف المرفق. يُمنع منعاً باتاً استخدام أي معلومة من خارجه حتى لو كانت صحيحة ومعروفة.
2. كل سؤال يجب أن يكون إجابته موجودة صراحة في الملف. لا تخمّن ولا تستنتج ما لا يدعمه النص.
3. في الحقل evidence ضع اقتباساً حرفياً قصيراً (حتى 25 كلمة) من الملف يدعم الإجابة، وفي location ضع رقم الصفحة أو اسم القسم/الفقرة إن أمكن.
4. لا تسأل عن بيانات شكلية: اسم الملف، الغلاف، الفهرس، اسم المؤلف أو الناشر، أرقام الصفحات، تاريخ الطباعة.
5. وزّع الأسئلة على كامل محتوى الملف (البداية والوسط والنهاية) ولا تركّز على جزء واحد، ولا تكرر السؤال نفسه بصيغ مختلفة.
6. اختيار من متعدد: 4 خيارات بالضبط، خيار واحد صحيح، والمشتتات معقولة ومن نفس المجال، وضع نص الإجابة الصحيحة في answer مطابقاً حرفياً لأحد الخيارات. نوّع موضع الإجابة الصحيحة، وتجنّب "كل ما سبق/لا شيء مما سبق".
7. صح/خطأ: answer هي "صح" أو "خطأ" فقط (بالإنجليزية True/False إن كانت لغة الامتحان الإنجليزية). عبارة واضحة غير ملتبسة.
8. أكمل الفراغ: ضع ______ مكان مصطلح مهم، والحقل answer هو المصطلح المحذوف فقط.
9. السؤال المقالي والقصير: ضع في answer إجابة نموذجية مختصرة مبنية على الملف، وفي explanation نقاط التصحيح.
10. نص عادي بدون أي تنسيق markdown (لا ** ولا ##).
11. إذا كان محتوى الملف لا يكفي لإنتاج العدد المطلوب بجودة، أنتج ما يمكن دعمه فقط، واجعل insufficient_content=true واشرح السبب في note. لا تملأ العدد بأسئلة مخترعة.
12. إذا كان الملف غير مقروء أو فارغاً أو لا يحتوي مادة تعليمية، أعد questions فارغة مع insufficient_content=true.
${p.avoid.length ? `\nأسئلة سبق إنتاجها (لا تكررها ولا تكرر أفكارها):\n${p.avoid.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n` : ""}`;
}

const VERIFY_SYSTEM = `أنت مدقق امتحانات صارم. ستُعطى الملف المرفق وقائمة أسئلة مرقمة مع إجاباتها.
لكل سؤال، تحقق من الملف نفسه فقط (لا من معرفتك الخارجية):
- هل الإجابة مذكورة أو مدعومة صراحة في الملف؟
- هل الإجابة المعطاة صحيحة بحسب الملف؟
- في أسئلة الاختيار من متعدد: هل يوجد خيار صحيح واحد فقط بحسب الملف؟
- هل السؤال واضح وغير ملتبس ولا يسأل عن بيانات شكلية (اسم الملف، الغلاف، الناشر)؟
أعد valid=false لأي سؤال يفشل في أي شرط، مع سبب مختصر بالعربية.`;

// ───────────────────────── Helpers ─────────────────────────
function buildFileParts(files: InFile[]): any[] {
  const parts: any[] = [];
  for (const f of files) {
    if (f.base64) {
      parts.push({ text: `=== الملف: ${f.name} ===` });
      parts.push({ inlineData: { mimeType: f.mimeType!, data: f.base64.replace(/^data:[^;]+;base64,/, "") } });
    } else if (f.text) {
      parts.push({ text: `=== الملف: ${f.name} ===\n${f.text.slice(0, MAX_TEXT_CHARS)}\n=== نهاية الملف ===` });
    }
  }
  return parts;
}

const norm = (s: string) => (s || "").replace(/[\s\u064B-\u0652\u0640]+/g, " ").trim().toLowerCase();

function normalizeQuestion(q: any): any | null {
  if (!q || !QTYPES.includes(q.type)) return null;
  const question = String(q.question ?? "").trim();
  let answer = String(q.answer ?? "").trim();
  if (question.length < 5 || !answer) return null;
  const out: any = {
    type: q.type,
    question,
    answer,
    explanation: String(q.explanation ?? "").trim(),
    evidence: String(q.evidence ?? "").trim(),
    location: String(q.location ?? "").trim(),
    difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
  };
  if (!out.evidence) return null; // بدون دليل من الملف = مرفوض

  if (q.type === "multiple_choice") {
    const opts = Array.isArray(q.options)
      ? q.options.map((o: any) => String(o).replace(/^\s*([A-Dأ-د]|[١-٤1-4])\s*[\.\)\-:]\s*/, "").trim()).filter(Boolean)
      : [];
    const uniq = Array.from(new Map(opts.map((o: string) => [norm(o), o])).values()) as string[];
    if (uniq.length !== 4) return null;
    let idx = uniq.findIndex((o) => norm(o) === norm(answer));
    if (idx < 0) {
      const letters = ["أ", "ب", "ج", "د"], latin = ["a", "b", "c", "d"];
      const a = norm(answer).replace(/[\.\)\s]/g, "");
      idx = letters.indexOf(a) >= 0 ? letters.indexOf(a) : latin.indexOf(a);
    }
    if (idx < 0) return null;
    out.options = uniq;
    out.answer = uniq[idx];
  } else if (q.type === "true_false") {
    const a = norm(answer);
    if (/^(صح|صحيح|true|t)$/.test(a)) out.answer = /[a-z]/.test(a) ? "True" : "صح";
    else if (/^(خطأ|خطا|خاطئ|false|f)$/.test(a)) out.answer = /[a-z]/.test(a) ? "False" : "خطأ";
    else return null;
  } else if (q.type === "fill_blank") {
    if (!/_{2,}|…{2,}|\.{4,}/.test(question)) return null;
  }
  return out;
}

// ───────────────────────── Handler ─────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const files: InFile[] = Array.isArray(body.files) ? body.files : [];
    const counts: Partial<Record<QType, number>> = {};
    for (const t of QTYPES) {
      const n = Math.floor(Number(body.counts?.[t] ?? 0));
      if (n > 0) counts[t] = Math.min(n, MAX_TOTAL_QUESTIONS);
    }
    const requested = QTYPES.reduce((s, t) => s + (counts[t] ?? 0), 0);
    if (requested < 1) return json({ error: "حدّد عدد الأسئلة لنوع واحد على الأقل" }, 400);
    if (requested > MAX_TOTAL_QUESTIONS) return json({ error: `الحد الأقصى ${MAX_TOTAL_QUESTIONS} سؤالاً في الامتحان الواحد` }, 400);
    if (files.length === 0 || files.length > 5) return json({ error: "ارفع من 1 إلى 5 ملفات" }, 400);

    let inlineBytes = 0;
    for (const f of files) {
      if (f.base64) {
        if (!INLINE_MIME.includes(f.mimeType || "")) return json({ error: `نوع الملف غير مدعوم: ${f.name}` }, 400);
        inlineBytes += Math.floor(f.base64.length * 0.75);
      } else if (!f.text || f.text.trim().length < 80) {
        return json({ error: `لم يُستخرج نص كافٍ من الملف: ${f.name}` }, 400);
      }
    }
    if (inlineBytes > MAX_INLINE_BYTES) return json({ error: "حجم الملفات كبير جداً (الحد 14 ميجابايت)" }, 413);

    const difficulty = String(body.difficulty || "mixed");
    const language = String(body.language || "auto");
    const meta = {
      grade: body.grade ? String(body.grade).slice(0, 80) : undefined,
      subject: body.subject ? String(body.subject).slice(0, 80) : undefined,
      notes: body.notes ? String(body.notes).slice(0, 1000) : undefined,
    };
    const fileParts = buildFileParts(files);

    const accepted: any[] = [];
    const seen = new Set<string>();
    const warnings: string[] = [];
    let dropped = 0;
    let insufficient = false;
    let note = "";
    let title = "";

    const remaining = () => {
      const r: Partial<Record<QType, number>> = {};
      for (const t of QTYPES) {
        const have = accepted.filter((q) => q.type === t).length;
        const need = (counts[t] ?? 0) - have;
        if (need > 0) r[t] = need;
      }
      return r;
    };

    // جولتان كحدّ أقصى: توليد ثم تعويض النقص بعد التحقق
    for (let round = 0; round < 2; round++) {
      const need = remaining();
      if (Object.keys(need).length === 0) break;

      const gen = await callGemini({
        system: generationSystem({
          counts: need, difficulty, language, ...meta,
          avoid: accepted.map((q) => q.question),
        }),
        parts: [...fileParts, { text: "أنشئ الامتحان الآن من الملف المرفق فقط." }],
        schema: GEN_SCHEMA,
        temperature: round === 0 ? 0.4 : 0.6,
      });

      if (gen.insufficient_content) { insufficient = true; note = String(gen.note || ""); }
      if (!title && gen.title) title = String(gen.title);

      const candidates: any[] = [];
      for (const raw of gen.questions ?? []) {
        const q = normalizeQuestion(raw);
        if (!q) { dropped++; continue; }
        const key = norm(q.question);
        if (seen.has(key)) { dropped++; continue; }
        // لا تتجاوز العدد المطلوب لكل نوع
        const wantOfType = need[q.type as QType] ?? 0;
        if (candidates.filter((c) => c.type === q.type).length >= wantOfType) continue;
        seen.add(key);
        candidates.push(q);
      }
      if (candidates.length === 0) { if (insufficient) break; else continue; }

      // مرحلة التحقق مقابل الملف
      const listing = candidates.map((q, i) =>
        `#${i}\nالنوع: ${q.type}\nالسؤال: ${q.question}\n${q.options ? `الخيارات: ${q.options.join(" | ")}\n` : ""}الإجابة: ${q.answer}\nالدليل المقتبس: ${q.evidence}`,
      ).join("\n\n");

      let verdicts: Map<number, { valid: boolean; reason?: string }> | null = null;
      try {
        const v = await callGemini({
          system: VERIFY_SYSTEM,
          parts: [...fileParts, { text: `الأسئلة المطلوب تدقيقها:\n\n${listing}` }],
          schema: VERIFY_SCHEMA,
          temperature: 0,
          maxTokens: 6000,
        });
        verdicts = new Map((v.results ?? []).map((r: any) => [Number(r.index), r]));
      } catch (e) {
        console.warn("verification failed, keeping unverified:", (e as Error).message);
        warnings.push("تعذّر التحقق الآلي النهائي من الأسئلة، يُرجى مراجعتها يدوياً.");
      }

      candidates.forEach((q, i) => {
        const verdict = verdicts?.get(i);
        if (verdicts && verdict && verdict.valid === false) {
          dropped++;
          seen.delete(norm(q.question));
        } else {
          accepted.push(q);
        }
      });
      if (insufficient && round === 0) break; // لا فائدة من التعويض إن كان المحتوى لا يكفي
    }

    if (accepted.length === 0) {
      return json({
        error: insufficient && note
          ? `لا يمكن إنشاء امتحان من هذا الملف: ${note}`
          : "لم أستطع إنشاء أسئلة موثوقة من هذا الملف. تأكد أنه يحتوي مادة تعليمية مقروءة.",
      }, 422);
    }

    // ترتيب: حسب نوع السؤال بالترتيب المعتاد
    accepted.sort((a, b) => QTYPES.indexOf(a.type) - QTYPES.indexOf(b.type));
    const questions = accepted.map((q, i) => ({ id: i + 1, ...q }));
    if (questions.length < requested) {
      warnings.push(
        insufficient
          ? `أُنشئ ${questions.length} من ${requested} سؤالاً فقط لأن محتوى الملف لا يكفي لعدد أكبر من الأسئلة الموثوقة${note ? ` (${note})` : ""}.`
          : `أُنشئ ${questions.length} من ${requested} سؤالاً؛ حُذفت أسئلة لم تجتز التحقق من الملف.`,
      );
    }

    return json({
      exam: { title: title || files.map((f) => f.name.replace(/\.[^.]+$/, "")).join(" + "), questions },
      requested,
      delivered: questions.length,
      dropped,
      warnings,
    });
  } catch (e: any) {
    console.error("generate-exam-from-file error:", e);
    return json({ error: e?.message || "حدث خطأ أثناء إنشاء الامتحان" }, 500);
  }
});
