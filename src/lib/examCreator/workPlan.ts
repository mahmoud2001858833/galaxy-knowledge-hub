// تخطيط العمل (منطق نقي): يقسّم المطلوب إلى «طلبات» صغيرة، لكل منها نافذة صفحات محدودة
// وعدد أسئلة قليل، فيتّسع كل طلب في مهلة الخادم ويُرسل جزء الملف اللازم فقط.
import { emptyCounts, splitCounts, sumCounts, type Counts } from "./batchPlan";
import type { Catalog, CatalogFigure, CatalogTable, UnitInfo, QType } from "./types";
import { QTYPE_META } from "./types";

const TYPES = QTYPE_META.map((t) => t.key);
const VISUAL_ORDER: QType[] = ["multiple_choice", "short_answer", "true_false", "fill_blank", "essay"];

export interface PageWindow { fileIndex: number; pages: number[] }
export interface WorkItem {
  id: string;
  kind: "text" | "visual";
  counts: Counts;
  units: UnitInfo[];
  focus?: string;
  /** صفحات الملفات اللازمة؛ null = الملفات كاملة (وحدات بلا أرقام صفحات) */
  windows: PageWindow[] | null;
  catalog: Catalog;
  minFig: number;
  minTbl: number;
}

export interface PlanLimits { textPerReq: number; visualPerReq: number; maxPages: number; chunk: number }
export const DEFAULT_LIMITS: PlanLimits = { textPerReq: 12, visualPerReq: 6, maxPages: 24, chunk: 10 };

const cloneCounts = (c: Counts): Counts => ({ ...c });
/** يأخذ n سؤالاً من counts بترتيب الأنواع الأنسب للأسئلة البصرية ويعيد (المأخوذ، الباقي). */
export function takeCounts(counts: Counts, n: number): { taken: Counts; rest: Counts } {
  const taken = emptyCounts(), rest = cloneCounts(counts);
  let left = n;
  for (const t of VISUAL_ORDER) {
    const k = Math.min(rest[t] ?? 0, left);
    taken[t] = k; rest[t] -= k; left -= k;
  }
  return { taken, rest };
}

const ranges = (pages: number[]) => {
  const s = [...pages].sort((a, b) => a - b), out: string[] = [];
  for (let i = 0; i < s.length;) {
    let j = i;
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    out.push(i === j ? `${s[i]}` : `${s[i]}–${s[j]}`);
    i = j + 1;
  }
  return out.join("، ");
};

interface Segment { unit: UnitInfo; pages: number[] | null }

function makeSegments(units: UnitInfo[], chunk: number): Segment[] {
  const segs: Segment[] = [];
  for (const u of units) {
    if (!u.pageStart) { segs.push({ unit: u, pages: null }); continue; }
    const end = Math.max(u.pageStart, u.pageEnd ?? u.pageStart);
    for (let a = u.pageStart; a <= end; a += chunk) {
      const b = Math.min(end, a + chunk - 1);
      segs.push({ unit: { ...u, pageStart: a, pageEnd: b }, pages: Array.from({ length: b - a + 1 }, (_, k) => a + k) });
    }
  }
  return segs;
}

function windowsOf(segs: Segment[]): PageWindow[] | null {
  if (segs.some((s) => !s.pages)) return null;
  const m = new Map<number, Set<number>>();
  for (const s of segs) {
    const set = m.get(s.unit.fileIndex) ?? new Set<number>();
    s.pages!.forEach((p) => set.add(p));
    m.set(s.unit.fileIndex, set);
  }
  return [...m.entries()].map(([fileIndex, set]) => ({ fileIndex, pages: [...set].sort((a, b) => a - b) }));
}

/** عناصر نصية: تغطية الكتاب موزّعة بالتساوي (نوافذ متباعدة) مع حدّ صفحات لكل طلب. */
export function planTextItems(units: UnitInfo[], counts: Counts, limits: PlanLimits, prefix = "t", focusNote = ""): WorkItem[] {
  const batches = splitCounts(counts, limits.textPerReq);
  const n = batches.length;
  if (!n) return [];
  const totalPages = units.reduce((s, u) => s + (u.pageStart ? Math.max(1, (u.pageEnd ?? u.pageStart) - u.pageStart + 1) : 0), 0);
  const chunk = Math.max(3, Math.min(limits.chunk, Math.ceil((totalPages || limits.chunk) / n)));
  const segs = makeSegments(units, chunk);
  const S = segs.length;
  if (!S) return batches.map((b, i) => ({ id: `${prefix}${i + 1}`, kind: "text" as const, counts: b, units, windows: null, catalog: { figures: [], tables: [] }, minFig: 0, minTbl: 0 }));

  const maxSeg = Math.max(1, Math.floor(limits.maxPages / chunk));
  const M = Math.min(S, n * maxSeg);
  const chosen = Array.from({ length: M }, (_, j) => Math.floor((j * S) / M));
  const per: Segment[][] = Array.from({ length: n }, () => []);
  chosen.forEach((si, j) => per[j % n].push(segs[si]));
  // طلبات أكثر من المقاطع: نعيد استعمال مقاطع (بتركيز مختلف) بدل طلب فارغ
  for (let i = 0; i < n; i++) if (!per[i].length) per[i].push(segs[i % S]);

  return batches.map((b, i) => {
    const my = per[i];
    const w = windowsOf(my);
    const pagesTxt = w ? w.map((x) => `الصفحات ${ranges(x.pages)}`).join(" ؛ ") : "";
    return {
      id: `${prefix}${i + 1}`, kind: "text" as const, counts: b,
      units: my.map((s) => s.unit), windows: w,
      focus: [pagesTxt, focusNote, S < n ? `الجزء ${i + 1} من ${n} من هذا النطاق (اختر مواضع مختلفة)` : ""].filter(Boolean).join(" — ") || undefined,
      catalog: { figures: [], tables: [] }, minFig: 0, minTbl: 0,
    };
  });
}

