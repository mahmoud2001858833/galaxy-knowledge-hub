import type { UnitInfo } from "./types";
import { applyTightBox, contentRect, expandRect, sensibleTightBox, type Rect } from "./trim";

export const MAX_FILES = 8;
export const MAX_INLINE_BYTES_PER_FILE = 10 * 1024 * 1024;
export const MAX_TOTAL_INLINE_BYTES = 14 * 1024 * 1024;
export const MAX_FILE_BYTES = 400 * 1024 * 1024;
const MAX_PDF_PAGES = 2500;
const MAX_SEND_PAGES = 36;            // صور صفحات مفصّلة للتوليد
const MAX_THUMB_PAGES = 120;          // مصغّرات للتحليل (الكتب الممسوحة ضوئياً)
const MAX_PAGE_IMAGE_BYTES = 11 * 1024 * 1024;
const MAX_GEN_TEXT_CHARS = 450_000;

export interface PagePayload { page: number; mimeType: string; base64: string }
export interface FilePayload { name: string; mimeType?: string; base64?: string; text?: string; pages?: PagePayload[] }

/** بيانات الملف الكبير (PDF > 10MB): نقرؤه صفحةً صفحة محلياً ولا نرسله كاملاً. */
export interface LargePdfInfo {
  numPages: number;
  pageTexts: string[]; // نص كل صفحة (فهرسها = رقم الصفحة - 1)
  scanned: boolean;    // بلا طبقة نصية: يعتمد على صور الصفحات
}

export interface PreparedFile {
  name: string;
  size: number;
  kind: "pdf" | "image" | "docx" | "text";
  /** ما يُرسل للخادم (للتحليل). للتوليد يُعاد بناؤه حسب الوحدات المختارة. */
  payload: FilePayload;
  large?: LargePdfInfo;
  /** الملف الأصلي (لقص الأشكال منه) */
  source: File;
  /** هل يمكن قص الأشكال منه (PDF/صورة أُرسلت كما هي) */
  figurable: boolean;
  note?: string;
}

const IMAGE_MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
export const ACCEPT = ".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp";

const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error(`تعذّرت قراءة الملف ${file.name}`));
    r.readAsDataURL(file);
  });

// ───────── PDF.js (يُحمَّل عند الحاجة فقط) ─────────
let pdfjsPromise: Promise<any> | null = null;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
      const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = worker;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

const pdfDocCache = new WeakMap<File, Promise<any>>();
async function loadPdf(file: File) {
  let p = pdfDocCache.get(file);
  if (!p) {
    p = (async () => {
      const pdfjs = await getPdfjs();
      if (file.size > 40 * 1024 * 1024) {
        // ملف ضخم: نقرأ منه بالنطاقات عبر blob URL بدل نسخه كاملاً إلى ذاكرة JS
        const url = URL.createObjectURL(file);
        return pdfjs.getDocument({ url, useSystemFonts: true, isEvalSupported: false, rangeChunkSize: 1 << 20 }).promise;
      }
      const data = new Uint8Array(await file.arrayBuffer());
      return pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
    })();
    pdfDocCache.set(file, p);
  }
  return p;
}

async function renderPageCanvas(file: File, pageNum: number, targetWidth: number): Promise<HTMLCanvasElement> {
  const pdf = await loadPdf(file);
  const page = await pdf.getPage(pageNum);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(3, targetWidth / base.width) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}

async function pageJpeg(file: File, pageNum: number, width: number, quality: number): Promise<PagePayload> {
  const c = await renderPageCanvas(file, pageNum, width);
  const base64 = c.toDataURL("image/jpeg", quality).split(",")[1] ?? "";
  c.width = c.height = 0; // حرّر الذاكرة
  return { page: pageNum, mimeType: "image/jpeg", base64 };
}

