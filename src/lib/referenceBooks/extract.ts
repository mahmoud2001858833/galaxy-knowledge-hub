import { getPdfjs } from '@/lib/examCreator/fileUtils';

export const MAX_BOOK_BYTES = 500 * 1024 * 1024;
export const BOOK_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.webp';
const MAX_PDF_PAGES = 2500;
const MIN_TEXT_CHARS_PER_PAGE = 25;
const CHUNK_TARGET = 1200;
const CHUNK_MAX = 1800;
const MIN_CHUNK = 40;

export type BookKind = 'pdf' | 'docx' | 'image';
export interface PageText { page: number; text: string }
export interface Chunk { chunkIndex: number; pageNumber: number | null; content: string }
export interface OcrPage { page: number; mimeType: 'image/jpeg'; base64: string }

export const bookKind = (file: File): BookKind | null => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  return null;
};

export const validateBookFile = (file: File): string | null => {
  if (!bookKind(file)) return `صيغة «${file.name}» غير مدعومة. المسموح: PDF وDOCX وصور PNG/JPG/WEBP`;
  if (file.size === 0) return `الملف «${file.name}» فارغ`;
  if (file.size > MAX_BOOK_BYTES) return `الملف «${file.name}» أكبر من 500 ميجابايت`;
  return null;
};

const normalize = (s: string) =>
  s.normalize('NFKC').split('\u0000').join('').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

/** Splits text into search chunks of ~1200 chars on paragraph/sentence boundaries; tiny leftovers are dropped. */
export function chunkText(text: string, pageNumber: number | null, startIndex: number): Chunk[] {
  const clean = normalize(text);
  if (clean.length < MIN_CHUNK) return [];
  const pieces = clean.split(/\n+/).flatMap((p) => {
    if (p.length <= CHUNK_MAX) return [p];
    return p.match(/[^.!؟?؛\n]+[.!؟?؛]?\s*/g) ?? [p];
  });
  const out: Chunk[] = [];
  let cur = '';
  const flush = () => {
    const c = cur.trim();
    if (c.length >= MIN_CHUNK) out.push({ chunkIndex: startIndex + out.length, pageNumber, content: c.slice(0, 6000) });
    cur = '';
  };
  for (const piece of pieces) {
    if (cur && cur.length + piece.length + 1 > CHUNK_MAX) flush();
    cur += (cur ? '\n' : '') + piece;
    if (cur.length >= CHUNK_TARGET) flush();
  }
  flush();
  return out;
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const extract = mammoth.extractRawText ?? mammoth.default.extractRawText;
  const res = await extract({ arrayBuffer: await file.arrayBuffer() });
  return String(res.value ?? '');
}

interface PdfPage {
  getTextContent: () => Promise<{ items: { str?: string; hasEOL?: boolean }[] }>;
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
  cleanup: () => void;
}
interface PdfDoc { numPages: number; getPage: (n: number) => Promise<PdfPage>; destroy?: () => Promise<void> }

/** An opened PDF: reads each page's text layer and renders pages to JPEG for OCR. */
export class BookPdf {
  private constructor(private doc: PdfDoc, readonly numPages: number) {}

  static async open(file: File): Promise<BookPdf> {
    const pdfjs = await getPdfjs();
    const doc =
      file.size > 40 * 1024 * 1024
        ? await pdfjs.getDocument({ url: URL.createObjectURL(file), useSystemFonts: true, isEvalSupported: false, rangeChunkSize: 1 << 20 }).promise
        : await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), useSystemFonts: true, isEvalSupported: false }).promise;
    if (doc.numPages > MAX_PDF_PAGES) throw new Error(`الكتاب ${doc.numPages} صفحة (الحد ${MAX_PDF_PAGES}). قسّمه إلى جزأين.`);
    return new BookPdf(doc, doc.numPages);
  }

  async pageText(page: number): Promise<string> {
    const p = await this.doc.getPage(page);
    try {
      const tc = await p.getTextContent();
      return tc.items.map((it) => (it.str ?? '') + (it.hasEOL ? '\n' : ' ')).join('').replace(/[ \t]+\n/g, '\n').trim();
    } finally {
      p.cleanup();
    }
  }

  async pageJpeg(page: number, targetWidth = 1400, quality = 0.8): Promise<OcrPage> {
    const p = await this.doc.getPage(page);
    try {
      const base = p.getViewport({ scale: 1 });
      const viewport = p.getViewport({ scale: Math.min(3, targetWidth / base.width) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await p.render({ canvas, canvasContext: ctx, viewport }).promise;
      const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1] ?? '';
      canvas.width = canvas.height = 0;
      return { page, mimeType: 'image/jpeg', base64 };
    } finally {
      p.cleanup();
    }
  }

  destroy() {
    void this.doc.destroy?.();
  }
}

/** A scanned photo/image → one JPEG page (longest side ≤ 2000px) for OCR. */
export async function imageToOcrPage(file: File): Promise<OcrPage> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '';
    return { page: 1, mimeType: 'image/jpeg', base64 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const needsOcr = (text: string) => text.replace(/\s+/g, '').length < MIN_TEXT_CHARS_PER_PAGE;
