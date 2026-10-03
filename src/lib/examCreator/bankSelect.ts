import type { ExamQuestion, QType } from "./types";
import { QTYPE_META } from "./types";
import type { Counts } from "./batchPlan";

const TYPES = QTYPE_META.map((t) => t.key);

export interface BankFilter {
  units?: string[];           // عناوين الوحدات
  difficulty?: ("easy" | "medium" | "hard")[];
  withVisuals?: "any" | "only" | "none";
  search?: string;
}

export function applyFilter(qs: ExamQuestion[], f: BankFilter): ExamQuestion[] {
  const s = (f.search ?? "").trim().toLowerCase();
  return qs.filter((q) =>
    (!f.units?.length || f.units.includes(q.unit ?? "")) &&
    (!f.difficulty?.length || f.difficulty.includes(q.difficulty)) &&
    (f.withVisuals !== "only" || !!(q.figure || q.table)) &&
    (f.withVisuals !== "none" || !(q.figure || q.table)) &&
    (!s || q.question.toLowerCase().includes(s) || (q.answer ?? "").toLowerCase().includes(s)));
}

/** مولّد عشوائي حتمي (mulberry32) لإعادة إنتاج الاختيار نفسه عند الحاجة. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function shuffle<T>(a: T[], r: () => number): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

/**
 * يختار أسئلة عشوائية من البنك بالعدد المطلوب لكل نوع، موزّعة بالتساوي على الوحدات قدر الإمكان.
 * يعيد المختار وما نقص (إن لم يكفِ البنك).
 */
export function pickFromBank(pool: ExamQuestion[], counts: Counts, seed = Date.now()): { picked: ExamQuestion[]; short: Partial<Record<QType, number>> } {
  const r = rng(seed);
  const picked: ExamQuestion[] = [];
  const short: Partial<Record<QType, number>> = {};
  for (const t of TYPES) {
    const want = counts[t] ?? 0;
    if (want <= 0) continue;
    const ofType = shuffle(pool.filter((q) => q.type === t), r);
    // توزيع دائري على الوحدات
    const byUnit = new Map<string, ExamQuestion[]>();
    for (const q of ofType) { const k = q.unit ?? ""; (byUnit.get(k) ?? byUnit.set(k, []).get(k)!).push(q); }
    const buckets = shuffle([...byUnit.values()], r);
    const got: ExamQuestion[] = [];
    while (got.length < want && buckets.some((b) => b.length)) {
      for (const b of buckets) { if (got.length >= want) break; const q = b.pop(); if (q) got.push(q); }
    }
    picked.push(...got);
    if (got.length < want) short[t] = want - got.length;
  }
  return { picked, short };
}

export function bankStats(qs: ExamQuestion[]) {
  const byType: Record<string, number> = {}, byUnit: Record<string, number> = {}, byDiff: Record<string, number> = {};
  let visuals = 0;
  for (const q of qs) {
    byType[q.type] = (byType[q.type] ?? 0) + 1;
    byUnit[q.unit || "—"] = (byUnit[q.unit || "—"] ?? 0) + 1;
    byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1;
    if (q.figure || q.table) visuals++;
  }
  return { total: qs.length, byType, byUnit, byDiff, visuals };
}
