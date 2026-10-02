// منطق نقي (بلا Deno) لتنظيف الأسئلة وتصحيح الإجابات. يُستخدم في التوليد وفي التصحيح.
export type QType = "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank";
export const QTYPES: QType[] = ["multiple_choice", "true_false", "fill_blank", "short_answer", "essay"];

export const normText = (s: string) =>
  String(s ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\s.,;:!?؟،؛"'«»()\[\]{}\-_]+/g, " ")
    .trim()
    .toLowerCase();

const FIG_REF =
  /(الشكل|الصورة|المخطط|الرسم)\s*(ال)?(أدناه|ادناه|المجاور|المقابل|التالي|السابق|\(?\d)|(يوضح|يبين|يظهر|يمثل|تمثل)\s+(الشكل|المخطط|الرسم|الصورة)|\b(figure|diagram|image|chart|graph)\s*(below|above|\d)|\b(shown|illustrated)\s+(in|below)/i;
const TBL_REF = /(الجدول)\s*(ال)?(أدناه|ادناه|التالي|السابق|المجاور|\(?\d)|(يوضح|يبين)\s+الجدول|\btable\s*(below|above|\d)/i;

export interface NormCtx {
  nFiles: number;
  figurable: boolean[]; // هل الملف i يمكن قصّ أشكال منه (PDF/صورة مضمّنة أو صور صفحات)
  /** للملفات الكبيرة: الصفحات التي أُرسلت صورها فقط. null = كل صفحات الملف مرئية للنموذج. */
  figPages?: (Set<number> | null)[];
  allowFigures: boolean;
  allowTables: boolean;
}

function normTable(t: any): { caption: string; headers: string[]; rows: string[][] } | null {
  if (!t || !Array.isArray(t.headers) || !Array.isArray(t.rows)) return null;
  const headers = t.headers.map((h: any) => String(h ?? "").trim().slice(0, 120));
  if (headers.length < 1 || headers.length > 12 || headers.every((h: string) => !h)) return null;
  if (t.rows.length < 1 || t.rows.length > 40) return null;
  const rows: string[][] = [];
  for (const r of t.rows) {
    if (!Array.isArray(r) || r.length !== headers.length) return null; // لا نُصلح جدولاً مشوّهاً بالتخمين
    rows.push(r.map((c: any) => String(c ?? "").trim().slice(0, 200)));
  }
  return { caption: String(t.caption ?? "").trim().slice(0, 200), headers, rows };
}

function normFigure(f: any, ctx: NormCtx) {
  if (!f) return null;
  const fileIndex = Number.isInteger(f.file_index) ? f.file_index : 0;
  const page = Number.isInteger(f.page) ? f.page : 0;
  if (fileIndex < 0 || fileIndex >= ctx.nFiles || !ctx.figurable[fileIndex]) return null;
  if (page < 1 || page > 5000) return null;
  const allowed = ctx.figPages?.[fileIndex];
  if (allowed && !allowed.has(page)) return null; // لم يرَ النموذج هذه الصفحة؛ الإحداثيات تخمين
  const b = Array.isArray(f.box_2d) ? f.box_2d.map(Number) : [];
  if (b.length !== 4 || b.some((n: number) => !Number.isFinite(n))) return null;
  const [y0, x0, y1, x1] = b.map((n: number) => Math.max(0, Math.min(1000, Math.round(n))));
  if (y1 - y0 < 20 || x1 - x0 < 20) return null;
  if ((y1 - y0) * (x1 - x0) < 10_000) return null; // أقل من 1% من الصفحة: غالباً خطأ في الإحداثيات
  return {
    fileIndex, page, box: [y0, x0, y1, x1] as [number, number, number, number],
    caption: String(f.caption ?? "").trim().slice(0, 300),
    revealsAnswer: !!f.reveals_answer,
  };
}

/** يعيد سؤالاً نظيفاً أو null إن كان غير صالح. */
export function normalizeQuestion(q: any, ctx: NormCtx): any | null {
  if (!q || !QTYPES.includes(q.type)) return null;
  const question = String(q.question ?? "").trim();
  const answer = String(q.answer ?? "").trim();
  if (question.length < 5 || !answer) return null;

  const out: any = {
    type: q.type,
    question,
    answer,
    explanation: String(q.explanation ?? "").trim(),
    evidence: String(q.evidence ?? "").trim(),
    location: String(q.location ?? "").trim(),
    unit: String(q.unit ?? "").trim().slice(0, 200),
    difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
  };
  if (!out.evidence) return null; // بلا دليل من الملف = مرفوض

  const table = ctx.allowTables ? normTable(q.table) : null;
  if (table) out.table = table;
  if (ctx.allowTables && q.table && !table) return null; // قصد النموذج جدولاً لكنه مشوّه: لا نُصلحه بالتخمين
  if (!table && TBL_REF.test(question)) return null; // يشير لجدول غير موجود

  const figure = ctx.allowFigures ? normFigure(q.figure, ctx) : null;
  if (figure) out.figure = figure;
  if (ctx.allowFigures && q.figure && !figure) return null; // إحداثيات/ملف غير صالح: السؤال يعتمد على شكل لا يمكن عرضه
  if (!figure && FIG_REF.test(question)) return null; // يشير لشكل غير موجود

  if (q.type === "multiple_choice") {
    const opts = Array.isArray(q.options)
      ? q.options.map((o: any) => String(o).replace(/^\s*([A-Dأ-د]|[١-٤1-4])\s*[\.\)\-:]\s*/, "").trim()).filter(Boolean)
      : [];
    const uniq = Array.from(new Map(opts.map((o: string) => [normText(o), o])).values()) as string[];
    if (uniq.length !== 4) return null;
    let idx = uniq.findIndex((o) => normText(o) === normText(answer));
    if (idx < 0) {
      const letters = ["ا", "ب", "ج", "د"], latin = ["a", "b", "c", "d"];
      const a = normText(answer).replace(/[\.\)\s]/g, "");
      idx = letters.indexOf(a) >= 0 ? letters.indexOf(a) : latin.indexOf(a);
    }
    if (idx < 0) return null;
    out.options = uniq;
    out.answer = uniq[idx];
  } else if (q.type === "true_false") {
    const a = normText(answer);
    if (/^(صح|صحيح|true|t)$/.test(a)) out.answer = /[a-z]/.test(a) ? "True" : "صح";
    else if (/^(خطا|خاطئ|false|f)$/.test(a)) out.answer = /[a-z]/.test(a) ? "False" : "خطأ";
    else return null;
  } else if (q.type === "fill_blank") {
    if (!/_{2,}|…{2,}|\.{4,}/.test(question)) return null;
  }
  return out;
}

const toBool = (s: string): boolean | null => {
  const a = normText(s);
  if (/^(صح|صحيح|true|t|نعم)$/.test(a)) return true;
  if (/^(خطا|خاطئ|false|f|لا)$/.test(a)) return false;
  return null;
};

/** تصحيح آلي لسؤال واحد. 'manual' للأسئلة التي تحتاج تصحيح معلم. */
export function gradeAnswer(q: { type: QType; answer: string }, student: unknown): "correct" | "wrong" | "manual" {
  if (q.type === "short_answer" || q.type === "essay") return "manual";
  const s = String(student ?? "").trim();
  if (!s) return "wrong";
  if (q.type === "multiple_choice") return normText(s) === normText(q.answer) ? "correct" : "wrong";
  if (q.type === "true_false") {
    const a = toBool(s), b = toBool(q.answer);
    return a !== null && a === b ? "correct" : "wrong";
  }
  // fill_blank: يقبل بدائل مفصولة بـ / أو ؛ أو "أو"
  const variants = q.answer.split(/\s*(?:\/|؛|;|\bor\b|\sأو\s)\s*/i).map(normText).filter(Boolean);
  return variants.includes(normText(s)) ? "correct" : "wrong";
}
