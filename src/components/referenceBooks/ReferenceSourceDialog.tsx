import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPdfjs } from '@/lib/examCreator/fileUtils';
import { getBookPage, getBookView, type ReferenceSource } from '@/lib/referenceBooks/api';

interface PdfPageProxy {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
  cleanup: () => void;
}
interface PdfDocProxy { numPages: number; getPage: (n: number) => Promise<PdfPageProxy>; destroy?: () => Promise<void> }

/** Draws one page of the original PDF (read straight from storage with range requests). */
const OriginalPage: React.FC<{ url: string; page: number; onFail: () => void }> = ({ url, page, onFail }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let doc: PdfDocProxy | null = null;
    (async () => {
      try {
        const pdfjs = await getPdfjs();
        doc = (await pdfjs.getDocument({ url, useSystemFonts: true, isEvalSupported: false, rangeChunkSize: 1 << 20 }).promise) as PdfDocProxy;
        if (page > doc.numPages) throw new Error('page out of range');
        const p = await doc.getPage(page);
        const canvas = canvasRef.current;
        if (!alive || !canvas) return;
        const base = p.getViewport({ scale: 1 });
        const scale = Math.min(2.5, (880 * Math.min(2, window.devicePixelRatio || 1)) / base.width);
        const viewport = p.getViewport({ scale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await p.render({ canvas, canvasContext: ctx, viewport }).promise;
        p.cleanup();
        if (alive) setLoading(false);
      } catch {
        if (alive) onFail();
      }
    })();
    return () => {
      alive = false;
      void doc?.destroy?.();
    };
  }, [url, page, onFail]);

  return (
    <div className="relative">
      {loading && <Loader2 className="mx-auto my-8 h-5 w-5 animate-spin text-muted-foreground" aria-hidden />}
      <canvas ref={canvasRef} className={`mx-auto w-full rounded-xl border border-border bg-white ${loading ? 'hidden' : ''}`} />
    </div>
  );
};

/** Shows the book page an answer or question was drawn from: the original page (leads) and its extracted text. */
export const ReferenceSourceDialog: React.FC<{
  source: Pick<ReferenceSource, 'bookId' | 'bookTitle' | 'pageNumber' | 'content'> | null;
  onClose: () => void;
}> = ({ source, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'page' | 'text'>('text');

  useEffect(() => {
    if (!source) return;
    setText(source.content);
    setViewUrl(null);
    setMode('text');
    if (!source.pageNumber) return;
    let alive = true;
    setLoading(true);
    getBookPage(source.bookId, source.pageNumber)
      .then((r) => alive && r.text && setText(r.text))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    // Only leads may open the original file; everyone else just gets the extracted text.
    getBookView(source.bookId)
      .then((v) => {
        if (alive && v.mimeType === 'application/pdf') {
          setViewUrl(v.url);
          setMode('page');
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [source]);

  const failPage = React.useCallback(() => setMode('text'), []);

  return (
    <Dialog open={!!source} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{source?.bookTitle}</DialogTitle>
          <DialogDescription>{source?.pageNumber ? `صفحة ${source.pageNumber}` : 'مقطع من الكتاب'}</DialogDescription>
        </DialogHeader>
        {viewUrl && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={mode === 'page' ? 'default' : 'outline'} onClick={() => setMode('page')}>الصفحة الأصلية</Button>
            <Button type="button" size="sm" variant={mode === 'text' ? 'default' : 'outline'} onClick={() => setMode('text')}>النص المستخرج</Button>
          </div>
        )}
        {mode === 'page' && viewUrl && source?.pageNumber ? (
          <OriginalPage url={viewUrl} page={source.pageNumber} onFail={failPage} />
        ) : (
          <>
            {loading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" aria-hidden />}
            <p className="whitespace-pre-wrap rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-foreground">{text}</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