const b64Bytes = (b64: string) => Math.floor(b64.length * 0.75);
export const payloadBytes = (p: FilePayload) =>
  (p.base64 ? b64Bytes(p.base64) : 0) + (p.pages ?? []).reduce((s, x) => s + b64Bytes(x.base64), 0);

type Progress = (msg: string) => void;

/** قراءة PDF كبير: نص كل صفحة محلياً + حمولة تحليل خفيفة (مقتطفات، أو مصغّرات إن كان ممسوحاً). */
async function prepareLargePdf(file: File, onProgress?: Progress): Promise<PreparedFile> {
  const pdf = await loadPdf(file);
  const numPages: number = pdf.numPages;
  if (numPages > MAX_PDF_PAGES) throw new Error(`"${file.name}" يحتوي ${numPages} صفحة (الحد ${MAX_PDF_PAGES}). قسّمه إلى جزأين.`);

  const pageTexts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    pageTexts.push(tc.items.map((it: any) => it.str || "").join(" ").replace(/\s+/g, " ").trim());
    page.cleanup();
    if (i % 10 === 0 || i === numPages) onProgress?.(`قراءة الصفحة ${i} من ${numPages} في «${file.name}»...`);
  }

  const totalChars = pageTexts.reduce((s, t) => s + t.length, 0);
  const scanned = totalChars / numPages < 40;
  const payload: FilePayload = { name: file.name };

  if (!scanned) {
    // مقتطف من أول كل صفحة (العناوين غالباً في الأعلى) ضمن ميزانية ثابتة
    const per = Math.max(150, Math.min(1500, Math.floor(450_000 / numPages)));
    payload.text = pageTexts.map((t, i) => (t ? `[صفحة ${i + 1}]\n${t.slice(0, per)}` : "")).filter(Boolean).join("\n\n");
  } else {
    // كتاب ممسوح: مصغّرات صفحات موزّعة بالتساوي
    const step = Math.max(1, Math.ceil(numPages / MAX_THUMB_PAGES));
    const pages: PagePayload[] = [];
    for (let p = 1; p <= numPages; p += step) {
      pages.push(await pageJpeg(file, p, 520, 0.55));
      if (pages.length % 5 === 0) onProgress?.(`تجهيز مصغّرات الصفحات (${pages.length}/${Math.ceil(numPages / step)})...`);
    }
    payload.pages = pages;
    payload.text = `هذا كتاب ممسوح ضوئياً من ${numPages} صفحة؛ تصلك مصغّرات لبعض صفحاته فقط (كل ${step} صفحة).`;
  }

  return {
    name: file.name, size: file.size, kind: "pdf", source: file, figurable: true, payload,
    large: { numPages, pageTexts, scanned },
    note: scanned
      ? `ملف كبير ممسوح ضوئياً (${numPages} صفحة): يُقسَّم من مصغّرات صفحاته، وتُرسل صور الصفحات المختارة عند إنشاء الامتحان.`
      : `ملف كبير (${numPages} صفحة): يُقرأ هنا محلياً، ويُرسل للذكاء الاصطناعي نصُّ وحداتك المختارة مع صور الصفحات التي فيها أشكال.`,
  };
}

/**
 * عند دمج عدة ملفات قد يتجاوز مجموع الـ PDF المضمَّنة حدّ الطلب. نحوّل الأكبر فالأكبر إلى القراءة المحلية
 * (نص + صور صفحات مختارة) حتى يدخل المجموع في الحد.
 */
export async function shrinkToBudget(prep: PreparedFile[], onProgress?: Progress): Promise<PreparedFile[]> {
  const out = [...prep];
  for (;;) {
    const total = out.reduce((s, p) => s + payloadBytes(p.payload), 0);
    if (total <= MAX_TOTAL_INLINE_BYTES) return out;
    let idx = -1, size = 0;
    out.forEach((p, i) => {
      if (p.kind === "pdf" && !p.large && p.payload.base64) {
        const b = payloadBytes(p.payload);
        if (b > size) { size = b; idx = i; }
      }
    });
    if (idx < 0) throw new Error("مجموع حجم الملفات كبير (الحد 14 ميجابايت للملفات المضمَّنة). قلّل عدد الصور أو حجمها.");
    out[idx] = await prepareLargePdf(out[idx].source, onProgress);
  }
}

