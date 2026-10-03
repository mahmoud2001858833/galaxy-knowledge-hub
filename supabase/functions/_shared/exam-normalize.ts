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
  /** يُستدعى بسبب كل سؤال يُرفض (للتقرير الشفاف للمعلم) */
  onDrop?: (reason: string) => void;
}

export function normTable(t: any): { caption: string; headers: string[]; rows: string[][] } | null {
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

export function normFigure(f: any, ctx: NormCtx) {
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
    id: f.id ? String(f.id).slice(0, 20) : undefined,
    fileIndex, page, box: [y0, x0, y1, x1] as [number, number, number, number],
    caption: String(f.caption ?? "").trim().slice(0, 300),
    revealsAnswer: !!f.reveals_answer,
  };
}

/** يعيد سؤالاً نظيفاً أو null إن كان غير صالح. */
export function normalizeQuestion(q: any, ctx: NormCtx): any | null {
  const drop = (r: string) => { ctx.onDrop?.(r); return null; };
  if (!q || !QTYPES.includes(q.type)) return drop("bad_type");
  const question = String(q.question ?? "").trim();
  const answer = String(q.answer ?? "").trim();
  if (question.length < 5 || !answer) return drop("empty_question_or_answer");

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
  if (!out.evidence) return drop("no_evidence"); // بلا دليل من الملف = مرفوض

  const table = ctx.allowTables ? normTable(q.table) : null;
  if (table) out.table = table;
  if (ctx.allowTables && q.table && !table) return drop("invalid_table"); // قصد النموذج جدولاً لكنه مشوّه: لا نُصلحه بالتخمين
  if (!table && TBL_REF.test(question)) return drop("mentions_missing_table"); // يشير لجدول غير موجود

  const figure = ctx.allowFigures ? normFigure(q.figure, ctx) : null;
  if (figure) out.figure = figure;
  if (ctx.allowFigures && q.figure && !figure) return drop("invalid_figure"); // إحداثيات/ملف غير صالح: السؤال يعتمد على شكل لا يمكن عرضه
  if (!figure && FIG_REF.test(question)) return drop("mentions_missing_figure"); // يشير لشكل غير موجود

  if (q.type === "multiple_choice") {
    const opts = Array.isArray(q.options)
      ? q.options.map((o: any) => String(o).replace(/^\s*([A-Dأ-د]|[١-٤1-4])\s*[\.\)\-:]\s*/, "").trim()).filter(Boolean)
      : [];
    const uniq = Array.from(new Map(opts.map((o: string) => [normText(o), o])).values()) as string[];
    if (uniq.length !== 4) return drop("mcq_options_not_4");
    let idx = uniq.findIndex((o) => normText(o) === normText(answer));
    if (idx < 0) {
      const letters = ["ا", "ب", "ج", "د"], latin = ["a", "b", "c", "d"];
      const a = normText(answer).replace(/[\.\)\s]/g, "");
      idx = letters.indexOf(a) >= 0 ? letters.indexOf(a) : latin.indexOf(a);
    }
    if (idx < 0) return drop("mcq_answer_not_in_options");
    out.options = uniq;
    out.answer = uniq[idx];
  } else if (q.type === "true_false") {
    const a = normText(answer);
    if (/^(صح|صحيح|true|t)$/.test(a)) out.answer = /[a-z]/.test(a) ? "True" : "صح";
    else if (/^(خطا|خاطئ|false|f)$/.test(a)) out.answer = /[a-z]/.test(a) ? "False" : "خطأ";
    else return drop("bad_true_false");
  } else if (q.type === "fill_blank") {
    if (!/_{2,}|…{2,}|\.{4,}/.test(question)) return drop("fill_blank_without_blank");
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


/** تقاطع/اتحاد صندوقين [ymin,xmin,ymax,xmax] */
export function iou(a: number[], b: number[]): number {
  const iy = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const ix = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = iy * ix;
  const uni = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
  return uni > 0 ? inter / uni : 0;
}

/** يزيل الأشكال المكررة (نفس الصفحة وتداخل كبير) ويُبقي الأكبر. */
export function dedupeFigures<T extends { fileIndex: number; page: number; box: number[] }>(figs: T[]): T[] {
  const area = (f: T) => (f.box[2] - f.box[0]) * (f.box[3] - f.box[1]);
  const sorted = [...figs].sort((x, y) => area(y) - area(x));
  const kept: T[] = [];
  for (const f of sorted) {
    if (!kept.some((k) => k.fileIndex === f.fileIndex && k.page === f.page && iou(k.box, f.box) > 0.5)) kept.push(f);
  }
  return figs.filter((f) => kept.includes(f));
}

/** يخفي خلايا محددة [صف, عمود] بعلامة «؟» ويعيد القيم المخفية (للإجابة). لا يعدّل الجدول الأصلي. */
export function maskTable(
  t: { caption?: string; headers: string[]; rows: string[][] }, cells: unknown,
): { table: { caption?: string; headers: string[]; rows: string[][] }; hidden: string[] } {
  const rows = t.rows.map((r) => [...r]);
  const hidden: string[] = [];
  if (Array.isArray(cells)) {
    for (const c of cells.slice(0, 6)) {
      if (!Array.isArray(c) || c.length !== 2) continue;
      const [r, k] = c.map(Number);
      if (Number.isInteger(r) && Number.isInteger(k) && rows[r] && k >= 0 && k < rows[r].length && rows[r][k] !== "؟") {
        hidden.push(rows[r][k]);
        rows[r][k] = "؟";
      }
    }
  }
  return { table: { ...t, rows }, hidden };
}
