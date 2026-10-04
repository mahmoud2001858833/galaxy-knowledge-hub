import { ApiError, generateExam, type GenerateParams } from "./api";
import { mergeUnique, sumCounts, emptyCounts, type Counts } from "./batchPlan";
import type { BatchDiagnostics, Catalog, ExamDiagnostics, ExamQuestion, GenerateResponse, QType } from "./types";
import { QTYPE_META } from "./types";
import type { CropResult, FilePayload } from "./fileUtils";
import { DEFAULT_LIMITS, planTextItems, planWork, splitItem, type PlanLimits, type WorkItem } from "./workPlan";

const TYPES = QTYPE_META.map((t) => t.key);
const TYPE_ORDER = new Map(TYPES.map((t, i) => [t, i]));

export interface Progress {
  batchesDone: number;
  batches: number;
  questions: number;
  target: number;
  failed: number;
  concurrency: number;
  /** ثوانٍ متبقية من انتظار حدّ المعدّل (0 = لا انتظار) */
  waitSeconds: number;
  lastError?: string;
  etaSeconds?: number;
}

export interface RunOptions {
  base: Omit<GenerateParams, "payloads" | "counts" | "units" | "catalog" | "minFigureQuestions" | "minTableQuestions" | "avoid" | "focus">;
  units: GenerateParams["units"];
  counts: Counts;
  catalog: Catalog;
  minFigureQuestions: number;
  minTableQuestions: number;
  figureImages: Map<string, CropResult>;
  /** الملفات المناسبة للطلب (مقتطعة على نافذة صفحاته إن أمكن) */
  payloadFor: (item: WorkItem) => Promise<FilePayload[]>;
  limits?: Partial<PlanLimits>;
  maxConcurrency: number;
  signal?: AbortSignal;
  onProgress?: (p: Progress) => void;
  /** تُستدعى بعد دمج كل دفعة (لحفظ تدريجي للبنوك الكبيرة) */
  onPartial?: (questions: ExamQuestion[]) => void | Promise<void>;
  // قابلة للاستبدال في الاختبارات
  generate?: (p: GenerateParams, signal?: AbortSignal) => Promise<GenerateResponse>;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

export interface RunResult {
  questions: ExamQuestion[];
  title: string;
  warnings: string[];
  diagnostics: Pick<ExamDiagnostics, "dropped" | "delivered" | "batches" | "duplicatesRemoved">;
  cancelled: boolean;
  /** سبب إيقاف مبكر (مفتاح غير صالح، فشل متكرر...) */
  fatal?: string;
  errors: string[];
}

interface Job { item: WorkItem; attempts: number; rateWaits: number; splits: number }

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const REASONS: Record<string, string> = {
  verify_invalid: "لم تجتز التدقيق مقابل الملف", duplicate: "مكررة", not_in_text: "الدليل غير موجود في الملف",
  invalid_table: "جدول مشوّه", invalid_figure: "شكل غير صالح", unknown_figure_id: "شكل غير معروف", unknown_table_id: "جدول غير معروف",
};

/** يولّد أسئلة كثيرة بطلبات صغيرة متوازية بتحكّم تكيّفي بالمعدّل، ويدمجها بلا تكرار، ويسدّ النقص بجولة تعويض واحدة. */
export async function runBatches(o: RunOptions): Promise<RunResult> {
  const sleep = o.sleep ?? defaultSleep, now = o.now ?? Date.now;
  const gen = o.generate ?? generateExam;
  const limits: PlanLimits = { ...DEFAULT_LIMITS, ...o.limits };
  const target = sumCounts(o.counts);
  const warnings: string[] = [];
  const errors: string[] = [];
  const dropped: Record<string, number> = {};
  let all: ExamQuestion[] = [];
  let title = "";
  let failed = 0, dups = 0, done = 0, totalJobs = 0, okCount = 0, consecFail = 0, streak = 0;
  let fatal: string | undefined;
  let cap = Math.min(2, o.maxConcurrency);
  let blockedUntil = 0;
  let lastError: string | undefined;
  /** بعد أول مهلة ننتقل لدفعات أصغر مسبقاً بدل تكرار نفس الفشل البطيء */
  let shrinkAbove = Infinity;
  const t0 = now();

  const addDrops = (d?: Record<string, number>) => { if (d) for (const [k, v] of Object.entries(d)) dropped[k] = (dropped[k] ?? 0) + v; };
  const pushErr = (m: string) => { lastError = m; if (!errors.includes(m)) errors.push(m); };
  const aborted = () => !!o.signal?.aborted;

  const emit = () => {
    const secs = Math.max(0, Math.ceil((blockedUntil - now()) / 1000));
    const elapsed = (now() - t0) / 1000;
    const eta = all.length >= 5 && all.length < target ? Math.round((elapsed / all.length) * (target - all.length)) : undefined;
    o.onProgress?.({ batchesDone: done, batches: totalJobs, questions: all.length, target, failed, concurrency: cap, waitSeconds: secs, lastError, etaSeconds: eta });
  };

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

  const queue: Job[] = [];
  const enqueue = (items: WorkItem[], front = false) => {
    const jobs = items.map((item) => ({ item, attempts: 0, rateWaits: 0, splits: 0 }));
    if (front) queue.unshift(...jobs); else queue.push(...jobs);
  };

  const finishFail = (job: Job, msg: string) => {
    failed++; done++; consecFail++; streak = 0;
    pushErr(msg);
    if (consecFail >= 3 && okCount === 0) fatal = fatal ?? `فشلت أول ${consecFail} دفعات متتالية. آخر خطأ: ${msg}`;
    emit();
  };

  const runJob = async (job: Job) => {
    // احترام الانتظار العام بعد خطأ معدّل (429)
    for (let w = blockedUntil - now(); w > 0 && !aborted(); w = blockedUntil - now()) {
      emit();
      await sleep(Math.min(w, 1000));
    }
    if (aborted() || fatal) return;
    const it = job.item;
    if (sumCounts(it.counts) > shrinkAbove && job.splits < 4) {
      const pre = splitItem(it);
      if (pre) {
        totalJobs += 1;
        queue.unshift(...pre.map((item) => ({ item, attempts: 0, rateWaits: 0, splits: job.splits + 1 })));
        return;
      }
    }
    let res: GenerateResponse;
    try {
      const payloads = await o.payloadFor(it);
      const params: GenerateParams = {
        ...o.base, payloads, counts: it.counts, units: it.units, focus: it.focus,
        catalog: it.catalog,
        includeFigures: it.catalog.figures.length > 0, includeTables: it.catalog.tables.length > 0,
        minFigureQuestions: it.minFig, minTableQuestions: it.minTbl,
        avoid: all.slice(-40).map((q) => q.question.slice(0, 110)),
      };
      res = await gen(params, o.signal);
    } catch (e: any) {
      if (aborted()) return;
      const err = e instanceof ApiError ? e : new ApiError(e?.message ?? "خطأ غير متوقع", "internal");
      switch (err.code) {
        case "rate_limited": {
          const wait = Math.min(90, Math.max(5, err.retryAfter ?? 15 * (job.rateWaits + 1)));
          blockedUntil = Math.max(blockedUntil, now() + wait * 1000);
          cap = Math.max(1, cap - 1); streak = 0;
          pushErr(`حدّ معدّل الذكاء الاصطناعي: انتظار ${wait} ثانية ثم المتابعة بتوازٍ أقل`);
          if (++job.rateWaits > 8) finishFail(job, "تجاوز الذكاء الاصطناعي حدّ الاستخدام مراراً. جرّب لاحقاً أو قلّل العدد.");
          else { queue.unshift(job); emit(); }
          return;
        }
        case "auth": case "bad_request":
          fatal = err.message; emit(); return;
        case "no_questions":
          addDrops(err.diagnostics?.dropped); done++; failed++; pushErr(err.message); emit(); return;
        case "timeout": case "invalid": {
          const halves = job.splits < 3 ? splitItem(it) : null;
          shrinkAbove = Math.min(shrinkAbove, Math.max(3, Math.ceil(sumCounts(it.counts) / 2)));
          if (halves) {
            pushErr(`تأخرت دفعة ${it.id}؛ قُسّمت إلى دفعتين أصغر`);
            totalJobs += 1;
            queue.unshift(...halves.map((item) => ({ item, attempts: 0, rateWaits: 0, splits: job.splits + 1 })));
            emit(); return;
          }
          if (job.attempts++ < 1) { queue.unshift(job); return; }
          finishFail(job, err.message); return;
        }
        default:
          if (job.attempts++ < 2) { pushErr(err.message); await sleep(3000 * job.attempts); queue.unshift(job); return; }
          finishFail(job, err.message); return;
      }
    }

    okCount++; consecFail = 0; done++;
    if (++streak >= 3 && cap < o.maxConcurrency) { cap++; streak = 0; }
    addDrops(res.diagnostics?.dropped);
    if (!title && res.exam.title) title = res.exam.title;
    res.warnings.forEach((w) => { if (!warnings.includes(w)) warnings.push(w); });
    const { kept, dups: d } = mergeUnique(all, attach(res.exam.questions));
    dups += d;
    all = all.concat(kept);
    emit();
    await o.onPartial?.(all);
  };

  const drain = () => new Promise<void>((resolve) => {
    let active = 0;
    const pump = () => {
      if (aborted() || fatal) { if (active === 0) resolve(); return; }
      while (active < cap && queue.length) {
        const job = queue.shift()!;
        active++;
        runJob(job).catch((e) => { fatal = fatal ?? String(e?.message ?? e); }).finally(() => { active--; pump(); });
      }
      if (active === 0 && queue.length === 0) resolve();
    };
    pump();
  });

  const items = planWork(o.units, o.counts, o.catalog, o.minFigureQuestions, o.minTableQuestions, limits);
  totalJobs = items.length;
  enqueue(items);
  emit();
  await drain();

  // جولة تعويض واحدة (نصية فقط) لسدّ النقص — فقط إن نجح شيء قبلها (وإلا فالمشكلة ليست النقص)
  if (!aborted() && !fatal && okCount > 0) {
    const short = emptyCounts();
    for (const t of TYPES) short[t] = Math.max(0, (o.counts[t] ?? 0) - all.filter((q) => q.type === t).length);
    if (sumCounts(short) >= 2) {
      const extra = planTextItems(o.units, short, limits, "x", "تكميل: اختر مواضع وأفكاراً لم تُغطَّ بعد");
      totalJobs += extra.length;
      enqueue(extra);
      emit();
      await drain();
    }
  }

  const questions = all
    .map((q, i) => ({ q, i }))
    .sort((a, b) => (TYPE_ORDER.get(a.q.type as QType)! - TYPE_ORDER.get(b.q.type as QType)!) || a.i - b.i)
    .map(({ q }, i) => ({ ...q, id: i + 1 }));

  if (questions.length === 0 && !fatal && !aborted()) {
    const top = Object.entries(dropped).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${REASONS[k] ?? k}: ${v}`).join("، ");
    fatal = (errors[errors.length - 1] ?? "لم تُنتج أي دفعة أسئلة") + (top ? ` (المحذوف: ${top})` : "");
  }
  if (questions.length < target && !aborted() && !fatal) {
    warnings.push(`أُنشئ ${questions.length} من ${target} سؤالاً؛ ما لم يكفِ فهو إما تكرار حُذف أو دفعات تعذّرت أو محتوى لا يسمح بأسئلة موثوقة أكثر.`);
  }
  return {
    questions, title, warnings, cancelled: aborted(), fatal, errors: errors.slice(-5),
    diagnostics: {
      dropped, batches: { total: totalJobs, failed }, duplicatesRemoved: dups,
      delivered: { figures: questions.filter((q) => q.figure).length, tables: questions.filter((q) => q.table).length },
    },
  };
}