export async function prepareFile(file: File, onProgress?: Progress): Promise<PreparedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.size > MAX_FILE_BYTES) throw new Error(`الملف "${file.name}" أكبر من ${MAX_FILE_BYTES / 1024 / 1024} ميجابايت`);
  const inlineOk = file.size <= MAX_INLINE_BYTES_PER_FILE;

  if (IMAGE_MIME[ext]) {
    if (!inlineOk) throw new Error(`الصورة "${file.name}" أكبر من 10 ميجابايت`);
    return {
      name: file.name, size: file.size, kind: "image", source: file, figurable: true,
      payload: { name: file.name, mimeType: IMAGE_MIME[ext], base64: await readBase64(file) },
    };
  }

  if (ext === "pdf") {
    if (inlineOk) {
      return {
        name: file.name, size: file.size, kind: "pdf", source: file, figurable: true,
        payload: { name: file.name, mimeType: "application/pdf", base64: await readBase64(file) },
      };
    }
    return prepareLargePdf(file, onProgress);
  }

  if (ext === "docx") {
    const mammoth: any = await import("mammoth");
    const res = await (mammoth.extractRawText ?? mammoth.default.extractRawText)({ arrayBuffer: await file.arrayBuffer() });
    const text = String(res.value ?? "").trim();
    if (text.length < 80) throw new Error(`لم أجد نصاً كافياً في "${file.name}"`);
    return {
      name: file.name, size: file.size, kind: "docx", source: file, figurable: false, payload: { name: file.name, text },
      note: "ملف Word: يُقرأ النص فقط (الصور داخله لا تُستخرج). للحصول على الأشكال احفظه PDF.",
    };
  }

  if (ext === "txt" || ext === "md") {
    const text = (await file.text()).trim();
    if (text.length < 80) throw new Error(`النص في "${file.name}" قصير جداً`);
    return { name: file.name, size: file.size, kind: "text", source: file, figurable: false, payload: { name: file.name, text } };
  }

  throw new Error(`صيغة "${file.name}" غير مدعومة. المسموح: PDF, DOCX, TXT, MD, PNG, JPG, WEBP`);
}

// ───────── قصّ الأشكال من الملف الأصلي (الجزء المهم فقط) ─────────
async function loadImageCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function renderPdfPage(file: File, pageNum: number): Promise<HTMLCanvasElement> {
  const pdf = await loadPdf(file);
  if (pageNum < 1 || pageNum > pdf.numPages) throw new Error(`الصفحة ${pageNum} غير موجودة (الملف ${pdf.numPages} صفحة)`);
  return renderPageCanvas(file, pageNum, 2200); // دقة عالية للخطوط الرفيعة والتسميات
}

export interface CropJob { id: string; fileIndex: number; page: number; box: [number, number, number, number]; caption: string }
export interface CropResult { id: string; dataUrl: string; width: number; height: number }
export interface CropReject { id: string; reason: string }
export interface CropVerdict { id: string; ok: boolean; complete: boolean; matches: boolean; tight: number[] | null; reason: string }
export type VerifyFn = (items: { id: string; caption: string; base64: string }[]) => Promise<CropVerdict[]>;

function cropToCanvas(src: HTMLCanvasElement, r: Rect): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(r.w));
  out.height = Math.max(1, Math.round(r.h));
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
  return out;
}

