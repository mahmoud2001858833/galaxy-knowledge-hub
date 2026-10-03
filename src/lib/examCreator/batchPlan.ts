import type { QType, UnitInfo, ExamQuestion } from "./types";
import { QTYPE_META } from "./types";

const TYPES = QTYPE_META.map((t) => t.key);
export type Counts = Record<QType, number>;
export const sumCounts = (c: Counts) => TYPES.reduce((s, t) => s + (c[t] ?? 0), 0);
export const emptyCounts = (): Counts => ({ multiple_choice: 0, true_false: 0, fill_blank: 0, short_answer: 0, essay: 0 });

/** يقسّم الأعداد المطلوبة إلى دفعات متقاربة الحجم (≤ batchSize) مع توزيع كل نوع بالتساوي. */
export function splitCounts(counts: Counts, batchSize: number): Counts[] {
  const total = sumCounts(counts);
  if (total <= 0) return [];
  const n = Math.ceil(total / batchSize);
  const batches = Array.from({ length: n }, emptyCounts);
  let cursor = 0; // يُكمل الدوران بين الأنواع حتى تتساوى أحجام الدفعات
  for (const t of TYPES) {
    for (let k = 0; k < (counts[t] ?? 0); k++) { batches[cursor % n][t]++; cursor++; }
  }
  return batches.filter((b) => sumCounts(b) > 0);
}

export interface BatchScope { units: UnitInfo[]; focus?: string }

/**
 * يوزّع نطاق كل دفعة لتغطية الكتاب بدل تكرار نفس المواضع:
 * - وحدات أكثر من الدفعات: تُقسَّم الوحدات على الدفعات تناوباً.
 * - وحدات أقل من الدفعات: تُقطَّع الوحدات ذات الصفحات إلى شرائح صفحات، وغيرها تأخذ «الجزء k من n».
 */
export function planScopes(units: UnitInfo[], nBatches: number): BatchScope[] {
  if (nBatches <= 1 || units.length === 0) return Array.from({ length: Math.max(1, nBatches) }, () => ({ units }));
  if (units.length >= nBatches) {
    const out: BatchScope[] = Array.from({ length: nBatches }, () => ({ units: [] }));
    units.forEach((u, i) => out[i % nBatches].units.push(u));
    return out;
  }
  const slicesPer = Math.ceil(nBatches / units.length);
  const slices: { unit: UnitInfo; focus?: string }[] = [];
  for (const u of units) {
    const span = u.pageStart ? (u.pageEnd ?? u.pageStart) - u.pageStart + 1 : 0;
    if (span >= slicesPer * 2) {
      const step = Math.ceil(span / slicesPer);
      for (let s = 0; s < slicesPer; s++) {
        const a = u.pageStart! + s * step, b = Math.min(u.pageEnd!, a + step - 1);
        if (a > u.pageEnd!) break;
        slices.push({ unit: { ...u, pageStart: a, pageEnd: b }, focus: `الصفحات ${a}–${b} من «${u.title}»` });
      }
    } else {
      for (let s = 0; s < slicesPer; s++) slices.push({ unit: u, focus: slicesPer > 1 ? `الجزء ${s + 1} من ${slicesPer} من «${u.title}»` : undefined });
    }
  }
  const out: BatchScope[] = Array.from({ length: nBatches }, () => ({ units: [] }));
  slices.forEach((sl, i) => {
    const b = out[i % nBatches];
    if (!b.units.some((x) => x.id === sl.unit.id && x.pageStart === sl.unit.pageStart)) b.units.push(sl.unit);
    b.focus = b.focus ? `${b.focus}؛ ${sl.focus ?? ""}` : sl.focus;
  });
  return out.map((b) => (b.units.length ? b : { units }));
}

// ───── التكرار ─────
const norm = (s: string) =>
  s.normalize("NFKC").replace(/[\u064B-\u0652\u0640]/g, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .replace(/[\s.,;:!?؟،؛"'«»()\[\]{}\-_]+/g, " ").trim().toLowerCase();
const tokens = (s: string) => new Set(norm(s).split(" ").filter((w) => w.length > 2));

export function similarity(a: string, b: string): number {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => { if (B.has(w)) inter++; });
  return inter / (A.size + B.size - inter);
}

/** يضيف `incoming` إلى `existing` مع إسقاط ما يشبه (≥ threshold) سؤالاً موجوداً. يعيد المقبول وعدد المكرر. */
export function mergeUnique(existing: ExamQuestion[], incoming: ExamQuestion[], threshold = 0.82): { kept: ExamQuestion[]; dups: number } {
  const pool = existing.map((q) => ({ n: norm(q.question), q }));
  const kept: ExamQuestion[] = [];
  let dups = 0;
  for (const q of incoming) {
    const n = norm(q.question);
    const hit = pool.some((p) => p.n === n || similarity(p.q.question, q.question) >= threshold);
    if (hit) { dups++; continue; }
    pool.push({ n, q });
    kept.push(q);
  }
  return { kept, dups };
}
