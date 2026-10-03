import { generateExam, type GenerateParams } from "./api";
import { mergeUnique, planScopes, splitCounts, sumCounts, emptyCounts, type Counts } from "./batchPlan";
import type { BatchDiagnostics, Catalog, ExamDiagnostics, ExamQuestion, QType } from "./types";
import { QTYPE_META } from "./types";
import type { CropResult } from "./fileUtils";

const TYPES = QTYPE_META.map((t) => t.key);
const TYPE_ORDER = new Map(TYPES.map((t, i) => [t, i]));

export interface RunOptions {
  base: Omit<GenerateParams, "counts" | "units" | "catalog" | "minFigureQuestions" | "minTableQuestions" | "avoid" | "focus">;
  units: GenerateParams["units"];
  counts: Counts;
  catalog: Catalog;
  minFigureQuestions: number;
  minTableQuestions: number;
  figureImages: Map<string, CropResult>;
  batchSize: number;
  concurrency: number;
  signal?: AbortSignal;
  onProgress?: (p: { batchesDone: number; batches: number; questions: number; target: number }) => void;
  /** تُستدعى بعد دمج كل دفعة (لحفظ تدريجي للبنوك الكبيرة) */
  onPartial?: (questions: ExamQuestion[]) => void | Promise<void>;
}

export interface RunResult {
  questions: ExamQuestion[];
  title: string;
  warnings: string[];
  diagnostics: Pick<ExamDiagnostics, "dropped" | "delivered" | "batches" | "duplicatesRemoved">;
  cancelled: boolean;
}

/** توزيع عدد صحيح على n دفعات بالتساوي (الباقي للأوائل). */
export const splitInt = (total: number, n: number) => Array.from({ length: n }, (_, i) => Math.floor(total / n) + (i < total % n ? 1 : 0));
function partition<T>(items: T[], n: number): T[][] {
  const out: T[][] = Array.from({ length: n }, () => []);
  items.forEach((it, i) => out[i % n].push(it));
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** يولّد أسئلة كثيرة على دفعات (وبالتوازي)، ويدمجها بلا تكرار، ويسدّ النقص بجولات تعويض. */
export async function runBatches(o: RunOptions): Promise<RunResult> {
  const target = sumCounts(o.counts);
  const warnings: string[] = [];
  const dropped: Record<string, number> = {};
  let all: ExamQuestion[] = [];
  let title = "";
  let failed = 0, dups = 0, done = 0, totalBatches = 0;

  const addDrops = (d?: BatchDiagnostics) => { if (d) for (const [k, v] of Object.entries(d.dropped)) dropped[k] = (dropped[k] ?? 0) + v; };

  const attach = (qs: ExamQuestion[]): ExamQuestion[] => {
    const out: ExamQuestion[] = [];
    for (const q of qs) {
      if (q.figure) {
        const img = q.figure.id ? o.figureImages.get(q.figure.id) : undefined;
        if (!img) { dropped.figure_image_missing = (dropped.figure_image_missing ?? 0) + 1; continue; }
        out.push({ ...q, figure: { ...q.figure, dataUrl: img.dataUrl, width: img.width, height: img.height } });
      } else out.push(q);
    }
    return out;
  };

  const runPass = async (counts: Counts, withVisuals: boolean) => {
    const batchCounts = splitCounts(counts, o.batchSize);
    const n = batchCounts.length;
    if (!n) return;
    totalBatches += n;
    const scopes = planScopes(o.units, n);
    const figParts = withVisuals ? partition(o.catalog.figures, n) : Array.from({ length: n }, () => [] as Catalog["figures"]);
    const tblParts = withVisuals ? partition(o.catalog.tables, n) : Array.from({ length: n }, () => [] as Catalog["tables"]);
    const minFig = withVisuals ? splitInt(o.minFigureQuestions, n) : Array(n).fill(0);
    const minTbl = withVisuals ? splitInt(o.minTableQuestions, n) : Array(n).fill(0);
    // نصيب الدفعة من الأسئلة البصرية لا يتجاوز ما لديها من أشكال/جداول (×2 استعمالات)
    const next = { i: 0 };

    const worker = async () => {
      for (;;) {
        if (o.signal?.aborted) return;
        const i = next.i++;
        if (i >= n) return;
        const params: GenerateParams = {
          ...o.base, counts: batchCounts[i], units: scopes[i].units, focus: scopes[i].focus,
          catalog: { figures: figParts[i], tables: tblParts[i] },
          minFigureQuestions: figParts[i].length ? minFig[i] : 0,
          minTableQuestions: tblParts[i].length ? minTbl[i] : 0,
          avoid: all.slice(-150).map((q) => q.question),
        };
        let res = null as Awaited<ReturnType<typeof generateExam>> | null;
        for (let attempt = 0; attempt < 2 && !res; attempt++) {
          try { res = await generateExam(params); }
          catch (e: any) {
            // 422 = لا أسئلة موثوقة من هذا النطاق: لا فائدة من إعادة المحاولة
            if (/لم أستطع إنشاء أسئلة|لا يمكن إنشاء/.test(e?.message ?? "")) break;
            if (attempt === 0) await sleep(2500);
            else warnings.push(`تعذّرت دفعة (${i + 1}/${n}): ${e?.message ?? "خطأ"}`);
          }
        }
        done++;
        if (!res) { failed++; o.onProgress?.({ batchesDone: done, batches: totalBatches, questions: all.length, target }); continue; }

        addDrops(res.diagnostics);
        if (!title && res.exam.title) title = res.exam.title;
        res.warnings.forEach((w) => { if (!warnings.includes(w)) warnings.push(w); });
        const { kept, dups: d } = mergeUnique(all, attach(res.exam.questions));
        dups += d;
        all = all.concat(kept);
        o.onProgress?.({ batchesDone: done, batches: totalBatches, questions: all.length, target });
        await o.onPartial?.(all);
      }
    };
    await Promise.all(Array.from({ length: Math.min(o.concurrency, n) }, worker));
  };

  await runPass(o.counts, true);

  // جولات تعويض للنقص (تكرار محذوف أو دفعات فاشلة) — بلا أشكال لتجنّب إعادة استعمالها
  for (let pass = 0; pass < 2 && !o.signal?.aborted; pass++) {
    const short = emptyCounts();
    for (const t of TYPES) short[t] = Math.max(0, (o.counts[t] ?? 0) - all.filter((q) => q.type === t).length);
    if (sumCounts(short) < 2) break; // نسدّ أي نقص بسؤالين فأكثر
    await runPass(short, false);
  }

  const questions = all
    .map((q, i) => ({ q, i }))
    .sort((a, b) => (TYPE_ORDER.get(a.q.type as QType)! - TYPE_ORDER.get(b.q.type as QType)!) || a.i - b.i)
    .map(({ q }, i) => ({ ...q, id: i + 1 }));

  if (questions.length < target && !o.signal?.aborted) {
    warnings.push(`أُنشئ ${questions.length} من ${target} سؤالاً؛ ما لم يكفِ فهو إما تكرار حُذف أو محتوى لا يسمح بأسئلة موثوقة أكثر.`);
  }
  return {
    questions, title, warnings, cancelled: !!o.signal?.aborted,
    diagnostics: {
      dropped, batches: { total: totalBatches, failed }, duplicatesRemoved: dups,
      delivered: { figures: questions.filter((q) => q.figure).length, tables: questions.filter((q) => q.table).length },
    },
  };
}
