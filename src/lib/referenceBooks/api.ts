import { supabase } from '@/integrations/supabase/client';
import {
  BookPdf,
  bookKind,
  chunkText,
  extractDocxText,
  imageToOcrPage,
  needsOcr,
  validateBookFile,
  type Chunk,
  type OcrPage,
} from './extract';

export type BookStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export interface ReferenceBook {
  id: string;
  title: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  status: BookStatus;
  extraction_method: 'text_layer' | 'docx' | 'ocr' | 'mixed' | null;
  total_pages: number | null;
  processed_pages: number;
  extracted_chars: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

const OCR_BATCH_PAGES = 5;
const OCR_BATCH_RETRIES = 3;
const INGEST_BATCH_CHUNKS = 120;

// reference_books is newer than the generated Supabase types, so it is queried untyped.
type ListResult = Promise<{ data: unknown[] | null; error: { message: string } | null }>;
const booksTable = () =>
  (supabase as unknown as {
    from: (t: string) => { select: (c: string) => { order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => ListResult } } };
  }).from('reference_books');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function invoke<T>(action: string, body: object = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('reference-books', { body: { action, ...body } });
  if (error) {
    let msg = error.message;
    try {
      const j = await (error as { context?: Response }).context?.json();
      if (j?.error) msg = String(j.error);
    } catch {
      /* keep the generic message */
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

export async function listReferenceBooks(): Promise<ReferenceBook[]> {
  const { data, error } = await booksTable().select('*').order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as ReferenceBook[];
}

export async function downloadReferenceBook(bookId: string): Promise<string> {
  return (await invoke<{ url: string }>('download', { bookId })).url;
}

export async function deleteReferenceBook(bookId: string): Promise<void> {
  await invoke('delete', { bookId });
}

function putToR2(url: string, file: File, onProgress: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`فشل رفع الملف إلى التخزين (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('تعذّر الاتصال بالتخزين. تحقق من الإنترنت ومن إعداد CORS لسلة R2'));
    xhr.send(file);
  });
}

export interface IngestProgress { phase: string; fraction: number }

/**
 * Full pipeline for one book: register → upload to R2 → extract text (text layer / Word / OCR for scans)
 * → save searchable chunks. The page must stay open while it runs (extraction happens in the browser).
 */
export async function ingestBook(
  file: File,
  title: string,
  onProgress: (p: IngestProgress) => void,
): Promise<string> {
  const invalid = validateBookFile(file);
  if (invalid) throw new Error(invalid);

  onProgress({ phase: 'تجهيز الرفع...', fraction: 0 });
  const { bookId, uploadUrl } = await invoke<{ bookId: string; uploadUrl: string }>('upload-url', {
    filename: file.name,
    sizeBytes: file.size,
    title,
  });

  try {
    await putToR2(uploadUrl, file, (f) => onProgress({ phase: 'رفع الملف إلى التخزين...', fraction: f * 0.4 }));
    await extractAndSave(bookId, file, onProgress);
    return bookId;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'فشلت المعالجة';
    await invoke('ingest', { bookId, error: message }).catch(() => undefined);
    throw e;
  }
}

async function saveChunks(bookId: string, chunks: Chunk[], extra: Record<string, unknown> = {}) {
  for (let i = 0; i < Math.max(1, chunks.length); i += INGEST_BATCH_CHUNKS) {
    const last = i + INGEST_BATCH_CHUNKS >= chunks.length;
    await invoke('ingest', {
      bookId,
      chunks: chunks.slice(i, i + INGEST_BATCH_CHUNKS),
      ...(last ? extra : {}),
    });
  }
}

async function ocrBatch(bookId: string, pages: OcrPage[]): Promise<{ page: number; text: string }[]> {
  for (let attempt = 1; ; attempt++) {
    try {
      return (await invoke<{ pages: { page: number; text: string }[] }>('ocr', { bookId, pages })).pages;
    } catch (e) {
      if (attempt >= OCR_BATCH_RETRIES) throw e;
      await sleep(4000 * attempt);
    }
  }
}

async function extractAndSave(bookId: string, file: File, onProgress: (p: IngestProgress) => void) {
  const kind = bookKind(file)!;
  const phase = (text: string, f: number) => onProgress({ phase: text, fraction: 0.4 + f * 0.6 });

  if (kind === 'docx') {
    phase('استخراج النص من ملف Word...', 0.2);
    const chunks = chunkText(await extractDocxText(file), null, 0);
    await saveChunks(bookId, chunks, { method: 'docx', done: true });
    return;
  }

  let nextIndex = 0;
  const pending: Chunk[] = [];
  const keep = (text: string, page: number | null) => {
    const cs = chunkText(text, page, nextIndex);
    nextIndex += cs.length;
    pending.push(...cs);
  };

  if (kind === 'image') {
    phase('قراءة النص من الصورة (OCR)...', 0.3);
    const [r] = await ocrBatch(bookId, [await imageToOcrPage(file)]);
    keep(r?.text ?? '', 1);
    await saveChunks(bookId, pending, { method: 'ocr', totalPages: 1, processedPages: 1, done: true });
    return;
  }

  const pdf = await BookPdf.open(file);
  try {
    const total = pdf.numPages;
    const ocrPages: number[] = [];
    for (let p = 1; p <= total; p++) {
      const text = await pdf.pageText(p);
      if (needsOcr(text)) ocrPages.push(p);
      else keep(text, p);
      if (p % 10 === 0 || p === total) phase(`قراءة النص من الصفحة ${p} من ${total}...`, (p / total) * (ocrPages.length ? 0.3 : 0.9));
    }
    const method = ocrPages.length === 0 ? 'text_layer' : ocrPages.length === total ? 'ocr' : 'mixed';
    await saveChunks(bookId, pending.splice(0), { method, totalPages: total, processedPages: total - ocrPages.length });

    for (let i = 0; i < ocrPages.length; i += OCR_BATCH_PAGES) {
      const batchNums = ocrPages.slice(i, i + OCR_BATCH_PAGES);
      phase(`قراءة الصفحات الممسوحة ${Math.min(i + OCR_BATCH_PAGES, ocrPages.length)} من ${ocrPages.length} (OCR)...`, 0.3 + (i / ocrPages.length) * 0.65);
      const images: OcrPage[] = [];
      for (const n of batchNums) images.push(await pdf.pageJpeg(n));
      for (const r of await ocrBatch(bookId, images)) keep(r.text, r.page);
      await saveChunks(bookId, pending.splice(0), { processedPages: total - ocrPages.length + i + batchNums.length });
    }
    await saveChunks(bookId, [], { done: true });
  } finally {
    pdf.destroy();
  }
}

export interface LibraryBook { id: string; title: string; total_pages: number | null; extracted_chars: number; extraction_method: string | null }
export interface ReferenceSource { bookId: string; bookTitle: string; pageNumber: number | null; content: string }

export const listReadyBooks = async () => (await invoke<{ books: LibraryBook[] }>('books')).books;

export const askLibrary = (question: string) =>
  invoke<{ answer: string; sources: ReferenceSource[] }>('ask', { question });

export const getBookPage = (bookId: string, page: number) =>
  invoke<{ bookTitle: string; page: number; text: string }>('page', { bookId, page });

export const getBookText = (bookId: string, pageStart?: number, pageEnd?: number) =>
  invoke<{ title: string; totalPages: number | null; truncated: boolean; pages: { page: number | null; text: string }[] }>('text', {
    bookId,
    pageStart,
    pageEnd,
  });