/** عناصر بصرية: كل طلب يخص مجموعة أشكال/جداول متجاورة ونافذته صفحاتها فقط. */
export function planVisualItems(
  units: UnitInfo[], counts: Counts, catalog: Catalog, minFig: number, minTbl: number, limits: PlanLimits,
): { items: WorkItem[]; rest: Counts } {
  const figs = [...catalog.figures].sort((a, b) => a.fileIndex - b.fileIndex || a.page - b.page);
  const tbls = [...catalog.tables].sort((a, b) => a.fileIndex - b.fileIndex || a.page - b.page);
  const wantFig = figs.length ? Math.min(minFig, figs.length * 2) : 0;
  const wantTbl = tbls.length ? Math.min(minTbl, tbls.length * 2) : 0;
  const vq = Math.min(wantFig + wantTbl, sumCounts(counts));
  if (vq < 1) return { items: [], rest: counts };

  const nV = Math.ceil(vq / limits.visualPerReq);
  type V = { kind: "f" | "t"; v: CatalogFigure | CatalogTable };
  const all: V[] = [...figs.map((v) => ({ kind: "f" as const, v })), ...tbls.map((v) => ({ kind: "t" as const, v }))]
    .sort((a, b) => a.v.fileIndex - b.v.fileIndex || a.v.page - b.v.page);
  const size = Math.ceil(all.length / nV);
  const groups = Array.from({ length: nV }, (_, i) => all.slice(i * size, (i + 1) * size)).filter((g) => g.length);

  let remF = Math.min(wantFig, vq), remT = Math.min(wantTbl, vq - remF);
  let pool = counts;
  const items: WorkItem[] = [];
  groups.forEach((g, gi) => {
    const gf = g.filter((x) => x.kind === "f").map((x) => x.v as CatalogFigure);
    const gt = g.filter((x) => x.kind === "t").map((x) => x.v as CatalogTable);
    const left = groups.length - gi;
    const fq = Math.min(gf.length * 2, Math.ceil(remF / left), remF);
    const tq = Math.min(gt.length * 2, Math.ceil(remT / left), remT);
    if (fq + tq < 1) return;
    remF -= fq; remT -= tq;
    const { taken, rest } = takeCounts(pool, fq + tq);
    pool = rest;

    // نافذة الصفحات: صفحات المجموعة أولاً ثم جيرانها حتى الحد
    const byFile = new Map<number, Set<number>>();
    g.forEach((x) => { const s = byFile.get(x.v.fileIndex) ?? new Set<number>(); s.add(x.v.page); byFile.set(x.v.fileIndex, s); });
    let budget = limits.maxPages;
    const windows: PageWindow[] = [];
    for (const [fileIndex, set] of byFile) {
      const core = [...set].sort((a, b) => a - b).slice(0, budget);
      const extra = new Set<number>(core);
      for (const p of core) for (const q of [p - 1, p + 1]) if (q >= 1 && extra.size < Math.min(budget, core.length * 2 + 2)) extra.add(q);
      budget -= extra.size;
      windows.push({ fileIndex, pages: [...extra].sort((a, b) => a - b) });
    }
    const pageSet = (fi: number) => new Set(windows.find((w) => w.fileIndex === fi)?.pages ?? []);
    const scoped = units.filter((u) => !u.pageStart || [...pageSet(u.fileIndex)].some((p) => p >= u.pageStart! && p <= (u.pageEnd ?? u.pageStart!)));
    items.push({
      id: `v${gi + 1}`, kind: "visual", counts: taken, units: scoped.length ? scoped : units, windows,
      catalog: { figures: gf, tables: gt }, minFig: fq, minTbl: tq,
      focus: `الصفحات ${windows.map((w) => ranges(w.pages)).join(" ؛ ")}`,
    });
  });
  return { items, rest: pool };
}

export function planWork(units: UnitInfo[], counts: Counts, catalog: Catalog, minFig: number, minTbl: number, limits = DEFAULT_LIMITS): WorkItem[] {
  const v = planVisualItems(units, counts, catalog, minFig, minTbl, limits);
  return [...v.items, ...planTextItems(units, v.rest, limits)];
}

/** تقسيم طلب تأخّر إلى نصفين (كل نصف نصف الأسئلة) ليتّسع في المهلة. */
export function splitItem(it: WorkItem): WorkItem[] | null {
  const total = sumCounts(it.counts);
  if (total < 4) return null;
  const a = emptyCounts(), b = emptyCounts();
  let k = 0;
  for (const t of TYPES) for (let i = 0; i < it.counts[t]; i++) { (k++ % 2 ? b : a)[t]++; }
  const fa = Math.ceil(it.minFig / 2), ta = Math.ceil(it.minTbl / 2);
  const mk = (c: Counts, f: number, t: number, s: string): WorkItem => ({ ...it, id: it.id + s, counts: c, minFig: f, minTbl: t });
  return [mk(a, fa, ta, "a"), mk(b, it.minFig - fa, it.minTbl - ta, "b")];
}
