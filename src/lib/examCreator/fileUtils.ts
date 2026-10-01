import type { FigureRef } from "./types";

export const MAX_FILES = 5;
export const MAX_INLINE_BYTES_PER_FILE = 10 * 1024 * 1024;
export const MAX_TOTAL_INLINE_BYTES = 14 * 1024 * 1024;
export const MAX_FILE_BYTES = 40 * 1024 * 1024;

export interface PreparedFile {
  name: string;
  size: number;
  kind: "pdf" | "image" | "docx" | "text";
  /** ما يُرسل للخادم */
  payload: { name: string; mimeType?: string; base64?: string; text?: string };
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
      const data = new Uint8Array(await file.arrayBuffer());
      return pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
    })();
    pdfDocCache.set(file, p);
  }
  return p;
}

/** استخراج نص PDF مع علامات الصفحات (للملفات الكبيرة فقط). لا يستبدل المحتوى بأي منهج مدمج. */
async function extractPdfText(file: File): Promise<string> {
  const pdf = await loadPdf(file);
  let out = "";
  const max = Math.min(pdf.numPages, 200);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const t = tc.items.map((it: any) => it.str || "").join(" ").replace(/\s+/g, " ").trim();
    if (t) out += `[صفحة ${i}]\n${t}\n\n`;
  }
  return out;
}

export async function prepareFile(file: File): Promise<PreparedFile> {
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
    const text = await extractPdfText(file);
    if (text.replace(/\[صفحة \d+\]/g, "").trim().length < 200) {
      throw new Error(`"${file.name}" كبير وممسوح ضوئياً (بلا نص). قسّمه إلى ملفات أصغر من 10 ميجابايت.`);
    }
    return {
      name: file.name, size: file.size, kind: "pdf", source: file, figurable: false,
      payload: { name: file.name, text },
      note: "ملف كبير: يُقرأ كنص، فلن تُستخرج منه الأشكال. اقسمه لملفات أصغر من 10 ميجابايت للحصول على الأشكال.",
    };
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

// ───────── قص الأشكال من الملف الأصلي ─────────
async function renderPdfPage(file: File, pageNum: number): Promise<HTMLCanvasElement> {
  const pdf = await loadPdf(file);
  if (pageNum < 1 || pageNum > pdf.numPages) throw new Error(`الصفحة ${pageNum} غير موجودة (الملف ${pdf.numPages} صفحة)`);
  const page = await pdf.getPage(pageNum);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(3, Math.max(1.5, 2200 / base.width)); // دقة عالية للخطوط الرفيعة والتسميات
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}

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

/** يقص الشكل المحدد من الملف الأصلي ويعيد نسخة من FigureRef مع dataUrl (أو cropError). */
export async function cropFigure(
  files: PreparedFile[], fig: FigureRef, cache?: Map<string, HTMLCanvasElement>,
): Promise<FigureRef> {
  try {
    const pf = files[fig.fileIndex];
    if (!pf || !pf.figurable) throw new Error("الملف لا يدعم استخراج الأشكال");
    const key = `${fig.fileIndex}:${pf.kind === "pdf" ? fig.page : 1}`;
    let canvas = cache?.get(key);
    if (!canvas) {
      canvas = pf.kind === "pdf" ? await renderPdfPage(pf.source, fig.page) : await loadImageCanvas(pf.source);
      cache?.set(key, canvas);
    }
    const [y0, x0, y1, x1] = fig.box;
    const pad = 0.006; // هامش صغير جداً حتى لا تُقصّ التسميات ولا يدخل نص مجاور
    const sx = Math.max(0, Math.floor((x0 / 1000 - pad) * canvas.width));
    const sy = Math.max(0, Math.floor((y0 / 1000 - pad) * canvas.height));
    const sw = Math.min(canvas.width - sx, Math.ceil(((x1 - x0) / 1000 + 2 * pad) * canvas.width));
    const sh = Math.min(canvas.height - sy, Math.ceil(((y1 - y0) / 1000 + 2 * pad) * canvas.height));
    if (sw < 40 || sh < 40) throw new Error("منطقة الشكل صغيرة جداً");
    const out = document.createElement("canvas");
    out.width = sw;
    out.height = sh;
    const octx = out.getContext("2d")!;
    octx.fillStyle = "#fff";
    octx.fillRect(0, 0, sw, sh);
    octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return { ...fig, dataUrl: out.toDataURL("image/jpeg", 0.92), width: sw, height: sh, cropError: undefined };
  } catch (e: any) {
    return { ...fig, dataUrl: undefined, cropError: e?.message || "تعذّر قص الشكل" };
  }
}

/** يقص كل أشكال الأسئلة (يعيد استخدام الصفحة المرسومة). الأسئلة التي يتعذّر قص شكلها تُحذف ويُعاد عددها. */
export async function cropAllFigures<T extends { id: number; figure?: FigureRef }>(
  files: PreparedFile[], questions: T[], onProgress?: (done: number, total: number) => void,
): Promise<{ questions: T[]; removed: number }> {
  const cache = new Map<string, HTMLCanvasElement>();
  const withFig = questions.filter((q) => q.figure);
  const order = [...withFig].sort((a, b) => a.figure!.fileIndex - b.figure!.fileIndex || a.figure!.page - b.figure!.page);
  const cropped = new Map<number, FigureRef>();
  let done = 0;
  for (const q of order) {
    cropped.set(q.id, await cropFigure(files, q.figure!, cache));
    onProgress?.(++done, order.length);
    if (cache.size > 4) cache.delete(cache.keys().next().value as string); // نحدّ الذاكرة
  }
  const out: T[] = [];
  let removed = 0;
  for (const q of questions) {
    if (!q.figure) { out.push(q); continue; }
    const f = cropped.get(q.id)!;
    if (f.dataUrl) out.push({ ...q, figure: f });
    else removed++;
  }
  return { questions: out, removed };
}
