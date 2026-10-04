// قصّ صفحات محددة من PDF في المتصفح (pdf-lib) لإرسال ما يلزم الدفعة فقط بدل الملف كاملاً.
import type { FilePayload } from "./fileUtils";

export const MAX_SLICE_SOURCE_BYTES = 80 * 1024 * 1024; // أكبر من هذا لا نحمّله في الذاكرة لقصّه
export const MAX_SLICE_BYTES = 9 * 1024 * 1024;

type Doc = import("pdf-lib").PDFDocument;
const docs = new WeakMap<File, Promise<Doc>>();

async function loadDoc(file: File): Promise<Doc> {
  let p = docs.get(file);
  if (!p) {
    p = (async () => {
      const { PDFDocument } = await import("pdf-lib");
      return PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
    })();
    p.catch(() => docs.delete(file));
    docs.set(file, p);
  }
  return p;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** يقتطع الصفحات (أرقام الأصل، تبدأ من 1) ويعيد حمولة PDF مع خريطة الصفحات. null إن تعذّر أو كبر الحجم. */
export async function slicePdf(file: File, name: string, pages: number[]): Promise<FilePayload | null> {
  if (file.size > MAX_SLICE_SOURCE_BYTES || pages.length === 0) return null;
  try {
    const src = await loadDoc(file);
    const n = src.getPageCount();
    const keep = [...new Set(pages)].filter((p) => p >= 1 && p <= n).sort((a, b) => a - b);
    if (!keep.length) return null;
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, keep.map((p) => p - 1));
    copied.forEach((pg) => out.addPage(pg));
    const bytes = await out.save({ useObjectStreams: true });
    if (bytes.length > MAX_SLICE_BYTES) return null;
    return { name, mimeType: "application/pdf", base64: bytesToBase64(bytes), pageMap: keep };
  } catch {
    return null;
  }
}