/** يقصّ الهوامش البيضاء حول المحتوى داخل المستطيل (فيبقى الشكل نفسه فقط). */
function trimmed(src: HTMLCanvasElement, r: Rect): Rect {
  const c = cropToCanvas(src, r);
  const img = c.getContext("2d")!.getImageData(0, 0, c.width, c.height);
  const cr = contentRect(img.data, c.width, c.height, 6);
  c.width = c.height = 0;
  if (!cr || cr.w < 40 || cr.h < 40) return r;
  return { x: r.x + cr.x, y: r.y + cr.y, w: cr.w, h: cr.h };
}

function boxToRect(box: number[], cw: number, ch: number, pad = 0.004): Rect {
  const [y0, x0, y1, x1] = box;
  const x = Math.max(0, Math.floor((x0 / 1000 - pad) * cw)), y = Math.max(0, Math.floor((y0 / 1000 - pad) * ch));
  return { x, y, w: Math.min(cw - x, Math.ceil(((x1 - x0) / 1000 + 2 * pad) * cw)), h: Math.min(ch - y, Math.ceil(((y1 - y0) / 1000 + 2 * pad) * ch)) };
}

const jpegB64 = (c: HTMLCanvasElement, maxW: number, q: number) => {
  let src = c;
  if (c.width > maxW) {
    src = document.createElement("canvas");
    src.width = maxW;
    src.height = Math.round((c.height * maxW) / c.width);
    src.getContext("2d")!.drawImage(c, 0, 0, src.width, src.height);
  }
  return src.toDataURL("image/jpeg", q).split(",")[1] ?? "";
};

/**
 * قصّ دقيق لقائمة أشكال:
 * 1) قصّ بالصندوق المرصود  2) قصّ الهوامش البيضاء تلقائياً  3) فحص بالذكاء الاصطناعي (كامل؟ يطابق الوصف؟ صندوق أضيق؟)
 * 4) تطبيق الصندوق الأضيق  5) عند «مقطوع» يُوسَّع الصندوق ويُعاد الفحص مرة واحدة. ما لا يجتاز يُرفض مع السبب.
 */
export async function cropFiguresTight(
  files: PreparedFile[], jobs: CropJob[], verify: VerifyFn | null, onProgress?: (msg: string) => void,
): Promise<{ results: Map<string, CropResult>; rejected: CropReject[] }> {
  const cache = new Map<string, HTMLCanvasElement>();
  const rejected: CropReject[] = [];
  type St = { job: CropJob; page: HTMLCanvasElement; rect: Rect };
  const states: St[] = [];

  const sorted = [...jobs].sort((a, b) => a.fileIndex - b.fileIndex || a.page - b.page);
  let n = 0;
  for (const job of sorted) {
    try {
      const pf = files[job.fileIndex];
      if (!pf || !pf.figurable) throw new Error("الملف لا يدعم استخراج الأشكال");
      const key = `${job.fileIndex}:${pf.kind === "pdf" ? job.page : 1}`;
      let page = cache.get(key);
      if (!page) {
        page = pf.kind === "pdf" ? await renderPdfPage(pf.source, job.page) : await loadImageCanvas(pf.source);
        cache.set(key, page);
        if (cache.size > 4) cache.delete(cache.keys().next().value as string);
      }
      const rect = trimmed(page, boxToRect(job.box, page.width, page.height));
      if (rect.w < 40 || rect.h < 40) throw new Error("منطقة الشكل صغيرة جداً");
      states.push({ job, page, rect });
    } catch (e: any) {
      rejected.push({ id: job.id, reason: e?.message || "تعذّر القص" });
    }
    onProgress?.(`قصّ الأشكال (${++n}/${sorted.length})...`);
  }

  const alive = new Map(states.map((s) => [s.job.id, s]));
  const runVerify = async (list: St[]): Promise<Map<string, CropVerdict>> => {
    const out = new Map<string, CropVerdict>();
    if (!verify) return out;
    for (let i = 0; i < list.length; i += 10) {
      const chunk = list.slice(i, i + 10);
      onProgress?.(`فحص جودة الأشكال بالذكاء الاصطناعي (${Math.min(i + 10, list.length)}/${list.length})...`);
      const items = chunk.map((s) => {
        const c = cropToCanvas(s.page, s.rect);
        const b = jpegB64(c, 720, 0.72);
        c.width = c.height = 0;
        return { id: s.job.id, caption: s.job.caption, base64: b };
      });
      try { (await verify(items)).forEach((v) => out.set(v.id, v)); }
      catch (e) { console.warn("verify-crops failed; keeping trimmed crops:", e); return new Map(); } // الفحص غير متاح: نبقي القص المضيَّق
    }
    return out;
  };

  const applyVerdicts = (list: St[], verdicts: Map<string, CropVerdict>, allowRetry: boolean): St[] => {
    const retry: St[] = [];
    for (const s of list) {
      const v = verdicts.get(s.job.id);
      if (!v) continue; // بلا فحص
      if (v.ok || (v.complete && v.matches)) {
        if (sensibleTightBox(v.tight)) s.rect = trimmed(s.page, applyTightBox(s.rect, v.tight)); // الجزء المهم فقط
      } else if (!v.complete && allowRetry) {
        s.rect = trimmed(s.page, expandRect(s.rect, 0.3, s.page.width, s.page.height));
        retry.push(s);
      } else {
        alive.delete(s.job.id);
        rejected.push({ id: s.job.id, reason: v.reason || (v.matches ? "الشكل غير كامل" : "لا يطابق الوصف") });
      }
    }
    return retry;
  };

  if (verify && states.length) {
    const first = await runVerify(states);
    const retry = applyVerdicts(states, first, true);
    if (retry.length) applyVerdicts(retry, await runVerify(retry), false);
  }

  const results = new Map<string, CropResult>();
  for (const s of alive.values()) {
    const c = cropToCanvas(s.page, s.rect);
    results.set(s.job.id, { id: s.job.id, dataUrl: c.toDataURL("image/jpeg", 0.92), width: c.width, height: c.height });
    c.width = c.height = 0;
  }
  return { results, rejected };
}

// ───────── حمولة التوليد للملفات الكبيرة ─────────
/** درجة "بصرية" للصفحة: صور نقطية ورسوم متجهة (مخططات) تعني احتمال وجود شكل. */
async function pageVisualScore(file: File, pageNum: number): Promise<number> {
  const pdfjs = await getPdfjs();
  const pdf = await loadPdf(file);
  const page = await pdf.getPage(pageNum);
  try {
    const list = await page.getOperatorList();
    const O = pdfjs.OPS;
    const imageOps = new Set([O.paintImageXObject, O.paintInlineImageXObject, O.paintImageMaskXObject, O.paintJpegXObject].filter((x) => x !== undefined));
    let img = 0, paths = 0;
    for (const fn of list.fnArray) {
      if (imageOps.has(fn)) img++;
      else if (fn === O.constructPath) paths++;
    }
    return img * 10 + Math.min(paths, 600) / 30;
  } finally {
    page.cleanup();
  }
}

export interface GenerationFiles { payloads: FilePayload[]; notes: string[] }

/**
 * يبني ما يُرسل لتوليد الامتحان: الملفات الصغيرة كما هي، والملفات الكبيرة = نص الوحدات المختارة كاملاً
 * + صور الصفحات المهمة (الممسوحة أولاً ثم الأكثر أشكالاً) ضمن ميزانية حجم ثابتة.
 */
export async function buildGenerationFiles(
  files: PreparedFile[], units: UnitInfo[], onProgress?: Progress,
): Promise<GenerationFiles> {
  const payloads: FilePayload[] = [];
  const notes: string[] = [];

  // ميزانية صور الصفحات مشتركة بين الملفات الكبيرة (حدّ الطلب 14MB، ويُخصم منه ما أُرسل مضمَّناً)
  const smallBytes = files.filter((f) => !f.large).reduce((s, f) => s + payloadBytes(f.payload), 0);
  const largeCount = Math.max(1, files.filter((f) => f.large).length);
  const budgetPerFile = Math.min(MAX_PAGE_IMAGE_BYTES, Math.max(1.5 * 1024 * 1024, Math.floor((13 * 1024 * 1024 - smallBytes) / largeCount)));

  for (let fi = 0; fi < files.length; fi++) {
    const f = files[fi];
    if (!f.large) { payloads.push(f.payload); continue; }

    const { numPages, pageTexts, scanned } = f.large;
    const mine = units.filter((u) => u.fileIndex === fi);
    const selected = new Set<number>();
    if (mine.length === 0 || mine.some((u) => !u.pageStart)) {
      for (let p = 1; p <= numPages; p++) selected.add(p);
    } else {
      for (const u of mine) {
        for (let p = Math.max(1, u.pageStart!); p <= Math.min(numPages, u.pageEnd ?? u.pageStart!); p++) selected.add(p);
      }
    }
    const pages = [...selected].sort((a, b) => a - b);

    // نص الصفحات المختارة كاملاً (بميزانية: نقصّ المقتطف المتساوي إن زاد)
    const perPage = Math.max(300, Math.floor(MAX_GEN_TEXT_CHARS / Math.max(1, pages.length)));
    const text = pages.map((p) => (pageTexts[p - 1] ? `[صفحة ${p}]\n${pageTexts[p - 1].slice(0, perPage)}` : "")).filter(Boolean).join("\n\n");

    // اختيار صفحات الصور
    let imagePages: number[];
    let sampled = false;
    if (pages.length <= MAX_SEND_PAGES) {
      imagePages = pages;
    } else {
      const scored: { p: number; score: number }[] = [];
      let i = 0;
      for (const p of pages) {
        const noText = (pageTexts[p - 1] ?? "").length < 40;
        scored.push({ p, score: noText || scanned ? 1000 : await pageVisualScore(f.source, p) });
        if (++i % 15 === 0) onProgress?.(`فحص الصفحات بحثاً عن الأشكال (${i}/${pages.length})...`);
      }
      const cands = scored.filter((x) => x.score >= 1);
      if (cands.length > MAX_SEND_PAGES && cands.every((x) => x.score >= 1000)) {
        // كل الصفحات صور بلا نص: نوزّع العيّنة بالتساوي على كامل المحدّد بدل أخذ أوله فقط
        const step = cands.length / MAX_SEND_PAGES;
        imagePages = Array.from({ length: MAX_SEND_PAGES }, (_, i) => cands[Math.floor(i * step)].p);
        sampled = true;
      } else {
        imagePages = cands.sort((a, b) => b.score - a.score).slice(0, MAX_SEND_PAGES).map((x) => x.p); // بترتيب الأولوية
      }
    }

    const out: PagePayload[] = [];
    let bytes = 0;
    for (const p of imagePages) {
      const img = await pageJpeg(f.source, p, 1000, 0.78);
      bytes += b64Bytes(img.base64);
      if (bytes > budgetPerFile) break;
      out.push(img);
      onProgress?.(`تجهيز صور الصفحات (${out.length}/${imagePages.length}) من «${f.name}»...`);
    }

    out.sort((a, b) => a.page - b.page);
    payloads.push({ name: f.name, text: text || `ملف ممسوح ضوئياً من ${numPages} صفحة.`, pages: out });
    notes.push(
      `«${f.name}»: اعتُمدت ${pages.length} صفحة من ${numPages}` +
      (out.length ? `، وأُرسلت صور ${out.length} صفحة منها (${sampled ? "عيّنة موزعة بالتساوي لأن الكتاب ممسوح ضوئياً؛ اختر وحدات أقل لتغطية أدق" : "الأكثر احتمالاً لاحتواء أشكال"})` : "") + ".",
    );
  }
  return { payloads, notes };
}
